import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh-tw', 'en'],
  defaultLocale: 'zh-tw',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
