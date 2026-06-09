import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { locales } from '../../../i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Tools' });
  const siteUrl = 'https://refinedocs.com';

  const languages: Record<string, string> = {
    'x-default': `${siteUrl}/en/tools`,
  };
  for (const loc of locales) {
    languages[loc] = `${siteUrl}/${loc}/tools`;
  }

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${siteUrl}/${locale}/tools`,
      languages,
    },
  };
}

export default async function ToolsIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const toolId = typeof resolvedSearchParams.tool === 'string' ? resolvedSearchParams.tool : null;

  // 301 redirect: old ?tool=xxx URLs → new /tools/xxx clean paths
  if (toolId) {
    redirect(`/${locale}/tools/${toolId}`);
  }

  // If no tool specified, redirect to the default tool
  redirect(`/${locale}/tools/pdf-to-excel`);
}
