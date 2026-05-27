'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Sparkles, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle } from '@/lib/auth-utils';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';

interface AIFeatureGateProps {
  children: React.ReactNode;
  toolId: string;
}

export default function AIFeatureGate({ children, toolId }: AIFeatureGateProps) {
  const { user, hasActiveLicense, loading } = useAuth();
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('AIGate');

  // Helper to check if there is completed processing state in sessionStorage
  const hasProcessedOutput = () => {
    if (typeof window === 'undefined') return false;
    try {
      const bgRemoverState = sessionStorage.getItem('refinedocs_tool_state_bg-remover-images');
      if (bgRemoverState) {
        const images = JSON.parse(bgRemoverState);
        if (Array.isArray(images) && images.some(img => img.status === 'completed' && img.processed)) {
          return true;
        }
      }
      const imageToTextState = sessionStorage.getItem('refinedocs_tool_state_image-to-text-images');
      if (imageToTextState) {
        const images = JSON.parse(imageToTextState);
        if (Array.isArray(images) && images.some(img => img.status === 'completed' && img.result)) {
          return true;
        }
      }
      const watermarkRemoverState = sessionStorage.getItem('refinedocs_tool_state_watermark-remover-images');
      if (watermarkRemoverState) {
        const images = JSON.parse(watermarkRemoverState);
        if (Array.isArray(images) && images.some(img => img.status === 'completed' && img.processed)) {
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to parse tool state', e);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="w-full bg-zinc-50 dark:bg-[#111317] border border-zinc-200 dark:border-white/5 rounded-[32px] p-12 md:p-20 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-black dark:border-white flex items-center justify-center text-black dark:text-[#d4ff33] relative z-10 animate-spin">
            <Sparkles size={24} />
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 animate-pulse">{t('verifying')}</p>
      </div>
    );
  }

  // 1. If user is authenticated and has an active license, let them through
  if (user && hasActiveLicense) {
    return <>{children}</>;
  }

  // 2. If it's the user's first usage or there's an existing processed output, let them through
  const usageCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem(`refinedocs_ai_usage_count_${toolId}`) || '0', 10) : 0;
  if (usageCount < 2 || hasProcessedOutput()) {
    return <>{children}</>;
  }

  // Otherwise, show the lock screen
  const handleGoogleSignIn = async () => {
    if (isSigning) return;
    setIsSigning(true);
    setSignError(null);
    try {
      const result = await signInWithGoogle(auth, googleProvider);
      if (result) {
        setIsSigning(false);
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setSignError('Sign-in failed. Please try again.');
      setIsSigning(false);
    }
  };

  const handleSubscribe = () => {
    router.push('/account/subscription');
  };

  const perks = [
    t('perk1'),
    t('perk2'),
    t('perk3'),
    t('perk4'),
  ];

  return (
    <div className="relative w-full overflow-hidden bg-zinc-50 dark:bg-[#111317] border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 md:p-16">
      <div className="relative max-w-lg mx-auto text-center flex flex-col items-center">
        {/* Lock badge */}
        <div className="relative w-16 h-16 mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-black dark:border-white">
          <Lock size={28} className="text-black dark:text-[#d4ff33] relative z-10" />
        </div>

        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-3">
          {t('title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-md">
          {!user ? t('descSignIn') : t('descUpgrade')}
        </p>

        {/* Perks Grid */}
        <div className="w-full text-left space-y-3 mb-8 bg-zinc-100/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-zinc-200 dark:border-white/5">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#d4ff33]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-[#d4ff33]" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        {!user ? (
          <div className="w-full space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigning}
              className={`w-full py-4 px-6 flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-black dark:text-white border border-black dark:border-zinc-700 font-bold rounded-2xl transition-all shadow-md ${
                isSigning ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
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
              <span>{isSigning ? t('signingIn') : t('signInGoogle')}</span>
            </button>
            {signError && <p className="text-red-400 text-xs mt-2">{signError}</p>}
            <p className="text-[11px] text-gray-500">
              {t('signInFreeDesc')}
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            className="w-full py-4 px-6 flex items-center justify-center gap-2 bg-[#d4ff33] hover:bg-[#c8f020] text-black border border-black font-bold rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
          >
            {t('upgradeToPro')}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
