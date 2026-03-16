import { describe, expect, it } from 'vitest';
import { convertAmountFromLowestUnit, formatMoney, parseMoney } from '@/utils/paddle/parse-money';

describe('convertAmountFromLowestUnit', () => {
  it('divides by 100 for standard currencies (USD, EUR, GBP)', () => {
    expect(convertAmountFromLowestUnit('1999', 'USD')).toBe(19.99);
    expect(convertAmountFromLowestUnit('500', 'EUR')).toBe(5);
    expect(convertAmountFromLowestUnit('12345', 'GBP')).toBe(123.45);
  });

  it('returns raw value for zero-decimal currencies (JPY, KRW)', () => {
    expect(convertAmountFromLowestUnit('1500', 'JPY')).toBe(1500);
    expect(convertAmountFromLowestUnit('50000', 'KRW')).toBe(50000);
  });

  it('handles "0" input', () => {
    expect(convertAmountFromLowestUnit('0', 'USD')).toBe(0);
    expect(convertAmountFromLowestUnit('0', 'JPY')).toBe(0);
  });
});

describe('formatMoney', () => {
  it('formats USD by default', () => {
    const result = formatMoney(19.99, 'USD');
    expect(result).toContain('19.99');
  });

  it('formats JPY without decimals', () => {
    const result = formatMoney(1500, 'JPY');
    expect(result).toContain('1,500');
  });

  it('defaults to $0.00 with no args', () => {
    const result = formatMoney();
    expect(result).toContain('0.00');
  });
});

describe('parseMoney', () => {
  it('converts from lowest unit and formats', () => {
    const result = parseMoney('1999', 'USD');
    expect(result).toContain('19.99');
  });

  it('handles JPY without division', () => {
    const result = parseMoney('1500', 'JPY');
    expect(result).toContain('1,500');
  });

  it('defaults to $0.00', () => {
    const result = parseMoney();
    expect(result).toContain('0.00');
  });
});
