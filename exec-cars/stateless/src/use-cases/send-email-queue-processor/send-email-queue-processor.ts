import { EmailCampaign } from '@dto/email-campaign';
import { SQSRecord } from 'aws-lambda';
import { getEmailTemplate } from '@email-templates/get-email-template';
import { renderEmail } from '@shared/render-email';
import { sendEmail } from '@adapters/secondary/email-adapter';

export async function queueProcessorUseCase(
  newEvent: SQSRecord,
): Promise<SQSRecord> {
  const email = JSON.parse(newEvent.body) as EmailCampaign;

  const template = getEmailTemplate(email.template);

  const html = renderEmail(template, {
    firstName: email.firstName,
  });

  await sendEmail({
    sourceEmail: email.fromAddress,
    subject: email.subject,
    toAddresses: email.toAddresses,
    htmlBody: html,
  });

  return newEvent;
}
