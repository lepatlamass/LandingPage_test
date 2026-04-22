import { getTranslations } from 'next-intl/server';
import { Link } from '../../../navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import FaqAccordion from './FaqAccordion';

export default async function HelpPage() {
  const t = await getTranslations('Help');

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <FaqAccordion />

        <div className="mt-16 text-center bg-[#d4ff33]/10 border border-[#d4ff33]/20 rounded-3xl p-10">
          <h3 className="text-2xl font-bold text-white mb-4">{t('contactUs')}</h3>
          <a 
            href="mailto:konwoubuntu@gmail.com" 
            className="inline-block px-8 py-4 bg-[#d4ff33] text-black font-bold rounded-xl hover:bg-[#bce622] transition-colors shadow-[0_0_20px_rgba(212,255,51,0.2)]"
          >
            {t('contactButton')}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
