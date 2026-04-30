'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { upscaleImageRequest } from '@/components/dashboard/image-upscaler/upscale-image-request';
import {
  UpscaleDefaultFactor,
  UpscalePhaseFallbackMessages,
} from '@/components/dashboard/image-upscaler/upscale-constants';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';

export interface UpscaleHistoryItem {
  id: string;
  sourceFile: File;
  sourcePreviewUrl: string;
  resultImage: string;
  fileName: string;
  scaleFactor: string;
}

interface UpscaleWorkbenchState {
  credits: CreditSummaryResponse | null;
  creditsError: string | null;
  isLoadingCredits: boolean;
  sourceFile: File | null;
  sourcePreviewUrl: string | null;
  scaleFactor: string;
  isGenerating: boolean;
  progress: number | null;
  phaseMessage: string | null;
  resultImage: string | null;
  error: string | null;
  history: UpscaleHistoryItem[];
}

function createItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildFallbackMessage(progress: number): string {
  const index = Math.min(
    UpscalePhaseFallbackMessages.length - 1,
    Math.max(0, Math.floor((progress / 100) * UpscalePhaseFallbackMessages.length)),
  );
  return UpscalePhaseFallbackMessages[index];
}

async function fetchCredits(): Promise<CreditSummaryResponse | null> {
  const response = await fetch(`/api/credits?ts=${Date.now()}`, {
    cache: 'no-store',
    credentials: 'include',
  });
  const payload = (await response.json()) as CreditSummaryResponse;

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Unable to load credits.');
  }

  return payload;
}

interface UseUpscaleWorkbenchOptions {
  initialCredits?: CreditSummaryResponse | null;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export function useUpscaleWorkbench({
  initialCredits = null,
  isAuthenticated = true,
  onRequireAuth,
}: UseUpscaleWorkbenchOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<UpscaleWorkbenchState>({
    credits: initialCredits,
    creditsError: null,
    isLoadingCredits: initialCredits === null,
    sourceFile: null,
    sourcePreviewUrl: null,
    scaleFactor: UpscaleDefaultFactor,
    isGenerating: false,
    progress: null,
    phaseMessage: null,
    resultImage: null,
    error: null,
    history: [],
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const creditsRequestIdRef = useRef(0);
  const stateRef = useRef(state);
  const isSyncingBilling = searchParams.get('billing') === 'success';

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const refreshCredits = useCallback(async () => {
    const requestId = creditsRequestIdRef.current + 1;
    creditsRequestIdRef.current = requestId;

    setState((current) => ({
      ...current,
      isLoadingCredits: current.credits === null,
      creditsError: null,
    }));

    try {
      const credits = await fetchCredits();
      if (creditsRequestIdRef.current !== requestId) return;
      setState((current) => ({ ...current, credits, creditsError: null, isLoadingCredits: false }));
    } catch (error) {
      if (creditsRequestIdRef.current !== requestId) return;
      const message = error instanceof Error ? error.message : 'Unable to load credits.';
      setState((current) => ({ ...current, creditsError: message, isLoadingCredits: false }));
    }
  }, []);

  useEffect(() => {
    if (initialCredits) return;
    void refreshCredits();
  }, [initialCredits, refreshCredits]);

  useEffect(() => {
    if (!isSyncingBilling) return;

    const syncTimers = [2000, 8000].map((delay) =>
      window.setTimeout(() => {
        void refreshCredits();
      }, delay),
    );
    const cleanupTimer = window.setTimeout(() => {
      router.replace(pathname || '/dashboard/upscale', { scroll: false });
    }, 10000);

    return () => {
      syncTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(cleanupTimer);
    };
  }, [isSyncingBilling, pathname, refreshCredits, router]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      const urls = new Set<string>();
      if (stateRef.current.sourcePreviewUrl) urls.add(stateRef.current.sourcePreviewUrl);
      stateRef.current.history.forEach((item) => urls.add(item.sourcePreviewUrl));
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const canGenerate = useMemo(() => {
    if (!isAuthenticated) {
      return Boolean(state.sourceFile && !state.isGenerating);
    }
    const balance = state.credits?.balance ?? 0;
    const cost = state.credits?.generationCost ?? 0;
    return Boolean(state.sourceFile && !state.isGenerating && balance >= cost);
  }, [isAuthenticated, state.credits?.balance, state.credits?.generationCost, state.isGenerating, state.sourceFile]);

  const setSourceFile = (file: File | null) => {
    if (!file) {
      setState((current) => ({
        ...current,
        sourceFile: null,
        sourcePreviewUrl: null,
        resultImage: null,
        progress: null,
        phaseMessage: null,
        error: null,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setState((current) => ({
      ...current,
      sourceFile: file,
      sourcePreviewUrl: previewUrl,
      resultImage: null,
      progress: null,
      phaseMessage: null,
      error: null,
    }));
  };

  const clearForNextUpscale = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState((current) => ({
      ...current,
      sourceFile: null,
      sourcePreviewUrl: null,
      isGenerating: false,
      progress: null,
      phaseMessage: null,
      resultImage: null,
      error: null,
      scaleFactor: UpscaleDefaultFactor,
    }));
  };

  const cancelGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState((current) => ({
      ...current,
      isGenerating: false,
      progress: null,
      phaseMessage: null,
      error: null,
    }));
  };

  const startGeneration = async () => {
    if (!state.sourceFile || !state.sourcePreviewUrl) return;

    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((current) => ({
      ...current,
      isGenerating: true,
      progress: 3,
      phaseMessage: buildFallbackMessage(3),
      error: null,
    }));

    try {
      const { resultImage } = await upscaleImageRequest({
        file: state.sourceFile,
        scaleFactor: state.scaleFactor,
        originalImageMeta: null,
        signal: controller.signal,
        onProgress: (progress) => {
          setState((current) => ({
            ...current,
            progress,
            phaseMessage: current.phaseMessage ?? buildFallbackMessage(progress),
          }));
        },
        onStatusMessage: (message) => {
          setState((current) => ({ ...current, phaseMessage: message }));
        },
      });

      setState((current) => {
        if (!current.sourcePreviewUrl || !current.sourceFile) return current;

        const historyItem: UpscaleHistoryItem = {
          id: createItemId(),
          sourceFile: current.sourceFile,
          sourcePreviewUrl: current.sourcePreviewUrl,
          resultImage,
          fileName: current.sourceFile.name,
          scaleFactor: current.scaleFactor,
        };

        return {
          ...current,
          isGenerating: false,
          progress: 100,
          phaseMessage: 'Upscale ready',
          resultImage,
          history: [historyItem, ...current.history.filter((item) => item.resultImage !== resultImage)].slice(0, 8),
        };
      });

      await refreshCredits();
    } catch (error) {
      if (controller.signal.aborted) return;

      const message = error instanceof Error ? error.message : 'Upscale failed.';
      setState((current) => ({
        ...current,
        isGenerating: false,
        progress: null,
        phaseMessage: null,
        error: message,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  };

  const restoreHistoryItem = (item: UpscaleHistoryItem) => {
    setState((current) => ({
      ...current,
      sourceFile: item.sourceFile,
      sourcePreviewUrl: item.sourcePreviewUrl,
      resultImage: item.resultImage,
      scaleFactor: item.scaleFactor,
      progress: 100,
      phaseMessage: 'Upscale ready',
      error: null,
    }));
  };

  return {
    ...state,
    isSyncingBilling,
    canGenerate,
    setSourceFile,
    setScaleFactor: (scaleFactor: string) =>
      setState((current) => ({ ...current, scaleFactor, resultImage: null })),
    refreshCredits,
    startGeneration,
    cancelGeneration,
    clearForNextUpscale,
    restoreHistoryItem,
  };
}
