'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, locales } from '../../../../navigation';

type Locale = (typeof locales)[number];
import { useAuth } from '../../../../providers/AuthProvider';
import { getUserPreferences, updateEmailPreferences } from '../../../../lib/firestore/userPreferences';
import { UserPreferences } from '../../../../types/user-preferences';
import { DeleteAccountDialog } from '../../../../components/account/DeleteAccountDialog';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
];

export default function SettingsPage() {
  const t = useTranslations('Account.pages.settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Custom tiny toast equivalent
  const [toastMsg, setToastMsg] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Form States
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [language, setLanguage] = useState(locale);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const prefs = await getUserPreferences(user!.uid);
        if (prefs) {
          setPreferences(prefs);
        }
      } catch (err) {
        console.error("Failed to load user preferences:", err);
        showToast(t('error.updateFailed'), 'error');
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [user, t]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    setLanguage(newLocale);
    
    // Switch the app's routing namespace natively
    router.replace(pathname, { locale: newLocale });
  };

  const handleToggleEmails = async () => {
    if (!user || !preferences) return;
    setUpdatingEmail(true);

    const newValue = !preferences.emailNotifications.promotional;
    try {
      await updateEmailPreferences(user.uid, newValue);
      setPreferences({
        ...preferences,
        emailNotifications: {
          promotional: newValue
        }
      });
      showToast(t('success.emailPreferencesUpdated'), 'success');
    } catch (err) {
      showToast(t('error.updateFailed'), 'error');
    } finally {
      setUpdatingEmail(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#d4ff33] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Preferences */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">{t('preferences.title')}</h2>
          </div>
          
          <div className="p-6 space-y-8">
            
            {/* Language */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white">{t('preferences.language.label')}</h3>
                <p className="text-sm text-zinc-400 mt-1">{t('preferences.language.disclaimer')}</p>
              </div>
              
              <div className="max-w-xs">
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#d4ff33] focus:border-transparent transition-all appearance-none"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-px bg-zinc-800 w-full" />

            {/* Email Notifications */}
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-white">{t('preferences.emailNotifications.label')}</h3>
                  <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                    {t('preferences.emailNotifications.description')}
                  </p>
                </div>

                <button
                  onClick={handleToggleEmails}
                  disabled={updatingEmail}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none flex-shrink-0
                    ${preferences?.emailNotifications.promotional ? 'bg-[#d4ff33]' : 'bg-zinc-700'}`}
                >   
                  {updatingEmail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <motion.div 
                    initial={false}
                    animate={{ x: preferences?.emailNotifications.promotional ? 24 : 2 }}
                    className={`absolute top-1 max-h-4 shadow-sm w-4 h-4 rounded-full bg-white transition-opacity ${updatingEmail ? 'opacity-0' : 'opacity-100'}`} 
                  />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Manage Account */}
        <section className="bg-zinc-900 border border-zinc-800 border-l-4 border-l-red-500 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">{t('manageAccount.label')}</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-white">{t('manageAccount.deleteAccount')}</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                  {t('manageAccount.deleteDescription')}
                </p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
              >
                {t('manageAccount.deleteConfirm')}
              </button>
            </div>
          </div>
        </section>

      </div>

      <DeleteAccountDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />

      {/* Floating Toast implementation mimicking standard bottom-right toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 z-40 
              ${toastMsg.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-green-400' : 'bg-zinc-900 border-red-500/20 text-red-400'}`}
          >
            {toastMsg.type === 'success' && <Check size={18} />}
            <span className="text-sm font-medium">{toastMsg.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
