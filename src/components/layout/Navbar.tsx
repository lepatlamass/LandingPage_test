import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import NavigationLoginButton from '../auth/NavigationLoginButton';
import { ThemeToggle } from '../ThemeToggle';

export default async function Navbar() {
  const tCommon = await getTranslations('Common');
  
  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-[#111111] sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-lg">
            R
          </div>
          <span className="hidden sm:inline-block font-bold text-lg tracking-tight text-black dark:text-white">Refinedocs</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-xs font-medium text-black dark:text-white transition-colors">
            {tCommon('home')}
          </Link>
          <Link href="/tools" className="text-xs font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
            {tCommon('tools')}
          </Link>
          <Link href="/faq" className="text-xs font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
            {tCommon('faqs')}
          </Link>
          <Link href="/pricing" className="text-xs font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
            {tCommon('pricing')}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <ThemeToggle />
        <LanguageSwitcher />
        <NavigationLoginButton />
        <Link
          href="/pricing"
          className="px-3 md:px-4 py-1.5 bg-[#d4ff33] text-black text-[10px] md:text-xs font-bold rounded hover:bg-[#bce622] transition-colors whitespace-nowrap"
        >
          {tCommon('getPro')}
        </Link>
      </div>
    </header>
  );
}
