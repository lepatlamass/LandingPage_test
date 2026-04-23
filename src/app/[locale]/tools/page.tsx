import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import App from '../../../App';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const toolId = typeof resolvedSearchParams.tool === 'string' ? resolvedSearchParams.tool : null;
  
  if (!toolId) {
    return {
      title: 'Tools | Refinedocs',
      alternates: {
        canonical: `https://refinedocs.com/${locale}/tools`,
      },
    };
  }

  const t = await getTranslations({ locale, namespace: 'Tools' });
  let title = 'Tools | Refinedocs';
  let description: string | undefined = undefined;

  try {
    // Try to translate the tool title and description. 
    // next-intl throws if the key is missing.
    const translatedTitle = t(toolId as any);
    if (translatedTitle) {
      title = `${translatedTitle} | Refinedocs`;
    }
    const translatedDesc = t(`${toolId}-desc` as any);
    if (translatedDesc) {
      description = translatedDesc;
    }
  } catch (error) {
    // Fallback to generic title if translation key doesn't exist
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://refinedocs.com/${locale}/tools?tool=${toolId}`,
    },
  };
}

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#d4ff33] rounded-xl blur-xl opacity-40 animate-pulse"></div>
            <div className="w-16 h-16 bg-[#d4ff33] rounded-xl flex items-center justify-center text-black font-bold text-3xl shadow-[0_0_30px_rgba(212,255,51,0.3)] animate-bounce relative z-10">
              R
            </div>
          </div>
          <div className="mt-8 text-[#d4ff33] font-medium tracking-widest text-sm uppercase animate-pulse">
            Loading Tool...
          </div>
        </div>
      }
    >
      <App />
    </Suspense>
  );
}
