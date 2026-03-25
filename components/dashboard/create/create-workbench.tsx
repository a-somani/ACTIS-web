'use client';

import { useRef, useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function downloadDataUrl(dataUrl: string, filename: string) {
  const extension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function CreateWorkbench() {
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
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
  } = useCreateWorkbench();

  const handleSelect = (files: FileList | null) => {
    const file = files?.[0] ?? null;
    if (!file) return;
    setSourceFile(file);
  };

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black text-white shadow-2xl">
      <CreateBackground />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />

      <div className="relative z-10 space-y-6 p-4 md:space-y-8 md:p-8">
        <CreateTopbar
          balance={credits?.balance ?? 0}
          generationCost={credits?.generationCost ?? 10}
          inventoryCount={history.length}
          tierName={credits?.activeTierName ?? null}
        />

        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-primary" />
              ACTIS AI
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-balance md:text-7xl">
              {resultImage ? 'Share what you created.' : 'Create with ACTIS.'}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-white/70 md:text-2xl">
              {isGenerating
                ? (phaseMessage ?? 'Transforming your image with ACTIS Create')
                : 'Expand, frame, and share with an AI-native studio flow.'}
            </p>
          </div>

          <div className="grid gap-3 text-left sm:grid-cols-3">
            {CreateStepItems.map((step, index) => (
              <div
                key={step.id}
                className="rounded-[28px] border border-white/10 bg-black/45 px-5 py-4 backdrop-blur-xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/90">Step 0{index + 1}</p>
                <p className="mt-2 text-lg font-semibold text-white">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="order-2 space-y-3 xl:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/45">Inventory</p>
            <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
              {history.length === 0 ? (
                <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-black/25 p-4 text-sm text-white/50">
                  Your recent generations appear here.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => restoreHistoryItem(item)}
                    className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30 p-1 transition-transform hover:-translate-y-0.5"
                  >
                    <img
                      src={item.resultImage}
                      alt={item.fileName}
                      className="aspect-square w-full rounded-[24px] object-cover"
                    />
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="order-1 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(25,28,39,0.88),rgba(11,13,18,0.92))] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl xl:order-2">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-semibold">ACTIS Create</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Best-practice guided workflow</p>
                </div>
              </div>

              <CreateBestPracticesDialog>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70">
                  <span>BEST PRACTICES</span>
                  <HelpCircle className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </button>
              </CreateBestPracticesDialog>
            </div>

            <div className="space-y-6 p-5 md:p-6">
              {isSyncingBilling && (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white/85">
                  Payment received. Syncing your credits and plan updates...
                </div>
              )}

              {(error || creditsError) && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                  {error ?? creditsError}
                </div>
              )}

              {!sourcePreviewUrl && (
                <EmptyUploadState
                  isLoadingCredits={isLoadingCredits}
                  onCamera={() => cameraInputRef.current?.click()}
                  onGallery={() => galleryInputRef.current?.click()}
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
                  sourcePreviewUrl={sourcePreviewUrl}
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
    </section>
  );
}
