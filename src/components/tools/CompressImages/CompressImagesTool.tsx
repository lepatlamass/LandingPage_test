"use client";

import React, { useState, useRef } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  Settings,
  CheckCircle2,
  AlertCircle,
  FileArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface CompressibleImage {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize?: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  error?: string;
}



export default function CompressImagesTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('compress-images');
  const [images, setImages] = useState<CompressibleImage[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 images
    const remainingSlots = 10 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      const newImage: CompressibleImage = {
        id: Math.random().toString(36).substring(7),
        file,
        preview: objectUrl,
        originalSize: file.size,
        status: 'idle'
      };
      setImages(prev => [...prev, newImage]);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const compressSingleImage = async (imgData: CompressibleImage, targetQuality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;

        if (!ctx) {
          reject(new Error(tt('compress-images-error-canvas')));
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        // Quality is 0-1, so divide by 100
        const mimeType = imgData.file.type === 'image/png' ? 'image/jpeg' : imgData.file.type;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error(tt('compress-images-error-generic')));
            }
          },
          mimeType,
          targetQuality / 100
        );
      };
      img.onerror = () => reject(new Error(tt('compress-images-error-load')));
      img.src = imgData.preview;
    });
  };

  const startProcessing = async () => {
    if (images.length === 0 || isProcessing) return;

    setIsProcessing(true);
    trackToolUsed('compress-images');
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.status === 'completed') continue;

      setImages(prev => prev.map(item => 
        item.id === img.id ? { ...item, status: 'processing' } : item
      ));

      try {
        const blob = await compressSingleImage(img, quality);
        setImages(prev => prev.map(item => 
          item.id === img.id ? { 
            ...item, 
            status: 'completed', 
            resultBlob: blob,
            compressedSize: blob.size 
          } : item
        ));
      } catch (error: any) {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error', error: error.message } : item
        ));
      }
    }

    setIsProcessing(false);
    trackToolCompleted('compress-images');
  };

  const downloadSingle = (img: CompressibleImage) => {
    if (!img.resultBlob) return;
    guardedBlobDownload(img.resultBlob, `compressed-${img.file.name}`);
  };

  const downloadAll = () => {
    trackFileDownloaded('compress-images');
    const completedImages = images.filter(img => img.status === 'completed' && img.resultBlob);
    if (completedImages.length === 0) return;

    if (completedImages.length === 1) {
      downloadSingle(completedImages[0]);
      return;
    }

    guardedBlobDownload(async () => {
      const zip = new JSZip();
      completedImages.forEach(img => {
        if (img.resultBlob) {
          zip.file(`compressed-${img.file.name}`, img.resultBlob);
        }
      });
      return await zip.generateAsync({ type: "blob" });
    }, "compressed-images.zip");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number) => {
    const savings = ((original - compressed) / original) * 100;
    return savings.toFixed(1) + '%';
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {images.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-400/30 bg-green-400/5 rounded-[32px] p-8 md:p-20 text-center min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-green-400/50"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-400 text-black px-4 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium flex items-center gap-2 hover:bg-green-300 transition-colors border border-green-600 shadow-md whitespace-nowrap text-xs sm:text-sm">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dropFilesHere')} {tt('compress-images-max-images')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-black dark:text-white font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-green-400" />
                {t('settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {tt('compress-images-quality-label')}
                    </label>
                    <span className="text-green-400 font-mono font-bold">{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-400"
                  />
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 italic">
                    {tt('compress-images-quality-desc')}
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                   <button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="w-full bg-green-400 text-black py-4 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-600 shadow-md whitespace-nowrap text-xs sm:text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {tt('compress-images-processing')}
                      </>
                    ) : (
                      <>
                        {tt('compress-images-all-btn')}
                      </>
                    )}
                  </button>

                  {images.some(img => img.status === 'completed') && (
                    <button
                      onClick={downloadAll}
                      className="w-full bg-green-400 text-black py-4 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-green-300 transition-all border border-green-600 shadow-md whitespace-nowrap text-xs sm:text-sm"
                    >
                      <FileArchive size={20} />
                      {tt('compress-images-download-all')}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-black/5 dark:bg-white/5 dark:bg-black/5 dark:bg-white/5 text-black dark:text-white py-3 px-4 rounded-xl font-medium text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/10 dark:border-white/10 whitespace-nowrap"
                  >
                    {tt('compress-images-add-more')}
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
                      <span>{formatSize(img.originalSize)}</span>
                      {img.compressedSize && (
                        <>
                          <span className="text-gray-700">•</span>
                          <span className="text-green-400">
                            {formatSize(img.compressedSize)}
                          </span>
                          <span className="text-gray-700">•</span>
                          <span className="bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">
                            -{calculateSavings(img.originalSize, img.compressedSize)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-3">
                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                          <Loader2 size={14} className="animate-spin" />
                          {tt('compress-images-processing')}
                        </div>
                      )}
                      {img.status === 'completed' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <CheckCircle2 size={14} />
                            {tt('compress-images-ready')}
                          </div>
                          <button 
                            onClick={() => downloadSingle(img)}
                            className="flex items-center gap-2 bg-green-400 text-black px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shadow-sm hover:bg-green-500"
                          >
                            <Download size={14} />
                            {tt('compress-images-download')}
                          </button>
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                          <AlertCircle size={14} />
                          {img.error || tt('compress-images-error-generic-label')}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
