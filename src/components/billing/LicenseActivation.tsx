'use client';

import { useState, useEffect } from 'react';
import { Key, Loader2, CheckCircle, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { saveUserLicense } from '@/lib/firestore/licenses';

const CREDITS_CHECKOUT =
  process.env.NEXT_PUBLIC_CHARIOW_CREDITS_CHECKOUT || '#';

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
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const isLow = remaining <= 3 && remaining > 0;
  const isEmpty = remaining === 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#d4ff33] h-5 w-5" />
          <h2 className="text-lg font-semibold text-white">AI Credits</h2>
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
              ? 'No credits remaining'
              : `${remaining} credit${remaining !== 1 ? 's' : ''} left`}
          </span>
          {isLow && (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> Running low
            </span>
          )}
        </div>

        {/* Buy more credits */}
        <button
          onClick={() => window.open(CREDITS_CHECKOUT, '_blank')}
          className="w-full py-3 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#d4ff33]" />
          Buy More Credits
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* License Activation Form                     */
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
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(isActive);
  const [licenseInfo, setLicenseInfo] = useState<{
    productName: string;
    expiresAt: string;
    aiCreditsRemaining?: number;
  } | null>(externalLicenseInfo || null);

  // Sync with external license info when props change (e.g., after page reload)
  useEffect(() => {
    if (isActive && externalLicenseInfo) {
      setSuccess(true);
      setLicenseInfo(externalLicenseInfo);
    }
  }, [isActive, externalLicenseInfo]);

  const handleValidate = async () => {
    if (!licenseKey) return;
    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (!res.ok || !data.isValid) {
        setError(data.error || 'Invalid license key');
        setLicenseInfo(null);
        return;
      }

      setLicenseInfo({
        productName: data.data.productName,
        expiresAt: new Date(data.data.expiresAt).toLocaleDateString(),
      });
    } catch {
      setError('Validation failed. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('You must be logged in to activate a license.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/licenses/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      // Save to Firestore client-side (where Firebase Auth session exists)
      await saveUserLicense(userId, {
        licenseKey: data.data.licenseKey,
        chariowLicenseId: data.data.chariowLicenseId,
        status: data.data.status,
        expiresAt: data.data.expiresAt,
        activatedAt: new Date().toISOString(),
        activationCount: data.data.activationCount,
        maxActivations: data.data.maxActivations,
        activationsRemaining: data.data.activationsRemaining,
        productName: data.data.productName,
        planType: data.data.planType,
        aiCreditsTotal: data.data.aiCreditsTotal,
        aiCreditsRemaining: data.data.aiCreditsRemaining,
        aiCreditsResetAt: data.data.aiCreditsResetAt,
        perToolCredits: data.data.perToolCredits,
      });

      setSuccess(true);
      setLicenseInfo({
        productName: data.data.productName,
        expiresAt: new Date(data.data.expiresAt).toLocaleDateString(),
        aiCreditsRemaining: data.data.aiCreditsRemaining,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="text-[#d4ff33] h-5 w-5" />
            <h2 className="text-lg font-semibold text-white">Current Plan</h2>
          </div>
          <button
            onClick={() => { setSuccess(false); setLicenseInfo(null); setLicenseKey(''); }}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Switch License
          </button>
        </div>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-[#d4ff33] h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            License Activated
          </h3>
          {licenseInfo && (
            <>
              <p className="text-zinc-400 mb-1">
                {licenseInfo.productName} — Valid until{' '}
                {licenseInfo.expiresAt}
              </p>
              {licenseInfo.aiCreditsRemaining !== undefined && (
                <p className="text-[#d4ff33] text-sm font-medium">
                  {licenseInfo.aiCreditsRemaining} AI credits included
                </p>
              )}
            </>
          )}
          <p className="text-zinc-500 text-sm mt-2">
            You have full access to all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="activate-form" className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center gap-3">
        <Key className="text-zinc-500 h-5 w-5" />
        <h2 className="text-lg font-semibold text-white">
          {t('activateLicense')}
        </h2>
      </div>

      <form onSubmit={handleActivate} className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value);
                setError(null);
                setLicenseInfo(null);
              }}
              onBlur={() => {
                if (licenseKey.length > 8) handleValidate();
              }}
              placeholder={t('placeholder.licenseKey')}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-[#d4ff33]/30 focus:border-[#d4ff33] outline-none font-mono uppercase text-sm"
              required
            />
          </div>
        </div>

        {licenseInfo && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300">
            <span className="text-[#d4ff33] font-semibold">
              {licenseInfo.productName}
            </span>{' '}
            — Valid until {licenseInfo.expiresAt}
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || validating || !licenseKey}
          className="w-full py-3 rounded-xl bg-[#d4ff33] text-black font-bold text-sm hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('activating')}
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              {t('activateLicenseButton')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
