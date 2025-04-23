import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { logger } from '@shared';

const sesClient = new SESClient();

interface SendEmailParams {
  sourceEmail: string;
  toAddresses: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
}

export async function sendEmail({
  sourceEmail,
  toAddresses,
  subject,
  textBody,
  htmlBody,
}: SendEmailParams): Promise<void> {
  try {
    if (!textBody && !htmlBody) {
      throw new Error('either textBody or htmlBody must be provided.');
    }

    const messageBody: any = {};
    if (textBody) {
      messageBody.Text = {
        Data: textBody,
        Charset: 'UTF-8',
      };
    }
    if (htmlBody) {
      messageBody.Html = {
        Data: htmlBody,
        Charset: 'UTF-8',
      };
    }

    const params = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: messageBody,
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    logger.info(
      `email sent successfully with MessageId: ${response.MessageId}`,
    );
  } catch (error) {
    logger.error(`error sending email: ${error}`);
    throw error;
  }
}
