import { CreateEmailCampaign } from '@dto/create-email-campaign';
import { EmailCampaign } from '@dto/email-campaign';
import { User } from '@dto/user';
import { config } from '@config';
import { getAll } from '@adapters/secondary/dynamodb-adapter';
import { getISOString } from '@shared';
import { scheduleEvent } from '@adapters/secondary/schedule-events';
import { v4 as uuid } from 'uuid';

const destinationQueueArn = config.get('destinationQueueArn');
const scheduleRoleArn = config.get('scheduleRoleArn');
const scheduleGroupName = config.get('scheduleGroupName');
const destinationDeadLetterQueueArn = config.get(
  'destinationDeadLetterQueueArn',
);
const tableName = config.get('tableName');

export async function createEmailCampaignUseCase(
  emailCampaign: CreateEmailCampaign,
): Promise<void> {
  try {
    const createdDate = getISOString();

    const users = await getAll<User>(tableName);

    const promises = users.map((user: User) => {
      return scheduleEvent({
        event: {
          id: uuid(),
          created: createdDate,
          toAddresses: [user.email],
          fromAddress: emailCampaign.fromAddress,
          subject: emailCampaign.subject,
          template: emailCampaign.template,
          firstName: user.firstName,
          lastName: user.lastName,
          scheduledDate: emailCampaign.scheduledDate,
        } as EmailCampaign,
        destinationQueueArn,
        scheduleRoleArn,
        scheduleGroupName,
        destinationDeadLetterQueueArn,
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('error creating email campaign:', error);
    throw new Error('failed to create email campaign');
  }
}
