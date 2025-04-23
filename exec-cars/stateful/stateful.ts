import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

import { Construct } from 'constructs';
import { SimpleTable } from '../app-constructs/simple-table';
import { Stage } from '../types';
import { getRemovalPolicyFromStage } from '../utils';

export interface ExecCarsStatefulStackStackProps extends cdk.StackProps {
  stage: string;
}

export class ExecCarsStatefulStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(
    scope: Construct,
    id: string,
    props: ExecCarsStatefulStackStackProps,
  ) {
    super(scope, id, props);

    const { stage } = props;

    this.table = new SimpleTable(this, 'Table', {
      tableName: `exec-cars-user-table-${stage}`,
      stageName: stage,
      nonStages: [Stage.prod, Stage.staging],
      dataPath: path.join(__dirname, '../data/'),
      removalPolicy: getRemovalPolicyFromStage(stage),
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
    }).table;
  }
}
