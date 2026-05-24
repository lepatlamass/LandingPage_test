"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import { dataUrlToBlob } from '@/lib/fileCache';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  Maximize, 
  Lock, 
  Unlock, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';
import WorkflowPrompts from '../WorkflowPrompts';

interface ResizableImage {
  id: string;
  file: File;
  preview: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
}



export default function ImageResizerTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('image-resizer');
  const [images, setImages] = useState<ResizableImage[]>([]);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [globalWidth, setGlobalWidth] = useState<number>(1920);
  const [globalHeight, setGlobalHeight] = useState<number>(1080);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 images
    const remainingSlots = 10 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const newImage: ResizableImage = {
          id: Math.random().toString(36).substring(7),
          file,
          preview: objectUrl,
          originalWidth: img.width,
          originalHeight: img.height,
          targetWidth: img.width, // Default to original
          targetHeight: img.height, // Default to original
          status: 'idle'
        };
        setImages(prev => [...prev, newImage]);
      };
      img.src = objectUrl;
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const updateGlobalWidth = (val: number) => {
    setGlobalWidth(val);
    if (lockAspectRatio && images.length > 0) {
      const ratio = images[0].originalWidth / images[0].originalHeight;
      setGlobalHeight(Math.round(val / ratio));
    }
  };

  const updateGlobalHeight = (val: number) => {
    setGlobalHeight(val);
    if (lockAspectRatio && images.length > 0) {
      const ratio = images[0].originalWidth / images[0].originalHeight;
      setGlobalWidth(Math.round(val * ratio));
    }
  };

  // Sync dimensions when lock is toggled on
  useEffect(() => {
    if (lockAspectRatio && images.length > 0) {
      const ratio = images[0].originalWidth / images[0].originalHeight;
      setGlobalHeight(Math.round(globalWidth / ratio));
    }
  }, [lockAspectRatio, images, globalWidth]);

  const getTargetDimensions = (imgData: ResizableImage) => {
    if (!lockAspectRatio) {
      return { width: globalWidth, height: globalHeight };
    }

    const ratio = imgData.originalWidth / imgData.originalHeight;
    const targetRatio = globalWidth / globalHeight;

    if (targetRatio > ratio) {
      // Height is the limiting factor
      return {
        width: Math.round(globalHeight * ratio),
        height: globalHeight
      };
    } else {
      // Width is the limiting factor
      return {
        width: globalWidth,
        height: Math.round(globalWidth / ratio)
      };
    }
  };

  const resizeImage = async (imgData: ResizableImage): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const { width: finalWidth, height: finalHeight } = getTargetDimensions(imgData);

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        resolve(canvas.toDataURL(imgData.file.type));
      };
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.src = imgData.preview;
    });
  };

  const startProcessing = async () => {
    if (images.length === 0 || isProcessing) return;

    setIsProcessing(true);
    trackToolUsed('image-resizer');
    
    const updatedImages = [...images];
    
    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      if (img.status === 'completed') continue;

      setImages(prev => prev.map(item => 
        item.id === img.id ? { ...item, status: 'processing' } : item
      ));

      try {
        const result = await resizeImage(img);
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'completed', result } : item
        ));
      } catch (error: any) {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error', error: error.message } : item
        ));
      }
    }

    setIsProcessing(false);
    trackToolCompleted('image-resizer');
  };

  const downloadImage = (img: ResizableImage) => {
    trackFileDownloaded('image-resizer');
    if (!img.result) return;
    guardedBlobDownload(
      () => dataUrlToBlob(img.result!),
      `resized-${img.file.name}`
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {images.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-cyan-400/30 bg-cyan-400/5 rounded-[32px] p-8 md:p-20 text-center min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-cyan-400/50"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-cyan-400 text-black px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-cyan-300 transition-colors border border-cyan-600 shadow-md whitespace-nowrap text-sm sm:text-base">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dropFilesHere')} {tt('resize-max-images')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-black dark:text-white font-bold mb-6 flex items-center gap-2">
                <Maximize size={20} className="text-cyan-400" />
                {tt('resize-settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    {tt('resize-width-label')}
                  </label>
                  <input 
                    type="number" 
                    value={globalWidth}
                    onChange={(e) => updateGlobalWidth(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    {tt('resize-height-label')}
                  </label>
                  <input 
                    type="number" 
                    value={globalHeight}
                    onChange={(e) => updateGlobalHeight(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>

                <button 
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    lockAspectRatio 
                      ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' 
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-bold">{tt('resize-lock-aspect')}</span>
                  {lockAspectRatio ? <Lock size={18} /> : <Unlock size={18} />}
                </button>

                <div className="pt-4">
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl whitespace-nowrap text-sm sm:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {tt('resize-processing')}
                      </>
                    ) : (
                      <>
                        {tt('resize-all-btn')}
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-3 bg-black/5 dark:bg-white/5 text-black dark:text-white py-3 rounded-xl font-bold text-sm hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10 whitespace-nowrap"
                  >
                    {tt('resize-add-more')}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onFileSelect} 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-4 flex items-center gap-6 group hover:bg-white/8 transition-colors"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/40 shrink-0 border border-black/10 dark:border-white/5">
                    <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-black dark:text-white font-bold text-sm truncate pr-4">{img.file.name}</h4>
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-400">
                      <span>{img.originalWidth} x {img.originalHeight} px</span>
                      <span className="text-gray-700">•</span>
                      <span className="text-cyan-400/80">
                        {tt('resize-target')}: {getTargetDimensions(img).width} x {getTargetDimensions(img).height} px
                      </span>
                    </div>

                    <div className="mt-3">
                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                          <Loader2 size={14} className="animate-spin" />
                          {tt('bg-remover-status-processing')}
                        </div>
                      )}
                      {img.status === 'completed' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <CheckCircle2 size={14} />
                            {tt('resize-ready')}
                          </div>
                          <button 
                            onClick={() => downloadImage(img)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-black dark:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                          >
                            <Download size={14} />
                            {tt('resize-download')}
                          </button>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                          <AlertCircle size={14} />
                          {img.error || 'Error'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {images.some(img => img.status === 'completed') && (
              <WorkflowPrompts currentTool="resize" />
            )}
          </div>
        </div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
