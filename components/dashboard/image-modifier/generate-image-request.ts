import type {
  ImageModifierResponse,
  OriginalImageMeta,
  StreamEventPayload,
} from '@/components/dashboard/image-modifier/types';
import { compressForUpload } from '@/utils/compress-image';

interface GenerateImageRequestParams {
  file: File;
  targetRatio: string;
  originalImageMeta: OriginalImageMeta | null;
  onProgress?: (progress: number) => void;
}

interface GenerateImageRequestResult {
  resultImage: string;
}

function toDataUrl(payload: Pick<StreamEventPayload, 'imageBase64' | 'imageUrl' | 'mimeType'>): string | null {
  if (payload.imageUrl) {
    return payload.imageUrl;
  }

  if (payload.imageBase64) {
    const mime = payload.mimeType ?? 'image/png';
    return `data:${mime};base64,${payload.imageBase64}`;
  }

  return null;
}

export async function generateImageRequest({
  file,
  targetRatio,
  originalImageMeta,
  onProgress,
}: GenerateImageRequestParams): Promise<GenerateImageRequestResult> {
  const uploadFile = await compressForUpload(file);
  const payload = new FormData();
  payload.append('image', uploadFile);
  payload.append('targetRatio', targetRatio);

  const shouldSendSourceMeta = Boolean(originalImageMeta && originalImageMeta.ratioLabel !== targetRatio);
  if (shouldSendSourceMeta && originalImageMeta) {
    payload.append('sourceWidth', originalImageMeta.width.toString());
    payload.append('sourceHeight', originalImageMeta.height.toString());
    payload.append('sourceRatio', originalImageMeta.ratioLabel);
  }

  const response = await fetch('/api/image-modifier/stream', {
    method: 'POST',
    body: payload,
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.includes('text/event-stream')) {
    const text = await response.text();
    let errorMessage = `Image generation failed (${response.status}).`;
    try {
      const data = JSON.parse(text) as ImageModifierResponse;
      errorMessage = data.error ?? errorMessage;
    } catch {
      if (text.length > 0 && text.length < 200) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not available in this browser.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let resultImage: string | null = null;

  let serverError: string | null = null;

  const handleSseEvent = (eventType: string, eventData: string) => {
    let parsedData: StreamEventPayload = {};

    try {
      parsedData = JSON.parse(eventData) as StreamEventPayload;
    } catch {
      parsedData = {};
    }

    if (eventType === 'status') {
      if (typeof parsedData.progress === 'number') {
        onProgress?.(parsedData.progress);
      }
      return;
    }

    if (eventType === 'result') {
      const dataUrl = toDataUrl(parsedData);
      if (dataUrl) {
        resultImage = dataUrl;
      }
      return;
    }

    if (eventType === 'error') {
      serverError = parsedData.message ?? 'Generation failed.';
      return;
    }

    if (eventType === 'done') {
      onProgress?.(typeof parsedData.progress === 'number' ? parsedData.progress : 100);
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split('\n\n');
      buffer = messages.pop() ?? '';

      for (const message of messages) {
        const lines = message.split('\n');
        const eventLine = lines.find((line) => line.startsWith('event:'));
        const dataLine = lines.find((line) => line.startsWith('data:'));

        if (!eventLine || !dataLine) {
          continue;
        }

        const eventType = eventLine.slice(6).trim();
        const eventData = dataLine.slice(5).trim();
        handleSseEvent(eventType, eventData);
      }
    }
  } catch (streamError) {
    if (!resultImage) {
      const msg = streamError instanceof Error ? streamError.message : 'Connection lost during generation.';
      throw new Error(msg);
    }
  }

  if (serverError) {
    throw new Error(serverError);
  }

  if (!resultImage) {
    throw new Error('No generated image was returned.');
  }

  return { resultImage };
}
