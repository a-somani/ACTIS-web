'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, ImagePlus, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DEFAULT_UPSCALE_FACTOR, IMAGE_UPSCALE_FACTOR_OPTIONS } from '@/utils/constants';
import { ScaleSelect } from '@/components/dashboard/image-upscaler/scale-select';
import { useImageUpscalerBatch } from '@/components/dashboard/image-upscaler/use-image-upscaler-batch';
import { UpscaleItemCard } from '@/components/dashboard/image-upscaler/upscale-item-card';

function downloadDataUrl(dataUrl: string, filename: string) {
  const extension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImageUpscalerWorkbench() {
  const hasInitializedScaleRef = useRef(false);
  const [scaleFactor, setScaleFactor] = useState(DEFAULT_UPSCALE_FACTOR);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const {
    items,
    isGeneratingAll,
    addFiles,
    removeItem,
    clearAll,
    generateItem,
    generateAll,
    resetOutputsForScaleChange,
  } = useImageUpscalerBatch();

  const scaleOptions = useMemo(() => IMAGE_UPSCALE_FACTOR_OPTIONS.map((option) => ({ ...option })), []);

  useEffect(() => {
    if (!hasInitializedScaleRef.current) {
      hasInitializedScaleRef.current = true;
      return;
    }
    resetOutputsForScaleChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleFactor]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File }[]) => {
      if (rejectedFiles.length > 0) {
        setValidationMessage(`${rejectedFiles.length} file(s) skipped. Only images up to 10 MB are supported.`);
      } else {
        setValidationMessage(null);
      }
      addFiles(acceptedFiles);
    },
    [addFiles],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: MAX_FILE_SIZE,
    noClick: items.length > 0,
    noKeyboard: items.length > 0,
  });

  const handleDownloadAll = () => {
    const completed = items.filter((item) => item.resultImage);
    completed.forEach((item, index) => {
      if (!item.resultImage) return;
      window.setTimeout(() => {
        downloadDataUrl(item.resultImage!, `image-upscale-${scaleFactor}-${index + 1}`);
      }, index * 200);
    });
  };

  const completedCount = items.filter((item) => item.status === 'done').length;
  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      {!hasItems ? (
        <HeroDropZone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
      ) : (
        <div {...getRootProps()} className="outline-none">
          <input {...getInputProps()} />
        </div>
      )}

      {validationMessage && <p className="text-sm text-destructive">{validationMessage}</p>}

      {hasItems && (
        <>
          <ScaleSelect
            value={scaleFactor}
            options={scaleOptions}
            disabled={isGeneratingAll}
            onChange={setScaleFactor}
          />

          <Toolbar
            itemCount={items.length}
            completedCount={completedCount}
            isGeneratingAll={isGeneratingAll}
            onGenerateAll={() => generateAll(scaleFactor)}
            onDownloadAll={handleDownloadAll}
            onClearAll={clearAll}
            onAddMore={open}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <UpscaleItemCard
                key={item.id}
                item={item}
                scaleFactor={scaleFactor}
                disableActions={isGeneratingAll}
                onGenerate={() => generateItem(item.id, scaleFactor)}
                onRemove={() => removeItem(item.id)}
                onDownload={() => {
                  if (!item.resultImage) return;
                  downloadDataUrl(item.resultImage, `image-upscale-${scaleFactor}-${index + 1}`);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface HeroDropZoneProps {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;
}

function HeroDropZone({ getRootProps, getInputProps, isDragActive }: HeroDropZoneProps) {
  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-20 text-center transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ImagePlus className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 text-base font-medium">Drop images to upscale</p>
      <p className="mt-1 text-sm text-muted-foreground">or click to browse from your device</p>
      <p className="mt-3 text-xs text-muted-foreground">PNG, JPG, WebP up to 10 MB each</p>
    </div>
  );
}

interface ToolbarProps {
  itemCount: number;
  completedCount: number;
  isGeneratingAll: boolean;
  onGenerateAll: () => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
  onAddMore: () => void;
}

function Toolbar({
  itemCount,
  completedCount,
  isGeneratingAll,
  onGenerateAll,
  onDownloadAll,
  onClearAll,
  onAddMore,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        onClick={onGenerateAll}
        disabled={isGeneratingAll || itemCount === 0}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isGeneratingAll ? 'Upscaling...' : 'Upscale all'}
      </Button>

      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="gap-1.5"
        onClick={onDownloadAll}
        disabled={completedCount === 0 || isGeneratingAll}
      >
        <Download className="h-3.5 w-3.5" />
        Download all ({completedCount})
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="gap-1.5 text-muted-foreground hover:text-destructive"
        onClick={onClearAll}
        disabled={itemCount === 0 || isGeneratingAll}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Clear all
      </Button>

      <div className="flex-1" />

      <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onAddMore}>
        <Plus className="h-3.5 w-3.5" />
        Add more
      </Button>
    </div>
  );
}
