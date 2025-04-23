import { template as blackFriday2025 } from './black-friday';

const emailTemplates: Record<string, string> = {
  'black-friday-2025': blackFriday2025,
};

export function getEmailTemplate(key: string): string {
  const template = emailTemplates[key];
  if (!template) {
    throw new Error(`email template not found for key: ${key}`);
  }
  return template;
}
