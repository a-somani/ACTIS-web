import { ImageModifierWorkbench } from '@/components/dashboard/image-modifier/image-modifier-workbench';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle="Image Expand" />
      <ImageModifierWorkbench />
    </main>
  );
}
