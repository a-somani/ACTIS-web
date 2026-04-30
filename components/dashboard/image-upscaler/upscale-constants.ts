export const UpscaleDefaultFactor = '2x';

export const UpscaleStepItems = [
  { id: 'upload', label: 'Upload' },
  { id: 'upscale', label: 'Upscale' },
  { id: 'download', label: 'Download' },
] as const;

export const UpscaleFactorOptions = [
  { value: '2x', label: '2x — Sharper detail' },
  { value: '4x', label: '4x — Maximum detail' },
] as const;

export const UpscaleBestPractices = {
  use: [
    'Start with the highest-resolution source you have — upscaling preserves what is already there.',
    'Sharp, well-lit photos respond best; soft or blurred sources stay soft.',
    'PNG and high-quality JPEG keep more detail than heavily compressed JPEGs.',
  ],
  avoid: [
    'Pixel-art or screenshots of low-res icons — model adds detail that may not match.',
    'Already 4K or larger inputs — Gemini caps output at 4K, so you gain little.',
    'Heavily distorted faces or text where artifacts will be amplified.',
  ],
} as const;

export const UpscalePhaseFallbackMessages = [
  'Reading your source image',
  'Mapping detail and texture',
  'Reconstructing fine edges',
  'Recovering micro-detail',
  'Cleaning compression artifacts',
  'Restoring sharpness',
  'Finishing the upscale pass',
  'Almost ready',
] as const;

export const UpscaleBackgroundTileGradients = [
  'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(236,72,153,0.18))',
  'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(217,70,239,0.16))',
  'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(251,113,133,0.18))',
  'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))',
  'linear-gradient(135deg, rgba(192,132,252,0.18), rgba(244,114,182,0.18))',
] as const;

export const UpscaleBackgroundTileClasses = [
  'col-span-1 h-36 rounded-[28px] bg-white/5 md:h-48',
  'col-span-1 h-48 rounded-[28px] bg-white/5 md:mt-6 md:h-64',
  'col-span-1 h-40 rounded-[28px] bg-white/5 md:h-52',
  'col-span-1 hidden h-56 rounded-[28px] bg-white/5 md:block',
  'col-span-1 hidden h-40 rounded-[28px] bg-white/5 md:block',
  'col-span-1 h-44 rounded-[28px] bg-white/5 md:-mt-10 md:h-56',
  'col-span-1 h-36 rounded-[28px] bg-white/5 md:h-44',
  'col-span-1 h-56 rounded-[28px] bg-white/5 md:h-72',
  'col-span-1 hidden h-44 rounded-[28px] bg-white/5 md:block',
  'col-span-1 hidden h-64 rounded-[28px] bg-white/5 md:-mt-10 md:block',
  'col-span-1 h-36 rounded-[28px] bg-white/5 md:h-48',
  'col-span-1 h-48 rounded-[28px] bg-white/5 md:h-56',
  'col-span-1 h-40 rounded-[28px] bg-white/5 md:h-52',
  'col-span-1 hidden h-48 rounded-[28px] bg-white/5 md:block',
  'col-span-1 hidden h-44 rounded-[28px] bg-white/5 md:block',
] as const;
