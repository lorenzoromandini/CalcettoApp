'use client';

import { useSession } from '@/components/providers/session-provider';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { UserMenu } from './user-menu';
import { Link } from '@/lib/i18n/navigation';
import { Menu, X, ArrowLeft, LayoutDashboard, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export function Header() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const { data: session, signOut } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Get locale from pathname - just extract it without leading slash
  const getLocale = () => {
    if (!pathname) return 'it';
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'it' || parts[0] === 'en') return parts[0];
    return 'it';
  };
  const locale = getLocale();
  
  const isDashboard = pathname?.includes('/dashboard');
  const isTeamCreate = pathname?.includes('/teams/create');
  const isInTeam = pathname?.includes('/teams/') && pathname?.split('/').length > 3;
  const teamId = isInTeam ? pathname?.split('/')[3] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          {(isInTeam || isTeamCreate) && session?.user ? (
            <Link
              href={isTeamCreate ? "/teams" : "/dashboard"}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {isTeamCreate ? 'Indietro' : t('dashboard')}
            </Link>
          ) : session?.user ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/icons/logo.png"
                alt="Calcetto Manager"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span className="text-xl font-bold text-primary">
                {tCommon('welcome')}, {session.user.nickname || session.user.firstName || session.user.email}
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icons/logo.png"
                alt="Calcetto Manager"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span className="text-xl font-bold text-primary">Calcetto Manager</span>
            </Link>
          )}
        </div>

        {/* Right side - Desktop: user menu, Mobile: hamburger */}
        <div className="flex items-center gap-2">
          {/* Desktop: LocaleSwitcher, ThemeToggle, UserMenu */}
          <div className="hidden md:flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                {t('signIn')}
              </Link>
            )}
          </div>

          {/* Mobile: Hamburger menu */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Dropdown overlay */}
      {mobileMenuOpen && session?.user && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-4 top-full z-50 mt-1 w-64 rounded-md border bg-background p-2 shadow-lg md:hidden">
            {/* Profile Section */}
            <div className="flex items-center gap-3 pb-3 mb-2 border-b">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {session.user.nickname || session.user.firstName || session.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>

            {/* Menu Links */}
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              {t('profile')}
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              {t('settings')}
            </Link>

            {/* Bottom section */}
            <div className="pt-2 mt-2 border-t flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent text-destructive w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Esci
              </button>
            </div>
          </div>
        </>
      )}
      {mobileMenuOpen && !session?.user && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-4 top-full z-50 mt-1 w-48 rounded-md border bg-background p-2 shadow-lg md:hidden">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('signIn')}
            </Link>
            <div className="pt-2 mt-2 border-t flex items-center justify-between">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
