'use client';

import { FormEvent, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type SyntheticEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton } from '@/components/ui/action-button';
import { DEFAULT_EXPAND_RATIO, IMAGE_EXPAND_RATIO_OPTIONS } from '@/utils/constants';
import { OriginalImageDropzone } from '@/components/dashboard/image-modifier/original-image-dropzone';
import { ProgressBar } from '@/components/dashboard/image-modifier/progress-bar';
import { ratioToAspect, formatAspectRatio } from '@/components/dashboard/image-modifier/ratio-utils';
import { RatioSelect } from '@/components/dashboard/image-modifier/ratio-select';
import type { OriginalImageMeta } from '@/components/dashboard/image-modifier/types';
import { useImageModifierGeneration } from '@/components/dashboard/image-modifier/use-image-modifier-generation';

export function ImageModifierWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewLoadStartedAtRef = useRef<number | null>(null);
  const ASPECT_EPSILON = 0.0001;
  const MIN_PREVIEW_LOADING_MS = 500;

  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [targetRatio, setTargetRatio] = useState(DEFAULT_EXPAND_RATIO);
  const [originalImageMeta, setOriginalImageMeta] = useState<OriginalImageMeta | null>(null);
  const {
    resultImage,
    error,
    displayProgress,
    isLoading,
    hasGeneratedForCurrentImage,
    resetForNewInput,
    generateImage,
  } = useImageModifierGeneration();

  const originalPreview = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalPreview) {
        URL.revokeObjectURL(originalPreview);
      }
    };
  }, [originalPreview]);

  const sourceAspect = useMemo(() => {
    return originalImageMeta ? originalImageMeta.width / originalImageMeta.height : null;
  }, [originalImageMeta]);

  const ratioOptionsWithDisabledState = useMemo(
    () =>
      IMAGE_EXPAND_RATIO_OPTIONS.map((option) => {
        const optionAspect = ratioToAspect(option.value);
        // Expand-only flow: target ratio must be strictly smaller than source ratio.
        const disabled = sourceAspect !== null ? optionAspect >= sourceAspect - ASPECT_EPSILON : false;
        return { ...option, disabled };
      }),
    [sourceAspect],
  );

  useEffect(() => {
    if (sourceAspect === null) {
      return;
    }

    const targetAspect = ratioToAspect(targetRatio);
    if (targetAspect < sourceAspect - ASPECT_EPSILON) {
      return;
    }

    const validOptions = IMAGE_EXPAND_RATIO_OPTIONS.filter(
      (option) => ratioToAspect(option.value) < sourceAspect - ASPECT_EPSILON,
    );

    if (validOptions.length === 0) {
      return;
    }

    const bestFallback = validOptions.reduce((best, current) => {
      const bestAspect = ratioToAspect(best.value);
      const currentAspect = ratioToAspect(current.value);
      return currentAspect > bestAspect ? current : best;
    }, validOptions[0]);

    setTargetRatio(bestFallback.value);
  }, [sourceAspect, targetRatio]);

  const setSelectedFile = (nextFile: File | null) => {
    resetForNewInput();
    setOriginalImageMeta(null);
    setFile(nextFile);
    setIsPreviewLoading(Boolean(nextFile));
    previewLoadStartedAtRef.current = nextFile ? Date.now() : null;
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      setIsPreviewLoading(false);
      return;
    }
    setSelectedFile(nextFile);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    setSelectedFile(event.dataTransfer.files?.[0] ?? null);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const openFilePicker = () => {
    // Allow selecting the same file again to trigger onChange.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreviewLoaded = (event?: SyntheticEvent<HTMLImageElement>) => {
    const imageElement = event?.currentTarget;
    if (imageElement?.naturalWidth && imageElement?.naturalHeight) {
      setOriginalImageMeta({
        width: imageElement.naturalWidth,
        height: imageElement.naturalHeight,
        ratioLabel: formatAspectRatio(imageElement.naturalWidth, imageElement.naturalHeight),
      });
    }

    const startedAt = previewLoadStartedAtRef.current;
    const elapsed = startedAt ? Date.now() - startedAt : MIN_PREVIEW_LOADING_MS;
    const remaining = Math.max(0, MIN_PREVIEW_LOADING_MS - elapsed);
    window.setTimeout(() => setIsPreviewLoading(false), remaining);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (resultImage) {
      const extension = resultImage.startsWith('data:image/jpeg') ? 'jpg' : 'png';
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `image-expand-${targetRatio.replace(':', 'x')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!file) {
      return;
    }
    await generateImage({ file, targetRatio, originalImageMeta });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Image Modifier</CardTitle>
          <CardDescription>Upload an image, pick a target ratio, and generate in the same canvas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">{resultImage ? `Generated (${targetRatio})` : 'Original'}</p>
            <OriginalImageDropzone
              fileInputRef={fileInputRef}
              originalPreview={originalPreview}
              generatedPreview={resultImage}
              targetRatio={targetRatio}
              sourceAspect={sourceAspect}
              isDragActive={isDragActive}
              isPreviewLoading={isPreviewLoading}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onFileChange={onFileChange}
              onOpenFilePicker={openFilePicker}
              onRemoveSelectedImage={removeSelectedImage}
              onPreviewLoad={handlePreviewLoaded}
              onPreviewError={() => {
                setOriginalImageMeta(null);
                handlePreviewLoaded();
              }}
            />
            {originalImageMeta && !resultImage ? (
              <p className="text-center text-xs text-muted-foreground">
                {originalImageMeta.width}x{originalImageMeta.height} ({originalImageMeta.ratioLabel})
              </p>
            ) : null}
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <RatioSelect value={targetRatio} options={ratioOptionsWithDisabledState} onChange={setTargetRatio} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionButton type="submit" className="w-full sm:w-auto" disabled={isLoading || !file}>
                {isLoading ? 'Saving...' : 'Save'}
              </ActionButton>
              {hasGeneratedForCurrentImage && !isLoading ? (
                <ActionButton
                  type="button"
                  variant="secondaryFlipped"
                  className="w-full sm:w-auto"
                  onClick={openFilePicker}
                >
                  Try again
                </ActionButton>
              ) : null}
              {file && !isLoading ? (
                <ActionButton
                  type="button"
                  variant="secondaryFlipped"
                  className="w-full sm:w-auto"
                  onClick={removeSelectedImage}
                >
                  Reset
                </ActionButton>
              ) : null}
            </div>
          </form>
          <ProgressBar progress={displayProgress} />
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
