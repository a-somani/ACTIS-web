import { GoogleGenAI, Modality } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { NANO_BANANA_BACKEND_PROMPT, createNanoBananaExpandPrompt, resolveExpandRatio } from '@/utils/constants';
import { parseGeminiResponse } from '@/utils/image-modifier-helpers';
import { log } from '@/utils/logger';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.NANO_BANANA_API_KEY;
  const model = process.env.NANO_BANANA_MODEL ?? 'gemini-3-pro-image-preview';
  const backendPrompt = NANO_BANANA_BACKEND_PROMPT;

  if (!apiKey) {
    return Response.json({ error: 'Nano Banana config is missing. Set NANO_BANANA_API_KEY.' }, { status: 500 });
  }

  const formData = await request.formData();
  const image = formData.get('image');
  const targetRatio = resolveExpandRatio(formData.get('targetRatio')?.toString() ?? null);
  const sourceRatio = formData.get('sourceRatio')?.toString();
  const sourceWidth = Number(formData.get('sourceWidth')?.toString() ?? '');
  const sourceHeight = Number(formData.get('sourceHeight')?.toString() ?? '');
  const userPrompt = createNanoBananaExpandPrompt({
    targetRatio,
    sourceRatio: sourceRatio || undefined,
    sourceWidth: Number.isFinite(sourceWidth) && sourceWidth > 0 ? sourceWidth : undefined,
    sourceHeight: Number.isFinite(sourceHeight) && sourceHeight > 0 ? sourceHeight : undefined,
  });

  if (!(image instanceof File)) {
    return Response.json({ error: 'Image is required.' }, { status: 400 });
  }

  if (sourceRatio && sourceRatio === targetRatio) {
    return Response.json({ error: 'Output ratio must be different from source ratio.' }, { status: 400 });
  }

  if (!image.type.startsWith('image/')) {
    return Response.json({ error: 'Only image files are supported.' }, { status: 400 });
  }

  if (image.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'Image must be 10 MB or smaller.' }, { status: 400 });
  }

  const mergedPrompt = backendPrompt.trim().length > 0 ? `${backendPrompt}\n\nUser request: ${userPrompt}` : userPrompt;
  const ai = new GoogleGenAI({ apiKey });
  const imageBytes = Buffer.from(await image.arrayBuffer()).toString('base64');

  log.info('Image expand started', {
    route: 'POST /api/image-modifier',
    userId: data.user.id,
    targetRatio,
    sourceRatio,
    fileSize: image.size,
    mimeType: image.type,
  });

  try {
    const geminiResponse = await ai.models.generateContent({
      model,
      contents: [
        { text: mergedPrompt },
        {
          inlineData: {
            mimeType: image.type,
            data: imageBytes,
          },
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parsed = parseGeminiResponse(geminiResponse);

    if (!parsed.imageBase64) {
      log.warn('Gemini returned no image', { route: 'POST /api/image-modifier', userId: data.user.id });
      return Response.json({ error: 'Nano Banana did not return an image.' }, { status: 502 });
    }

    log.info('Image expand completed', { route: 'POST /api/image-modifier', userId: data.user.id, targetRatio });
    return Response.json(parsed);
  } catch (error) {
    log.error('Image expand failed', error, { route: 'POST /api/image-modifier', userId: data.user.id });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Nano Banana request failed: ${errorMessage}` }, { status: 502 });
  }
}
