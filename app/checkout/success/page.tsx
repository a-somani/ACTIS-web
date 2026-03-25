import { SuccessPageGradients } from '@/components/gradients/success-page-gradients';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PoweredByPaddle } from '@/components/home/footer/powered-by-paddle';
import '../../../styles/checkout.css';
import { createClient } from '@/utils/supabase/server';

export default async function SuccessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main>
      <div className={'relative h-screen overflow-hidden'}>
        <SuccessPageGradients />
        <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
          <div className={'flex flex-col items-center text-white text-center'}>
            <div className="pb-12 flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className={'text-4xl md:text-[80px] leading-9 md:leading-[80px] font-medium pb-6'}>
              Payment successful
            </h1>
            <p className={'max-w-2xl text-lg pb-6'}>Success! Your payment is complete, and you’re all set.</p>
            {data.user ? (
              <>
                <p className="max-w-xl pb-10 text-sm text-white/70">
                  We&apos;re syncing your updated credits and subscription details in the background.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant={'secondary'} asChild={true}>
                    <Link href={'/dashboard/create?billing=success'}>Open Create</Link>
                  </Button>
                  <Button variant={'ghost'} asChild={true}>
                    <Link href={'/dashboard/subscriptions?billing=success'}>View Billing</Link>
                  </Button>
                </div>
              </>
            ) : (
              <Button variant={'secondary'} asChild={true}>
                <Link href={'/'}>Go to Home</Link>
              </Button>
            )}
          </div>
        </div>
        <div className={'absolute bottom-0 w-full'}>
          <PoweredByPaddle />
        </div>
      </div>
    </main>
  );
}
