'use client';

import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ToolLimitsComparison() {
  const t = useTranslations('ToolLimits');

  const categories = [
    {
      title: t('pdfToWord') + ' / ' + t('wordToPdf'),
      items: [
        { name: t('pdfToWord'), free: t('limitDaily'), pro: t('unlimitedPro'), isAi: false },
        { name: t('wordToPdf'), free: t('limitDaily'), pro: t('unlimitedPro'), isAi: false },
      ]
    },
    {
      title: t('compressPdf') + ' / ' + t('compressImages') + ' / ' + t('compressVideo'),
      items: [
        { name: t('compressPdf'), free: t('limitDaily'), pro: t('unlimitedLarge'), isAi: false },
        { name: t('compressImages'), free: t('limitImages'), pro: t('unlimitedBatch'), isAi: false },
        { name: t('compressVideo'), free: t('limitVideo'), pro: t('unlimitedVideo'), isAi: false },
      ]
    },
    {
      title: t('imageConverter') + ' / ' + t('heicToPng') + ' / ' + t('pdfToImage') + ' / ' + t('svgToPng'),
      items: [
        { name: t('imageConverter'), free: t('limitConverter'), pro: t('unlimitedBatch'), isAi: false },
        { name: t('heicToPng'), free: t('limitConverter'), pro: t('unlimitedBatch'), isAi: false },
        { name: t('pdfToImage'), free: t('limitPdfToImage'), pro: t('unlimitedLarge'), isAi: false },
        { name: t('svgToPng'), free: t('limitConverter'), pro: t('unlimitedBatch'), isAi: false },
      ]
    },
    {
      title: 'AI Smart Tools',
      items: [
        { name: t('bgRemover'), free: t('noAccess'), pro: t('unlimitedPro'), isAi: true },
        { name: t('watermarkRemover'), free: t('noAccess'), pro: t('unlimitedPro'), isAi: true },
        { name: t('imageToText'), free: t('noAccess'), pro: t('unlimitedPro'), isAi: true },
      ]
    },
    {
      title: 'Other Utilities',
      items: [
        { name: t('watermark'), free: t('limitDaily'), pro: t('unlimitedPro'), isAi: false },
        { name: t('resize'), free: t('limitImages'), pro: t('unlimitedBatch'), isAi: false },
        { name: t('videoToGif'), free: t('limitVideo'), pro: t('unlimitedVideo'), isAi: false },
      ]
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#111111]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">{t('title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-3xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#1a1c21] shadow-md">
          {/* Table for Desktop & Tablet */}
          <div className="hidden sm:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#111111]">
                  <th className="py-5 px-6 font-bold text-sm text-black dark:text-white w-1/2">{t('colTool')}</th>
                  <th className="py-5 px-6 font-bold text-sm text-gray-700 dark:text-gray-400 w-1/4">{t('colFree')}</th>
                  <th className="py-5 px-6 font-bold text-sm text-[#d4ff33] w-1/4">{t('colPro')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, catIdx) => (
                  <tr key={catIdx} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
                    <td colSpan={3} className="p-0">
                      <div className="bg-zinc-50 dark:bg-zinc-900/60 px-6 py-3 font-bold text-xs uppercase tracking-widest text-zinc-500 dark:text-gray-400 border-b border-zinc-200 dark:border-zinc-800">
                        {category.title}
                      </div>
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {category.items.map((item, itemIdx) => (
                            <tr key={itemIdx} className="hover:bg-zinc-100 dark:hover:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
                              <td className="py-4 px-6 text-sm font-medium text-black dark:text-white w-1/2 flex items-center gap-2">
                                {item.name}
                                {item.isAi && (
                                  <span className="text-[10px] bg-[#d4ff33]/20 text-black dark:text-[#d4ff33] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    AI
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 w-1/4">
                                {item.free.includes('No access') || item.free.includes('Sin acceso') || item.free.includes('Non disponible') || item.free.includes('Nessun accesso') || item.free.includes('Sem acesso') ? (
                                  <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                    <X className="w-4 h-4" />
                                    {item.free}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    {item.free}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-sm text-[#d4ff33] font-semibold w-1/4">
                                <span className="flex items-center gap-1.5">
                                  <Check className="w-4 h-4 text-[#d4ff33]" />
                                  {item.pro}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* List Layout for Mobile */}
          <div className="block sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {categories.map((category, catIdx) => (
              <div key={catIdx} className="flex flex-col">
                <div className="bg-zinc-100 dark:bg-zinc-900 px-6 py-3 font-bold text-xs uppercase tracking-widest text-zinc-500 dark:text-gray-400">
                  {category.title}
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="p-6 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-white">
                        {item.name}
                        {item.isAi && (
                          <span className="text-[9px] bg-[#d4ff33]/20 text-black dark:text-[#d4ff33] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider text-[10px]">
                            {t('colFree')}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                            {item.free.includes('No access') || item.free.includes('Sin acceso') || item.free.includes('Non disponible') || item.free.includes('Nessun accesso') || item.free.includes('Sem acesso') ? (
                              <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            ) : null}
                            {item.free}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#d4ff33]/80 font-medium uppercase tracking-wider text-[10px]">
                            {t('colPro')}
                          </span>
                          <span className="text-[#d4ff33] font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            {item.pro}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
