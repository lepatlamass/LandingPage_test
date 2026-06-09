import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import App from '../../../../App';
import { locales } from '../../../../i18n/config';

// All valid tool slugs — used to generate static params and validate routes
const VALID_TOOL_SLUGS = [
  'bg-remover', 'watermark', 'watermark-remover', 'image-to-text', 'resize',
  'compress-images', 'compress-pdf', 'compress-video',
  'image-converter', 'heic-to-png', 'pdf-to-image', 'svg-to-png',
  'pdf-to-csv', 'csv-to-pdf', 'pdf-to-excel', 'excel-to-pdf',
  'excel-to-csv', 'csv-to-excel', 'pdf-to-word', 'word-to-pdf',
  'video-to-gif',
];

type Props = {
  params: Promise<{ locale: string; toolSlug: string }>;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    VALID_TOOL_SLUGS.map((toolSlug) => ({ locale, toolSlug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, toolSlug } = await params;

  if (!VALID_TOOL_SLUGS.includes(toolSlug)) {
    return { title: 'Tool Not Found | Refinedocs' };
  }

  const t = await getTranslations({ locale, namespace: 'Tools' });
  let title = 'Tools | Refinedocs';
  let description: string | undefined = undefined;

  try {
    const translatedTitle = t(toolSlug as any);
    if (translatedTitle) {
      title = `${translatedTitle} – Free Online | Refinedocs`;
    }
    const translatedDesc = t(`${toolSlug}-desc` as any);
    if (translatedDesc) {
      description = translatedDesc;
    }
  } catch {
    // Fallback
  }

  // Build hreflang alternates for all locales
  const languages: Record<string, string> = {
    'x-default': `https://refinedocs.com/en/tools/${toolSlug}`
  };
  for (const loc of locales) {
    languages[loc] = `https://refinedocs.com/${loc}/tools/${toolSlug}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://refinedocs.com/${locale}/tools/${toolSlug}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `https://refinedocs.com/${locale}/tools/${toolSlug}`,
      siteName: 'Refinedocs',
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1024, height: 1024 }],
    },
  };
}

// JSON-LD structured data component
function ToolJsonLd({ locale, toolSlug, title, description, faqs }: {
  locale: string; toolSlug: string; title: string; description: string; faqs?: { question: string; answer: string }[];
}) {
  const url = `https://refinedocs.com/${locale}/tools/${toolSlug}`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Refinedocs',
      url: 'https://refinedocs.com',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://refinedocs.com/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `https://refinedocs.com/${locale}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: url,
      },
    ],
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}

export default async function ToolPage({ params }: Props) {
  const { locale, toolSlug } = await params;

  if (!VALID_TOOL_SLUGS.includes(toolSlug)) {
    notFound();
  }

  let title = toolSlug;
  let description = '';
  const faqs: { question: string; answer: string }[] = [];

  try {
    const tTools = await getTranslations({ locale, namespace: 'Tools' });
    const tCommon = await getTranslations({ locale, namespace: 'Common' });
    if (tTools.has(toolSlug as any)) {
      title = tTools(toolSlug as any);
    }
    const descKey = `${toolSlug}-desc`;
    if (tTools.has(descKey as any)) {
      description = tTools(descKey as any);
    }

    const faqSlug = (toolSlug === 'excel-to-csv' || toolSlug === 'csv-to-excel') ? 'excel-csv' : toolSlug;

    for (let i = 1; i <= 4; i++) {
      const qKey = `${faqSlug}-faq${i}-q`;
      const aKey = `${faqSlug}-faq${i}-a`;
      if (tTools.has(qKey as any) && tTools.has(aKey as any)) {
        const question = tTools(qKey as any);
        const answer = tTools(aKey as any);
        if (question && answer) {
          faqs.push({ question, answer });
        }
      } else {
        break;
      }
    }

    if (tCommon.has('securityFaqQuestion' as any) && tCommon.has('securityFaqAnswer' as any)) {
      faqs.push({
        question: tCommon('securityFaqQuestion' as any),
        answer: tCommon('securityFaqAnswer' as any)
      });
    }
    if (tCommon.has('loginFaqQuestion' as any) && tCommon.has('loginFaqAnswer' as any)) {
      faqs.push({
        question: tCommon('loginFaqQuestion' as any),
        answer: tCommon('loginFaqAnswer' as any)
      });
    }
  } catch {
    // fallback
  }

  return (
    <>
      <ToolJsonLd locale={locale} toolSlug={toolSlug} title={title} description={description} faqs={faqs} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-white dark:bg-[#111111] flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-[#d4ff33] rounded-xl flex items-center justify-center text-black font-bold text-3xl border-2 border-black animate-bounce relative z-10">
                R
              </div>
            </div>
            <div className="mt-8 text-[#d4ff33] font-medium tracking-widest text-sm uppercase animate-pulse">
              Loading Tool...
            </div>
          </div>
        }
      >
        <App toolSlug={toolSlug} />
      </Suspense>
    </>
  );
}
