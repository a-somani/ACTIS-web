export const CreateGenerationStorageBucket = 'create-generations';

export const CreateGenerationAssetKind = {
  Source: 'source',
  Result: 'result',
} as const;

export type CreateGenerationAssetKind = (typeof CreateGenerationAssetKind)[keyof typeof CreateGenerationAssetKind];

export interface CreateGenerationRecord {
  id: string;
  user_id: string;
  source_file_name: string;
  source_storage_path: string;
  source_mime_type: string | null;
  source_size_bytes: number;
  result_storage_path: string;
  result_mime_type: string | null;
  result_size_bytes: number;
  target_ratio: string;
  provider: string;
  status: string;
  created_at: string;
  updated_at: string;
  unavailable_at: string | null;
}

function resolveExtensionFromName(fileName?: string | null): string | null {
  if (!fileName) {
    return null;
  }

  const extension = fileName.split('.').pop()?.trim().toLowerCase();
  return extension && extension.length <= 8 ? extension : null;
}

export function resolveImageExtension(mimeType?: string | null, fileName?: string | null): string {
  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return resolveExtensionFromName(fileName) ?? 'png';
}

export function buildCreateGenerationStoragePath(params: {
  userId: string;
  generationId: string;
  assetKind: CreateGenerationAssetKind;
  mimeType?: string | null;
  fileName?: string | null;
}): string {
  const extension = resolveImageExtension(params.mimeType, params.fileName);
  return `${params.userId}/${params.generationId}/${params.assetKind}.${extension}`;
}

export function buildCreateGenerationAssetUrl(params: {
  generationId: string;
  assetKind: CreateGenerationAssetKind;
  download?: boolean;
}): string {
  const search = params.download ? '?download=1' : '';
  return `/api/create-history/${params.generationId}/${params.assetKind}${search}`;
}

export function buildCreateGenerationDownloadName(record: Pick<CreateGenerationRecord, 'source_file_name' | 'target_ratio'>): string {
  const sourceBaseName = record.source_file_name.replace(/\.[^.]+$/, '') || 'actis-create';
  const safeBaseName = sourceBaseName.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const ratioSuffix = record.target_ratio.replace(':', 'x');
  return `${safeBaseName || 'actis-create'}-${ratioSuffix}`;
}

export const GenerationKind = {
  Expand: 'expand',
  Upscale: 'upscale',
} as const;

export type GenerationKind = (typeof GenerationKind)[keyof typeof GenerationKind];

export function detectGenerationKind(targetRatio: string | null | undefined): GenerationKind {
  return (targetRatio ?? '').startsWith('upscale-') ? GenerationKind.Upscale : GenerationKind.Expand;
}

export function formatTargetRatioLabel(targetRatio: string | null | undefined): string {
  const value = targetRatio ?? '';
  if (value.startsWith('upscale-')) {
    return `Upscale · ${value.slice('upscale-'.length)}`;
  }
  return value || 'Expand';
}
