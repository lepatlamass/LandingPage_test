export const locales = ['en', 'es', 'fr', 'pt-PT', 'pt-BR', 'it'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
