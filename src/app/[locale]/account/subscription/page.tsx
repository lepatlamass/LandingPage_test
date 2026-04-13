'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/providers/AuthProvider';
import LicenseActivation from '@/components/billing/LicenseActivation';
import AICreditsGrid from '@/components/billing/AICreditsGrid';

export default function SubscriptionPage() {
  const t = useTranslations('Account.pages.subscription');
  const { user, loading, hasActiveLicense, perToolCredits, licenseInfo } = useAuth();

  if (loading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400">Manage your plan and billing.</p>
      </div>

      <div className="space-y-6">
        {/* Info Box (Callout) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-6"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-white">Upgrade to Pro Plan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Save 20% with a Pro plan and unlock all features, including unlimited AI credits and priority processing.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href={process.env.NEXT_PUBLIC_CHARIOW_YEARLY_CHECKOUT || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors active:scale-[0.98]"
              >
                Switch to Pro Plan <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </motion.div>

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
                  productName: licenseInfo.productName || 'Pro Plan',
                  expiresAt: new Date(licenseInfo.expiresAt).toLocaleDateString(),
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
                  Loading AI credits information…
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* License Activation Form — shown first */}
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
                <h2 className="text-lg font-semibold text-white">Current Plan</h2>
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="text-zinc-500 h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
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
