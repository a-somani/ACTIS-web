'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface SidebarUserInfoProps {
  fullWidthLogout?: boolean;
}

export function SidebarUserInfo({ fullWidthLogout = false }: SidebarUserInfoProps) {
  const { user, signOut } = useAuth();

  return (
    <div className={'flex flex-col items-start pb-8 px-2 text-sm font-medium lg:px-4'}>
      <Separator className={'relative mt-6 dashboard-sidebar-highlight bg-border'} />
      <div className={fullWidthLogout ? 'mt-6 flex w-full flex-col gap-4' : 'mt-6 flex w-full flex-row items-center justify-between gap-3'}>
        <div className={'flex min-w-0 flex-col items-start justify-center overflow-hidden text-ellipsis'}>
          {fullWidthLogout ? (
            <div className={'text-sm leading-5 text-muted-foreground w-full overflow-hidden text-ellipsis'}>
              {user?.email}
            </div>
          ) : (
            <>
              <div className={'text-sm leading-5 font-semibold w-full overflow-hidden text-ellipsis'}>
                {user?.user_metadata?.full_name}
              </div>
              <div className={'text-sm leading-5 text-muted-foreground w-full overflow-hidden text-ellipsis'}>
                {user?.email}
              </div>
            </>
          )}
        </div>
        {fullWidthLogout ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-xl border-border/70 px-4 text-sm"
            onClick={() => void signOut()}
          >
            Log out
          </Button>
        ) : (
          <button type="button" onClick={() => void signOut()} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
            <LogOut className={'h-6 w-6 cursor-pointer'} />
            <span className="sr-only">Log out</span>
          </button>
        )}
      </div>
    </div>
  );
}
