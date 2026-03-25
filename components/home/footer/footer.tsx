import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Separator } from '@/components/ui/separator';

interface Props {
  user: User | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export function Footer({ user, onOpenLogin, onOpenSignup }: Props) {
  return (
    <footer className="mt-12">
      <Separator className="footer-border" />
      <div className="mx-auto max-w-7xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">ACTIS</span>
          <span className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {user?.id ? (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          ) : (
            <>
              <button type="button" className="transition-colors hover:text-foreground" onClick={onOpenLogin}>
                Sign in
              </button>
              <button type="button" className="transition-colors hover:text-foreground" onClick={onOpenSignup}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
