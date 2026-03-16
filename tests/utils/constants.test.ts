import { describe, expect, it } from 'vitest';
import { resolveExpandRatio, createNanoBananaExpandPrompt, DEFAULT_EXPAND_RATIO } from '@/utils/constants';

describe('resolveExpandRatio', () => {
  it('returns default when given null', () => {
    expect(resolveExpandRatio(null)).toBe(DEFAULT_EXPAND_RATIO);
  });

  it('returns default when given empty string', () => {
    expect(resolveExpandRatio('')).toBe(DEFAULT_EXPAND_RATIO);
  });

  it('returns default for an unknown ratio', () => {
    expect(resolveExpandRatio('7:3')).toBe(DEFAULT_EXPAND_RATIO);
  });

  it.each(['1:1', '4:5', '9:16', '3:4', '2:3', '16:9'])('accepts known ratio %s', (ratio) => {
    expect(resolveExpandRatio(ratio)).toBe(ratio);
  });
});

describe('createNanoBananaExpandPrompt', () => {
  it('includes target ratio in the prompt', () => {
    const prompt = createNanoBananaExpandPrompt({ targetRatio: '16:9' });
    expect(prompt).toContain('16:9');
  });

  it('excludes source details when none provided', () => {
    const prompt = createNanoBananaExpandPrompt({ targetRatio: '1:1' });
    expect(prompt).not.toContain('Input image');
  });

  it('includes full source details when width, height, and ratio are present', () => {
    const prompt = createNanoBananaExpandPrompt({
      targetRatio: '9:16',
      sourceRatio: '1:1',
      sourceWidth: 1080,
      sourceHeight: 1080,
    });
    expect(prompt).toContain('Input image details: 1080x1080 (1:1).');
  });

  it('includes only ratio when source dimensions are missing', () => {
    const prompt = createNanoBananaExpandPrompt({
      targetRatio: '9:16',
      sourceRatio: '4:5',
    });
    expect(prompt).toContain('Input image aspect ratio: 4:5.');
    expect(prompt).not.toContain('Input image details:');
  });
});
