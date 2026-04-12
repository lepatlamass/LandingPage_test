'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/navigation';
import { Check } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

const MONTHLY_CHECKOUT = process.env.NEXT_PUBLIC_CHARIOW_MONTHLY_CHECKOUT || '#';
const YEARLY_CHECKOUT = process.env.NEXT_PUBLIC_CHARIOW_YEARLY_CHECKOUT || '#';

/** Map country code → currency code. */
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
  RU: 'RUB', HK: 'HKD', TW: 'TWD', CM: 'XAF', CF: 'XAF',
  TD: 'XAF', GQ: 'XAF', GA: 'XAF', CG: 'XAF',
};

/** Known locale for currency formatting. */
const CURRENCY_LOCALE: Record<string, string> = {
  USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', BRL: 'pt-BR',
  JPY: 'ja-JP', CNY: 'zh-CN', INR: 'en-IN', KRW: 'ko-KR',
  CAD: 'en-CA', AUD: 'en-AU', CHF: 'de-CH',
  XAF: 'fr-CM', XOF: 'fr-SN',
};

/**
 * Convert price from store currency to user's local currency.
 * `rates` is always a USD-based exchange rate map (key = currency code, value = units per 1 USD).
 */
function convertPrice(
  storeValue: number,
  storeCurrency: string,
  userCurrency: string,
  rates: Record<string, number> | null
): number {
  if (storeCurrency === userCurrency) return storeValue;
  if (!rates) return storeValue;

  // Convert storeValue to USD first, then to userCurrency.
  const storeRate = rates[storeCurrency]; // units of storeCurrency per 1 USD
  if (!storeRate || storeRate === 0) return storeValue;
  const usdAmount = storeValue / storeRate;

  const userRate = rates[userCurrency]; // units of userCurrency per 1 USD
  if (!userRate) return storeValue;
  return usdAmount * userRate;
}

/** Format price with proper locale for the currency. */
function formatLocalizedPrice(value: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Detect user's country from IP using a free geo-IP service. */
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
    // Fallback: try another service
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

/** Fetch USD-based exchange rates from a free API. */
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
    // Fallback to exchangerate.host
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

interface PriceInfo {
  value: number;
  formatted: string;
  currency: string;
}

interface PricingStrings {
  foundryPro: string;
  foundryProPrice: string;
  foundryProPeriod: string;
  bestForOccasional: string;
  unlimitedDownloads: string;
  creditsDesc: string;
  priorityProcessing: string;
  noWatermarks: string;
  startMonthly: string;
  yearlyBestValue: string;
  yearlyPrice: string;
  yearlyPeriod: string;
  saveAmount: string;
  bestForPower: string;
  everythingInPro: string;
  yearlyCredits: string;
  getYearly: string;
}

interface PricingButtonsProps {
  t: PricingStrings;
  monthlyPrice?: PriceInfo | null;
  yearlyPrice?: PriceInfo | null;
  monthlySale?: string | null;
  yearlySale?: string | null;
  monthlyName?: string | null;
  yearlyName?: string | null;
}

export default function PricingButtons({
  t,
  monthlyPrice,
  yearlyPrice,
  monthlySale,
  yearlySale,
  monthlyName,
  yearlyName,
}: PricingButtonsProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount: detect country → get currency → fetch USD-based rates
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [country, r] = await Promise.all([
        detectCountry(),
        fetchRates(),
      ]);

      if (cancelled) return;

      const currency = country ? COUNTRY_CURRENCY[country] ?? 'USD' : 'USD';
      setUserCurrency(currency);
      setRates(r);
      setIsLoading(false);
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
    if (!monthlyPrice?.value) return monthlyPrice?.formatted ?? t.foundryProPrice;
    if (isLoading) return null; // show skeleton
    const converted = convert(monthlyPrice.value, monthlyPrice.currency);
    return formatLocalizedPrice(converted, userCurrency);
  })();

  const yearlyDisplay = (() => {
    if (!yearlyPrice?.value) return yearlyPrice?.formatted ?? t.yearlyPrice;
    if (isLoading) return null; // show skeleton
    const converted = convert(yearlyPrice.value, yearlyPrice.currency);
    return formatLocalizedPrice(converted, userCurrency);
  })();

  const monthlyTitle = monthlyName ?? t.foundryPro;
  const yearlyTitle = yearlyName ?? t.yearlyBestValue;

  const handleMonthly = () => {
    if (!user) {
      router.push('/login?redirect=/#price');
    } else {
      window.open(MONTHLY_CHECKOUT, '_blank');
    }
  };

  const handleYearly = () => {
    if (!user) {
      router.push('/login?redirect=/#price');
    } else {
      window.open(YEARLY_CHECKOUT, '_blank');
    }
  };

  return (
    <div className="lg:w-2/3 flex flex-col sm:flex-row gap-8 w-full items-stretch">
      {/* Monthly Plan */}
      <div className="flex-1 rounded-[32px] border-[2px] border-[#d4ff33] bg-[#111111] p-8 relative flex flex-col shadow-2xl shadow-[#d4ff33]/5 min-h-[460px]">
        <div className="absolute -top-[2px] right-8 bg-[#d4ff33] text-black text-[10px] font-black px-6 py-2 rounded-b-xl uppercase tracking-widest">
          Recommended
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{monthlyTitle}</h3>
        <div className="flex items-baseline gap-1 mb-4">
          {monthlyDisplay === null ? (
            <span className="h-9 w-24 rounded-lg bg-white/10 animate-pulse inline-block" />
          ) : (
            <span className="text-3xl font-bold text-white">{monthlyDisplay}</span>
          )}
          <span className="text-gray-500 text-base">{t.foundryProPeriod}</span>
        </div>
        {monthlySale && (
          <div className="inline-block text-[10px] text-black bg-[#d4ff33] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-4">
            Save {monthlySale}
          </div>
        )}
        <div className="text-xs text-[#d4ff33] font-bold mb-8 uppercase tracking-widest">{t.bestForOccasional}</div>

        <ul className="space-y-4 mb-10 flex-1">
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.unlimitedDownloads}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.creditsDesc}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.priorityProcessing}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.noWatermarks}</span>
          </li>
        </ul>

        <button
          onClick={handleMonthly}
          className="w-full py-4 rounded-xl bg-[#d4ff33] text-black font-black text-base hover:bg-[#bce622] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {t.startMonthly}
        </button>
      </div>

      {/* Yearly Plan */}
      <div className="flex-1 rounded-[32px] bg-[#1a1c21] p-8 flex flex-col shadow-xl min-h-[460px]">
        <h3 className="text-xl font-bold mb-2 text-white">{yearlyTitle}</h3>
        <div className="flex items-baseline gap-2 mb-4">
          {yearlyDisplay === null ? (
            <span className="h-9 w-24 rounded-lg bg-white/10 animate-pulse inline-block" />
          ) : (
            <span className="text-3xl font-bold text-white">{yearlyDisplay}</span>
          )}
          <span className="text-gray-500 text-base">{t.yearlyPeriod}</span>
          {yearlySale && (
            <span className="text-[#d4ff33] text-xs font-bold">(Save {yearlySale})</span>
          )}
        </div>
        <div className="text-xs text-[#d4ff33] font-bold mb-8 uppercase tracking-widest">{t.bestForPower}</div>

        <ul className="space-y-4 mb-10 flex-1">
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.everythingInPro}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.yearlyCredits}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.priorityProcessing}</span>
          </li>
          <li className="flex items-start gap-3 text-[14px] text-gray-300">
            <Check className="w-5 h-5 text-[#d4ff33] shrink-0 mt-0.5" />
            <span className="leading-tight">{t.noWatermarks}</span>
          </li>
        </ul>

        <button
          onClick={handleYearly}
          className="w-full py-4 rounded-xl bg-[#2a2d35] text-white font-black text-base hover:bg-[#353943] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {t.getYearly}
        </button>
      </div>
    </div>
  );
}
