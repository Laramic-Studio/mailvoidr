import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CampaignStateBanner } from '@/components/newsletter/CampaignStateBanner';
import { StatusPill } from '@/components/newsletter/StatusPill';

function renderBanner(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('StatusPill', () => {
  it('shows the API word in sentence case with text, not color alone', () => {
    render(<StatusPill status="auto_paused" />);
    expect(screen.getByText('Auto-paused')).toBeTruthy();
    render(<StatusPill status="in_review" />);
    expect(screen.getByText('In review')).toBeTruthy();
    render(<StatusPill status="complained" />);
    expect(screen.getByText('Complained')).toBeTruthy();
  });
});

describe('CampaignStateBanner', () => {
  it('hides resume on auto_paused and names the reason', () => {
    renderBanner(
      <CampaignStateBanner status="auto_paused" autoPauseReason="bounce_rate_threshold" />,
    );
    expect(screen.getByText('Bounce rate passed the limit')).toBeTruthy();
    expect(screen.getByText('Our team has been alerted.')).toBeTruthy();
    expect(screen.getByTestId('campaign-contact-support')).toBeTruthy();
    expect(screen.queryByTestId('campaign-resume')).toBeNull();
  });

  it('offers resume only for a manual pause', () => {
    renderBanner(<CampaignStateBanner status="paused" />);
    expect(screen.getByTestId('campaign-resume')).toBeTruthy();
    expect(screen.getByText('Paused by you.')).toBeTruthy();
  });

  it('estimates time left from the recent rate', () => {
    renderBanner(
      <CampaignStateBanner
        status="sending"
        sentCount={20}
        totalRecipients={500}
        recentSendsPerMinute={1}
      />,
    );
    expect(screen.getByText(/About 8 h left/)).toBeTruthy();
  });
});
