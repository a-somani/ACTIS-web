'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton } from '@/components/ui/action-button';
import { DEFAULT_EXPAND_RATIO, IMAGE_EXPAND_RATIO_OPTIONS } from '@/utils/constants';
import { RatioSelect } from '@/components/dashboard/image-modifier/ratio-select';
import { useImageModifierBatch } from '@/components/dashboard/image-modifier/use-image-modifier-batch';
import { BatchImageItemCard } from '@/components/dashboard/image-modifier/batch-image-item-card';

function downloadDataUrl(dataUrl: string, filename: string) {
  const extension = dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ImageModifierWorkbench() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasInitializedRatioRef = useRef(false);
  const [targetRatio, setTargetRatio] = useState(DEFAULT_EXPAND_RATIO);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const {
    items,
    isGeneratingAll,
    addFiles,
    removeItem,
    clearAll,
    generateItem,
    generateAll,
    resetOutputsForRatioChange,
  } = useImageModifierBatch();

  const ratioOptions = useMemo(() => IMAGE_EXPAND_RATIO_OPTIONS.map((option) => ({ ...option, disabled: false })), []);

  useEffect(() => {
    if (!hasInitializedRatioRef.current) {
      hasInitializedRatioRef.current = true;
      return;
    }

    resetOutputsForRatioChange();
    // resetOutputsForRatioChange is intentionally omitted because we only want this on ratio changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRatio]);

  const handleAddFiles = async (incomingFiles: File[]) => {
    if (!incomingFiles.length) {
      return;
    }

    const validFiles = incomingFiles.filter((file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024);
    const rejectedFiles = incomingFiles.length - validFiles.length;

    if (rejectedFiles > 0) {
      setValidationMessage(`${rejectedFiles} file(s) were skipped. Only images up to 10MB are supported.`);
    } else {
      setValidationMessage(null);
    }

    await addFiles(validFiles);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    await handleAddFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    await handleAddFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleDownloadAll = () => {
    const completed = items.filter((item) => item.resultImage);
    completed.forEach((item, index) => {
      const resultImage = item.resultImage;
      if (!resultImage) {
        return;
      }

      window.setTimeout(() => {
        downloadDataUrl(resultImage, `image-expand-${targetRatio.replace(':', 'x')}-${index + 1}`);
      }, index * 200);
    });
  };

  const completedCount = items.filter((item) => item.status === 'done').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Modifier</CardTitle>
        <CardDescription>
          Add one or many images, choose a target ratio once, then run generation per image or for the full batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />

        <div
          onDrop={onDrop}
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragActive(false);
          }}
          className={`rounded-md border border-dashed p-6 text-center ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <p className="text-sm text-muted-foreground">Drop image files here, or add from your device.</p>
          <ActionButton type="button" variant="secondary" className="mt-3 h-8 px-3 text-xs" onClick={openFilePicker}>
            Add images
          </ActionButton>
          <p className="mt-2 text-xs text-muted-foreground">Supports batch upload. Max 10MB per image.</p>
        </div>

        {validationMessage ? <p className="text-sm text-destructive">{validationMessage}</p> : null}

        <RatioSelect value={targetRatio} options={ratioOptions} disabled={isGeneratingAll} onChange={setTargetRatio} />

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            type="button"
            className="h-8 px-3 text-xs"
            onClick={() => generateAll(targetRatio)}
            disabled={isGeneratingAll || items.length === 0}
          >
            {isGeneratingAll ? 'Generating all...' : 'Generate all'}
          </ActionButton>
          <ActionButton
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={handleDownloadAll}
            disabled={completedCount === 0 || isGeneratingAll}
          >
            Download all ({completedCount})
          </ActionButton>
          <ActionButton
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={clearAll}
            disabled={items.length === 0 || isGeneratingAll}
          >
            Clear all
          </ActionButton>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Your upload queue is empty.
            </div>
          ) : (
            items.map((item, index) => (
              <BatchImageItemCard
                key={item.id}
                item={item}
                targetRatio={targetRatio}
                disableActions={isGeneratingAll}
                onGenerate={() => generateItem(item.id, targetRatio)}
                onRemove={() => removeItem(item.id)}
                onDownload={() => {
                  if (!item.resultImage) {
                    return;
                  }

                  downloadDataUrl(item.resultImage, `image-expand-${targetRatio.replace(':', 'x')}-${index + 1}`);
                }}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
