import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import { Twitter, Linkedin, Youtube } from 'lucide-react';

export default async function Footer() {
  const tCommon = await getTranslations('Common');
  
  return (
    <footer className="bg-black py-20 px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-sm">
                R
              </div>
              <span className="text-white font-bold text-lg">Refinedocs</span>
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
              <li><Link href="/help" className="hover:text-white transition-colors">{tCommon('help')}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{tCommon('blog')}</Link></li>
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
            <a href="https://www.linkedin.com/in/konwolorentz/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Linkedin size={20} /></a>
            <a href="https://x.com/LorentzKonwo" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="https://www.youtube.com/@konwolorentz7285" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Youtube size={20} /></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] text-gray-600 uppercase tracking-widest font-bold">
            <span>{tCommon('copyright')}</span>
            <Link href="/privacy" className="hover:text-white transition-colors">{tCommon('privacyNotice')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{tCommon('termsConditions')}</Link>
            <a href="mailto:konwoubuntu@gmail.com" className="hover:text-white transition-colors">{tCommon('contactUs')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
