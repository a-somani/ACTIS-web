'use client';

import { useState } from 'react';
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

  return (
    <div className="relative min-h-screen">
      <HomePageBackground />
      <Header user={user} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Pricing country={country} />
      </main>
      <Footer />
    </div>
  );
}
