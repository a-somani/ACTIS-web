'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OriginalImageDropzoneProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  originalPreview: string | null;
  generatedPreview: string | null;
  targetRatio: string;
  sourceAspect?: number | null;
  isDragActive: boolean;
  isPreviewLoading: boolean;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDragEnter: React.DragEventHandler<HTMLDivElement>;
  onDragLeave: React.DragEventHandler<HTMLDivElement>;
  onFileChange: React.ChangeEventHandler<HTMLInputElement>;
  onOpenFilePicker: () => void;
  onRemoveSelectedImage: () => void;
  onPreviewLoad: React.ReactEventHandler<HTMLImageElement>;
  onPreviewError: React.ReactEventHandler<HTMLImageElement>;
}

export function OriginalImageDropzone({
  fileInputRef,
  originalPreview,
  generatedPreview,
  targetRatio,
  sourceAspect,
  isDragActive,
  isPreviewLoading,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onFileChange,
  onOpenFilePicker,
  onRemoveSelectedImage,
  onPreviewLoad,
  onPreviewError,
}: OriginalImageDropzoneProps) {
  const frameWidthPercent = 86;
  const hasAnyPreview = Boolean(originalPreview || generatedPreview);
  const shouldShowOuterFrame = Boolean(originalPreview) && !generatedPreview && typeof sourceAspect === 'number';

  return (
    <div className="mx-auto w-full max-w-sm">
      <Input id="modifier-image" ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative flex aspect-square w-full flex-col items-center justify-center overflow-visible text-center text-sm ${
          hasAnyPreview ? '' : 'rounded-md border border-dashed'
        } ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        {generatedPreview ? (
          <img
            src={generatedPreview}
            alt="Generated output"
            style={{ aspectRatio: targetRatio.replace(':', ' / ') }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : null}
        {originalPreview && !generatedPreview ? (
          <div style={{ width: `${frameWidthPercent}%` }} className="relative z-[1]">
            {shouldShowOuterFrame ? (
              <div
                style={{ aspectRatio: targetRatio.replace(':', ' / ') }}
                className="pointer-events-none relative z-[4] w-full border-2 border-dashed border-white/95"
              />
            ) : null}
            <div
              style={{ aspectRatio: sourceAspect ? `${sourceAspect}` : '1 / 1' }}
              className="absolute left-0 top-1/2 z-[2] w-full -translate-y-1/2 overflow-hidden"
            >
              <img
                src={originalPreview}
                alt="Original upload"
                onLoad={onPreviewLoad}
                onError={onPreviewError}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        {originalPreview ? (
          <>
            <div className="absolute -top-10 right-0 z-20 flex items-center gap-4">
              <Button
                type="button"
                variant="secondary"
                className="h-6 w-6 bg-transparent p-0 text-2xl leading-none text-white hover:bg-transparent"
                onClick={onOpenFilePicker}
              >
                🔄
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-6 w-6 bg-transparent p-0 text-2xl leading-none text-white hover:bg-transparent"
                onClick={onRemoveSelectedImage}
              >
                ❌
              </Button>
            </div>
            {!generatedPreview && isPreviewLoading ? (
              <div className="relative z-10 rounded-md bg-background/80 px-3 py-2 text-muted-foreground">Loading preview...</div>
            ) : null}
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-3 px-4">
            <p className="text-muted-foreground">Drag and drop a 1:1 image here</p>
            <Button type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={onOpenFilePicker}>
              Choose image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
