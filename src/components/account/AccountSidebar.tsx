'use client';

import React from 'react';
import { usePathname } from '../../navigation';
import { Link } from '../../navigation';
import { useTranslations } from 'next-intl';
import { User, Crown, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function AccountSidebar() {
  const t = useTranslations('Account.sidebar');
  const pathname = usePathname();

  const navItems = [
    { name: t('account'), href: '/account', icon: User },
    { name: t('subscription'), href: '/account/subscription', icon: Crown },
    { name: t('billing'), href: '/account/billing', icon: CreditCard },
    { name: t('settings'), href: '/account/settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 lg:border-r border-zinc-800 bg-zinc-950 flex flex-col lg:shrink-0 lg:overflow-y-auto">
      <div className="p-4 lg:p-6 pb-2 lg:pb-2 flex justify-between items-center lg:block border-b border-zinc-800 lg:border-none">
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {/* t('backToTools') needs an entry, but wait, the spec didn't mention it. Let's hardcode or omit if user didn't ask. */}
          Back to Tools
        </Link>
        <h2 className="text-lg lg:text-xl font-semibold text-black dark:text-white tracking-tight hidden lg:block">{t('settings')}</h2>
      </div>

      <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible px-2 lg:px-3 py-2 lg:py-4 gap-2 lg:gap-0 lg:space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-full lg:rounded-xl transition-all duration-200 text-xs lg:text-sm font-medium whitespace-nowrap ${
                isActive 
                  ? 'bg-zinc-800 text-black dark:text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[#d4ff33]' : 'text-zinc-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
