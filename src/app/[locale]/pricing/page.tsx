import { getTranslations } from 'next-intl/server';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import PricingButtons from '../../../components/billing/PricingButtons';
import ToolLimitsComparison from '../../../components/billing/ToolLimitsComparison';
import ToolsDirectory from '../../../components/layout/ToolsDirectory';
import { getProductPrice } from '../../../lib/stripe';
import type { Metadata } from 'next';
import { locales } from '../../../i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pricing' });
  const siteUrl = 'https://refinedocs.com';

  const languages: Record<string, string> = {
    'x-default': `${siteUrl}/en/pricing`,
  };
  for (const loc of locales) {
    languages[loc] = `${siteUrl}/${loc}/pricing`;
  }

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${siteUrl}/${locale}/pricing`,
      languages,
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${siteUrl}/${locale}/pricing`,
      type: 'website',
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tPricing = await getTranslations('Pricing');
  const tHome = await getTranslations('Home');

  const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || '';
  const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID || '';

  // Fetch live prices from Stripe
  let monthlyPrice: { value: number; formatted: string; currency: string } | null = null;
  let yearlyPrice: { value: number; formatted: string; currency: string } | null = null;
  let monthlySale: string | null = null;
  let yearlySale: string | null = null;
  let monthlyName: string | null = null;
  let yearlyName: string | null = null;

  if (MONTHLY_PRICE_ID && YEARLY_PRICE_ID) {
    try {
      const [monthly, yearly] = await Promise.all([
        getProductPrice(MONTHLY_PRICE_ID),
        getProductPrice(YEARLY_PRICE_ID),
      ]);
      monthlyPrice = monthly.currentPrice;
      yearlyPrice = yearly.currentPrice;
      monthlySale = monthly.priceOff ?? null;
      yearlySale = yearly.priceOff ?? null;
      monthlyName = monthly.name;
      yearlyName = yearly.name;
    } catch (err) {
      console.error('Failed to fetch Stripe product prices on pricing page:', err);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-black dark:text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {tPricing('title')}
          </h1>
          <p className="text-black dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {tPricing('subtitle')}
          </p>
        </div>

        <div className="flex justify-center mt-12">
          <PricingButtons
            t={{
              foundryPro: tHome('foundryPro'),
              foundryProPrice: tHome('foundryProPrice'),
              foundryProPeriod: tHome('foundryProPeriod'),
              bestForOccasional: tHome('bestForOccasional'),
              unlimitedDownloads: tHome('unlimitedDownloads'),
              creditsDesc: tHome('creditsDesc'),
              priorityProcessing: tHome('priorityProcessing'),
              noWatermarks: tHome('noWatermarks'),
              startMonthly: tHome('startMonthly'),
              yearlyBestValue: tHome('yearlyBestValue'),
              yearlyPrice: tHome('yearlyPrice'),
              yearlyPeriod: tHome('yearlyPeriod'),
              saveAmount: tHome('saveAmount'),
              bestForPower: tHome('bestForPower'),
              everythingInPro: tHome('everythingInPro'),
              yearlyCredits: tHome('yearlyCredits'),
              getYearly: tHome('getYearly'),
              
              // Free tier
              freeTier: tPricing('freeTier'),
              freeTierDesc: tPricing('freeTierDesc'),
              freeTierPrice: tPricing('freeTierPrice'),
              freeTierPeriod: tPricing('freeTierPeriod'),
              limitedDownloads: tPricing('limitedDownloads'),
              noAiFeatures: tPricing('noAiFeatures'),
              clientSideOnly: tPricing('clientSideOnly'),
              currentPlan: tPricing('currentPlan'),
              getStarted: tPricing('getStarted'),
            }}
            monthlyPrice={monthlyPrice}
            yearlyPrice={yearlyPrice}
            monthlySale={monthlySale}
            yearlySale={yearlySale}
            monthlyName={monthlyName}
            yearlyName={yearlyName}
            monthlyPriceId={MONTHLY_PRICE_ID}
            yearlyPriceId={YEARLY_PRICE_ID}
            showDetails={true}
            showFree={true}
          />
        </div>
      </main>

      <ToolLimitsComparison />
      <ToolsDirectory />

      <Footer />
    </div>
  );
}
