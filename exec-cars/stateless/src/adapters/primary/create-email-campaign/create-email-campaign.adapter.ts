import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { errorHandler, getHeaders, logger, schemaValidator } from '@shared';

import { CreateEmailCampaign } from '@dto/create-email-campaign';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { ValidationError } from '@errors/validation-error';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { config } from '@config';
import { createEmailCampaignUseCase } from '@use-cases/create-email-campaign';
import httpErrorHandler from '@middy/http-error-handler';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import middy from '@middy/core';
import { schema } from './create-email-campaign.schema';

const tracer = new Tracer();
const metrics = new Metrics();

const stage = config.get('stage');

export const createEmailCampaignAdapter = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new ValidationError('no payload body');

    const emailCampaign = JSON.parse(body) as CreateEmailCampaign;

    schemaValidator(schema, emailCampaign);

    await createEmailCampaignUseCase(emailCampaign);

    metrics.addMetric('SuccessfulCreateEmailCampaign', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      body: JSON.stringify(emailCampaign),
      headers: getHeaders(stage),
    };
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    logger.error(errorMessage);

    metrics.addMetric('CreateEmailCampaignError', MetricUnit.Count, 1);

    return errorHandler(error);
  }
};

export const handler = middy(createEmailCampaignAdapter)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
  .use(httpErrorHandler());
