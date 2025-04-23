#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { ExecCarsStatefulStack } from '../stateful/stateful';
import { ExecCarsStatelessStack } from '../stateless/stateless';
import { Stage } from '../types';
import { getEnvironmentConfig } from '../app-config';
import { getStage } from '../utils';

const stage = getStage(process.env.STAGE as Stage) as Stage;
const appConfig = getEnvironmentConfig(stage);

const app = new cdk.App();

const statefulStack = new ExecCarsStatefulStack(app, 'ExecCarsStatefulStack', {
  stage,
});

new ExecCarsStatelessStack(app, 'ExecCarsStatelessStack', {
  env: appConfig.env,
  stateless: appConfig.stateless,
  shared: appConfig.shared,
  table: statefulStack.table,
});
