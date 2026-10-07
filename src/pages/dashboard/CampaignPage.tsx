import { useSearchParams, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { QueryErrorState } from '@/components/QueryErrorState';
import CampaignBuilder from '@/pages/dashboard/CampaignBuilder';
import CampaignDetail from '@/pages/dashboard/CampaignDetail';
import { useCampaign } from '@/hooks/useNewsletter';

export default function CampaignPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const query = useCampaign(id);

  if (query.isLoading) {
    return <DashboardLayout><p className="text-[13px] text-muted-foreground">Loading campaign…</p></DashboardLayout>;
  }

  if (query.isError || !query.data) {
    return (
      <DashboardLayout>
        <QueryErrorState error={query.error} subject="this campaign" onRetry={() => void query.refetch()} framed />
      </DashboardLayout>
    );
  }

  const campaign = query.data.campaign;
  const editing = campaign.status === 'draft' || (campaign.status === 'scheduled' && params.get('edit') === '1');
  if (editing) return <CampaignBuilder campaign={campaign} />;
  return <CampaignDetail campaign={campaign} />;
}
