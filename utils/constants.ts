export const NANO_BANANA_BACKEND_PROMPT =
  'You are an expert image editing assistant. Apply the user request while preserving core subject identity, realism, and composition unless explicitly asked otherwise.';

export const DEFAULT_EXPAND_RATIO = '9:16';

export const IMAGE_EXPAND_RATIO_OPTIONS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:5', label: 'Portrait (4:5)' },
  { value: '9:16', label: 'Story/Reel (9:16)' },
  { value: '3:4', label: 'Classic portrait (3:4)' },
  { value: '2:3', label: 'Photo portrait (2:3)' },
  { value: '16:9', label: 'Landscape (16:9)' },
] as const;

export function resolveExpandRatio(targetRatio: string | null): string {
  if (!targetRatio) {
    return DEFAULT_EXPAND_RATIO;
  }

  const isKnown = IMAGE_EXPAND_RATIO_OPTIONS.some((option) => option.value === targetRatio);
  if (isKnown) {
    return targetRatio;
  }

  return DEFAULT_EXPAND_RATIO;
}

interface ExpandPromptOptions {
  targetRatio: string;
  sourceRatio?: string;
  sourceWidth?: number;
  sourceHeight?: number;
}

export function createNanoBananaExpandPrompt(options: ExpandPromptOptions): string {
  const sourceDetails =
    options.sourceWidth && options.sourceHeight && options.sourceRatio
      ? `Input image details: ${options.sourceWidth}x${options.sourceHeight} (${options.sourceRatio}).`
      : options.sourceRatio
        ? `Input image aspect ratio: ${options.sourceRatio}.`
        : '';

  return `expand this image to a ${options.targetRatio} aspect ratio while preserving the main subject and existing framing. ${sourceDetails} generate natural new canvas areas where needed without distorting facial/body proportions. enhance the attached image to be more photo realistic, cleaner image quality, remove any ai artifacts to improve the image, hyper-detailed skin texture, pores and follicle micro-structure visible, soft visible vellus hairs, subsurface scattering, anisotropic reflectance on hair and moisturized areas. Natural skin imperfections, visible capillaries, hydrated sheen on nose, slight film grain, RAW photo. maintain exact composition and lock in all other details while enhancing.`;
}
