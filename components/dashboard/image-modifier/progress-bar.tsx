'use client';

interface ProgressBarProps {
  progress: number | null;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  if (progress === null) {
    return null;
  }

  return (
    <div className="mt-4 w-full space-y-1">
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground">{Math.round(progress)}%</p>
    </div>
  );
}
