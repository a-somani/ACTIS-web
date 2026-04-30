'use client';

import { useRef, useState } from 'react';
import { HelpCircle, Maximize } from 'lucide-react';
import Link from 'next/link';
import { CreateBackground } from '@/components/dashboard/create/create-background';
import { CreateBestPracticesDialog } from '@/components/dashboard/create/create-best-practices-dialog';
import {
  EmptyUploadState,
  GeneratingState,
  ReadyState,
  ResultState,
} from '@/components/dashboard/create/create-panels';
import { CreateStepItems } from '@/components/dashboard/create/constants';
import { CreateTopbar } from '@/components/dashboard/create/create-topbar';
import { useCreateWorkbench } from '@/components/dashboard/create/use-create-workbench';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';
import { cn } from '@/lib/utils';

function downloadDataUrl(dataUrl: string, filename: string) {
  const extension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface CreateWorkbenchProps {
  initialCredits?: CreditSummaryResponse | null;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
  showDashboardChrome?: boolean;
}

export function CreateWorkbench({
  initialCredits = null,
  isAuthenticated = true,
  onRequireAuth,
  showDashboardChrome = true,
}: CreateWorkbenchProps) {
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const {
    credits,
    creditsError,
    isLoadingCredits,
    isSyncingBilling,
    sourcePreviewUrl,
    targetRatio,
    isGenerating,
    progress,
    phaseMessage,
    resultImage,
    error,
    history,
    canGenerate,
    setSourceFile,
    setTargetRatio,
    startGeneration,
    cancelGeneration,
    clearForNextCreate,
    restoreHistoryItem,
  } = useCreateWorkbench({ initialCredits, isAuthenticated, onRequireAuth });

  const generateLabel = isAuthenticated ? `Generate ${credits?.generationCost ?? 10} credits` : 'Continue to generate';

  const handleSelect = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file) return;
    setSourceFile(file);
  };

  const handleUploadAction = () => {
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    galleryInputRef.current?.click();
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-black/95 text-white">
      <CreateBackground />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />

      <div
        className={cn('relative z-10 space-y-4 p-4 md:space-y-5 md:p-8')}
      >
        <CreateTopbar
          balance={credits?.balance ?? 0}
          generationCost={credits?.generationCost ?? 10}
          inventoryCount={history.length}
          tierName={credits?.activeTierName ?? null}
          showMobileSidebar={showDashboardChrome}
          actionLabel={isAuthenticated ? 'Get Credits' : 'Continue'}
          actionHref={isAuthenticated ? '/dashboard/subscriptions' : '/'}
          onActionClick={!isAuthenticated ? onRequireAuth : undefined}
        />

        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 xl:max-w-[1280px]">
          <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="order-2 hidden space-y-3 xl:order-1 xl:block">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Inventory</p>
                {showDashboardChrome ? (
                  <Link href="/dashboard/history" className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                    View History
                  </Link>
                ) : null}
              </div>
              <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
                {history.length === 0 ? (
                  <div className="col-span-full rounded-[24px] bg-white/[0.04] p-4 text-sm text-white/50">
                    Your recent generations appear here.
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => restoreHistoryItem(item)}
                      className="overflow-hidden rounded-[24px] bg-white/[0.04] p-1 transition-transform hover:-translate-y-0.5"
                    >
                      <img
                        src={item.resultImage}
                        alt={item.fileName}
                        className="aspect-square w-full rounded-[20px] object-cover"
                      />
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="order-1 flex flex-col gap-4 xl:order-2">
              <div className="grid w-full grid-cols-3 gap-2 rounded-[22px] bg-white/[0.04] p-2">
                {CreateStepItems.map((step, index) => (
                  <div key={step.id} className="rounded-[18px] px-2 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-primary/90">0{index + 1}</p>
                    <p className="mt-1 text-xs font-semibold text-white md:text-sm">{step.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(25,28,39,0.96),rgba(11,13,18,0.98))]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5 md:py-4">
                <div className="flex items-center gap-3">
                  <Maximize className="h-5 w-5 text-primary" />
                  <p className="text-base font-semibold md:text-lg">ACTIS Expand</p>
                </div>

                <CreateBestPracticesDialog>
                  <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 md:text-sm">
                    <span>TIPS</span>
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </CreateBestPracticesDialog>
              </div>

              <div className="space-y-4 p-4 md:space-y-6 md:p-6">
              {isSyncingBilling && (
                <div className="rounded-2xl bg-primary/12 px-4 py-3 text-sm text-white/85">
                  Payment received. Syncing your credits and plan updates...
                </div>
              )}

              {(error || creditsError) && (
                <div className="rounded-2xl bg-destructive/12 px-4 py-3 text-sm text-destructive-foreground">
                  {error ?? creditsError}
                </div>
              )}

              {!isAuthenticated && !sourcePreviewUrl && (
                <div className="rounded-2xl bg-primary/12 px-4 py-3 text-sm text-white/85">
                  Choose an image to get started, then continue into create.
                </div>
              )}

              {!sourcePreviewUrl && (
                <EmptyUploadState
                  isLoadingCredits={isLoadingCredits}
                  onUpload={handleUploadAction}
                />
              )}

              {sourcePreviewUrl && !resultImage && !isGenerating && (
                <ReadyState
                  sourcePreviewUrl={sourcePreviewUrl}
                  targetRatio={targetRatio}
                  onChangeRatio={setTargetRatio}
                  onGenerate={() => void startGeneration()}
                  onReplace={() => galleryInputRef.current?.click()}
                  canGenerate={canGenerate}
                  generateLabel={generateLabel}
                />
              )}

              {sourcePreviewUrl && isGenerating && (
                <GeneratingState
                  sourcePreviewUrl={sourcePreviewUrl}
                  progress={progress}
                  phaseMessage={phaseMessage}
                  onCancel={cancelGeneration}
                />
              )}

              {sourcePreviewUrl && resultImage && !isGenerating && (
                <ResultState
                  resultImage={showOriginal ? sourcePreviewUrl : resultImage}
                  onCompareChange={setShowOriginal}
                  onDownload={() => downloadDataUrl(resultImage, 'actis-create-result')}
                  onRegenerate={() => void startGeneration()}
                  onCreateNew={clearForNextCreate}
                />
              )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
