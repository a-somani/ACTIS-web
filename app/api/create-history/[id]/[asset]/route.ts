import { NextRequest } from 'next/server';
import {
  downloadCreateGenerationAsset,
  getCreateGenerationForUser,
  markCreateGenerationUnavailable,
} from '@/utils/create-generations-server';
import {
  buildCreateGenerationDownloadName,
  CreateGenerationAssetKind,
  resolveImageExtension,
} from '@/utils/create-generations';
import { validateUserSession } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteContext {
  params: Promise<{
    id: string;
    asset: string;
  }>;
}

function resolveAssetPath(
  asset: string,
  record: Awaited<ReturnType<typeof getCreateGenerationForUser>>
): { path: string; mimeType: string | null; fileName: string } | null {
  if (!record) {
    return null;
  }

  if (asset === CreateGenerationAssetKind.Result) {
    const extension = resolveImageExtension(record.result_mime_type);
    return {
      path: record.result_storage_path,
      mimeType: record.result_mime_type,
      fileName: `${buildCreateGenerationDownloadName(record)}.${extension}`,
    };
  }

  if (asset === CreateGenerationAssetKind.Source) {
    const extension = resolveImageExtension(record.source_mime_type, record.source_file_name);
    return {
      path: record.source_storage_path,
      mimeType: record.source_mime_type,
      fileName: `${buildCreateGenerationDownloadName(record)}-source.${extension}`,
    };
  }

  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id, asset } = await context.params;
  const user = await validateUserSession();
  const record = await getCreateGenerationForUser(user.id, id);
  const assetTarget = resolveAssetPath(asset, record);

  if (!assetTarget) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const blob = await downloadCreateGenerationAsset(assetTarget.path);
    const shouldDownload = request.nextUrl.searchParams.get('download') === '1';
    const headers = new Headers({
      'Content-Type': assetTarget.mimeType ?? blob.type ?? 'application/octet-stream',
      'Cache-Control': 'private, max-age=60',
    });

    if (shouldDownload) {
      headers.set('Content-Disposition', `attachment; filename="${assetTarget.fileName}"`);
    }

    return new Response(blob.stream(), { headers });
  } catch {
    await markCreateGenerationUnavailable(user.id, id);
    return Response.json({ error: 'Unable to load image.' }, { status: 404 });
  }
}
