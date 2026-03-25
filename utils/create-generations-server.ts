import 'server-only';

import { CreateGenerationCreditCost } from '@/utils/credits';
import {
  buildCreateGenerationStoragePath,
  CreateGenerationAssetKind,
  CreateGenerationRecord,
  CreateGenerationStorageBucket,
} from '@/utils/create-generations';
import { createClient as createServiceClient } from '@/utils/supabase/server-internal';

interface PersistCreateGenerationParams {
  userId: string;
  sourceFileName: string;
  sourceMimeType: string;
  sourceBytes: Uint8Array;
  targetRatio: string;
  resultMimeType: string;
  resultBytes: Uint8Array;
}

function toUploadBody(bytes: Uint8Array): Uint8Array {
  return bytes;
}

async function removeStoredAssets(paths: string[]) {
  if (!paths.length) {
    return;
  }

  const supabase = createServiceClient();
  await supabase.storage.from(CreateGenerationStorageBucket).remove(paths);
}

export async function persistCreateGeneration(params: PersistCreateGenerationParams): Promise<string> {
  const generationId = crypto.randomUUID();
  const sourceStoragePath = buildCreateGenerationStoragePath({
    userId: params.userId,
    generationId,
    assetKind: CreateGenerationAssetKind.Source,
    mimeType: params.sourceMimeType,
    fileName: params.sourceFileName,
  });
  const resultStoragePath = buildCreateGenerationStoragePath({
    userId: params.userId,
    generationId,
    assetKind: CreateGenerationAssetKind.Result,
    mimeType: params.resultMimeType,
  });
  const supabase = createServiceClient();

  const uploadTargets = [
    {
      path: sourceStoragePath,
      body: toUploadBody(params.sourceBytes),
      mimeType: params.sourceMimeType,
    },
    {
      path: resultStoragePath,
      body: toUploadBody(params.resultBytes),
      mimeType: params.resultMimeType,
    },
  ];

  try {
    for (const target of uploadTargets) {
      const { error } = await supabase.storage.from(CreateGenerationStorageBucket).upload(target.path, target.body, {
        contentType: target.mimeType,
        upsert: false,
      });

      if (error) {
        throw error;
      }
    }

    const { data, error } = await supabase.rpc('record_create_generation', {
      p_generation_id: generationId,
      p_user_id: params.userId,
      p_source_file_name: params.sourceFileName,
      p_source_storage_path: sourceStoragePath,
      p_source_mime_type: params.sourceMimeType,
      p_source_size_bytes: params.sourceBytes.byteLength,
      p_result_storage_path: resultStoragePath,
      p_result_mime_type: params.resultMimeType,
      p_result_size_bytes: params.resultBytes.byteLength,
      p_target_ratio: params.targetRatio,
      p_generation_credit_cost: CreateGenerationCreditCost,
      p_provider: 'actis-create',
    });

    if (error) {
      throw error;
    }

    return String(data ?? generationId);
  } catch (error) {
    await removeStoredAssets([sourceStoragePath, resultStoragePath]);
    throw error;
  }
}

export async function listCreateGenerations(userId: string): Promise<CreateGenerationRecord[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('create_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as CreateGenerationRecord[];
}

export async function getCreateGenerationForUser(userId: string, generationId: string): Promise<CreateGenerationRecord | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('create_generations')
    .select('*')
    .eq('id', generationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CreateGenerationRecord | null) ?? null;
}

export async function downloadCreateGenerationAsset(storagePath: string): Promise<Blob> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(CreateGenerationStorageBucket).download(storagePath);

  if (error) {
    throw error;
  }

  return data;
}

export async function markCreateGenerationUnavailable(userId: string, generationId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('create_generations')
    .update({
      status: 'unavailable',
      unavailable_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', generationId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
