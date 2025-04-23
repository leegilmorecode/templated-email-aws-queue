import {
  ActionAfterCompletion,
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';

import { formatISODatetimeForScheduler } from '@shared/date-utils';

const client = new SchedulerClient({});

export async function scheduleEvent({
  event,
  destinationQueueArn,
  scheduleRoleArn,
  scheduleGroupName,
  destinationDeadLetterQueueArn,
}: {
  event: Record<string, any>;
  destinationQueueArn: string;
  scheduleRoleArn: string;
  scheduleGroupName: string;
  destinationDeadLetterQueueArn: string;
}) {
  await client.send(
    new CreateScheduleCommand({
      Name: event.id,
      GroupName: scheduleGroupName,
      ActionAfterCompletion: ActionAfterCompletion.DELETE,
      Target: {
        RoleArn: scheduleRoleArn,
        Arn: destinationQueueArn,
        Input: JSON.stringify(event),
        DeadLetterConfig: { Arn: destinationDeadLetterQueueArn },
      },
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF,
      },
      Description: `${event.id} was created for ${event.userEmail}`,
      ScheduleExpression: `at(${formatISODatetimeForScheduler(
        event.scheduledDate,
      )})`,
    }),
  );
}
