'use client';

import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../../providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { User, Mail, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AccountPage() {
  const t = useTranslations('Account.pages.account');
  const { user, loading } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);
    
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setSuccessMsg(t('saveChanges'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#d4ff33] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If unauthenticated, layout's AuthRedirect will handle redirection
  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400">Manage your account details and personalization.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">{t('title')}</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Display Name Field */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="displayName">
                  {t('name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Address (Read Only - Google OAuth) */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="emailAddress">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="emailAddress"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-400 cursor-not-allowed opacity-80"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {t('managedViaGoogle')}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm"
                >
                  {successMsg}
                </motion.div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || displayName === user.displayName}
                  className="inline-flex items-center gap-2 bg-[#d4ff33] text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c2eb2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  {isSaving ? "Saving..." : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
