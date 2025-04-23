export const schema = {
  type: 'object',
  required: [
    'subject',
    'template',
    'fromAddress',
    'scheduledDate',
    'campaignName',
  ],
  maxProperties: 5,
  minProperties: 5,
  properties: {
    subject: { type: 'string' },
    template: { type: 'string' },
    fromAddress: { type: 'string', format: 'email' },
    scheduledDate: { type: 'string', format: 'date-time' },
    campaignName: { type: 'string' },
  },
};
