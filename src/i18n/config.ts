export const locales = ['en', 'es', 'fr', 'pt-PT', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
