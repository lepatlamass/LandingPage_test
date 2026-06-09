import { getTranslations } from 'next-intl/server';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import FaqAccordion from './FaqAccordion';
import ToolLimitsComparison from '../../../components/billing/ToolLimitsComparison';
import ToolsDirectory from '../../../components/layout/ToolsDirectory';
import type { Metadata } from 'next';
import { locales } from '../../../i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Help' });
  const siteUrl = 'https://refinedocs.com';

  const languages: Record<string, string> = {
    'x-default': `${siteUrl}/en/faq`,
  };
  for (const loc of locales) {
    languages[loc] = `${siteUrl}/${loc}/faq`;
  }

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${siteUrl}/${locale}/faq`,
      languages,
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${siteUrl}/${locale}/faq`,
      type: 'website',
    },
  };
}

export default async function FaqPage() {
  const t = await getTranslations('Help');

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-black dark:text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-black dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <FaqAccordion />

        <div className="mt-16 text-center bg-[#d4ff33]/10 border border-[#d4ff33]/20 rounded-3xl p-10">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-4">{t('contactUs')}</h3>
          <a 
            href="mailto:konwoubuntu@gmail.com" 
            className="inline-block px-8 py-4 bg-[#d4ff33] text-black font-bold rounded-xl hover:bg-[#bce622] transition-colors shadow-[0_0_20px_rgba(212,255,51,0.2)]"
          >
            {t('contactButton')}
          </a>
        </div>
      </main>

      <ToolLimitsComparison />
      <ToolsDirectory />

      <Footer />
    </div>
  );
}
