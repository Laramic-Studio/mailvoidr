import { describe, expect, it } from 'vitest';
import {
  abTestBlockers,
  audienceReceiptCopy,
  autoPauseTitle,
  campaignActions,
  campaignNeedsPhysicalAddress,
  campaignReasonLine,
  formatComplaint,
  formatRate,
  inReviewMessage,
  maskEmail,
  perVariantCount,
  reviewSendFloor,
  sendingEta,
  statusLabel,
  subscriberCapNotice,
  subscriberMeterCopy,
  subscriberMeterKnown,
  subscriberPlanLimitMessage,
  tenantCanResume,
} from '@/lib/newsletter/format';
import { normalizeAudience, normalizeCampaign, normalizeSettings } from '@/lib/newsletter/normalize';

describe('status labels', () => {
  it('sentence-cases API words and hyphenates auto-paused', () => {
    expect(statusLabel('pending')).toBe('Pending');
    expect(statusLabel('in_review')).toBe('In review');
    expect(statusLabel('auto_paused')).toBe('Auto-paused');
    expect(statusLabel('needs_manual_pick')).toBe('Needs manual pick');
    expect(statusLabel('winner_picked')).toBe('Winner picked');
  });
});

describe('formatRate', () => {
  it('displays API percents as-is and never scales by 100', () => {
    expect(formatRate(0.04)).toBe('0.04%');
    expect(formatRate(0.1)).toBe('0.10%');
    expect(formatRate(1)).toBe('1.0%');
    expect(formatRate(12.34)).toBe('12.3%');
    expect(formatRate(null)).toBe('—');
  });
});

describe('formatComplaint', () => {
  it('does not show 0 before complaint ingestion is live', () => {
    expect(formatComplaint(null, false)).toBe('Not available yet');
    expect(formatComplaint(0, false)).toBe('Not available yet');
    expect(formatComplaint(0)).toBe('Not available yet');
    expect(formatComplaint(0, true)).toBe('0.00%');
    expect(formatComplaint(0.1, true)).toBe('0.10%');
  });
});

describe('sending ETA', () => {
  it('uses the recent rate and switches to hours at an hour', () => {
    expect(sendingEta({
      sentCount: 20,
      totalRecipients: 500,
      recentSendsPerMinute: 1,
    })).toBe('About 8 h left');

    expect(sendingEta({
      sentCount: 10,
      totalRecipients: 40,
      recentSendsPerMinute: 2,
    })).toBe('About 15 min left');
  });

  it('does not invent a rate from the workspace cap', () => {
    expect(sendingEta({
      sentCount: 0,
      totalRecipients: 1000,
      recentSendsPerMinute: null,
    })).toBeNull();
  });
});

describe('review send floor', () => {
  it('uses the workspace cap only', () => {
    expect(reviewSendFloor({ totalRecipients: 480, sendsPerMinute: 1 })).toBe('At least 8 h to send');
    expect(reviewSendFloor({ totalRecipients: 30, sendsPerMinute: 2 })).toBe('At least 15 min to send');
    expect(reviewSendFloor({ totalRecipients: 30, sendsPerMinute: null })).toBeNull();
  });
});

describe('A/B eligibility', () => {
  it('names each failed rule', () => {
    expect(perVariantCount(200, 50)).toBe(50);
    expect(abTestBlockers(200, 50)).toEqual([]);
    expect(abTestBlockers(100, 50).join(' ')).toMatch(/200 eligible/);
    expect(abTestBlockers(200, 10).join(' ')).toMatch(/50 recipients/);
    expect(abTestBlockers(100, 10)).toHaveLength(2);
  });
});

describe('auto pause', () => {
  it('maps reason codes and withholds tenant resume', () => {
    expect(autoPauseTitle('bounce_rate_threshold')).toBe('Bounce rate passed the limit');
    expect(autoPauseTitle('complaint_rate_threshold')).toBe('Complaint rate passed the limit');
    expect(autoPauseTitle('deliverability_hold')).toBe('Sending paused to protect deliverability');
    expect(tenantCanResume('auto_paused')).toBe(false);
    expect(tenantCanResume('paused')).toBe(true);
    expect(campaignActions('auto_paused')).toEqual(['contact_support']);
    expect(campaignActions('paused')).toEqual(['resume', 'cancel']);
    expect(campaignReasonLine({
      status: 'auto_paused',
      auto_pause_reason: 'complaint_rate_threshold',
    })).toBe('Complaint rate passed the limit');
  });
});

describe('review copy', () => {
  it('includes turnaround only when config provides it', () => {
    expect(inReviewMessage(null)).toBe('Your first large send is being reviewed.');
    expect(inReviewMessage('one business day')).toBe(
      'Your first large send is being reviewed. This usually takes up to one business day.',
    );
  });

  it('formats the audience receipt line', () => {
    expect(audienceReceiptCopy({ eligible: 1240, pending: 86, suppressed: 31 })).toBe(
      '1,240 will receive this. 86 pending and 31 suppressed are left out.',
    );
  });
});

describe('subscriber meter', () => {
  it('shows subscriber used and limit and does not invent a send quota', () => {
    expect(subscriberMeterKnown(2400, 3000)).toBe(true);
    expect(subscriberMeterKnown(undefined, undefined)).toBe(false);
    expect(subscriberMeterCopy(2400, 3000)).toBe(
      '2,400 of 3,000 subscribers. Campaign sends are unlimited and follow the workspace send rate.',
    );
    expect(subscriberMeterCopy(10, null)).toContain('does not cap subscribers');
    expect(subscriberCapNotice(3000, 3000)).toContain('3,000 of 3,000');
    expect(subscriberCapNotice(2999, 3000)).toBeNull();
  });

  it('surfaces a 402 as the subscriber cap', () => {
    const error = {
      isAxiosError: true,
      response: { status: 402, data: { message: 'Subscriber limit reached (3000).' } },
    };
    expect(subscriberPlanLimitMessage(error)).toBe('Subscriber limit reached (3000).');
    expect(subscriberPlanLimitMessage({ isAxiosError: true, response: { status: 422, data: {} } })).toBeNull();
  });
});

describe('US physical address', () => {
  it('requires an address only when the campaign or audience is US-targeted', () => {
    expect(campaignNeedsPhysicalAddress(true, false)).toBe(true);
    expect(campaignNeedsPhysicalAddress(false, true)).toBe(true);
    expect(campaignNeedsPhysicalAddress(false, false)).toBe(false);
    expect(campaignNeedsPhysicalAddress(null, null)).toBe(false);
  });

  it('reads subscriber meter and US targeting from the API payload', () => {
    expect(normalizeSettings({ subscribers_used: 12, subscriber_limit: 3000 }).subscribers_used).toBe(12);
    expect(normalizeSettings({ subscribers: { used: 4, limit: null } }).subscriber_limit).toBeNull();
    expect(normalizeSettings({ physical_address: null }).subscribers_used).toBeUndefined();
    expect(normalizeAudience({ id: 'a', us_targeted: true }).us_targeted).toBe(true);
    expect(normalizeCampaign({ id: 'c', country: 'US' }).us_targeted).toBe(true);
    expect(normalizeCampaign({ id: 'c' }).us_targeted).toBeNull();
  });
});

describe('maskEmail', () => {
  it('keeps the domain and never echoes a full local part', () => {
    expect(maskEmail('lateef@gmail.com')).toBe('l•••@gmail.com');
    expect(maskEmail('l•••@gmail.com')).toBe('l•••@gmail.com');
    expect(maskEmail('')).toBe('•••');
  });
});
