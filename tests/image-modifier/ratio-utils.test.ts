import { describe, expect, it } from 'vitest';
import { ratioToAspect, formatAspectRatio } from '@/components/dashboard/image-modifier/ratio-utils';

describe('ratioToAspect', () => {
  it('converts "16:9" to ~1.778', () => {
    expect(ratioToAspect('16:9')).toBeCloseTo(16 / 9);
  });

  it('converts "1:1" to 1', () => {
    expect(ratioToAspect('1:1')).toBe(1);
  });

  it('converts "9:16" to ~0.5625', () => {
    expect(ratioToAspect('9:16')).toBeCloseTo(9 / 16);
  });

  it('returns 1 for invalid input', () => {
    expect(ratioToAspect('')).toBe(1);
    expect(ratioToAspect('abc')).toBe(1);
    expect(ratioToAspect('0:0')).toBe(1);
  });
});

describe('formatAspectRatio', () => {
  it('reduces 1920x1080 to 16:9', () => {
    expect(formatAspectRatio(1920, 1080)).toBe('16:9');
  });

  it('reduces 1080x1080 to 1:1', () => {
    expect(formatAspectRatio(1080, 1080)).toBe('1:1');
  });

  it('reduces 1080x1350 to 4:5', () => {
    expect(formatAspectRatio(1080, 1350)).toBe('4:5');
  });

  it('handles non-standard dimensions', () => {
    expect(formatAspectRatio(800, 600)).toBe('4:3');
    expect(formatAspectRatio(2560, 1440)).toBe('16:9');
  });

  it('handles prime-number dimensions', () => {
    expect(formatAspectRatio(7, 11)).toBe('7:11');
  });
});
