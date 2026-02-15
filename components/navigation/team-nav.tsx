'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Settings, Trophy, Calendar } from 'lucide-react';

interface TeamNavProps {
  teamId: string;
  isAdmin: boolean;
}

export function TeamNav({ teamId, isAdmin }: TeamNavProps) {
  const t = useTranslations('teamNav');
  const pathname = usePathname();

  const navItems = [
    {
      href: `/teams/${teamId}`,
      label: t('overview'),
      icon: Trophy,
      exact: true,
    },
    {
      href: `/teams/${teamId}/players`,
      label: t('players'),
      icon: Users,
    },
    {
      href: `/teams/${teamId}/roster`,
      label: t('roster'),
      icon: Users,
    },
    {
      href: `/teams/${teamId}/settings`,
      label: t('settings'),
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2">
      {navItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;

        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
