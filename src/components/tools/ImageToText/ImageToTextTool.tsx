"use client";

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  Type,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { processImageToText } from '@/lib/ai/gemini';
// import ReactMarkdown from 'react-markdown';
import { useAIGate } from '@/hooks/useAIGate';
import AIGateModal from '@/components/auth/AIGateModal';
import { useToolState } from '@/hooks/useToolState';
import { consumeAICredit } from '@/lib/firestore/licenses';
import { auth } from '@/lib/firebase';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
}

export default function ImageToTextTool() {
  const t = useTranslations('Tools');
  const commonT = useTranslations('Common');
  const { guardedAction, modalState, closeModal, onLoginSuccess } = useAIGate();
  // Persisted: the image extraction result survives locale changes
  const [images, setImages] = useToolState<ImageFile[]>('image-to-text-images', []);
  const [mode, setMode] = useToolState<'extract' | 'caption'>('image-to-text-mode', 'extract');
  // Not persisted: transient UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle'
    }));

    // For this tool, we only process one image at a time for simplicity in the UI
    setImages([newImages[0]]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Revoke object URLs to avoid memory leaks
      prev.find(img => img.id === id)?.preview && URL.revokeObjectURL(prev.find(img => img.id === id)!.preview);
      return filtered;
    });
  };

  const handleExtractText = async () => {
    guardedAction(async () => {
      if (images.length === 0 || isProcessing) return;

      setIsProcessing(true);
      trackToolUsed('image-to-text');
      const image = images[0];

      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'processing', error: undefined } : img
      ));

      try {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image.file);
        });

        const base64 = await base64Promise;
        const result = await processImageToText(base64, image.file.type, mode);

        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, status: 'completed', result } : img
        ));

        // Consume AI credit for this tool
        const user = auth.currentUser;
        if (user) {
          await consumeAICredit(user.uid, 'image-to-text');
        }
      } catch (error: any) {
        console.error("Processing error:", error);
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'error', error: error.message || "Failed to process image" } : img
        ));
      } finally {
        setIsProcessing(false);
        trackToolCompleted('image-to-text');
      }
    });
  };

  const copyToClipboard = () => {
    if (images[0]?.result) {
      navigator.clipboard.writeText(images[0].result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (images[0]?.result) {
      trackFileDownloaded('image-to-text');
      const element = document.createElement("a");
      const file = new Blob([images[0].result], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `extracted-text-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {images.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#d4ff33]/30 bg-[#d4ff33]/5 rounded-[32px] p-8 md:p-20 text-center min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-[#d4ff33]/50 whitespace-nowrap"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-[#d4ff33]/10 rounded-full flex items-center justify-center text-[#d4ff33] mb-6 group-hover:scale-110 transition-transform whitespace-nowrap">
            <Upload size={32} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#d4ff33] text-black px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#c2eb2e] transition-colors border border-black shadow-md whitespace-nowrap text-sm sm:text-base">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dropFilesHere')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Preview & Controls */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[32px] overflow-hidden bg-gray-100 dark:bg-black/40 border border-black/10 dark:border-white/10 group">
              <img
                src={images[0].preview}
                alt={commonT('alt.original')}
                className="w-full h-full object-contain"
              />
              <button 
                onClick={() => removeImage(images[0].id)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 text-black dark:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6">
              <h3 className="text-black dark:text-white font-bold mb-4 flex items-center gap-2">
                <Search size={18} className="text-[#d4ff33]" />
                Processing Mode
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('extract')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all ${
                    mode === 'extract' 
                      ? 'bg-[#d4ff33] text-black border border-black shadow-md' 
                      : 'bg-black/5 dark:bg-white/5 text-black dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <Type size={18} />
                  Extract Text
                </button>
                <button
                  onClick={() => setMode('caption')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all ${
                    mode === 'caption' 
                      ? 'bg-[#d4ff33] text-black border border-black shadow-md' 
                      : 'bg-black/5 dark:bg-white/5 text-black dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <FileText size={18} />
                  Caption
                </button>
              </div>

              <button onClick={handleExtractText}
                disabled={isProcessing || images[0].status === 'completed'}
                className="flex-1 w-full mt-6 py-4 px-6 flex items-center justify-center gap-2 bg-[#d4ff33] hover:bg-[#c8f020] text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Process Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Area */}
          <div className="space-y-6">
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-8 h-full flex flex-col min-h-[300px] md:min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-black dark:text-white font-bold flex items-center gap-2">
                  <FileText size={20} className="text-[#d4ff33]" />
                  Result
                </h3>
                {images[0].status === 'completed' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-gray-400 hover:text-black dark:text-white rounded-lg transition-all whitespace-nowrap"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button 
                      onClick={downloadText}
                      className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-gray-400 hover:text-black dark:text-white rounded-lg transition-all whitespace-nowrap"
                      title="Download as .txt"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  {images[0].status === 'idle' && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 text-center p-8"
                    >
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p>Click &quot;Process Image&quot; to extract text or generate a caption.</p>
                    </motion.div>
                  )}

                  {images[0].status === 'processing' && (
                    <motion.div 
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <Loader2 className="animate-spin text-[#d4ff33] mb-4" size={48} />
                      <p className="text-black dark:text-white font-bold">Analyzing Image...</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Gemini AI is reading the content</p>
                    </motion.div>
                  )}

                  {images[0].status === 'error' && (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <AlertCircle className="text-red-500 mb-4" size={48} />
                      <p className="text-black dark:text-white font-bold">Processing Failed</p>
                      <p className="text-red-400/80 text-sm mt-2">{images[0].error}</p>
                      <button onClick={handleExtractText}
                        className="mt-6 text-[#d4ff33] hover:text-[#c8f020] text-xs sm:text-sm font-bold underline underline-offset-4 whitespace-nowrap"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}

                  {images[0].status === 'completed' && (
                    <motion.div 
                      key="completed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <textarea 
                        readOnly
                        value={images[0].result}
                        className="w-full h-full bg-gray-50 dark:bg-black/20 border border-black/10 dark:border-white/5 rounded-2xl p-6 text-black dark:text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none scrollbar-hide"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
      <AIGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
