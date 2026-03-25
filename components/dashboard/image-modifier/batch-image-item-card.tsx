'use client';

import { useState } from 'react';
import { Download, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { BatchImageItem } from '@/components/dashboard/image-modifier/use-image-modifier-batch';

interface BatchImageItemCardProps {
  item: BatchImageItem;
  targetRatio: string;
  disableActions: boolean;
  onGenerate: () => void;
  onRemove: () => void;
  onDownload: () => void;
}

type CompareTab = 'original' | 'result';

function ratioToCss(ratio: string): string {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return '1/1';
  return `${w}/${h}`;
}

function StatusBadge({ item }: { item: BatchImageItem }) {
  if (item.status === 'generating') return null;

  const config = {
    ready: { label: 'Ready', className: 'bg-muted text-muted-foreground' },
    done: { label: 'Done', className: 'bg-green-500/20 text-green-400' },
    error: { label: 'Error', className: 'bg-destructive/20 text-destructive' },
  } as const;

  const { label, className } = config[item.status];

  return (
    <span className={cn('absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium', className)}>
      {label}
    </span>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-muted/50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

function CompareTabs({ active, onChange }: { active: CompareTab; onChange: (tab: CompareTab) => void }) {
  return (
    <div className="flex gap-1 p-2 pb-0">
      {(['original', 'result'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'rounded-md px-3 py-2 text-xs font-medium capitalize transition-colors sm:py-1',
            active === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function OriginalOverlay({
  originalSrc,
  resultSrc,
  targetRatio,
  alt,
}: {
  originalSrc: string;
  resultSrc: string;
  targetRatio: string;
  alt: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: ratioToCss(targetRatio) }}>
      <img src={resultSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={originalSrc} alt={alt} className="max-h-full max-w-full object-contain drop-shadow-lg" />
      </div>
    </div>
  );
}

export function BatchImageItemCard({
  item,
  targetRatio,
  disableActions,
  onGenerate,
  onRemove,
  onDownload,
}: BatchImageItemCardProps) {
  const [activeTab, setActiveTab] = useState<CompareTab>('result');
  const isDone = item.status === 'done';
  const isGenerating = item.status === 'generating';

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-background/50">
      {isDone && <CompareTabs active={activeTab} onChange={setActiveTab} />}

      <div className="relative">
        {isDone && item.resultImage ? (
          activeTab === 'original' ? (
            <OriginalOverlay
              originalSrc={item.previewUrl}
              resultSrc={item.resultImage}
              targetRatio={targetRatio}
              alt={item.file.name}
            />
          ) : (
            <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: ratioToCss(targetRatio) }}>
              <img src={item.resultImage} alt={item.file.name} className="h-full w-full object-cover" />
            </div>
          )
        ) : (
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className={cn('h-full w-full object-cover transition-opacity duration-200', isGenerating && 'opacity-60')}
            />

            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  {item.progress !== null && (
                    <span className="text-xs font-medium text-white drop-shadow">{Math.round(item.progress)}%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!isDone && <StatusBadge item={item} />}
        {isGenerating && item.progress !== null && <ProgressBar progress={item.progress} />}
      </div>

      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(item.file.size / (1024 * 1024)).toFixed(1)} MB
            {item.originalImageMeta ? ` · ${item.originalImageMeta.width}×${item.originalImageMeta.height}` : ''}
            {' · '}
            {targetRatio}
          </p>
          {item.error && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={isDone ? 'secondary' : 'default'}
            className="h-10 flex-1 gap-1.5 text-xs sm:h-8"
            onClick={onGenerate}
            disabled={disableActions || isGenerating}
          >
            {isDone ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </>
            )}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 shrink-0 sm:h-8 sm:w-8"
            onClick={onDownload}
            disabled={!item.resultImage || isGenerating}
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive sm:h-8 sm:w-8"
            onClick={onRemove}
            disabled={isGenerating}
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
