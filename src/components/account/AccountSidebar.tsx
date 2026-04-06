'use client';

import React from 'react';
import { usePathname } from '../../navigation';
import { Link } from '../../navigation';
import { User, Shield, CreditCard, Settings, ArrowLeft } from 'lucide-react';

export default function AccountSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Profile', href: '/account', icon: User },
    // Google OAuth means we don't handle passwords, but might handle 2FA or external logins in the future
    { name: 'Security', href: '/account/security', icon: Shield },
    { name: 'Billing', href: '/account/billing', icon: CreditCard },
    { name: 'Preferences', href: '/account/preferences', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6 pb-2">
        <Link 
          href="/tools" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Tools
        </Link>
        <h2 className="text-xl font-semibold text-white tracking-tight">Account Settings</h2>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/account' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow-sm' 
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
