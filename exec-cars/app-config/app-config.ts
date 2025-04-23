import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Region, Stage } from '../types';

export interface EnvironmentConfig {
  shared: {
    stage: Stage;
    serviceName: string;
    metricNamespace: string;
    logging: {
      logLevel: 'DEBUG' | 'INFO' | 'ERROR';
      logEvent: 'true' | 'false';
    };
  };
  env: {
    account: string;
    region: string;
  };
  stateless: {
    runtimes: lambda.Runtime;
  };
  stateful: {};
}

export const getEnvironmentConfig = (stage: Stage): EnvironmentConfig => {
  switch (stage) {
    case Stage.test:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `exec-cars-service-${Stage.test}`,
          metricNamespace: `gilmore-exec-cars-${Stage.test}`,
          stage: Stage.test,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_22_X,
        },
        env: {
          account: '12345678912',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.staging:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `exec-cars-service-${Stage.staging}`,
          metricNamespace: `gilmore-exec-cars-${Stage.staging}`,
          stage: Stage.staging,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_22_X,
        },
        env: {
          account: '12345678912',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.prod:
      return {
        shared: {
          logging: {
            logLevel: 'INFO',
            logEvent: 'true',
          },
          serviceName: `exec-cars-service-${Stage.prod}`,
          metricNamespace: `gilmore-exec-cars-${Stage.prod}`,
          stage: Stage.prod,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_22_X,
        },
        env: {
          account: '12345678912',
          region: Region.dublin,
        },
        stateful: {},
      };
    case Stage.develop:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `exec-cars-service-${Stage.develop}`,
          metricNamespace: `gilmore-exec-cars-${Stage.develop}`,
          stage: Stage.develop,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_22_X,
        },
        env: {
          account: '12345678912',
          region: Region.dublin,
        },
        stateful: {},
      };
    default:
      return {
        shared: {
          logging: {
            logLevel: 'DEBUG',
            logEvent: 'true',
          },
          serviceName: `exec-cars-service-${stage}`,
          metricNamespace: `gilmore-exec-cars-${stage}`,
          stage: stage,
        },
        stateless: {
          runtimes: lambda.Runtime.NODEJS_22_X,
        },
        env: {
          account: '12345678912',
          region: Region.dublin,
        },
        stateful: {},
      };
  }
};
