'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/i18n/navigation';
import { OnboardingTutorial } from '@/components/onboarding/tutorial';
import { useOnboarding } from '@/hooks/use-onboarding';
import Image from 'next/image';

export default function HomePageClient() {
  const t = useTranslations();
  const router = useRouter();
  const { showOnboarding, completeOnboarding, skipOnboarding, isLoading } = useOnboarding();

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showOnboarding && (
        <OnboardingTutorial 
          onComplete={completeOnboarding} 
          onSkip={skipOnboarding} 
        />
      )}

      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons/logo.png"
            alt="Calcetto Manager"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-primary">Calcetto Manager</span>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('home.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('home.subtitle')}
          </p>
          
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/login">
                {t('auth.signIn')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">
                {t('auth.signUp')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">⚽</div>
            <h3 className="mt-2 font-semibold">{t('home.features.teams')}</h3>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">🏆</div>
            <h3 className="mt-2 font-semibold">{t('home.features.matches')}</h3>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">📊</div>
            <h3 className="mt-2 font-semibold">{t('home.features.stats')}</h3>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="text-2xl font-bold text-primary">⭐</div>
            <h3 className="mt-2 font-semibold">{t('home.features.ratings')}</h3>
          </div>
        </div>
      </main>
    </div>
  );
}
