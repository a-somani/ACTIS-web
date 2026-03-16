'use client';

import { ActionButton } from '@/components/ui/action-button';
import type { BatchImageItem } from '@/components/dashboard/image-modifier/use-image-modifier-batch';

interface BatchImageItemCardProps {
  item: BatchImageItem;
  targetRatio: string;
  disableActions: boolean;
  onGenerate: () => void;
  onRemove: () => void;
  onDownload: () => void;
}

function statusLabel(item: BatchImageItem): string {
  if (item.status === 'done') {
    return 'Done';
  }

  if (item.status === 'generating') {
    return item.progress !== null ? `Generating ${Math.round(item.progress)}%` : 'Generating';
  }

  if (item.status === 'error') {
    return 'Error';
  }

  return 'Ready';
}

export function BatchImageItemCard({
  item,
  targetRatio,
  disableActions,
  onGenerate,
  onRemove,
  onDownload,
}: BatchImageItemCardProps) {
  return (
    <article className="rounded-md border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <img src={item.resultImage ?? item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{item.file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(item.file.size / (1024 * 1024)).toFixed(2)} MB
            {item.originalImageMeta ? ` • ${item.originalImageMeta.width}x${item.originalImageMeta.height}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">Output ratio: {targetRatio}</p>
          <p className="text-xs font-medium">{statusLabel(item)}</p>
          {item.error ? <p className="text-xs text-destructive">{item.error}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          type="button"
          className="h-8 px-3 text-xs"
          onClick={onGenerate}
          disabled={disableActions || item.status === 'generating'}
        >
          {item.status === 'done' ? 'Regenerate' : 'Generate'}
        </ActionButton>
        <ActionButton
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={onDownload}
          disabled={!item.resultImage || item.status === 'generating'}
        >
          Download
        </ActionButton>
        <ActionButton
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={onRemove}
          disabled={item.status === 'generating'}
        >
          Remove
        </ActionButton>
      </div>
    </article>
  );
}
