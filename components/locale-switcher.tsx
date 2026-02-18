'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/(it|en)/, '') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  const localeLabels: Record<string, { label: string; flag: string }> = {
    it: { label: 'Italiano', flag: '🇮🇹' },
    en: { label: 'English', flag: '🇬🇧' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <button
              onClick={() => handleLocaleChange('it')}
              className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                locale === 'it' ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2">{localeLabels.it.flag}</span>
              {localeLabels.it.label}
            </button>
            <button
              onClick={() => handleLocaleChange('en')}
              className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                locale === 'en' ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2">{localeLabels.en.flag}</span>
              {localeLabels.en.label}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
