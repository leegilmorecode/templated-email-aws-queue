export type EmailCampaign = {
  id: string;
  created: string;
  template: string;
  subject: string;
  datetime: string;
  toAddresses: string[];
  fromAddress: string;
  firstName: string;
  lastName: string;
  scheduledDate: string;
  campaignName: string;
};
