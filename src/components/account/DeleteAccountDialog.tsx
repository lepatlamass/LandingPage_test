'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../providers/AuthProvider';
import { deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from '../../navigation';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const t = useTranslations('Account.pages.settings');
  const { user } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async () => {
    if (!user) return;
    setErrorMsg('');

    if (confirmText.toLowerCase() !== 'delete my account') {
      setErrorMsg('Please type "delete my account" accurately to confirm.');
      return;
    }

    setDeleting(true);

    try {
      // 1. Delete main user object inside authentication
      await deleteUser(user);
      
      // Navigate outward immediately
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        try {
          // If the user signed in with Google, we can trigger the popup
          // Provide basic check:
          const providerData = user.providerData || [];
          if (providerData.some((p: any) => p.providerId === 'google.com')) {
            const provider = new GoogleAuthProvider();
            await reauthenticateWithPopup(user, provider);
            // Re-attempt delete
            await deleteUser(user);
            router.push('/');
          } else {
            setErrorMsg(t('error.requiresReauth'));
          }
        } catch (reauthErr) {
          setErrorMsg(t('error.requiresReauth'));
        }
      } else {
        setErrorMsg(t('error.deleteFailed'));
      }
    } finally {
      if (onOpenChange) {
        setDeleting(false);
        onOpenChange(false);
      }
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/85" 
          onClick={() => !deleting && onOpenChange(false)} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden py-6 px-6 sm:px-8 z-10"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">{t('manageAccount.deleteTitle')}</h2>
            <p className="text-red-500 dark:text-red-400 text-sm">{t('manageAccount.deleteDescription')}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Type <span className="font-bold text-black dark:text-white">&quot;delete my account&quot;</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                placeholder={t('manageAccount.placeholder.deleteMyAccount')}
                disabled={deleting}
              />
            </div>
            
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
            >
              {t('manageAccount.deleteCancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || confirmText.toLowerCase() !== 'delete my account'}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white border border-red-700 dark:border-red-650 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : t('manageAccount.deleteConfirm')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
