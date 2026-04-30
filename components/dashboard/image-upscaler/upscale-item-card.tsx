'use client';

import { useState } from 'react';
import { Download, Eye, EyeOff, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { UpscalerBatchImageItem } from '@/components/dashboard/image-upscaler/use-image-upscaler-batch';

interface UpscaleItemCardProps {
  item: UpscalerBatchImageItem;
  scaleFactor: string;
  disableActions: boolean;
  onGenerate: () => void;
  onRemove: () => void;
  onDownload: () => void;
}

function StatusBadge({ item }: { item: UpscalerBatchImageItem }) {
  if (item.status === 'generating') return null;

  const config = {
    ready: { label: 'Ready', className: 'bg-muted text-muted-foreground' },
    done: { label: 'Upscaled', className: 'bg-green-500/20 text-green-400' },
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

export function UpscaleItemCard({
  item,
  scaleFactor,
  disableActions,
  onGenerate,
  onRemove,
  onDownload,
}: UpscaleItemCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const isDone = item.status === 'done';
  const isGenerating = item.status === 'generating';

  const displayedSrc = isDone && item.resultImage && !showOriginal ? item.resultImage : item.previewUrl;
  const aspect = item.originalImageMeta
    ? `${item.originalImageMeta.width} / ${item.originalImageMeta.height}`
    : '1 / 1';

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-background/50">
      <div className="relative">
        <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: aspect }}>
          <img
            src={displayedSrc}
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

          {isDone && item.resultImage && (
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur hover:bg-black/75"
              aria-label={showOriginal ? 'Show upscaled' : 'Show original'}
            >
              {showOriginal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showOriginal ? 'Original' : 'Upscaled'}
            </button>
          )}
        </div>

        <StatusBadge item={item} />
        {isGenerating && item.progress !== null && <ProgressBar progress={item.progress} />}
      </div>

      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(item.file.size / (1024 * 1024)).toFixed(1)} MB
            {item.originalImageMeta ? ` · ${item.originalImageMeta.width}×${item.originalImageMeta.height}` : ''}
            {' · '}
            {scaleFactor}
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
                Re-upscale
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Upscale
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
