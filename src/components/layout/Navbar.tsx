import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import NavigationLoginButton from '../auth/NavigationLoginButton';

export default async function Navbar() {
  const tCommon = await getTranslations('Common');
  
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#111111] sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-lg">
            R
          </div>
          <span className="font-bold text-lg tracking-tight">Refinedocs</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-xs font-medium text-white transition-colors">
            {tCommon('home')}
          </Link>
          <Link href="/tools" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
            {tCommon('tools')}
          </Link>
          <a href="/#faq" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
            Faq
          </a>
          <a href="/#price" className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
            Price
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <NavigationLoginButton />
        <Link
          href="/tools"
          className="px-4 py-1.5 bg-[#d4ff33] text-black text-xs font-bold rounded hover:bg-[#bce622] transition-colors"
        >
          {tCommon('getPro')}
        </Link>
      </div>
    </header>
  );
}
