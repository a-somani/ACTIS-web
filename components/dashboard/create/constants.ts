import { CreateGenerationCreditCost } from '@/utils/credits';

export const CreateDefaultRatio = '1:1';

export const CreateStepItems = [
  { id: 'upload', label: 'Upload' },
  { id: 'generate', label: 'Generate' },
  { id: 'download', label: 'Download' },
] as const;

export const CreateRatioOptions = [
  { value: '1:1', label: 'Square' },
  { value: '4:5', label: 'Portrait' },
  { value: '9:16', label: 'Story' },
  { value: '16:9', label: 'Landscape' },
] as const;

export const CreateBestPractices = {
  use: [
    'Start with a clear source image and a dominant subject.',
    'Choose the target canvas size before you generate.',
    'Use images with clean lighting and enough room around the subject.',
    'Keep file sizes reasonable for a faster upload and generation start.',
  ],
  avoid: [
    'Very small or heavily compressed screenshots.',
    'Source images where the subject is already cropped too tightly.',
    'Frequent ratio changes between attempts unless you want a new result.',
  ],
} as const;

export const CreatePhaseFallbackMessages = [
  'Reading your source image',
  'Balancing light and color',
  'Aligning structure and style',
  'Refining depth and detail',
  'Mapping signature features',
  'Rendering your new frame',
  'Enhancing visual consistency',
  'Tuning the finishing touches',
  'Almost ready',
] as const;

export const CreateSocialShareItems = [
  {
    id: 'x',
    label: 'Share to X',
    url: 'https://twitter.com/intent/tweet?text=Created%20with%20ACTIS&url=',
  },
  {
    id: 'reddit',
    label: 'Share to Reddit',
    url: 'https://www.reddit.com/submit?title=Created%20with%20ACTIS&url=',
  },
] as const;

export const CreateGenerationCostLabel = `${CreateGenerationCreditCost} credits`;

export const CreateBackgroundTileGradients = [
  'linear-gradient(135deg, rgba(45,212,191,0.18), rgba(168,85,247,0.18))',
  'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(59,130,246,0.14))',
  'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(251,191,36,0.18))',
  'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(45,212,191,0.18))',
  'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(56,189,248,0.18))',
] as const;

export const CreateBackgroundTileClasses = [
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
