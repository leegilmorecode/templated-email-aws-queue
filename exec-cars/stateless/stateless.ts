import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'node:path';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { Construct } from 'constructs';
import { Stage } from '../types';
import { getRemovalPolicyFromStage } from '../utils';

export interface ExecCarsStatelessStackStackProps extends cdk.StackProps {
  shared: {
    stage: Stage;
    serviceName: string;
    metricNamespace: string;
    logging: {
      logLevel: 'DEBUG' | 'INFO' | 'ERROR';
      logEvent: 'true' | 'false';
    };
  };
  stateless: {
    runtimes: lambda.Runtime;
  };
  table: dynamodb.Table;
}

export class ExecCarsStatelessStack extends cdk.Stack {
  private table: dynamodb.Table;
  private queue: sqs.Queue;
  private schedulerDeadLetterQueue: sqs.Queue;
  public api: apigw.RestApi;

  constructor(
    scope: Construct,
    id: string,
    props: ExecCarsStatelessStackStackProps,
  ) {
    super(scope, id, props);

    const {
      shared: {
        stage,
        serviceName,
        metricNamespace,
        logging: { logLevel, logEvent },
      },
      stateless: { runtimes },
    } = props;

    this.table = props.table;

    const lambdaConfig = {
      LOG_LEVEL: logLevel,
      POWERTOOLS_LOGGER_LOG_EVENT: logEvent,
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'true',
      POWERTOOLS_SERVICE_NAME: serviceName,
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'true',
      POWERTOOLS_METRICS_NAMESPACE: metricNamespace,
    };

    // create the email processing sqs queue
    this.queue = new sqs.Queue(this, 'EmailProcessingQueue', {
      queueName: `${stage}-email-processing-queue`,
      removalPolicy: getRemovalPolicyFromStage(stage),
    });

    this.schedulerDeadLetterQueue = new sqs.Queue(
      this,
      'SchedulerDeadLetterQueue',
      {
        queueName: `${stage}-scheduler-dead-letter-queue`,
        removalPolicy: getRemovalPolicyFromStage(stage),
      },
    );

    // create a new schedule group (this will store our scheduled events)
    const scheduleGroup = new scheduler.CfnScheduleGroup(
      this,
      'ScheduleGroup',
      {
        name: `${stage}-gilmore-exec-cars-schedule-group`,
      },
    );

    // ensure the scheduler can send messages to the sqs queue
    const launchRole = new iam.Role(this, 'SchedulerRole', {
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
    });
    new iam.Policy(this, 'SchedulePolicy', {
      policyName: 'ScheduleToSendSqSMessage',
      roles: [launchRole],
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'sqs:SendMessage',
            'sqs:GetQueueAttributes',
            'sqs:GetQueueUrl',
          ],
          resources: [this.queue.queueArn],
        }),
      ],
    });

    const sendEmailQueueProcessor: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'SendEmailQueueProcessor', {
        functionName: `send-email-queue-processor-${stage}`,
        description: `Send emails for ${serviceName} in ${stage}`,
        runtime: runtimes,
        entry: path.join(
          __dirname,
          './src/adapters/primary/send-email-queue-processor/send-email-queue-processor.adapter.ts',
        ),
        memorySize: 1024,
        logRetention: logs.RetentionDays.ONE_DAY,
        handler: 'handler',
        architecture: lambda.Architecture.ARM_64,
        tracing: lambda.Tracing.ACTIVE,
        environment: {
          ...lambdaConfig,
          STAGE: stage,
        },
        bundling: {
          minify: true,
          externalModules: ['@aws-sdk/*'],
          nodeModules: ['mjml', 'handlebars'],
        },
      });

    sendEmailQueueProcessor.addEventSource(
      new lambdaEventSources.SqsEventSource(this.queue, {
        batchSize: 10,
        maxConcurrency: 2,
        reportBatchItemFailures: true,
      }),
    );

    const createEmailCampaignLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateEmailCampaignLambda', {
        functionName: `create-email-campaign-${stage}`,
        description: `Create email campaign for ${serviceName} in ${stage}`,
        runtime: runtimes,
        entry: path.join(
          __dirname,
          './src/adapters/primary/create-email-campaign/create-email-campaign.adapter.ts',
        ),
        memorySize: 1024,
        logRetention: logs.RetentionDays.ONE_DAY,
        handler: 'handler',
        architecture: lambda.Architecture.ARM_64,
        tracing: lambda.Tracing.ACTIVE,
        environment: {
          ...lambdaConfig,
          STAGE: stage,
          SCHEDULE_GROUP_NAME: scheduleGroup.name as string,
          SCHEDULE_ROLE_ARN: launchRole.roleArn,
          QUEUE_ARN: this.queue.queueArn,
          DEAD_LETTER_QUEUE_ARN: this.schedulerDeadLetterQueue.queueArn,
          TABLE_NAME: props.table.tableName,
        },
        bundling: {
          minify: true,
          externalModules: ['@aws-sdk/*'],
        },
        // ensure we can create new scheduled events
        initialPolicy: [
          new iam.PolicyStatement({
            actions: [
              'scheduler:CreateSchedule',
              'iam:PassRole',
              'scheduler:CreateScheduleGroup',
            ],
            resources: ['*'],
          }),
        ],
      });

    this.table.grantReadData(createEmailCampaignLambda);

    sendEmailQueueProcessor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      }),
    );

    // create our rest api for email admin
    this.api = new apigw.RestApi(this, 'Api', {
      description: `(${stage}) email admin api`,
      restApiName: `${stage}-email-admin-api`,
      deploy: true,
      deployOptions: {
        stageName: 'api',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    const root: apigw.Resource = this.api.root.addResource('v1');
    const emails: apigw.Resource = root.addResource('emails');

    // point the api resource to the lambda function
    emails.addMethod(
      'POST',
      new apigw.LambdaIntegration(createEmailCampaignLambda, {
        proxy: true,
      }),
    );
  }
}
