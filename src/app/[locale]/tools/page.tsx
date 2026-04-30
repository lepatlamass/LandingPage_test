import { redirect } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'All Tools | Refinedocs',
    description: 'Free online PDF, image, video, and document conversion tools. Convert, compress, resize, and edit files instantly.',
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
