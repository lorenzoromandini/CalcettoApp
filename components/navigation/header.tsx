'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { UserMenu } from './user-menu';
import { Link } from '@/lib/i18n/navigation';
import { Menu, X, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export function Header() {
  const t = useTranslations('navigation');
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isDashboard = pathname?.includes('/dashboard');
  const isInTeam = pathname?.includes('/teams/') && pathname?.split('/').length > 3;
  const teamId = isInTeam ? pathname?.split('/')[3] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isInTeam && session?.user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('dashboard')}
            </Link>
          ) : !isDashboard && session?.user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('dashboard')}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user && (
            <nav className="flex items-center gap-4">
              <Link
                href="/teams"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t('teams')}
              </Link>
              <Link
                href="/matches"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t('matches')}
              </Link>
            </nav>
          )}
          
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4">
          <div className="flex flex-col gap-4">
            {session?.user ? (
              <>
                {(isInTeam || !isDashboard) && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </Link>
                )}
                <Link
                  href="/teams"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('teams')}
                </Link>
                <Link
                  href="/matches"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('matches')}
                </Link>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {session.user.email}
                    </span>
                    <div className="flex items-center gap-2">
                      <LocaleSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>
                  <UserMenu user={session.user} />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('signIn')}
                </Link>
                <div className="flex items-center gap-2">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
