import React from 'react';
import MainSidebar from '../../../components/layout/MainSidebar';
import AccountSidebar from '../../../components/account/AccountSidebar';
import NavigationLoginButton from '../../../components/auth/NavigationLoginButton';
import RequireAuth from '../../../components/auth/RequireAuth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0f1115] text-zinc-300 font-sans overflow-hidden">
      <RequireAuth />
      <div className="hidden lg:block shrink-0">
        <MainSidebar />
      </div>
      <div className="w-full lg:w-auto shrink-0 z-10 border-b border-zinc-800 lg:border-b-0 shadow-md lg:shadow-none bg-[#0f1115]">
        <AccountSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-end px-8 shrink-0 bg-[#0f1115] sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <NavigationLoginButton />
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
