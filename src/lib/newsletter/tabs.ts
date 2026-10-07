export type CampaignListTab = 'all' | 'drafts' | 'scheduled' | 'sending' | 'sent';

export const CAMPAIGN_LIST_TABS: { id: CampaignListTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'sending', label: 'Sending' },
  { id: 'sent', label: 'Sent' },
];
