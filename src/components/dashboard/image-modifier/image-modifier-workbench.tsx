'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ActionButton } from '@/components/ui/action-button';

interface ImageModifierResponse {
  error?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

interface StreamEventPayload {
  message?: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  progress?: number;
}

export function ImageModifierWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewLoadStartedAtRef = useRef<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusProgress, setStatusProgress] = useState<number | null>(null);
  const [displayProgress, setDisplayProgress] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [hasGeneratedForCurrentImage, setHasGeneratedForCurrentImage] = useState(false);
  const MIN_PREVIEW_LOADING_MS = 500;

  const originalPreview = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalPreview) {
        URL.revokeObjectURL(originalPreview);
      }
    };
  }, [originalPreview]);

  useEffect(() => {
    if (statusProgress === null) {
      setDisplayProgress(null);
      return;
    }

    setDisplayProgress((previous) => {
      if (previous === null) {
        return statusProgress;
      }
      return Math.max(previous, statusProgress);
    });
  }, [statusProgress]);

  useEffect(() => {
    if (!isLoading || displayProgress === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setDisplayProgress((previous) => {
        if (previous === null) {
          return previous;
        }
        const target = statusProgress ?? previous;
        if (previous < target) {
          return Math.min(target, previous + 1.4);
        }
        return previous;
      });
    }, 120);

    return () => window.clearInterval(timer);
  }, [isLoading, displayProgress, statusProgress]);

  const setSelectedFile = (nextFile: File | null) => {
    setError(null);
    setStatusProgress(null);
    setDisplayProgress(null);
    setResultImage(null);
    setFile(nextFile);
    setIsPreviewLoading(Boolean(nextFile));
    previewLoadStartedAtRef.current = nextFile ? Date.now() : null;
    setHasGeneratedForCurrentImage(false);
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

  const handlePreviewLoaded = () => {
    const startedAt = previewLoadStartedAtRef.current;
    const elapsed = startedAt ? Date.now() - startedAt : MIN_PREVIEW_LOADING_MS;
    const remaining = Math.max(0, MIN_PREVIEW_LOADING_MS - elapsed);
    window.setTimeout(() => setIsPreviewLoading(false), remaining);
  };

  const applyResultImage = (data: ImageModifierResponse | StreamEventPayload) => {
    if (data.imageUrl) {
      setResultImage(data.imageUrl);
      return;
    }
    if (data.imageBase64) {
      const mime = data.mimeType ?? 'image/png';
      setResultImage(`data:${mime};base64,${data.imageBase64}`);
    }
  };

  const handleSseEvent = (eventType: string, eventData: string) => {
    let parsedData: StreamEventPayload = {};
    try {
      parsedData = JSON.parse(eventData) as StreamEventPayload;
    } catch {
      parsedData = {};
    }

    if (eventType === 'status') {
      if (typeof parsedData.progress === 'number') {
        setStatusProgress(parsedData.progress);
      }
      return;
    }

    if (eventType === 'result') {
      applyResultImage(parsedData);
      return;
    }

    if (eventType === 'error') {
      setError(parsedData.message ?? 'Generation failed.');
      return;
    }

    if (eventType === 'done') {
      setStatusProgress(typeof parsedData.progress === 'number' ? parsedData.progress : 100);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatusProgress(null);
    setDisplayProgress(2);

    if (!file) {
      setError('Please upload an image.');
      return;
    }

    if (hasGeneratedForCurrentImage) {
      return;
    }

    const payload = new FormData();
    payload.append('image', file);

    setHasGeneratedForCurrentImage(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/image-modifier/stream', {
        method: 'POST',
        body: payload,
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.includes('text/event-stream')) {
        const data = (await response.json()) as ImageModifierResponse;
        throw new Error(data.error ?? 'Image generation failed.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming is not available in this browser.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() ?? '';

        for (const message of messages) {
          const lines = message.split('\n');
          const eventLine = lines.find((line) => line.startsWith('event:'));
          const dataLine = lines.find((line) => line.startsWith('data:'));

          if (!eventLine || !dataLine) {
            continue;
          }

          const eventType = eventLine.slice(6).trim();
          const eventData = dataLine.slice(5).trim();
          handleSseEvent(eventType, eventData);
        }
      }
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Image Modifier</CardTitle>
          <CardDescription>Upload a 1:1 image to expand it to 9:16</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">Original (1:1)</p>
            <div className="mx-auto w-full max-w-sm">
              <Input
                id="modifier-image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-md border border-dashed text-center text-sm ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                {originalPreview ? (
                  <img
                    src={originalPreview}
                    alt="Original upload"
                    onLoad={handlePreviewLoaded}
                    onError={handlePreviewLoaded}
                    className="absolute inset-0 h-full w-full rounded-md object-cover"
                  />
                ) : null}
                {originalPreview ? (
                  <>
                    <div className="absolute right-2 top-2 z-10 flex items-center gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-6 w-6 bg-transparent p-0 text-2xl leading-none text-white hover:bg-transparent"
                        onClick={openFilePicker}
                      >
                        🔄
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-6 w-6 bg-transparent p-0 text-2xl leading-none text-white hover:bg-transparent"
                        onClick={removeSelectedImage}
                      >
                        ❌
                      </Button>
                    </div>
                    {isPreviewLoading ? (
                      <div className="relative z-10 rounded-md bg-background/80 px-3 py-2 text-muted-foreground">
                        Loading preview...
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-3 px-4">
                    <p className="text-muted-foreground">Drag and drop a 1:1 image here</p>
                    <Button type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={openFilePicker}>
                      Choose image
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex items-center gap-3">
              <ActionButton type="submit" disabled={isLoading || !file || hasGeneratedForCurrentImage}>
                {isLoading ? 'Generating...' : 'Generate image'}
              </ActionButton>
              {hasGeneratedForCurrentImage && !isLoading ? (
                <ActionButton
                  type="button"
                  variant="secondaryFlipped"
                  className="h-10 px-4 text-sm"
                  onClick={openFilePicker}
                >
                  Try again
                </ActionButton>
              ) : null}
            </div>
          </form>
          {displayProgress !== null ? (
            <div className="mt-4 w-full space-y-1">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, displayProgress))}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">{Math.round(displayProgress)}%</p>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated</CardTitle>
          <CardDescription>Expanded 9:16 output</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Generated (9:16)</p>
            <div className="mx-auto w-full max-w-sm">
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Generated output"
                  className="aspect-[9/16] w-full rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex aspect-[9/16] w-full items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
                  Run generation to see your 9:16 output.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
