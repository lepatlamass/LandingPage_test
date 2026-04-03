import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from 'react';
import { AuthProvider } from '../../providers/AuthProvider';

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
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
