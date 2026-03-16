import { describe, expect, it } from 'vitest';
import { getPaymentReason, formatBillingCycle } from '@/utils/paddle/data-helpers';

describe('getPaymentReason', () => {
  it('returns "New" for web origin', () => {
    expect(getPaymentReason('web')).toBe('New');
  });

  it('returns "New" for subscription_charge origin', () => {
    expect(getPaymentReason('subscription_charge')).toBe('New');
  });

  it('returns "Renewal of " for any other origin', () => {
    expect(getPaymentReason('subscription_recurring')).toBe('Renewal of ');
    expect(getPaymentReason('import')).toBe('Renewal of ');
  });
});

describe('formatBillingCycle', () => {
  it('returns singular label for frequency 1', () => {
    expect(formatBillingCycle({ frequency: 1, interval: 'month' })).toBe('monthly');
    expect(formatBillingCycle({ frequency: 1, interval: 'year' })).toBe('yearly');
    expect(formatBillingCycle({ frequency: 1, interval: 'week' })).toBe('weekly');
    expect(formatBillingCycle({ frequency: 1, interval: 'day' })).toBe('daily');
  });

  it('returns "every N units" for frequency > 1', () => {
    expect(formatBillingCycle({ frequency: 3, interval: 'month' })).toBe('every 3 months');
    expect(formatBillingCycle({ frequency: 2, interval: 'week' })).toBe('every 2 weeks');
    expect(formatBillingCycle({ frequency: 6, interval: 'day' })).toBe('every 6 days');
    expect(formatBillingCycle({ frequency: 2, interval: 'year' })).toBe('every 2 years');
  });
});
