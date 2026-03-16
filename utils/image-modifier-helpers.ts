export interface ParsedResult {
  imageBase64?: string;
  mimeType?: string;
}

export function parseGeminiResponse(data: unknown): ParsedResult {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const response = data as {
    data?: string;
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
  };

  const parts = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const imagePart = parts.find((part) => typeof part.inlineData?.data === 'string');

  if (imagePart?.inlineData?.data) {
    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    };
  }

  if (typeof response.data === 'string' && response.data.length > 0) {
    return { imageBase64: response.data, mimeType: 'image/png' };
  }

  return {};
}

export function createSseEvent(event: string, payload: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export interface ChunkSignals {
  hasUsageMetadata: boolean;
  hasCandidate: boolean;
  hasFinishReason: boolean;
}

export function getChunkSignals(data: unknown): ChunkSignals {
  if (!data || typeof data !== 'object') {
    return { hasUsageMetadata: false, hasCandidate: false, hasFinishReason: false };
  }

  const response = data as {
    usageMetadata?: unknown;
    candidates?: Array<{ finishReason?: unknown }>;
  };

  const firstCandidate = response.candidates?.[0];
  return {
    hasUsageMetadata: Boolean(response.usageMetadata),
    hasCandidate: Boolean(firstCandidate),
    hasFinishReason: Boolean(firstCandidate?.finishReason),
  };
}
