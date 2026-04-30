'use client';

import { ArrowUpFromLine, Download, ImagePlus, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UpscaleFactorOptions } from '@/components/dashboard/image-upscaler/upscale-constants';

export function UpscaleEmptyState(props: { isLoadingCredits: boolean; onUpload: () => void }) {
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="space-y-3 text-center md:space-y-4">
        <p className="text-sm font-medium text-white/60">Source image</p>
        <button
          type="button"
          onClick={props.onUpload}
          className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-white/[0.04] px-4 py-4 text-left transition-colors hover:bg-white/[0.06] md:rounded-[22px] md:py-5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-white/80 md:h-11 md:w-11">
            <ImagePlus className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-white md:text-base">Gallery</span>
        </button>
        <p className="text-center text-sm text-white/50">JPG or PNG, up to 10 MB.</p>
      </div>
      <Button
        className="h-12 w-full rounded-2xl bg-violet-500 text-sm text-white hover:bg-violet-600 md:h-[52px] md:text-base"
        disabled={props.isLoadingCredits}
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        Add an image to continue
      </Button>
    </div>
  );
}

export function UpscaleReadyState(props: {
  sourcePreviewUrl: string;
  scaleFactor: string;
  canGenerate: boolean;
  generateLabel?: string;
  onGenerate: () => void;
  onReplace: () => void;
  onChangeFactor: (factor: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <img src={props.sourcePreviewUrl} alt="Source upload" className="aspect-square w-full rounded-[28px] object-cover" />
      <div className="space-y-5 p-1 md:p-2">
        <div className="flex flex-wrap gap-2">
          {UpscaleFactorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => props.onChangeFactor(option.value)}
              className={cn(
                'rounded-full px-3 py-2 text-sm transition-colors',
                props.scaleFactor === option.value
                  ? 'bg-violet-500/20 text-white ring-1 ring-violet-400'
                  : 'bg-white/[0.04] text-white/65',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-semibold">Source loaded and ready.</p>
          <p className="text-white/60">
            Choose how much to upscale, then generate a sharper, higher-fidelity version of the same image.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-12 flex-1 rounded-2xl bg-violet-500 text-base text-white hover:bg-violet-600"
            onClick={props.onGenerate}
            disabled={!props.canGenerate}
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            {props.generateLabel ?? 'Upscale 10 credits'}
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-white/10 bg-transparent text-white"
            onClick={props.onReplace}
          >
            Replace image
          </Button>
        </div>
      </div>
    </div>
  );
}

export function UpscaleGeneratingState(props: {
  sourcePreviewUrl: string;
  progress: number | null;
  phaseMessage: string | null;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="hidden rounded-[24px] bg-white/[0.04] p-4 lg:block">
        <img
          src={props.sourcePreviewUrl}
          alt="Source upload"
          className="aspect-square w-full rounded-[24px] object-cover opacity-65"
        />
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Source</p>
      </div>
      <div className="rounded-[24px] bg-white/[0.03] p-5 text-center">
        <img
          src={props.sourcePreviewUrl}
          alt="Upscaling result"
          className="mx-auto aspect-square w-full max-w-xs rounded-[28px] object-cover opacity-55 lg:max-w-sm"
        />
        <p className="mt-4 text-lg font-semibold text-violet-300">{props.phaseMessage ?? 'Upscaling your image'}</p>
        <p className="mt-2 text-sm text-white/60">
          {props.progress ? `${Math.round(props.progress)}% complete` : 'Starting up'}
        </p>
        <Button
          variant="outline"
          className="mt-5 h-12 rounded-2xl border-white/10 bg-transparent text-white"
          onClick={props.onCancel}
        >
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Cancel upscale
        </Button>
      </div>
    </div>
  );
}

export function UpscaleResultState(props: {
  resultImage: string;
  onCompareChange: (value: boolean) => void;
  onDownload: () => void;
  onRegenerate: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="space-y-4 rounded-[24px] bg-white/[0.03] p-5">
      <div className="mx-auto w-full max-w-sm">
        <button
          type="button"
          onPointerDown={() => props.onCompareChange(true)}
          onPointerUp={() => props.onCompareChange(false)}
          onPointerLeave={() => props.onCompareChange(false)}
          className="relative block w-full"
        >
          <img src={props.resultImage} alt="Upscaled result" className="aspect-square w-full object-cover" />
          <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Hold to compare
          </span>
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"
          onClick={props.onDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-2xl border-white/10 bg-transparent text-white"
          onClick={props.onRegenerate}
        >
          Re-upscale
        </Button>
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-2xl border-white/10 bg-transparent text-white"
          onClick={props.onCreateNew}
        >
          New upscale
        </Button>
      </div>
    </div>
  );
}
