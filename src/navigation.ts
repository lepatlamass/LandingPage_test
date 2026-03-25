import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr', 'pt-PT', 'pt-BR', 'it'] as const;
export const localePrefix = 'always'; // Default

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
