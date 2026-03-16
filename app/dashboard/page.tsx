import { ImageModifierWorkbench } from '@/components/dashboard/image-modifier/image-modifier-workbench';

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Image Expand</h1>
      <ImageModifierWorkbench />
    </main>
  );
}
