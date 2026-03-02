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
  const ai = new GoogleGenAI({ apiKey });
  const imageBytes = Buffer.from(await image.arrayBuffer()).toString('base64');

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
      return Response.json({ error: 'Nano Banana did not return an image.' }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Nano Banana request failed: ${errorMessage}` }, { status: 502 });
  }
}
