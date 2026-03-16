import { describe, expect, it } from 'vitest';
import { parseGeminiResponse, createSseEvent, getChunkSignals } from '@/utils/image-modifier-helpers';

describe('parseGeminiResponse', () => {
  it('returns empty for null/undefined/non-object', () => {
    expect(parseGeminiResponse(null)).toEqual({});
    expect(parseGeminiResponse(undefined)).toEqual({});
    expect(parseGeminiResponse('string')).toEqual({});
    expect(parseGeminiResponse(42)).toEqual({});
  });

  it('extracts image from candidates[].content.parts[].inlineData', () => {
    const geminiPayload = {
      candidates: [
        {
          content: {
            parts: [{ inlineData: { data: 'base64data', mimeType: 'image/jpeg' } }],
          },
        },
      ],
    };
    expect(parseGeminiResponse(geminiPayload)).toEqual({
      imageBase64: 'base64data',
      mimeType: 'image/jpeg',
    });
  });

  it('defaults mimeType to image/png when inlineData has no mimeType', () => {
    const payload = {
      candidates: [{ content: { parts: [{ inlineData: { data: 'abc123' } }] } }],
    };
    expect(parseGeminiResponse(payload)).toEqual({
      imageBase64: 'abc123',
      mimeType: 'image/png',
    });
  });

  it('falls back to top-level data field', () => {
    const payload = { data: 'fallback-base64' };
    expect(parseGeminiResponse(payload)).toEqual({
      imageBase64: 'fallback-base64',
      mimeType: 'image/png',
    });
  });

  it('ignores empty top-level data string', () => {
    expect(parseGeminiResponse({ data: '' })).toEqual({});
  });

  it('returns empty when candidates exist but have no image parts', () => {
    const payload = {
      candidates: [{ content: { parts: [{ text: 'no image here' }] } }],
    };
    expect(parseGeminiResponse(payload)).toEqual({});
  });

  it('handles candidates with missing content gracefully', () => {
    const payload = { candidates: [{}] };
    expect(parseGeminiResponse(payload)).toEqual({});
  });

  it('picks first image part when multiple candidates exist', () => {
    const payload = {
      candidates: [
        { content: { parts: [{ text: 'hello' }] } },
        { content: { parts: [{ inlineData: { data: 'second-candidate', mimeType: 'image/webp' } }] } },
      ],
    };
    expect(parseGeminiResponse(payload)).toEqual({
      imageBase64: 'second-candidate',
      mimeType: 'image/webp',
    });
  });
});

describe('createSseEvent', () => {
  it('formats SSE with event and JSON data', () => {
    const result = createSseEvent('status', { progress: 50 });
    expect(result).toBe('event: status\ndata: {"progress":50}\n\n');
  });

  it('serializes nested payloads', () => {
    const result = createSseEvent('result', { image: 'abc', meta: { width: 100 } });
    expect(result).toBe('event: result\ndata: {"image":"abc","meta":{"width":100}}\n\n');
  });
});

describe('getChunkSignals', () => {
  it('returns all false for null/non-object', () => {
    expect(getChunkSignals(null)).toEqual({
      hasUsageMetadata: false,
      hasCandidate: false,
      hasFinishReason: false,
    });
  });

  it('detects usageMetadata', () => {
    const signals = getChunkSignals({ usageMetadata: { totalTokens: 100 } });
    expect(signals.hasUsageMetadata).toBe(true);
    expect(signals.hasCandidate).toBe(false);
  });

  it('detects candidate without finishReason', () => {
    const signals = getChunkSignals({ candidates: [{ content: {} }] });
    expect(signals.hasCandidate).toBe(true);
    expect(signals.hasFinishReason).toBe(false);
  });

  it('detects candidate with finishReason', () => {
    const signals = getChunkSignals({ candidates: [{ finishReason: 'STOP' }] });
    expect(signals.hasCandidate).toBe(true);
    expect(signals.hasFinishReason).toBe(true);
  });

  it('handles empty candidates array', () => {
    const signals = getChunkSignals({ candidates: [] });
    expect(signals.hasCandidate).toBe(false);
    expect(signals.hasFinishReason).toBe(false);
  });
});
