'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle, CreditCard, Shield } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    id: 'account',
    icon: <HelpCircle className="w-5 h-5 text-[#d4ff33]" />,
    items: ['1', '2', '3', '4', '5']
  },
  {
    id: 'payments',
    icon: <CreditCard className="w-5 h-5 text-[#d4ff33]" />,
    items: ['6', '7', '8', '9', '10', '11']
  },
  {
    id: 'processing',
    icon: <Shield className="w-5 h-5 text-[#d4ff33]" />,
    items: ['12', '13', '14', '15', '16', '17', '18']
  }
];

export default function FaqAccordion() {
  const t = useTranslations('Help');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="space-y-12">
      {FAQ_CATEGORIES.map((category) => (
        <div key={category.id} className="bg-[#1a1c21] border border-white/5 rounded-3xl p-4 md:p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#2a2d39] flex items-center justify-center shrink-0">
              {category.icon}
            </div>
            <h2 className="text-2xl font-bold text-white">{t(`categories.${category.id}`)}</h2>
          </div>

          <div className="space-y-4">
            {category.items.map((num) => {
              const qKey = `q${num}`;
              const aKey = `a${num}`;
              const isOpen = openItem === qKey;

              return (
                <div 
                  key={qKey} 
                  className={`border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/5 border-white/10' : 'bg-transparent hover:bg-white/5'}`}
                >
                  <button
                    onClick={() => toggleItem(qKey)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                  >
                    <span className="font-semibold text-base md:text-lg pr-4">{t(`faqs.${qKey}`)}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#d4ff33]' : ''}`} 
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="p-5 pt-0 md:p-6 md:pt-0 text-gray-400 leading-relaxed text-sm md:text-base">
                      {t(`faqs.${aKey}`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
