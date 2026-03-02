'use client';

interface GeneratedImagePreviewProps {
  resultImage: string | null;
  targetRatio: string;
}

export function GeneratedImagePreview({ resultImage, targetRatio }: GeneratedImagePreviewProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Generated ({targetRatio})</p>
      <div className="mx-auto w-full max-w-sm">
        {resultImage ? (
          <img
            src={resultImage}
            alt="Generated output"
            style={{ aspectRatio: targetRatio.replace(':', ' / ') }}
            className="w-full rounded-md border border-border object-cover"
          />
        ) : (
          <div
            style={{ aspectRatio: targetRatio.replace(':', ' / ') }}
            className="flex w-full items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground"
          >
            Run generation to see your {targetRatio} output.
          </div>
        )}
      </div>
    </div>
  );
}
