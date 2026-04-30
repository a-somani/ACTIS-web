'use client';

import { useState } from 'react';
import { AuthDialog, type AuthDialogMode } from '@/components/authentication/auth-dialog';
import { CreateWorkbench } from '@/components/dashboard/create/create-workbench';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';
import { useAuth } from '@/contexts/auth-context';
import '../../styles/home-page.css';

interface HomePageProps {
  initialCredits?: CreditSummaryResponse | null;
  initialIsAuthenticated?: boolean;
}

export function HomePage({ initialCredits = null, initialIsAuthenticated = false }: HomePageProps) {
  const { user, loading } = useAuth();
  const [authDialogMode, setAuthDialogMode] = useState<AuthDialogMode>('signup');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authNextPath, setAuthNextPath] = useState('/');
  const isAuthenticated = Boolean(user?.id) || (loading && initialIsAuthenticated);

  function openAuthDialog(mode: AuthDialogMode, nextPath: string) {
    setAuthDialogMode(mode);
    setAuthNextPath(nextPath);
    setAuthDialogOpen(true);
  }

  return (
    <>
      <DashboardLayout>
        <main className="mx-auto w-full max-w-[1600px] p-3 md:p-6">
          <CreateWorkbench
            initialCredits={initialCredits}
            isAuthenticated={isAuthenticated}
            onRequireAuth={() => openAuthDialog('signup', '/')}
            showDashboardChrome={true}
          />
        </main>
      </DashboardLayout>
      <AuthDialog
        open={authDialogOpen}
        mode={authDialogMode}
        nextPath={authNextPath}
        onOpenChange={setAuthDialogOpen}
        onModeChange={setAuthDialogMode}
      />
    </>
  );
}
