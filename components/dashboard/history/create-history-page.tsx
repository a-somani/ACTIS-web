import dayjs from 'dayjs';
import { Download, ImagePlus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import {
  buildCreateGenerationAssetUrl,
  buildCreateGenerationDownloadName,
  CreateGenerationAssetKind,
  type CreateGenerationRecord,
} from '@/utils/create-generations';

interface Props {
  records: CreateGenerationRecord[];
}

function EmptyState() {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">No generations yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
        Your saved ACTIS creates will appear here once you generate and store your first result.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard/create">Open Create</Link>
      </Button>
    </div>
  );
}

function HistoryCard({ record }: { record: CreateGenerationRecord }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-black/25">
      <div className="grid gap-4 p-4 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <Image
            src={buildCreateGenerationAssetUrl({
              generationId: record.id,
              assetKind: CreateGenerationAssetKind.Source,
            })}
            alt={`${record.source_file_name} source`}
            width={320}
            height={320}
            unoptimized
            className="aspect-square w-full rounded-[20px] border border-white/10 object-cover"
            loading="lazy"
          />
          <Image
            src={buildCreateGenerationAssetUrl({
              generationId: record.id,
              assetKind: CreateGenerationAssetKind.Result,
            })}
            alt={`${record.source_file_name} result`}
            width={320}
            height={320}
            unoptimized
            className="aspect-square w-full rounded-[20px] border border-white/10 object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">ACTIS Create</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{record.source_file_name}</h2>
              <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                {record.status}
              </span>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Created</p>
              <p className="mt-1 font-medium text-white">{dayjs(record.created_at).format('MMM DD, YYYY [at] h:mma')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Ratio</p>
              <p className="mt-1 font-medium text-white">{record.target_ratio}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Download</p>
              <p className="mt-1 font-medium text-white">{buildCreateGenerationDownloadName(record)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 lg:flex-col">
          <Button asChild>
            <a
              href={buildCreateGenerationAssetUrl({
                generationId: record.id,
                assetKind: CreateGenerationAssetKind.Result,
                download: true,
              })}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button asChild variant="outline" className="border-white/10 bg-transparent text-white">
            <Link href="/dashboard/create">
              <ImagePlus className="mr-2 h-4 w-4" />
              Create Again
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CreateHistoryPage({ records }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="History" compact />
      {records.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </main>
  );
}
