import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'it'],
  defaultLocale: 'it',
  localePrefix: {
    mode: 'always',
    prefixes: {
      en: '/en',
      it: '/it',
    },
  },
});
