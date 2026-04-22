import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React, { Suspense } from 'react';
import { AuthProvider } from '../../providers/AuthProvider';
import { ToolStateProvider } from '../../providers/ToolStateProvider';
import AnalyticsProvider from '../../components/analytics/AnalyticsProvider';
import CookieConsent from '../../components/analytics/CookieConsent';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;

}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <ToolStateProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
          </div>
          <CookieConsent />
        </ToolStateProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

