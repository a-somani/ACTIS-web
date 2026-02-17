import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { ImageModifierWorkbench } from '@/components/dashboard/image-modifier/image-modifier-workbench';

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Image Modifier'} />
      <ImageModifierWorkbench />
    </main>
  );
}
