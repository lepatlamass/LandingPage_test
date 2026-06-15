'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/providers/AuthProvider';
import LicenseActivation from '@/components/billing/LicenseActivation';
import AICreditsGrid from '@/components/billing/AICreditsGrid';

// ─── Currency Helpers ────────────────────────────────────────────────────────

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', FI: 'EUR',
  GR: 'EUR', CY: 'EUR', LU: 'EUR', MT: 'EUR', SK: 'EUR',
  SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR',
  BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP',
  PE: 'PEN', JP: 'JPY', KR: 'KRW', CN: 'CNY', IN: 'INR',
  SG: 'SGD', MY: 'MYR', TH: 'THB', PH: 'PHP', ID: 'IDR',
  VN: 'VND', CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK',
  PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN',
  ZA: 'ZAR', IL: 'ILS', AE: 'AED', SA: 'SAR', TR: 'TRY',
  RU: 'RUB', HK: 'HKD', TW: 'TWD', CA_FR: 'CAD', CM: 'XAF',
  CF: 'XAF', TD: 'XAF', GQ: 'XAF', GA: 'XAF', CG: 'XAF',
};

const CURRENCY_LOCALE: Record<string, string> = {
  USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', BRL: 'pt-BR',
  JPY: 'ja-JP', CNY: 'zh-CN', INR: 'en-IN', KRW: 'ko-KR',
  CAD: 'en-CA', AUD: 'en-AU', CHF: 'de-CH',
  XAF: 'fr-CM', XOF: 'fr-SN',
};

function convertPrice(
  storeValue: number,
  storeCurrency: string,
  userCurrency: string,
  rates: Record<string, number> | null
): number {
  if (storeCurrency === userCurrency) return storeValue;
  if (!rates) return storeValue;

  const storeRate = rates[storeCurrency];
  if (!storeRate || storeRate === 0) return storeValue;
  const usdAmount = storeValue / storeRate;

  const userRate = rates[userCurrency];
  if (!userRate) return storeValue;
  return usdAmount * userRate;
}

function formatLocalizedPrice(value: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.country_code || null;
    }
  } catch {
    try {
      const res = await fetch('https://ip-api.com/json/?fields=countryCode', {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        return data.countryCode || null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.rates || null;
    }
  } catch {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD', {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        return data.rates || null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export default function SubscriptionPage() {
  const t = useTranslations('Account.pages.subscription');
  const { user, loading, hasActiveLicense, perToolCredits, licenseInfo } = useAuth();

  const [pricingData, setPricingData] = useState<{
    monthlyPrice: any;
    yearlyPrice: any;
    monthlySale: string | null;
    yearlySale: string | null;
    monthlyName: string | null;
    yearlyName: string | null;
  } | null>(null);

  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isCurrencyLoading, setIsCurrencyLoading] = useState<boolean>(true);

  // Fetch product pricing data from our API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setPricingData(data);
      })
      .catch((err) => {
        console.error('Failed to fetch pricing:', err);
      });
  }, []);

  // Fetch exchange rates and detect user currency
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [country, r] = await Promise.all([
          detectCountry(),
          fetchRates(),
        ]);

        if (cancelled) return;

        const currency = country ? COUNTRY_CURRENCY[country] ?? 'USD' : 'USD';
        setUserCurrency(currency);
        setRates(r);
      } catch (err) {
        console.error('Failed to load localized subscription prices:', err);
      } finally {
        if (!cancelled) {
          setIsCurrencyLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const convert = useCallback(
    (value: number, currency: string) => {
      return convertPrice(value, currency, userCurrency, rates);
    },
    [userCurrency, rates]
  );

  const monthlyDisplay = (() => {
    if (!pricingData?.monthlyPrice?.value) return pricingData?.monthlyPrice?.formatted ?? '$9.99';
    if (isCurrencyLoading) return '$9.99';
    if (!rates && pricingData.monthlyPrice.currency !== userCurrency) {
      return pricingData.monthlyPrice.formatted;
    }
    const converted = convert(pricingData.monthlyPrice.value, pricingData.monthlyPrice.currency);
    return formatLocalizedPrice(converted, userCurrency);
  })();

  const yearlyDisplay = (() => {
    if (!pricingData?.yearlyPrice?.value) return pricingData?.yearlyPrice?.formatted ?? '$89.99';
    if (isCurrencyLoading) return '$89.99';
    if (!rates && pricingData.yearlyPrice.currency !== userCurrency) {
      return pricingData.yearlyPrice.formatted;
    }
    const converted = convert(pricingData.yearlyPrice.value, pricingData.yearlyPrice.currency);
    return formatLocalizedPrice(converted, userCurrency);
  })();

  if (loading) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400">{t('managePlan')}</p>
      </div>

      <div className="space-y-6">
        {/* Upgrade Plan Card (Inline Pro features + purchase options) */}
        {!hasActiveLicense && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-8 shadow-2xl relative"
          >


            <div className="space-y-8 relative z-10">
              {/* Top Row: Title, Description, and Perks */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-[#d4ff33]/10 border border-[#d4ff33]/20 text-[#d4ff33] text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                      ⚡ {t('refinedocsPro')}
                    </div>
                    <h3 className="text-2xl font-extrabold text-black dark:text-white leading-tight">
                      {t('upgradeToProTitle')}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                  {t('upgradeToProDescription')}
                </p>
                
                {/* Visual features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/60">
                  {[
                    t('perkDownloads'),
                    t('perkBatch'),
                    t('perkSpeed'),
                    t('perkBg'),
                    t('perkWatermark'),
                    t('perkOcr')
                  ].map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#d4ff33] shrink-0" strokeWidth={3} />
                      <span className="text-xs text-zinc-300 font-medium">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Purchase Options (Centered, side-by-side in next row) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/60">
                {/* Monthly Option */}
                <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[170px]">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t('monthlyPlan')}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-extrabold text-black dark:text-white">{monthlyDisplay}</span>
                      <span className="text-[10px] text-zinc-500">/ mo</span>
                    </div>
                  </div>
                  <a
                    href={process.env.NEXT_PUBLIC_CHARIOW_MONTHLY_CHECKOUT || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 bg-zinc-800 text-white hover:bg-zinc-750 border border-zinc-700/60 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] block text-center"
                  >
                    {t('buyMonthlyPlan')}
                  </a>
                </div>

                {/* Yearly Option */}
                <div className="bg-[#d4ff33]/5 border border-[#d4ff33]/20 rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[170px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#d4ff33] text-black text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    {t('save25')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#d4ff33] uppercase tracking-wider mb-2">{t('yearlyPlan')}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-extrabold text-black dark:text-white">{yearlyDisplay}</span>
                      <span className="text-[10px] text-zinc-500">/ yr</span>
                    </div>
                  </div>
                  <a
                    href={process.env.NEXT_PUBLIC_CHARIOW_YEARLY_CHECKOUT || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-4 bg-[#d4ff33] text-black hover:bg-[#bce622] py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] block text-center"
                  >
                    {t('buyYearlyPlan')}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Status Card */}
        {hasActiveLicense ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LicenseActivation
                userId={user?.uid}
                isActive={hasActiveLicense}
                licenseInfo={licenseInfo ? {
                  productName: licenseInfo.productName || t('proPlan'),
                  expiresAt: new Date(licenseInfo.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                } : null}
              />
            </motion.div>

            {/* Per-Tool AI Credits Usage Grid */}
            {perToolCredits ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AICreditsGrid perToolCredits={perToolCredits} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-6 text-center"
              >
                <p className="text-zinc-400 text-sm">
                  {t('loadingCredits')}
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* License Activation Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LicenseActivation userId={user?.uid} />
            </motion.div>

            {/* "No Active Subscription" card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
                <CreditCard className="text-zinc-500 h-5 w-5" />
                <h2 className="text-lg font-semibold text-black dark:text-white">{t('currentPlan')}</h2>
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="text-zinc-500 h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{t('noActiveSubscription')}</h3>
                <p className="text-zinc-400 mb-8 max-w-sm">
                  {t('noSubscription')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
