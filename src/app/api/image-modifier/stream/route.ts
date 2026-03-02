import { GoogleGenAI, Modality } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { NANO_BANANA_BACKEND_PROMPT, NANO_BANANA_EXPAND_USER_PROMPT } from '@/utils/constants';

interface ParsedResult {
  imageBase64?: string;
  mimeType?: string;
}

function parseGeminiResponse(data: unknown): ParsedResult {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const response = data as {
    data?: string;
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
  };

  const parts = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];
  const imagePart = parts.find((part) => typeof part.inlineData?.data === 'string');

  if (imagePart?.inlineData?.data) {
    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/png',
    };
  }

  if (typeof response.data === 'string' && response.data.length > 0) {
    return { imageBase64: response.data, mimeType: 'image/png' };
  }

  return {};
}

function createSseEvent(event: string, payload: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

interface ChunkSignals {
  hasUsageMetadata: boolean;
  hasCandidate: boolean;
  hasFinishReason: boolean;
}

function getChunkSignals(data: unknown): ChunkSignals {
  if (!data || typeof data !== 'object') {
    return { hasUsageMetadata: false, hasCandidate: false, hasFinishReason: false };
  }

  const response = data as {
    usageMetadata?: unknown;
    candidates?: Array<{ finishReason?: unknown }>;
  };

  const firstCandidate = response.candidates?.[0];
  return {
    hasUsageMetadata: Boolean(response.usageMetadata),
    hasCandidate: Boolean(firstCandidate),
    hasFinishReason: Boolean(firstCandidate?.finishReason),
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.NANO_BANANA_API_KEY;
  const model = process.env.NANO_BANANA_MODEL ?? 'gemini-3-pro-image-preview';
  const backendPrompt = NANO_BANANA_BACKEND_PROMPT;
  const userPrompt = NANO_BANANA_EXPAND_USER_PROMPT;

  if (!apiKey) {
    return Response.json({ error: 'Nano Banana config is missing. Set NANO_BANANA_API_KEY.' }, { status: 500 });
  }

  const formData = await request.formData();
  const image = formData.get('image');

  if (!(image instanceof File)) {
    return Response.json({ error: 'Image is required.' }, { status: 400 });
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
          controller.close();
        } catch (error) {
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
