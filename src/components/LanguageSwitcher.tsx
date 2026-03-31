"use client";

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../navigation';
import { useSearchParams } from 'next/navigation';
import { Locale } from '../i18n/config';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`${pathname}?${params.toString()}`, { locale: newLocale });
    setIsLangMenuOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/10"
      >
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isLangMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsLangMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c21] shadow-2xl"
            >
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                      locale === lang.code ? 'bg-white/10 text-white font-medium' : 'text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
