import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import Image from 'next/image';
import { ArrowRight, Check, ChevronDown, FileText, Image as ImageIcon, Video, Zap, Shield, TrendingUp, CloudDownload, Twitter, Linkedin, Minimize, RefreshCw, Eraser, Droplets, Type, Maximize, FileSpreadsheet, FileCode, FileVideo } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default async function Page() {
  const t = await getTranslations('Home');
  const tCommon = await getTranslations('Common');
  const tTools = await getTranslations('Tools');

  const toolDirectory = [
    {
      title: tCommon('directoryCompress'),
      tools: [
        { id: "compress-pdf", name: tTools('compress-pdf'), icon: Minimize },
        { id: "compress-images", name: tTools('compress-images'), icon: ImageIcon },
        { id: "compress-video", name: tTools('compress-video'), icon: Video },
      ]
    },
    {
      title: tCommon('directoryConvert'),
      tools: [
        { id: "image-converter", name: tTools('image-converter'), icon: RefreshCw },
        { id: "heic-to-png", name: tTools('heic-to-png'), icon: ImageIcon },
        { id: "pdf-to-image", name: tTools('pdf-to-image'), icon: FileText },
        { id: "svg-to-png", name: tTools('svg-to-png'), icon: ImageIcon },
      ]
    },
    {
      title: tCommon('directoryAiTools'),
      tools: [
        { id: "bg-remover", name: tTools('bg-remover'), icon: Eraser },
        { id: "watermark-remover", name: tTools('watermark-remover'), icon: Droplets },
        { id: "image-to-text", name: tTools('image-to-text'), icon: Type },
      ]
    },
    {
      title: tCommon('directoryViewEdit'),
      tools: [
        { id: "watermark", name: tTools('watermark'), icon: Droplets },
        { id: "resize", name: tTools('resize'), icon: Maximize },
      ]
    },
    {
      title: tCommon('directoryConvertFromPdf'),
      tools: [
        { id: "pdf-to-word", name: tTools('pdf-to-word'), icon: FileText },
        { id: "pdf-to-excel", name: tTools('pdf-to-excel'), icon: FileSpreadsheet },
        { id: "pdf-to-csv", name: tTools('pdf-to-csv'), icon: FileCode },
      ]
    },
    {
      title: tCommon('directoryConvertToPdf'),
      tools: [
        { id: "word-to-pdf", name: tTools('word-to-pdf'), icon: FileText },
        { id: "excel-to-pdf", name: tTools('excel-to-pdf'), icon: FileSpreadsheet },
        { id: "csv-to-pdf", name: tTools('csv-to-pdf'), icon: FileCode },
      ]
    },
    {
      title: tCommon('directorySpreadsheet'),
      tools: [
        { id: "excel-to-csv", name: tTools('excel-to-csv'), icon: FileSpreadsheet },
        { id: "csv-to-excel", name: tTools('csv-to-excel'), icon: FileSpreadsheet },
      ]
    },
    {
      title: tCommon('directoryMedia'),
      tools: [
        { id: "video-to-gif", name: tTools('video-to-gif'), icon: FileVideo },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      {/* Navigation */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#111111] sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-lg">
              R
            </div>
            <span className="font-bold text-lg tracking-tight">Refindocs</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-xs font-medium text-white transition-colors">
              {tCommon('home')}
            </Link>
            <Link href="/tools" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
              {tCommon('tools')}
            </Link>
            <a href="#faq" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
              Faq
            </a>
            <a href="#price" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
              Price
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/tools" className="text-xs font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
            {tCommon('logIn')}
          </Link>
          <Link
            href="/tools"
            className="px-4 py-1.5 bg-[#d4ff33] text-black text-xs font-bold rounded hover:bg-[#bce622] transition-colors"
          >
            Get Pro
          </Link>
        </div>
      </header>

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
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=placeholder"
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
                    <Link href={`/tools?tool=${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
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
                    <Link href={`/tools?tool=${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
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
                    <Link href={`/tools?tool=${tool.id}`} className="text-xs font-bold text-white flex items-center justify-end gap-1 hover:text-[#d4ff33] transition-colors mt-auto">
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
                  <Link href="/tools?tool=pdf-to-excel" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Convert PDF to Excel <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Business.svg"
                    alt="For Businesses"
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
                  <Link href="/tools?tool=excel-to-csv" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Convert Excel/CSV <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Accountant.svg"
                    alt="For Accountants"
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
                  <Link href="/tools?tool=image-to-text" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Extract Text <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/Student.svg"
                    alt="For Students"
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
                  <Link href="/tools?tool=compress-images" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#d4ff33] transition-colors">
                    Compress Image <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-square max-w-md">
                  <Image
                    src="/design.svg"
                    alt="For Designers"
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

              <div className="lg:w-2/3 flex flex-col sm:flex-row gap-8 w-full items-stretch">
                {/* Monthly Plan */}
                <div className="flex-1 rounded-[32px] border-[2px] border-[#d4ff33] bg-[#111111] p-8 relative flex flex-col shadow-2xl shadow-[#d4ff33]/5 min-h-[500px]">
                  <div className="absolute -top-[2px] right-8 bg-[#d4ff33] text-black text-[10px] font-black px-6 py-2 rounded-b-xl uppercase tracking-widest">
                    Recommended
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{t('foundryPro')}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-bold text-white">{t('foundryProPrice')}</span>
                    <span className="text-gray-500 text-xl">{t('foundryProPeriod')}</span>
                  </div>
                  <div className="text-xs text-[#d4ff33] font-bold mb-8 uppercase tracking-widest">{t('bestForOccasional')}</div>

                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('unlimitedDownloads')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('creditsDesc')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('priorityProcessing')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('noWatermarks')}</span>
                    </li>
                  </ul>

                  <button className="w-full py-4 rounded-xl bg-[#d4ff33] text-black font-black text-base hover:bg-[#bce622] transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t('startMonthly')}
                  </button>
                </div>

                {/* Yearly Plan */}
                <div className="flex-1 rounded-[32px] bg-[#1a1c21] p-8 flex flex-col shadow-xl min-h-[500px]">
                  <h3 className="text-2xl font-bold mb-3 text-white">{t('yearlyBestValue')}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold text-white">{t('yearlyPrice')}</span>
                    <span className="text-gray-500 text-xl">{t('yearlyPeriod')}</span>
                    <span className="text-[#d4ff33] text-lg font-bold ml-2">{t('saveAmount')}</span>
                  </div>
                  <div className="text-xs text-[#d4ff33] font-bold mb-8 uppercase tracking-widest">{t('bestForPower')}</div>

                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('everythingInPro')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('yearlyCredits')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('priorityProcessing')}</span>
                    </li>
                    <li className="flex items-start gap-3 text-[14px] text-gray-300">
                      <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
                      <span className="leading-tight">{t('noWatermarks')}</span>
                    </li>
                  </ul>

                  <button className="w-full py-4 rounded-xl bg-[#2a2d35] text-white font-black text-base hover:bg-[#353943] transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t('getYearly')}
                  </button>
                </div>
              </div>
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

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 text-[#d4ff33] mb-6">
                  <CloudDownload className="w-full h-full" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('downloadTrial')}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('downloadTrialDesc')}
                </p>
              </div>
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
                    alt="Globe Illustration"
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Directory Section */}
        <section className="py-20 bg-[#0a0b0e] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-12 text-white">{tCommon('allTools')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
              {toolDirectory.map((category, idx) => (
                <div key={idx} className="flex flex-col">
                  <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-6 border-b border-white/5 pb-2">
                    {category.title}
                  </h3>
                  <ul className="space-y-4">
                    {category.tools.map((tool, toolIdx) => (
                      <li key={toolIdx}>
                        <Link
                          href={`/tools?tool=${tool.id}`}
                          className="group flex items-center gap-3 text-gray-400 hover:text-[#d4ff33] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#d4ff33]/10 transition-colors">
                            <tool.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-sm font-medium">{tool.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-20 px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-sm">
                    R
                  </div>
                  <span className="text-white font-bold text-lg">Refindocs</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tCommon('weMakePdfEasy')}
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{tCommon('solutions')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><Link href="/#solutions" className="hover:text-white transition-colors">{tCommon('sales')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-white transition-colors">{tCommon('finance')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-white transition-colors">{tCommon('realEstate')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-white transition-colors">{tCommon('education')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{tCommon('company')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><Link href="/#about" className="hover:text-white transition-colors">{tCommon('about')}</Link></li>
                  <li><Link href="/#cta" className="hover:text-white transition-colors">{tCommon('help')}</Link></li>
                  <li><Link href="/#about" className="hover:text-white transition-colors">{tCommon('blog')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{tCommon('product')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><Link href="/#price" className="hover:text-white transition-colors">{tCommon('pricing')}</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-white transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-gray-600 hover:text-white transition-colors"><Twitter size={20} /></a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] text-gray-600 uppercase tracking-widest font-bold">
                <span>{tCommon('copyright')}</span>
                <Link href="/privacy" className="hover:text-white transition-colors">{tCommon('privacyNotice')}</Link>
                <Link href="/terms" className="hover:text-white transition-colors">{tCommon('termsConditions')}</Link>
                <Link href="/imprint" className="hover:text-white transition-colors">{tCommon('imprint')}</Link>
                <Link href="/contact" className="hover:text-white transition-colors">{tCommon('contactUs')}</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
