'use client';

import { Album, ArrowUpFromLine, CreditCard, History, Maximize } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Image Expand',
    icon: <Maximize className="h-6 w-6" />,
    href: '/dashboard/create',
    accent: 'expand' as const,
  },
  {
    title: 'Image Upscale',
    icon: <ArrowUpFromLine className="h-6 w-6" />,
    href: '/dashboard/upscale',
    accent: 'upscale' as const,
  },
  {
    title: 'Subscriptions',
    icon: <Album className="h-6 w-6" />,
    href: '/dashboard/subscriptions',
  },
  {
    title: 'History',
    icon: <History className="h-6 w-6" />,
    href: '/dashboard/history',
  },
  {
    title: 'Payments',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/dashboard/payments',
  },
];

interface SidebarProps {
  className?: string;
  itemClassName?: string;
}

export function Sidebar({ className, itemClassName }: SidebarProps) {
  const pathname = usePathname();
  return (
    <nav className={cn('flex grow flex-col items-start justify-between px-2 text-sm font-medium lg:px-4', className)}>
      <div className={'w-full'}>
        {sidebarItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xxs px-4 py-3 text-base dashboard-sidebar-items',
              itemClassName,
              {
                'dashboard-sidebar-items-active': pathname.startsWith(item.href),
              },
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
