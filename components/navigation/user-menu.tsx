'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';

interface UserMenuProps {
  user: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const displayName = user.nickname || user.firstName || user.email?.split('@')[0];
  const initials = user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        aria-label="User menu"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {initials}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-background p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              {user.email}
            </div>
            <div className="h-px bg-border my-1" />
            <Link
              href="/profile"
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              {t('navigation.profile')}
            </Link>
            <Link
              href="/settings"
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('navigation.settings')}
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              onClick={handleLogout}
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('navigation.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
