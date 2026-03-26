'use client';

import { useMemo, useState, useTransition } from 'react';
import dayjs from 'dayjs';
import { Download, LoaderCircle, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteCreateGeneration } from '@/app/dashboard/history/actions';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { Button } from '@/components/ui/button';
import {
  buildCreateGenerationAssetUrl,
  CreateGenerationAssetKind,
  type CreateGenerationRecord,
} from '@/utils/create-generations';

interface Props {
  records: CreateGenerationRecord[];
}

function EmptyState() {
  return (
    <div className="rounded-[24px] bg-white/[0.03] p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05]">
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

function HistoryTile(props: { record: CreateGenerationRecord; onOpen: () => void }) {
  return (
    <button type="button" onClick={props.onOpen} className="block w-full overflow-hidden rounded-[22px] bg-white/[0.03] text-left transition-transform hover:-translate-y-0.5">
      <Image
        src={buildCreateGenerationAssetUrl({
          generationId: props.record.id,
          assetKind: CreateGenerationAssetKind.Result,
        })}
        alt={props.record.source_file_name}
        width={480}
        height={480}
        unoptimized
        className="aspect-square w-full object-cover"
        loading="lazy"
      />
    </button>
  );
}

function HistoryLightbox(props: {
  record: CreateGenerationRecord;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4 py-6" onClick={props.onClose}>
      <div className="relative w-full max-w-md" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={props.onClose}
          className="absolute right-0 top-0 z-10 flex h-11 w-11 -translate-y-3 translate-x-1 items-center justify-center rounded-full bg-black/70 text-white/80 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="space-y-5 rounded-[28px] bg-[linear-gradient(180deg,rgba(25,28,39,0.98),rgba(11,13,18,0.99))] p-4 pb-6 shadow-2xl">
          <div className="overflow-hidden rounded-[22px] bg-black/20">
            <img
              src={buildCreateGenerationAssetUrl({
                generationId: props.record.id,
                assetKind: CreateGenerationAssetKind.Result,
              })}
              alt={props.record.source_file_name}
              className="max-h-[56vh] w-full object-contain"
            />
          </div>

          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-white">{props.record.source_file_name}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              {props.record.target_ratio} · {dayjs(props.record.created_at).format('MMM D, YYYY')}
            </p>
          </div>

          {props.error ? <p className="text-center text-sm text-destructive-foreground">{props.error}</p> : null}

          <div className="flex justify-center">
            <Button asChild className="h-12 w-full max-w-sm rounded-2xl text-base">
              <a
                href={buildCreateGenerationAssetUrl({
                  generationId: props.record.id,
                  assetKind: CreateGenerationAssetKind.Result,
                  download: true,
                })}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-sm text-white/55 hover:bg-transparent hover:text-destructive-foreground"
              onClick={props.onDelete}
              disabled={props.isDeleting}
            >
              {props.isDeleting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateHistoryPage({ records }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(records);
  const [galleryScale, setGalleryScale] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const selectedRecord = useMemo(
    () => items.find((record) => record.id === selectedId) ?? null,
    [items, selectedId],
  );
  const galleryGridClassName = useMemo(() => {
    if (galleryScale <= 1) {
      return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }

    if (galleryScale >= 3) {
      return 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';
    }

    return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
  }, [galleryScale]);

  const handleDelete = () => {
    if (!selectedRecord) {
      return;
    }

    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteCreateGeneration(selectedRecord.id);

      if ('error' in result && result.error) {
        setDeleteError(result.error);
        return;
      }

      setItems((current) => current.filter((record) => record.id !== selectedRecord.id));
      setSelectedId(null);
      router.refresh();
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader
        pageTitle="History"
        compact
        actions={
          items.length > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-white/55" />
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={galleryScale}
                onChange={(event) => setGalleryScale(Number(event.target.value))}
                className="h-1.5 w-20 accent-primary md:w-24"
                aria-label="Adjust gallery size"
              />
            </div>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`grid gap-3 ${galleryGridClassName}`}>
          {items.map((record) => (
            <HistoryTile key={record.id} record={record} onOpen={() => setSelectedId(record.id)} />
          ))}
        </div>
      )}

      {selectedRecord ? (
        <HistoryLightbox
          record={selectedRecord}
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => {
            if (isDeleting) {
              return;
            }

            setDeleteError(null);
            setSelectedId(null);
          }}
          onDelete={handleDelete}
        />
      ) : null}
    </main>
  );
}
