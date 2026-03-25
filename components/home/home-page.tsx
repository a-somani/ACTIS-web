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
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-4 pt-3 md:gap-6 md:px-6 md:pb-10 md:pt-6">
        <div className="space-y-2 px-2 text-center md:space-y-3 md:px-0">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary/80">ACTIS Create</p>
          <h1 className="text-[2.65rem] font-semibold leading-none tracking-tight text-foreground md:text-6xl">
            Create in the landing flow.
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground md:max-w-2xl md:text-base">
            Upload a source image, choose your framing, and generate without leaving the page.
          </p>
        </div>

        <CreateWorkbench
          initialCredits={initialCredits}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => openAuthDialog('signup', '/')}
          showDashboardChrome={false}
          compactMode="landing"
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
