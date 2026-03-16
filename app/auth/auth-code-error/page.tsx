import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  return (
    <div className={'flex min-h-screen items-center justify-center px-6'}>
      <div className={'flex max-w-md flex-col items-center text-center gap-4'}>
        <h1 className={'text-2xl font-semibold'}>Authentication failed</h1>
        <p className={'text-muted-foreground'}>
          We were unable to complete the sign-in process. The link may have expired or already been used.
        </p>
        <Button asChild variant={'secondary'}>
          <Link href={'/login'}>Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
