'use client';

import { Download, ImagePlus, LoaderCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreateShareMenu } from '@/components/dashboard/create/create-share-menu';
import { CreateRatioOptions } from '@/components/dashboard/create/constants';

export function EmptyUploadState(props: { isLoadingCredits: boolean; onUpload: () => void }) {
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
      <Button className="h-12 w-full rounded-2xl text-sm md:h-[52px] md:text-base" disabled={props.isLoadingCredits}>
        <ImagePlus className="mr-2 h-4 w-4" />
        Add an image to continue
      </Button>
    </div>
  );
}

export function ReadyState(props: {
  sourcePreviewUrl: string;
  targetRatio: string;
  canGenerate: boolean;
  generateLabel?: string;
  onGenerate: () => void;
  onReplace: () => void;
  onChangeRatio: (ratio: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <img
        src={props.sourcePreviewUrl}
        alt="Source upload"
        className="aspect-square w-full rounded-[28px] object-cover"
      />
      <div className="space-y-5 p-1 md:p-2">
        <div className="flex flex-wrap gap-2">
          {CreateRatioOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => props.onChangeRatio(option.value)}
              className={cn(
                'rounded-full px-3 py-2 text-sm transition-colors',
                props.targetRatio === option.value ? 'bg-primary/15 text-white' : 'bg-white/[0.04] text-white/65',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-semibold">Source loaded and ready.</p>
          <p className="text-white/60">
            Choose the final canvas ratio, then generate a polished result you can compare and share.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-12 flex-1 rounded-2xl text-base"
            onClick={props.onGenerate}
            disabled={!props.canGenerate}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {props.generateLabel ?? 'Generate 10 credits'}
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

export function GeneratingState(props: {
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
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
          Source
        </p>
      </div>
      <div className="rounded-[24px] bg-white/[0.03] p-5 text-center">
        <img
          src={props.sourcePreviewUrl}
          alt="Generating result"
          className="mx-auto aspect-[4/5] w-full max-w-xs rounded-[28px] object-cover opacity-55 lg:max-w-sm"
        />
        <p className="mt-4 text-lg font-semibold text-fuchsia-300">{props.phaseMessage ?? 'Transforming your image'}</p>
        <p className="mt-2 text-sm text-white/60">
          {props.progress ? `${Math.round(props.progress)}% complete` : 'Starting up'}
        </p>
        <Button
          variant="outline"
          className="mt-5 h-12 rounded-2xl border-white/10 bg-transparent text-white"
          onClick={props.onCancel}
        >
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Cancel transformation
        </Button>
      </div>
    </div>
  );
}

export function ResultState(props: {
  resultImage: string;
  sourcePreviewUrl: string;
  onCompareChange: (value: boolean) => void;
  onDownload: () => void;
  onRegenerate: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <img
        src={props.sourcePreviewUrl}
        alt="Original source"
        className="aspect-square w-full rounded-[28px] object-cover"
      />
      <div className="space-y-4 rounded-[24px] bg-white/[0.03] p-5">
        <button
          type="button"
          onPointerDown={() => props.onCompareChange(true)}
          onPointerUp={() => props.onCompareChange(false)}
          onPointerLeave={() => props.onCompareChange(false)}
          className="relative mx-auto block w-full max-w-sm rounded-[28px]"
        >
          <img
            src={props.resultImage}
            alt="Generated result"
            className="aspect-square w-full rounded-[28px] object-cover"
          />
          <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Hold to compare
          </span>
        </button>
        <p className="text-center text-sm text-primary">Secure in ACTIS Vault</p>
        <div className="flex flex-wrap gap-3">
          <CreateShareMenu onDownload={props.onDownload} />
          <Button
            size="icon"
            className="h-12 w-12 rounded-2xl bg-primary/20 text-primary hover:bg-primary/30"
            onClick={props.onDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-2xl border-white/10 bg-transparent text-white"
            onClick={props.onRegenerate}
          >
            Regenerate
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-2xl border-white/10 bg-transparent text-white"
            onClick={props.onCreateNew}
          >
            Create new
          </Button>
        </div>
      </div>
    </div>
  );
}

