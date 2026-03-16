import { GoogleGenAI, Modality } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { NANO_BANANA_BACKEND_PROMPT, createNanoBananaExpandPrompt, resolveExpandRatio } from '@/utils/constants';
import { createSseEvent, getChunkSignals, parseGeminiResponse, type ParsedResult } from '@/utils/image-modifier-helpers';
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
    return Response.json({ error: 'Image must be 10MB or smaller.' }, { status: 400 });
  }

  const mergedPrompt = backendPrompt.trim().length > 0 ? `${backendPrompt}\n\nUser request: ${userPrompt}` : userPrompt;
  const imageBytes = Buffer.from(await image.arrayBuffer()).toString('base64');
  const ai = new GoogleGenAI({ apiKey });
  const encoder = new TextEncoder();

  log.info('Image expand stream started', {
    route: 'POST /api/image-modifier/stream',
    userId: data.user.id,
    targetRatio,
    sourceRatio,
    fileSize: image.size,
    mimeType: image.type,
  });

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(createSseEvent(event, payload)));
      };

      void (async () => {
        let heartbeat: ReturnType<typeof setInterval> | null = null;
        let lastSentProgress = 0;
        let liveProgress = 3;
        let phaseFloor = 3;

        const sendProgress = (progress: number, message?: string) => {
          const clamped = Math.max(lastSentProgress, Math.min(100, Math.round(progress)));
          if (clamped === lastSentProgress && !message) {
            return;
          }
          lastSentProgress = clamped;
          sendEvent('status', {
            progress: clamped,
            ...(message ? { message } : {}),
          });
        };

        const advancePhase = (nextFloor: number, message?: string) => {
          phaseFloor = Math.max(phaseFloor, Math.min(97, nextFloor));
          sendProgress(phaseFloor, message);
        };

        try {
          advancePhase(8, 'Uploading image...');
          advancePhase(20, 'Preparing Nano Banana request...');

          heartbeat = setInterval(() => {
            const towardPhase = Math.max(0, phaseFloor - liveProgress);
            if (towardPhase > 0) {
              liveProgress += Math.min(2.6, towardPhase * 0.45 + 0.6);
            } else if (liveProgress < 97) {
              // Human-perceived smoothness while waiting between backend updates.
              liveProgress += liveProgress < 90 ? 0.35 : 0.12;
            }
            sendProgress(liveProgress);
          }, 180);

          const responseStream = await ai.models.generateContentStream({
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

          let latestImage: ParsedResult | null = null;
          let chunkIndex = 0;
          advancePhase(30, 'Generating with Nano Banana...');

          for await (const chunk of responseStream) {
            chunkIndex += 1;
            const signals = getChunkSignals(chunk);
            if (chunkIndex === 1 || signals.hasCandidate) {
              advancePhase(42);
            }
            if (signals.hasUsageMetadata) {
              advancePhase(58);
            }
            if (chunkIndex >= 2) {
              advancePhase(58 + chunkIndex * 4);
            }
            if (signals.hasFinishReason) {
              advancePhase(88);
            }
            const parsed = parseGeminiResponse(chunk);
            if (parsed.imageBase64) {
              latestImage = parsed;
              advancePhase(96);
            }
          }

          if (!latestImage?.imageBase64) {
            log.warn('Gemini stream returned no image', {
              route: 'POST /api/image-modifier/stream',
              userId: data.user.id,
              chunks: chunkIndex,
            });
            sendEvent('error', { message: 'Nano Banana did not return an image.' });
            controller.close();
            return;
          }

          advancePhase(99);
          sendEvent('result', {
            imageBase64: latestImage.imageBase64,
            mimeType: latestImage.mimeType ?? 'image/png',
          });
          sendEvent('done', { message: 'Completed.', progress: 100 });
          log.info('Image expand stream completed', {
            route: 'POST /api/image-modifier/stream',
            userId: data.user.id,
            targetRatio,
            chunks: chunkIndex,
          });
          controller.close();
        } catch (error) {
          log.error('Image expand stream failed', error, {
            route: 'POST /api/image-modifier/stream',
            userId: data.user.id,
          });
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          sendEvent('error', { message: `Nano Banana request failed: ${errorMessage}` });
          controller.close();
        } finally {
          if (heartbeat) {
            clearInterval(heartbeat);
          }
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
