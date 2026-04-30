import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import Image from 'next/image';
import { ArrowRight, Zap, Shield, TrendingUp, CloudDownload } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import ToolsDirectory from '../../components/layout/ToolsDirectory';
import Footer from '../../components/layout/Footer';
import PricingButtons from '../../components/billing/PricingButtons';
import TrialSectionWrapper from '../../components/layout/TrialSectionWrapper';
import { getProduct } from '../../lib/chariow';

const MONTHLY_PRODUCT_ID = 'prd_zvd1cf';
const YEARLY_PRODUCT_ID = 'prd_ge7e1g';

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Home');
  const tCommon = await getTranslations('Common');
  const tTools = await getTranslations('Tools');

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
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent border border-white/20 text-[10px] font-bold text-[#d4ff33] mb-6 tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-[#d4ff33]"></div> YOUR ALL IN ONE TOOL FOR IMAGES AND DOCUMENTS
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.15]">
            {t('heroTitle')}<span className="text-[#d4ff33]">{t('heroTitleAccent')}</span><br />
            {t('heroTitleSuffix')}
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/tools"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#d4ff33] text-black font-bold rounded hover:bg-[#bce622] transition-colors text-base"
            >
              {t('startConverting')}
            </Link>
            <span className="text-sm text-white font-bold tracking-wide">
              {t('noCreditCard')}
            </span>
          </div>

          {/* App Mockup Placeholder - YouTube Embed Ready */}
          <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden border-2 border-[#d4ff33] shadow-[0_0_50px_rgba(212,255,51,0.15)] bg-[#1a1c21] aspect-[16/9]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/rCMfqbzG-uw"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Tools Grid Section */}
        <section className="py-16 bg-[#111111]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('powerfulTools')}</h2>
              <h2 className="text-2xl md:text-3xl font-bold text-[#d4ff33]">{t('powerfulToolsAccent')}</h2>
            </div>

            {/* PDF Tools */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-xl">📄</span>
                <h3 className="text-xl font-bold">{t('pdfTools')}</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: "pdf-to-excel", title: "PDF to Excel Converter", desc: "Extract tables and data from PDFs into editable Excel spreadsheets. Perfect for invoices, bank statements, and financial reports.", link: "Convert PDF to Excel" },
                  { id: "pdf-to-word", title: "PDF to Word Converter", desc: "Transform PDF documents into fully editable Word files while preserving formatting, images, and layout.", link: "Convert PDF to Word" },
                  { id: "pdf-to-csv", title: "PDF to CSV Converter", desc: "Convert PDF tables to CSV format for easy data import into spreadsheets, databases, or analytics tools.", link: "Convert PDF to CSV" },
                  { id: "excel-to-csv", title: "Excel/CSV Tools", desc: "Convert between Excel and CSV formats instantly. Merge, split, or transform your spreadsheet files.", link: "Convert Excel/CSV" }
                ].map((tool, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#1a1c21] border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full">
                    <h4 className="text-[#d4ff33] font-bold mb-3">{tool.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{tool.desc}</p>
                    <Link href={`/tools/${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
                      {tool.link} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Tools */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-xl">🖼️</span>
                <h3 className="text-xl font-bold">{t('imageTools')}</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: "bg-remover", title: "Background Remover", desc: "Remove image backgrounds automatically with AI. Get clean, professional product photos in seconds.", link: "Remove Background" },
                  { id: "watermark", title: "Watermark Tool", desc: "Add custom watermarks to protect your images and documents. Choose text or logo watermarks.", link: "Add Watermark" },
                  { id: "watermark-remover", title: "Watermark Remover", desc: "Erase unwanted watermarks, logos, or text from images effortlessly using smart AI technology.", link: "Remove Watermark" },
                  { id: "image-to-text", title: "Image to Text (OCR)", desc: "Extract text from images, screenshots, or scanned documents. Supports multiple languages with high accuracy.", link: "Extract Text" },
                  { id: "resize", title: "Image Resizer", desc: "Resize images for social media, websites, or print. Maintain quality while adjusting dimensions.", link: "Resize Image" },
                  { id: "compress-images", title: "Image Compressor", desc: "Reduce image file size without losing quality. Optimize photos for faster web loading and email sharing.", link: "Compress Image" }
                ].map((tool, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#1a1c21] border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full">
                    <h4 className="text-[#d4ff33] font-bold mb-3">{tool.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{tool.desc}</p>
                    <Link href={`/tools/${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
                      {tool.link} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Media Tools */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-xl">🎦</span>
                <h3 className="text-xl font-bold">{t('mediaTools')}</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { id: "video-to-gif", title: "Video to GIF Converter", desc: "Transform video clips into animated GIFs. Perfect for social media, presentations, and messaging.", link: "Create GIF" },
                  { id: "image-converter", title: "File Converter", desc: "Convert between multiple file formats. Support for documents, images, audio, and video files.", link: "Convert Files" }
                ].map((tool, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#1a1c21] border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full">
                    <h4 className="text-[#d4ff33] font-bold mb-3">{tool.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{tool.desc}</p>
                    <Link href={`/tools/${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
                      {tool.link} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Built for Every Need */}
        <section id="solutions" className="py-16 bg-[#111111]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('builtForEveryNeed')}</h2>

            <div className="space-y-20">
              {/* For Businesses */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold">{t('forBusinesses')}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {t('forBusinessesDesc')}
                  </p>
                  <Link href="/tools/pdf-to-excel" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Convert PDF to Excel <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Business.svg"
                    alt={tCommon('alt.forBusinesses')}
                    fill
                    className="object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* For Accountants */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold">{t('forAccountants')}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {t('forAccountantsDesc')}
                  </p>
                  <Link href="/tools/excel-to-csv" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Convert Excel/CSV <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Accountant.svg"
                    alt={tCommon('alt.forAccountants')}
                    fill
                    className="object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* For Students */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold">{t('forStudents')}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {t('forStudentsDesc')}
                  </p>
                  <Link href="/tools/image-to-text" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Extract Text <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Student.svg"
                    alt={tCommon('alt.forStudents')}
                    fill
                    className="object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* For Designers */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl font-bold">{t('forDesigners')}</h3>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {t('forDesignersDesc')}
                  </p>
                  <Link href="/tools/compress-images" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Compress Image <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/design.svg"
                    alt={tCommon('alt.forDesigners')}
                    fill
                    className="object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="price" className="py-20 bg-[#0a0b0e]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/3">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">{t('pricingTitle')}</h2>
                <p className="text-gray-400 text-base max-w-md leading-relaxed">
                  {t('pricingSubtitle')}
                </p>
              </div>
              <PricingButtons
                t={{
                  foundryPro: t('foundryPro'),
                  foundryProPrice: t('foundryProPrice'),
                  foundryProPeriod: t('foundryProPeriod'),
                  bestForOccasional: t('bestForOccasional'),
                  unlimitedDownloads: t('unlimitedDownloads'),
                  creditsDesc: t('creditsDesc'),
                  priorityProcessing: t('priorityProcessing'),
                  noWatermarks: t('noWatermarks'),
                  startMonthly: t('startMonthly'),
                  yearlyBestValue: t('yearlyBestValue'),
                  yearlyPrice: t('yearlyPrice'),
                  yearlyPeriod: t('yearlyPeriod'),
                  saveAmount: t('saveAmount'),
                  bestForPower: t('bestForPower'),
                  everythingInPro: t('everythingInPro'),
                  yearlyCredits: t('yearlyCredits'),
                  getYearly: t('getYearly'),
                }}
                monthlyPrice={monthlyPrice}
                yearlyPrice={yearlyPrice}
                monthlySale={monthlySale}
                yearlySale={yearlySale}
                monthlyName={monthlyName}
                yearlyName={yearlyName}
              />
            </div>
          </div>
        </section>

        {/* Premium Quality Section */}
        <section id="about" className="py-16 bg-[#111111]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t('premiumQuality')}</h2>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-12">
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 text-[#d4ff33] mb-6">
                  <Zap className="w-full h-full" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('lightningFast')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('lightningFastDesc')}
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 text-[#d4ff33] mb-6">
                  <Shield className="w-full h-full" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('privacyFirst')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('privacyFirstDesc')}
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 text-[#d4ff33] mb-6">
                  <TrendingUp className="w-full h-full" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('unbeatableValue')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('unbeatableValueDesc')}
                </p>
              </div>

              <TrialSectionWrapper>
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 text-[#d4ff33] mb-6">
                    <CloudDownload className="w-full h-full" fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('downloadTrial')}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {t('downloadTrialDesc')}
                  </p>
                </div>
              </TrialSectionWrapper>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-16 bg-[#1a1c21]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('readyToTransform')}</h2>
                <p className="text-gray-400 mb-6 text-sm">
                  {t('readyToTransformDesc')}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/tools"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#d4ff33] text-black font-bold rounded hover:bg-[#bce622] transition-colors text-center text-sm"
                  >
                    {t('startConverting')}
                  </Link>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-400 font-medium inline-block bg-black/50 px-4 py-2 rounded-full">
                    {t('unlimitedAccessNote')}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-64 h-64">
                  <Image
                    src="/Happy.svg"
                    alt={tCommon('alt.globeIllustration')}
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ToolsDirectory />
        <Footer />
      </main>
    </div>
  );
}
