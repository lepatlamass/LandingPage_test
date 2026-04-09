"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  CheckCircle2, 
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { processBackgroundRemoval } from '@/lib/ai/gemini';
import { useTranslations } from 'next-intl';

interface ProcessedImage {
  id: string;
  original: string;
  processed?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}



export default function BackgroundRemover() {
  const t = useTranslations('Tools');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [mode, setMode] = useState<'prompt' | 'preset' | 'custom'>('prompt');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { id: 'office', name: 'Office', url: 'https://picsum.photos/seed/office/1200/800' },
    { id: 'beach', name: 'Beach', url: 'https://picsum.photos/seed/beach/1200/800' },
    { id: 'studio', name: 'Studio', url: 'https://picsum.photos/seed/studio/1200/800' },
    { id: 'nature', name: 'Nature', url: 'https://picsum.photos/seed/nature/1200/800' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const remainingSlots = 5 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          original: base64,
          status: 'pending'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBgSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomBg(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };


  const resizeImage = (base64: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.8));
      };
      img.src = base64;
    });
  };

  const startProcessing = async () => {
    if (images.length === 0) return;

    // Check for API Key if using gemini-3.1-flash-image-preview
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // After opening the dialog, we assume the user will select a key.
        // The app will rebuild or the next call will use the new key.
        return;
      }
    }

    setIsProcessing(true);

    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].status === 'completed') continue;

      try {
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'processing' } : img
        ));

        const mimeType = updatedImages[i].original.split(';')[0].split(':')[1];
        
        // Resize original image
        const resizedOriginal = await resizeImage(updatedImages[i].original);
        
        // Resize background image if present
        let resizedBg = undefined;
        if (mode === 'custom' && customBg) {
          resizedBg = await resizeImage(customBg);
        } else if (mode === 'preset' && selectedPreset) {
          const presetUrl = presets.find(p => p.id === selectedPreset)?.url;
          if (presetUrl) {
            // Fetch and convert preset to base64 for processing
            const response = await fetch(presetUrl);
            const blob = await response.blob();
            resizedBg = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        }

        const result = await processBackgroundRemoval(
          resizedOriginal,
          mimeType,
          {
            prompt: mode === 'prompt' ? prompt : undefined,
            backgroundImageBase64: resizedBg,
            backgroundMimeType: mode === 'custom' || mode === 'preset' ? 'image/jpeg' : undefined
          }
        );

        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'completed', processed: result } : img
        ));
      } catch (error: any) {
        console.error("Processing error:", error);
        const errorMessage = error.message || "Failed to process image";
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'error', error: errorMessage } : img
        ));
      }
    }

    setIsProcessing(false);
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Steps */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1 */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('bg-remover-upload-step')}
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border border-gray-800 bg-[#1a1c21] rounded-2xl p-12 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                images.length >= 5 ? "opacity-50 pointer-events-none" : "hover:border-[#d4ff33]/50 hover:bg-[#d4ff33]/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                accept="image/png,image/jpeg,image/webp"
                className="hidden" 
              />
              <Upload className="w-10 h-10 text-gray-500 mb-4 group-hover:text-[#d4ff33] transition-colors" />
              <p className="text-sm font-bold text-white mb-1">
                {t('bg-remover-click-to-upload')} <span className="font-normal text-gray-400">{t('bg-remover-or-drag-drop')}</span>
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                {t('bg-remover-formats')}
              </p>
            </div>
          </div>

          {/* Mode Selection Tabs */}
          <div className="bg-[#1a1c21] p-1 rounded-xl flex items-center gap-1 border border-gray-800">
            <button 
              onClick={() => setMode('prompt')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                mode === 'prompt' ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Sparkles size={14} />
              {t('bg-remover-mode-prompt')}
            </button>
            <button 
              onClick={() => setMode('preset')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                mode === 'preset' ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <LayoutGrid size={14} />
              {t('bg-remover-mode-preset')}
            </button>
            <button 
              onClick={() => setMode('custom')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                mode === 'custom' ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <ImageIcon size={14} />
              {t('bg-remover-mode-custom')}
            </button>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {mode === 'prompt' ? t('bg-remover-step2-prompt') : mode === 'preset' ? t('bg-remover-step2-preset') : t('bg-remover-step2-custom')}
            </h3>
            
            <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-6 space-y-6">
              {mode === 'prompt' && (
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-[#d4ff33]">
                    <Sparkles size={20} />
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('bg-remover-prompt-placeholder')}
                    className="w-full h-32 bg-black border-2 border-[#d4ff33]/30 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4ff33] transition-all resize-none placeholder:text-gray-600"
                  />
                </div>
              )}

              {mode === 'preset' && (
                <div className="grid grid-cols-4 gap-3">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPreset(p.id)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                        selectedPreset === p.id ? "border-[#d4ff33]" : "border-transparent hover:border-gray-600"
                      )}
                    >
                      <img src={p.url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-[10px] font-bold text-white">{p.name}</span>
                      </div>
                      {selectedPreset === p.id && (
                        <div className="absolute top-2 right-2 bg-[#d4ff33] rounded-full p-0.5">
                          <CheckCircle2 size={12} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {mode === 'custom' && (
                <div 
                  onClick={() => bgInputRef.current?.click()}
                  className={cn(
                    "relative aspect-video border-2 border-dashed border-gray-800 rounded-xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center bg-black transition-all hover:border-[#d4ff33]/30",
                    customBg ? "" : "hover:bg-[#d4ff33]/5"
                  )}
                >
                  <input 
                    type="file" 
                    ref={bgInputRef} 
                    onChange={handleBgSelect} 
                    accept="image/*"
                    className="hidden" 
                  />
                  {customBg ? (
                    <img src={customBg} alt="Custom Background" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={24} className="text-gray-600 group-hover:text-[#d4ff33]" />
                      <span className="text-xs font-bold text-gray-500">{t('bg-remover-select-bg')}</span>
                    </div>
                  )}
                  {customBg && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <RefreshCw size={24} className="text-white" />
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={startProcessing}
                disabled={isProcessing || images.length === 0 || (mode === 'prompt' && !prompt) || (mode === 'custom' && !customBg) || (mode === 'preset' && !selectedPreset)}
                className={cn(
                  "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm",
                  isProcessing || images.length === 0 || (mode === 'prompt' && !prompt) || (mode === 'custom' && !customBg) || (mode === 'preset' && !selectedPreset)
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-[#84a12d] text-black hover:bg-[#d4ff33] shadow-lg"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('bg-remover-generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('bg-remover-generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-50">{t('bg-remover-preview')}</h3>
          <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <div className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {images.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-medium text-gray-400">{t('bg-remover-empty-preview')}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="previews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide"
                  >
                    {images.map((img) => (
                      <div key={img.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1 aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img src={img.original} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase">{t('bg-remover-original')}</div>
                          </div>
                          <div className="relative flex-1 aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-200 flex items-center justify-center">
                            {img.status === 'completed' && img.processed ? (
                              <>
                                <img src={img.processed} alt="Processed" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute top-1 left-1 bg-[#d4ff33] px-1.5 py-0.5 rounded text-[8px] font-bold text-black uppercase">{t('bg-remover-result')}</div>
                              </>
                            ) : img.status === 'processing' ? (
                              <Loader2 className="w-5 h-5 text-[#d4ff33] animate-spin" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            img.status === 'error' ? "text-red-400" : "text-gray-400"
                          )}>
                            {img.status === 'error' ? img.error : t(`bg-remover-status-${img.status}`)}
                          </span>
                          {img.status === 'completed' && img.processed && (
                            <button 
                              onClick={() => downloadImage(img.processed!, `result-${img.id}.png`)}
                              className="text-[#84a12d] hover:text-[#d4ff33] transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {images.length > 0 && (
              <button 
                onClick={() => setImages([])}
                className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors font-bold uppercase tracking-widest"
              >
                {t('bg-remover-clear-all')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
