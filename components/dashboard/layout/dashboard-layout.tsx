import Link from 'next/link';
import { ReactNode } from 'react';
import { DashboardGradient } from '@/components/gradients/dashboard-gradient';
import '../../../styles/dashboard.css';
import { Sidebar } from '@/components/dashboard/layout/sidebar';
import { SidebarUserInfo } from '@/components/dashboard/layout/sidebar-user-info';

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="relative grid min-h-screen w-full overflow-x-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardGradient />
      <div className="relative hidden border-r md:sticky md:top-0 md:block md:h-screen">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center pt-8 pl-6 pb-10">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl font-semibold tracking-tight text-foreground">ACTIS</span>
            </Link>
          </div>
          <div className="flex flex-col grow">
            <Sidebar />
            <SidebarUserInfo />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  );
}
