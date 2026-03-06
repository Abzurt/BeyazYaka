export const i18n = {
  defaultLocale: 'tr',
  locales: ['en', 'tr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
