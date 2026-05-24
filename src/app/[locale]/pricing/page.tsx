import { getTranslations } from 'next-intl/server';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import PricingButtons from '../../../components/billing/PricingButtons';
import ToolLimitsComparison from '../../../components/billing/ToolLimitsComparison';
import ToolsDirectory from '../../../components/layout/ToolsDirectory';
import { getProduct } from '../../../lib/chariow';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Pricing' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `https://refinedocs.com/${locale}/pricing`,
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `https://refinedocs.com/${locale}/pricing`,
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

  const MONTHLY_PRODUCT_ID = 'prd_zvd1cf';
  const YEARLY_PRODUCT_ID = 'prd_ge7e1g';

  // Fetch live prices from Chariow
  let monthlyPrice: { value: number; formatted: string; currency: string } | null = null;
  let yearlyPrice: { value: number; formatted: string; currency: string } | null = null;
  let monthlySale: string | null = null;
  let yearlySale: string | null = null;
  let monthlyName: string | null = null;
  let yearlyName: string | null = null;

  try {
    const [monthly, yearly] = await Promise.all([
      getProduct(MONTHLY_PRODUCT_ID),
      getProduct(YEARLY_PRODUCT_ID),
    ]);
    monthlyPrice = monthly.currentPrice;
    yearlyPrice = yearly.currentPrice;
    monthlySale = monthly.priceOff ?? null;
    yearlySale = yearly.priceOff ?? null;
    monthlyName = monthly.name;
    yearlyName = yearly.name;
  } catch {
    // If Chariow API is unavailable, prices will remain null and use fallbacks
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
