'use client';

import React from 'react';
import { Link } from '../../../../navigation';
import { CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function SubscriptionPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
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
              <h3 className="text-lg font-semibold text-white">Upgrade to Team Plan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Why pay for a Pro plan, when your organization could pay for a Team plan and save up to 22% on licensing, get centralized billing and account management, plus priority support?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link 
                href="#"
                className="text-sm font-medium text-[#d4ff33] hover:text-[#c2eb2e] hover:underline transition-colors flex items-center justify-center pt-2 sm:pt-0"
              >
                Tell your boss
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-colors"
              >
                Switch to a Team plan
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Subscription Status Card */}
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
              You do not have a subscription. Upgrade to a Pro or Team plan to unlock premium features and advanced tools.
            </p>
            
            <button
              className="inline-flex items-center justify-center gap-2 bg-[#d4ff33] text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors active:scale-[0.98]"
            >
              Try 7 days free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
