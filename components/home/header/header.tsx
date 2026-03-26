import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

interface Props {
  user: User | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  showMarketingLinks?: boolean;
  isAuthenticatedOverride?: boolean;
}

export default function Header({
  user,
  onOpenLogin,
  onOpenSignup,
  showMarketingLinks = true,
  isAuthenticatedOverride = false,
}: Props) {
  const isAuthenticated = Boolean(user?.id) || isAuthenticatedOverride;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link className="flex items-center" href="/">
            <span className="text-lg font-semibold tracking-tight text-foreground md:text-xl">ACTIS</span>
          </Link>
          {showMarketingLinks ? (
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#how-it-works" className="transition-colors hover:text-foreground">
                How it works
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground">
                Pricing
              </Link>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <Button variant="secondary" asChild>
              <Link href="/dashboard/subscriptions">Account</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground" onClick={onOpenLogin}>
                Sign in
              </Button>
              <Button onClick={onOpenSignup}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
