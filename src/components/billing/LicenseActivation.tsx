import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';

/* ─────────────────────────────────────────── */
/* AI Credits Progress Bar                     */
/* ─────────────────────────────────────────── */

export function AICreditsBar({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const t = useTranslations('Account.pages.subscription');
  const router = useRouter();
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const isLow = remaining <= 3 && remaining > 0;
  const isEmpty = remaining === 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#d4ff33] h-5 w-5" />
          <h2 className="text-lg font-semibold text-black dark:text-white">{t('aiCredits')}</h2>
        </div>
        <span
          className={`text-sm font-bold ${
            isEmpty
              ? 'text-red-400'
              : isLow
                ? 'text-amber-400'
                : 'text-[#d4ff33]'
          }`}
        >
          {remaining} / {total}
        </span>
      </div>

      <div className="p-6 space-y-3">
        {/* Progress bar */}
        <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEmpty
                ? 'bg-red-400'
                : isLow
                  ? 'bg-amber-400'
                  : 'bg-[#d4ff33]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            {isEmpty
              ? t('noCreditsRemaining')
              : `${remaining} ${t('creditsLeft', { count: remaining })}`}
          </span>
          {isLow && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> {t('runningLow')}
            </span>
          )}
        </div>

        {/* Buy more credits */}
        <button
          onClick={() => router.push('/pricing')}
          className="w-full py-3 rounded-xl bg-zinc-800 text-black dark:text-white font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#d4ff33]" />
          {t('buyMoreCredits')}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* License Status Display                      */
/* ─────────────────────────────────────────── */

export default function LicenseActivation({
  userId,
  isActive = false,
  licenseInfo: externalLicenseInfo,
}: {
  userId?: string;
  isActive?: boolean;
  licenseInfo?: {
    productName: string;
    expiresAt: string;
    aiCreditsRemaining?: number;
  } | null;
}) {
  const t = useTranslations('Account.pages.subscription');
  const [licenseInfo, setLicenseInfo] = useState<{
    productName: string;
    expiresAt: string;
    aiCreditsRemaining?: number;
  } | null>(externalLicenseInfo || null);

  useEffect(() => {
    if (isActive && externalLicenseInfo) {
      setLicenseInfo(externalLicenseInfo);
    }
  }, [isActive, externalLicenseInfo]);

  if (!isActive || !licenseInfo) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
        <CreditCard className="text-[#d4ff33] h-5 w-5" />
        <h2 className="text-lg font-semibold text-black dark:text-white">{t('currentPlan')}</h2>
      </div>
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-[#d4ff33] h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {t('licenseActivated')}
        </h3>
        <p className="text-zinc-400 mb-1" suppressHydrationWarning>
          {licenseInfo.productName} — {t('validUntil')}{' '}
          {licenseInfo.expiresAt}
        </p>
        {licenseInfo.aiCreditsRemaining !== undefined && (
          <p className="text-[#d4ff33] text-sm font-medium">
            {licenseInfo.aiCreditsRemaining} {t('aiCreditsIncluded')}
          </p>
        )}
        <p className="text-zinc-500 text-sm mt-2">
          {t('fullAccessMessage')}
        </p>
      </div>
    </div>
  );
}
