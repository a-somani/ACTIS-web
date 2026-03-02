'use client';

import { useEffect, useState } from 'react';
import type { ImageModifierResponse, OriginalImageMeta, StreamEventPayload } from '@/components/dashboard/image-modifier/types';

interface GenerateImageParams {
  file: File;
  targetRatio: string;
  originalImageMeta: OriginalImageMeta | null;
}

interface UseImageModifierGenerationResult {
  resultImage: string | null;
  error: string | null;
  displayProgress: number | null;
  isLoading: boolean;
  hasGeneratedForCurrentImage: boolean;
  resetForNewInput: () => void;
  generateImage: (params: GenerateImageParams) => Promise<void>;
}

export function useImageModifierGeneration(): UseImageModifierGenerationResult {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusProgress, setStatusProgress] = useState<number | null>(null);
  const [displayProgress, setDisplayProgress] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedForCurrentImage, setHasGeneratedForCurrentImage] = useState(false);

  useEffect(() => {
    if (statusProgress === null) {
      setDisplayProgress(null);
      return;
    }

    setDisplayProgress((previous) => {
      if (previous === null) {
        return statusProgress;
      }
      return Math.max(previous, statusProgress);
    });
  }, [statusProgress]);

  useEffect(() => {
    if (!isLoading || displayProgress === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setDisplayProgress((previous) => {
        if (previous === null) {
          return previous;
        }
        const target = statusProgress ?? previous;
        if (previous < target) {
          return Math.min(target, previous + 1.4);
        }
        return previous;
      });
    }, 120);

    return () => window.clearInterval(timer);
  }, [isLoading, displayProgress, statusProgress]);

  const resetForNewInput = () => {
    setError(null);
    setStatusProgress(null);
    setDisplayProgress(null);
    setResultImage(null);
    setHasGeneratedForCurrentImage(false);
  };

  const applyResultImage = (data: ImageModifierResponse | StreamEventPayload) => {
    if (data.imageUrl) {
      setResultImage(data.imageUrl);
      return;
    }
    if (data.imageBase64) {
      const mime = data.mimeType ?? 'image/png';
      setResultImage(`data:${mime};base64,${data.imageBase64}`);
    }
  };

  const handleSseEvent = (eventType: string, eventData: string) => {
    let parsedData: StreamEventPayload = {};
    try {
      parsedData = JSON.parse(eventData) as StreamEventPayload;
    } catch {
      parsedData = {};
    }

    if (eventType === 'status') {
      if (typeof parsedData.progress === 'number') {
        setStatusProgress(parsedData.progress);
      }
      return;
    }

    if (eventType === 'result') {
      applyResultImage(parsedData);
      return;
    }

    if (eventType === 'error') {
      setError(parsedData.message ?? 'Generation failed.');
      return;
    }

    if (eventType === 'done') {
      setStatusProgress(typeof parsedData.progress === 'number' ? parsedData.progress : 100);
    }
  };

  const generateImage = async ({ file, targetRatio, originalImageMeta }: GenerateImageParams) => {
    if (hasGeneratedForCurrentImage) {
      return;
    }

    setError(null);
    setStatusProgress(null);
    setDisplayProgress(2);
    setHasGeneratedForCurrentImage(true);
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append('image', file);
      payload.append('targetRatio', targetRatio);
      if (originalImageMeta) {
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
        const data = (await response.json()) as ImageModifierResponse;
        throw new Error(data.error ?? 'Image generation failed.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming is not available in this browser.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

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
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resultImage,
    error,
    displayProgress,
    isLoading,
    hasGeneratedForCurrentImage,
    resetForNewInput,
    generateImage,
  };
}
