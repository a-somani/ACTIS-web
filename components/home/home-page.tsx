'use client';

import { useState } from 'react';
import { AuthDialog, type AuthDialogMode } from '@/components/authentication/auth-dialog';
import { useAuth } from '@/contexts/auth-context';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { HeroSection } from '@/components/home/hero-section/hero-section';
import { FeaturesSection } from '@/components/home/features-section/features-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section/how-it-works-section';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Pricing } from '@/components/home/pricing/pricing';
import { Footer } from '@/components/home/footer/footer';

export function HomePage() {
  const { user } = useAuth();
  const [country, setCountry] = useState('US');
  const [authDialogMode, setAuthDialogMode] = useState<AuthDialogMode>('signup');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authNextPath, setAuthNextPath] = useState('/dashboard');

  function openAuthDialog(mode: AuthDialogMode, nextPath: string) {
    setAuthDialogMode(mode);
    setAuthNextPath(nextPath);
    setAuthDialogOpen(true);
  }

  return (
    <div className="relative min-h-screen">
      <HomePageBackground />
      <Header user={user} onOpenLogin={() => openAuthDialog('login', '/dashboard')} onOpenSignup={() => openAuthDialog('signup', '/dashboard')} />
      <main>
        <HeroSection
          isAuthenticated={Boolean(user?.id)}
          onStartExpanding={() => openAuthDialog('signup', '/dashboard')}
        />
        <FeaturesSection />
        <HowItWorksSection />
        <Pricing country={country} user={user} onRequireAuth={(nextPath) => openAuthDialog('signup', nextPath)} />
      </main>
      <Footer user={user} onOpenLogin={() => openAuthDialog('login', '/dashboard')} onOpenSignup={() => openAuthDialog('signup', '/dashboard')} />
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
