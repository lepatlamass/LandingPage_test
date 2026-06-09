import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import { Twitter, Linkedin, Youtube } from 'lucide-react';

export default async function Footer() {
  const tCommon = await getTranslations('Common');
  
  return (
    <footer className="bg-white dark:bg-black py-20 px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-sm">
                R
              </div>
              <span className="text-black dark:text-white font-bold text-lg">Refinedocs</span>
            </div>
            <p className="text-black dark:text-gray-400 text-sm leading-relaxed">
              {tCommon('weMakePdfEasy')}
            </p>
          </div>

          <div>
            <h4 className="text-black dark:text-white font-bold mb-6">{tCommon('solutions')}</h4>
            <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
              <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{tCommon('sales')}</Link></li>
              <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{tCommon('finance')}</Link></li>
              <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{tCommon('realEstate')}</Link></li>
              <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{tCommon('education')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black dark:text-white font-bold mb-6">{tCommon('company')}</h4>
            <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
              <li><Link href="/#about" className="hover:text-black dark:text-white transition-colors">{tCommon('about')}</Link></li>
              <li><Link href="/faq" className="hover:text-black dark:text-white transition-colors">{tCommon('help')}</Link></li>
              <li><Link href="/blog" className="hover:text-black dark:text-white transition-colors">{tCommon('blog')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-black dark:text-white font-bold mb-6">{tCommon('product')}</h4>
            <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
              <li><Link href="/tools" className="hover:text-black dark:text-white transition-colors">All Free Tools</Link></li>
              <li><Link href="/blog" className="hover:text-black dark:text-white transition-colors">Blog</Link></li>
              <li><Link href="/pricing" className="hover:text-black dark:text-white transition-colors">{tCommon('pricing')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-black/10 dark:border-gray-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/in/konwolorentz/" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on LinkedIn" className="text-black dark:text-gray-400 hover:opacity-80 transition-opacity"><Linkedin size={20} /></a>
            <a href="https://x.com/LorentzKonwo" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on X" className="text-black dark:text-gray-400 hover:opacity-80 transition-opacity"><Twitter size={20} /></a>
            <a href="https://www.youtube.com/@konwolorentz7285" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on YouTube" className="text-black dark:text-gray-400 hover:opacity-80 transition-opacity"><Youtube size={20} /></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] text-black dark:text-gray-500 uppercase tracking-widest font-bold">
            <span>{tCommon('copyright')}</span>
            <Link href="/privacy" className="hover:text-black dark:text-white transition-colors">{tCommon('privacyNotice')}</Link>
            <Link href="/terms" className="hover:text-black dark:text-white transition-colors">{tCommon('termsConditions')}</Link>
            <a href="mailto:contact@refinedocs.com" className="hover:text-black dark:text-white transition-colors">{tCommon('contactUs')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
