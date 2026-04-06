'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '../../navigation';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { sidebarTools } from '../../lib/sidebarData';

interface MainSidebarProps {
  activeTool?: string;
  onToolSelect?: (toolId: string) => void;
  // If we only have activeTool from App.tsx, we can highlight it. 
  // If we don't have activeTool (like in Account layout), we don't highlight anything,
  // but if the user clicks a tool, what happens?
  // We navigate to /tools?tool=xx
}

// Mock toolContent keys dictionary for expand logic since we just need to know if it's a "parent without content"
// We'll just define a helper or hardcode the parents that have no content:
const toolContentKeys = new Set([
  'bg-remover', 'watermark', 'watermark-remover', 'image-to-text', 'resize', 
  'compress-images', 'compress-pdf', 'compress-video', 'image-converter', 
  'heic-to-png', 'pdf-to-image', 'svg-to-png', 'pdf-to-csv', 'csv-to-pdf', 
  'pdf-to-excel', 'excel-to-pdf', 'excel-to-csv', 'csv-to-excel', 'pdf-to-word', 
  'word-to-pdf', 'video-to-gif'
]);

export default function MainSidebar({ activeTool, onToolSelect }: MainSidebarProps) {
  const tt = useTranslations('Tools');
  const locale = useLocale();
  const router = useRouter();

  const handleToolSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    } else {
      router.push(`/tools?tool=${toolId}`);
    }
  };

  return (
    <aside className="w-64 border-r border-gray-800 flex flex-col shrink-0 bg-[#0f1115]">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#d4ff33] rounded-lg flex items-center justify-center text-black font-bold text-xl">
          R
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Refindocs</span>
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-4">Tools</h2>
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
          {sidebarTools.map((tool) => {
            const isStrictlyActive = activeTool === tool.id;
            const isExpanded = tool.children?.some(c => c.id === activeTool) || isStrictlyActive;
            
            return (
              <div key={tool.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (tool.id === 'compress' && tool.children) {
                      handleToolSelect(tool.children[0].id);
                    } else if (tool.children && tool.children.length > 0) {
                      if (!toolContentKeys.has(tool.id)) {
                        handleToolSelect(tool.children[0].id);
                      } else {
                        handleToolSelect(tool.id);
                      }
                    } else {
                      handleToolSelect(tool.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isStrictlyActive 
                      ? 'bg-white/10 text-white' 
                      : isExpanded && tool.children
                        ? 'text-white'
                        : `text-gray-400 hover:text-gray-200 ${tool.hover}`
                  }`}
                >
                  <div className={`p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${tool.color}`}>
                    <tool.icon size={18} />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{tt(tool.nameKey.split('.')[1])}</span>
                  {tool.children && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {tool.children && isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pl-11 space-y-1"
                  >
                    {tool.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleToolSelect(child.id)}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                          activeTool === child.id ? 'text-[#d4ff33]' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {tt(child.nameKey.split('.')[1])}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
