import { ImageUpscalerWorkbench } from '@/components/dashboard/image-upscaler/image-upscaler-workbench';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';

export default function DashboardUpscalePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Image Upscale" />
      <ImageUpscalerWorkbench />
    </main>
  );
}
