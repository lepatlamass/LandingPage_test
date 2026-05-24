import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Tools' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `https://refinedocs.com/${locale}/tools`,
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
