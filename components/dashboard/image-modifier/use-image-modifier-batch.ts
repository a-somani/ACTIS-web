'use client';

import { useEffect, useRef, useState } from 'react';
import { formatAspectRatio } from '@/components/dashboard/image-modifier/ratio-utils';
import type { OriginalImageMeta } from '@/components/dashboard/image-modifier/types';
import { generateImageRequest } from '@/components/dashboard/image-modifier/generate-image-request';

export type BatchImageStatus = 'ready' | 'generating' | 'done' | 'error';

export interface BatchImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalImageMeta: OriginalImageMeta | null;
  status: BatchImageStatus;
  progress: number | null;
  resultImage: string | null;
  error: string | null;
}

interface UseImageModifierBatchResult {
  items: BatchImageItem[];
  isGeneratingAll: boolean;
  addFiles: (files: File[]) => Promise<void>;
  removeItem: (itemId: string) => void;
  clearAll: () => void;
  generateItem: (itemId: string, targetRatio: string) => Promise<void>;
  generateAll: (targetRatio: string) => Promise<void>;
  resetOutputsForRatioChange: () => void;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function createItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadImageMeta(previewUrl: string): Promise<OriginalImageMeta | null> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || !height) {
        resolve(null);
        return;
      }

      resolve({
        width,
        height,
        ratioLabel: formatAspectRatio(width, height),
      });
    };

    image.onerror = () => resolve(null);
    image.src = previewUrl;
  });
}

function canUseFile(file: File): boolean {
  return file.type.startsWith('image/') && file.size <= MAX_IMAGE_BYTES;
}

export function useImageModifierBatch(): UseImageModifierBatchResult {
  const [items, setItems] = useState<BatchImageItem[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const itemsRef = useRef<BatchImageItem[]>(items);

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

  const addFiles = async (files: File[]) => {
    const validFiles = files.filter(canUseFile);
    if (!validFiles.length) {
      return;
    }

    const nextItems = await Promise.all(
      validFiles.map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const originalImageMeta = await loadImageMeta(previewUrl);
        return {
          id: createItemId(),
          file,
          previewUrl,
          originalImageMeta,
          status: 'ready' as const,
          progress: null,
          resultImage: null,
          error: null,
        };
      }),
    );

    setItems((previous) => [...previous, ...nextItems]);
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

  const generateSingleItem = async (itemId: string, targetRatio: string) => {
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
      const { resultImage } = await generateImageRequest({
        file: item.file,
        targetRatio,
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
      const message = error instanceof Error ? error.message : 'Generation failed.';

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

  const generateItem = async (itemId: string, targetRatio: string) => {
    await generateSingleItem(itemId, targetRatio);
  };

  const generateAll = async (targetRatio: string) => {
    const queue = itemsRef.current.filter((item) => item.status !== 'generating');
    if (!queue.length) {
      return;
    }

    setIsGeneratingAll(true);

    try {
      for (const item of queue) {
        await generateSingleItem(item.id, targetRatio);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const resetOutputsForRatioChange = () => {
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
    resetOutputsForRatioChange,
  };
}
