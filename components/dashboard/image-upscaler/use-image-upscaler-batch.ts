'use client';

import { useEffect, useRef, useState } from 'react';
import type { UpscalerOriginalImageMeta } from '@/components/dashboard/image-upscaler/types';
import { upscaleImageRequest } from '@/components/dashboard/image-upscaler/upscale-image-request';

export type UpscalerBatchImageStatus = 'ready' | 'generating' | 'done' | 'error';

export interface UpscalerBatchImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalImageMeta: UpscalerOriginalImageMeta | null;
  status: UpscalerBatchImageStatus;
  progress: number | null;
  resultImage: string | null;
  error: string | null;
}

interface UseImageUpscalerBatchResult {
  items: UpscalerBatchImageItem[];
  isGeneratingAll: boolean;
  addFiles: (files: File[]) => void;
  removeItem: (itemId: string) => void;
  clearAll: () => void;
  generateItem: (itemId: string, scaleFactor: string) => Promise<void>;
  generateAll: (scaleFactor: string) => Promise<void>;
  resetOutputsForScaleChange: () => void;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function createItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadImageMeta(previewUrl: string): Promise<UpscalerOriginalImageMeta | null> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || !height) {
        resolve(null);
        return;
      }

      resolve({ width, height });
    };

    image.onerror = () => resolve(null);
    image.src = previewUrl;
  });
}

function canUseFile(file: File): boolean {
  return file.type.startsWith('image/') && file.size <= MAX_IMAGE_BYTES;
}

export function useImageUpscalerBatch(): UseImageUpscalerBatchResult {
  const [items, setItems] = useState<UpscalerBatchImageItem[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const itemsRef = useRef<UpscalerBatchImageItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(canUseFile);
    if (!validFiles.length) {
      return;
    }

    const nextItems: UpscalerBatchImageItem[] = validFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: createItemId(),
        file,
        previewUrl,
        originalImageMeta: null,
        status: 'ready' as const,
        progress: null,
        resultImage: null,
        error: null,
      };
    });

    setItems((previous) => [...previous, ...nextItems]);

    for (const item of nextItems) {
      loadImageMeta(item.previewUrl).then((meta) => {
        if (!meta) return;
        setItems((previous) =>
          previous.map((candidate) =>
            candidate.id === item.id ? { ...candidate, originalImageMeta: meta } : candidate,
          ),
        );
      });
    }
  };

  const removeItem = (itemId: string) => {
    setItems((previous) => {
      const item = previous.find((candidate) => candidate.id === itemId);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return previous.filter((candidate) => candidate.id !== itemId);
    });
  };

  const clearAll = () => {
    setItems((previous) => {
      for (const item of previous) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return [];
    });
  };

  const upscaleSingleItem = async (itemId: string, scaleFactor: string) => {
    const item = itemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item || item.status === 'generating') {
      return;
    }

    setItems((previous) =>
      previous.map((candidate) =>
        candidate.id === itemId
          ? {
              ...candidate,
              status: 'generating',
              progress: 2,
              error: null,
            }
          : candidate,
      ),
    );

    try {
      const { resultImage } = await upscaleImageRequest({
        file: item.file,
        scaleFactor,
        originalImageMeta: item.originalImageMeta,
        onProgress: (progress) => {
          setItems((previous) =>
            previous.map((candidate) =>
              candidate.id === itemId
                ? {
                    ...candidate,
                    progress: Math.max(candidate.progress ?? 0, Math.round(progress)),
                  }
                : candidate,
            ),
          );
        },
      });

      setItems((previous) =>
        previous.map((candidate) =>
          candidate.id === itemId
            ? {
                ...candidate,
                status: 'done',
                progress: 100,
                resultImage,
                error: null,
              }
            : candidate,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upscale failed.';

      setItems((previous) =>
        previous.map((candidate) =>
          candidate.id === itemId
            ? {
                ...candidate,
                status: 'error',
                progress: null,
                error: message,
              }
            : candidate,
        ),
      );
    }
  };

  const generateItem = async (itemId: string, scaleFactor: string) => {
    await upscaleSingleItem(itemId, scaleFactor);
  };

  const generateAll = async (scaleFactor: string) => {
    const queue = itemsRef.current.filter((item) => item.status !== 'generating');
    if (!queue.length) {
      return;
    }

    setIsGeneratingAll(true);

    try {
      for (const item of queue) {
        await upscaleSingleItem(item.id, scaleFactor);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const resetOutputsForScaleChange = () => {
    setItems((previous) =>
      previous.map((item) => ({
        ...item,
        status: 'ready',
        progress: null,
        resultImage: null,
        error: null,
      })),
    );
  };

  return {
    items,
    isGeneratingAll,
    addFiles,
    removeItem,
    clearAll,
    generateItem,
    generateAll,
    resetOutputsForScaleChange,
  };
}
