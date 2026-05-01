'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, ArrowRight, Zap, Shield, Infinity as InfinityIcon } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from '@/navigation';
import type { AIGateModalState } from '@/hooks/useAIGate';
import { signInWithGoogle } from '@/lib/auth-utils';

const CREDITS_CHECKOUT = process.env.NEXT_PUBLIC_CHARIOW_CREDITS_CHECKOUT || '/account/subscription';

interface AIGateModalProps {
  state: AIGateModalState;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AIGateModal({ state, onClose, onLoginSuccess }: AIGateModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const router = useRouter();

  const isOpen = state !== 'none';

  const handleGoogleSignIn = async () => {
    if (isSigning) return;
    setIsSigning(true);
    setSignError(null);
    try {
      const result = await signInWithGoogle(auth, googleProvider);
      if (result === null) {
        setIsSigning(false);
        return;
      }
      // If result exists, we are logged in. Redirect will handle its own state.
      if (result) {
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setSignError('Sign-in failed. Please try again.');
      setIsSigning(false);
    }
  };

  const handleSubscribe = () => {
    onClose();
    router.push('/account/subscription');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md pointer-events-auto rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient border glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d4ff33]/30 via-transparent to-blue-500/20 pointer-events-none" />
              
              {/* Card body */}
              <div className="relative bg-[#111317] border border-black/10 dark:border-white/10 rounded-3xl p-8">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-gray-500 hover:text-black dark:text-white transition-all z-10"
                >
                  <X size={18} />
                </button>

                {state === 'login' ? (
                  <LoginView
                    isSigning={isSigning}
                    signError={signError}
                    onSignIn={handleGoogleSignIn}
                  />
                ) : state === 'subscribe' ? (
                  <SubscribeView onSubscribe={handleSubscribe} onClose={onClose} />
                ) : (
                  <BuyCreditsView onClose={onClose} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────── */
/* Login View                                  */
/* ─────────────────────────────────────────── */

function LoginView({
  isSigning,
  signError,
  onSignIn,
}: {
  isSigning: boolean;
  signError: string | null;
  onSignIn: () => void;
}) {
  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#d4ff33]/20 to-transparent flex items-center justify-center">
        <Sparkles size={28} className="text-[#d4ff33]" />
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
        Unlock AI Features
      </h2>
      <p className="text-black dark:text-gray-400 text-sm mb-8 leading-relaxed">
        Sign in to protect against abuse and gain access to our powerful AI tools.
      </p>

      {/* Perks */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: Shield, label: 'Secure Access' },
          { icon: Zap, label: 'Instant Results' }
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-black/10 dark:border-white/5">
            <Icon size={18} className="text-[#d4ff33]" />
            <span className="text-[10px] font-bold text-black dark:text-gray-400 uppercase tracking-wider leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Google Sign-In Button */}
      <button
        onClick={onSignIn}
        disabled={isSigning}
        className={`w-full py-4 px-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-bold rounded-2xl transition-all shadow-xl ${
          isSigning ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isSigning ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{isSigning ? 'Signing in…' : 'Continue with Google'}</span>
      </button>

      {signError && (
        <p className="mt-3 text-red-400 text-xs">{signError}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Subscribe View                              */
/* ─────────────────────────────────────────── */

function SubscribeView({
  onSubscribe,
  onClose,
}: {
  onSubscribe: () => void;
  onClose: () => void;
}) {
  const perks = [
    'Unlimited AI tools usage credits',
    'High-resolution AI generations',
    'Unlimited standard downloads',
    'Cancel anytime',
  ];

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-[#d4ff33]/20 flex items-center justify-center">
        <Sparkles size={28} className="text-[#d4ff33]" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
        <InfinityIcon size={12} />
        Premium AI Access
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
        Upgrade for AI features
      </h2>
      <p className="text-black dark:text-gray-400 text-sm mb-7 leading-relaxed">
        Our AI models consume significant server credits. An active subscription is required to generate AI outputs.
      </p>

      {/* Perks list */}
      <div className="text-left space-y-3 mb-8 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#d4ff33]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-[#d4ff33]" />
            </div>
            <span className="text-sm text-black dark:text-gray-300 font-medium">{perk}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onSubscribe}
        className="w-full py-4 px-6 flex items-center justify-center gap-2 bg-[#d4ff33] hover:bg-[#c8f020] text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#d4ff33]/20"
      >
        View Plans
        <ArrowRight size={18} />
      </button>

      <button
        onClick={onClose}
        className="mt-3 w-full py-3 text-sm text-black dark:text-gray-500 hover:text-black dark:text-gray-300 transition-colors font-medium"
      >
        Back to tool
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Buy Credits View                            */
/* ─────────────────────────────────────────── */

function BuyCreditsView({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();

  const handleBuyCredits = () => {
    onClose();
    if (CREDITS_CHECKOUT.startsWith('http')) {
      window.open(CREDITS_CHECKOUT, '_blank');
    } else {
      router.push(CREDITS_CHECKOUT);
    }
  };

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center">
        <Zap size={28} className="text-amber-400" />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
        <Zap size={12} />
        Credits Depleted
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
        Out of AI Credits
      </h2>
      <p className="text-black dark:text-gray-400 text-sm mb-7 leading-relaxed">
        You&apos;ve used all your AI credits for this billing period. Purchase more credits to continue using AI features.
      </p>

      {/* Perks list */}
      <div className="text-left space-y-3 mb-8 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05]">
        {[
          'Instant credit top-up',
          'Credits never expire',
          'Use across all AI tools',
        ].map((perk) => (
          <div key={perk} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#d4ff33]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-[#d4ff33]" />
            </div>
            <span className="text-sm text-black dark:text-gray-300 font-medium">{perk}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleBuyCredits}
        className="w-full py-4 px-6 flex items-center justify-center gap-2 bg-[#d4ff33] hover:bg-[#c8f020] text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#d4ff33]/20"
      >
        <Zap size={18} />
        Buy More Credits
      </button>

      <button
        onClick={onClose}
        className="mt-3 w-full py-3 text-sm text-black dark:text-gray-500 hover:text-black dark:text-gray-300 transition-colors font-medium"
      >
        Back to tool
      </button>
    </div>
  );
}
