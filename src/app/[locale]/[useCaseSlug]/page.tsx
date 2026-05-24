import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import App from '../../../App';
import { getSeoPageData, seoPages } from '../../../lib/seoData';
import { locales } from '../../../i18n/config';

type Props = {
  params: Promise<{ locale: string; useCaseSlug: string }>;
};

// Generate static params for all SEO use cases across all locales
export async function generateStaticParams() {
  const slugs = Object.keys(seoPages);
  return locales.flatMap((locale) =>
    slugs.map((useCaseSlug) => ({ locale, useCaseSlug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, useCaseSlug } = await params;
  const seoData = getSeoPageData(useCaseSlug);

  if (!seoData) {
    return { title: 'Not Found | Refinedocs' };
  }

  // Merge localized overrides if available
  const localizedData = {
    ...seoData,
    ...(seoData.locales?.[locale] || {})
  };

  const url = `https://refinedocs.com/${locale}/${useCaseSlug}`;
  
  // Build hreflang alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `https://refinedocs.com/${loc}/${useCaseSlug}`;
  }

  return {
    title: localizedData.title,
    description: localizedData.description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: localizedData.title,
      description: localizedData.description,
      url,
      siteName: 'Refinedocs',
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1024, height: 1024 }],
    },
  };
}

// JSON-LD structured data component for SEO use case pages
function SeoUseCaseJsonLd({ locale, useCaseSlug, title, description, faqs }: {
  locale: string; useCaseSlug: string; title: string; description: string; faqs: any[]
}) {
  const url = `https://refinedocs.com/${locale}/${useCaseSlug}`;

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

export default async function UseCasePage({ params }: Props) {
  const { locale, useCaseSlug } = await params;
  const seoData = getSeoPageData(useCaseSlug);

  // If the slug is not found in our SEO dictionary, 404
  // This prevents the catch-all route from matching invalid URLs
  if (!seoData) {
    notFound();
  }

  // Merge localized overrides if available
  const localizedData = {
    ...seoData,
    ...(seoData.locales?.[locale] || {})
  };

  const t = await getTranslations({ locale, namespace: 'Common' });
  const combinedFaqs = [
    ...localizedData.faqs,
    {
      question: t('securityFaqQuestion'),
      answer: t('securityFaqAnswer')
    },
    {
      question: t('loginFaqQuestion'),
      answer: t('loginFaqAnswer')
    }
  ];

  return (
    <>
      <SeoUseCaseJsonLd 
        locale={locale} 
        useCaseSlug={useCaseSlug} 
        title={localizedData.title} 
        description={localizedData.description}
        faqs={combinedFaqs}
      />
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
        <App toolSlug={seoData.coreTool} seoOverride={localizedData} />
      </Suspense>
    </>
  );
}
