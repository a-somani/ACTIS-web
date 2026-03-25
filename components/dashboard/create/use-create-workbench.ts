'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { generateImageRequest } from '@/components/dashboard/image-modifier/generate-image-request';
import { CreateDefaultRatio, CreatePhaseFallbackMessages } from '@/components/dashboard/create/constants';
import type { CreditSummaryResponse, CreateHistoryItem } from '@/components/dashboard/create/types';

interface CreateWorkbenchState {
  credits: CreditSummaryResponse | null;
  creditsError: string | null;
  isLoadingCredits: boolean;
  sourceFile: File | null;
  sourcePreviewUrl: string | null;
  targetRatio: string;
  isGenerating: boolean;
  progress: number | null;
  phaseMessage: string | null;
  resultImage: string | null;
  error: string | null;
  history: CreateHistoryItem[];
}

function createItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildFallbackMessage(progress: number): string {
  const index = Math.min(
    CreatePhaseFallbackMessages.length - 1,
    Math.max(0, Math.floor((progress / 100) * CreatePhaseFallbackMessages.length)),
  );
  return CreatePhaseFallbackMessages[index];
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

interface UseCreateWorkbenchOptions {
  initialCredits?: CreditSummaryResponse | null;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export function useCreateWorkbench({
  initialCredits = null,
  isAuthenticated = true,
  onRequireAuth,
}: UseCreateWorkbenchOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CreateWorkbenchState>({
    credits: initialCredits,
    creditsError: null,
    isLoadingCredits: initialCredits === null,
    sourceFile: null,
    sourcePreviewUrl: null,
    targetRatio: CreateDefaultRatio,
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

    setState((current) => ({ ...current, isLoadingCredits: true, creditsError: null }));

    try {
      const credits = await fetchCredits();

      if (creditsRequestIdRef.current !== requestId) {
        return;
      }

      setState((current) => ({ ...current, credits, creditsError: null, isLoadingCredits: false }));
    } catch (error) {
      if (creditsRequestIdRef.current !== requestId) {
        return;
      }

      const message = error instanceof Error ? error.message : 'Unable to load credits.';
      setState((current) => ({ ...current, creditsError: message, isLoadingCredits: false }));
    }
  }, []);

  useEffect(() => {
    if (initialCredits) {
      return;
    }

    void refreshCredits();
  }, [initialCredits, refreshCredits]);

  useEffect(() => {
    if (!isSyncingBilling) {
      return;
    }

    const syncTimers = [1500, 3500, 6500, 10000].map((delay) =>
      window.setTimeout(() => {
        void refreshCredits();
      }, delay),
    );
    const cleanupTimer = window.setTimeout(() => {
      router.replace(pathname || '/dashboard/create', { scroll: false });
    }, 12000);

    return () => {
      syncTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(cleanupTimer);
    };
  }, [isSyncingBilling, pathname, refreshCredits, router]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      const urls = new Set<string>();
      if (stateRef.current.sourcePreviewUrl) {
        urls.add(stateRef.current.sourcePreviewUrl);
      }
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

  const clearForNextCreate = () => {
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
      targetRatio: CreateDefaultRatio,
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
    if (!state.sourceFile || !state.sourcePreviewUrl) {
      return;
    }

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
      const { resultImage } = await generateImageRequest({
        file: state.sourceFile,
        targetRatio: state.targetRatio,
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
        if (!current.sourcePreviewUrl || !current.sourceFile) {
          return current;
        }

        const historyItem: CreateHistoryItem = {
          id: createItemId(),
          sourceFile: current.sourceFile,
          sourcePreviewUrl: current.sourcePreviewUrl,
          resultImage,
          fileName: current.sourceFile.name,
          targetRatio: current.targetRatio,
        };

        return {
          ...current,
          isGenerating: false,
          progress: 100,
          phaseMessage: 'Ready to share',
          resultImage,
          history: [historyItem, ...current.history.filter((item) => item.resultImage !== resultImage)].slice(0, 8),
        };
      });

      await refreshCredits();
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const message = error instanceof Error ? error.message : 'Generation failed.';
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

  const restoreHistoryItem = (item: CreateHistoryItem) => {
    setState((current) => ({
      ...current,
      sourceFile: item.sourceFile,
      sourcePreviewUrl: item.sourcePreviewUrl,
      resultImage: item.resultImage,
      targetRatio: item.targetRatio,
      progress: 100,
      phaseMessage: 'Ready to share',
      error: null,
    }));
  };

  return {
    ...state,
    isSyncingBilling,
    canGenerate,
    setSourceFile,
    setTargetRatio: (targetRatio: string) => setState((current) => ({ ...current, targetRatio, resultImage: null })),
    refreshCredits,
    startGeneration,
    cancelGeneration,
    clearForNextCreate,
    restoreHistoryItem,
  };
}
