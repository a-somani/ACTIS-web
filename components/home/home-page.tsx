'use client';

import { useState } from 'react';
import { AuthDialog, type AuthDialogMode } from '@/components/authentication/auth-dialog';
import { CreateWorkbench } from '@/components/dashboard/create/create-workbench';
import type { CreditSummaryResponse } from '@/components/dashboard/create/types';
import { useAuth } from '@/contexts/auth-context';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { HomePageBackground } from '@/components/gradients/home-page-background';

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
    <div className="relative min-h-screen">
      <HomePageBackground />
      <Header
        user={user}
        onOpenLogin={() => openAuthDialog('login', '/')}
        onOpenSignup={() => openAuthDialog('signup', '/')}
        showMarketingLinks={false}
        isAuthenticatedOverride={loading && initialIsAuthenticated}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 pb-4 pt-2 md:px-5 md:pb-8 md:pt-4">
        <CreateWorkbench
          initialCredits={initialCredits}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => openAuthDialog('signup', '/')}
          showDashboardChrome={false}
        />
      </main>
      <AuthDialog
        open={authDialogOpen}
        mode={authDialogMode}
        nextPath={authNextPath}
        onOpenChange={setAuthDialogOpen}
        onModeChange={setAuthDialogMode}
      />
    </div>
  );
}
