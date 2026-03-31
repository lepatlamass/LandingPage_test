"use client";

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  Settings,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

type TargetFormat = 'png' | 'jpeg' | 'webp' | 'avif';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  error?: string;
}

import Image from 'next/image';

export default function ImageConverterTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newImages: ImageFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: 'idle'
      }));

    setImages(prev => [...prev, ...newImages].slice(0, 10));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setIsProcessing(false);
  };

  const convertImage = async (image: ImageFile, format: TargetFormat): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // For JPEG, we might want a white background if the source is transparent
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        
        const mimeType = `image/${format}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        }, mimeType, 0.9);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = image.preview;
    });
  };

  const processAll = async () => {
    if (images.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const updatedImages = [...images];
    
    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      if (img.status === 'completed') continue;

      try {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'processing' } : item
        ));

        const resultBlob = await convertImage(img, targetFormat);
        
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'completed', resultBlob } : item
        ));
      } catch (error) {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error', error: 'Failed' } : item
        ));
      }
    }

    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.resultBlob);
    if (completedImages.length === 0) return;

    if (completedImages.length === 1) {
      const img = completedImages[0];
      const url = URL.createObjectURL(img.resultBlob!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${img.file.name.split('.')[0]}.${targetFormat}`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      completedImages.forEach((img) => {
        zip.file(`${img.file.name.split('.')[0]}.${targetFormat}`, img.resultBlob!);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-images.zip`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadSingle = (img: ImageFile) => {
    if (!img.resultBlob) return;
    const url = URL.createObjectURL(img.resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${img.file.name.split('.')[0]}.${targetFormat}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#1a1c21] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Image Converter</h3>
              <p className="text-gray-500 text-sm">Convert your images to PNG, JPEG, WebP or AVIF</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800">
              {(['png', 'jpeg', 'webp', 'avif'] as TargetFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    targetFormat === f 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            {images.length > 0 && (
              <button 
                onClick={clearAll}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="Clear all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {images.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(Array.from(e.dataTransfer.files));
              }}
              className="border-2 border-dashed border-blue-400/30 bg-blue-400/5 rounded-[24px] p-20 flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-blue-400/50 hover:bg-blue-400/10"
            >
              <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{t('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">{t('dropFilesHere')}</p>
              <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Secure Processing
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Instant Conversion
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={img.id}
                    className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-gray-800 relative">
                      <Image src={img.preview} alt="preview" fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{img.file.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                        {(img.file.size / 1024).toFixed(1)} KB • {img.file.type.split('/')[1]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {img.status === 'completed' ? (
                        <button 
                          onClick={() => downloadSingle(img)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Download size={16} />
                        </button>
                      ) : img.status === 'processing' ? (
                        <Loader2 size={16} className="text-blue-400 animate-spin" />
                      ) : img.status === 'error' ? (
                        <AlertCircle size={16} className="text-red-400" />
                      ) : (
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {images.length < 10 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:border-blue-400/30 hover:text-blue-400 transition-all group"
                  >
                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Add More</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  {images.filter(i => i.status === 'completed').length} of {images.length} converted
                </div>
                <div className="flex items-center gap-3">
                  {images.some(i => i.status === 'completed') && (
                    <button 
                      onClick={downloadAll}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all"
                    >
                      {images.filter(i => i.status === 'completed').length > 1 ? (
                        <><FileArchive size={18} /> Download All (ZIP)</>
                      ) : (
                        <><Download size={18} /> Download Converted</>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={processAll}
                    disabled={isProcessing || images.every(i => i.status === 'completed')}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Converting...</>
                    ) : (
                      <><RefreshCw size={18} /> Convert All to {targetFormat.toUpperCase()}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Privacy First</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your images are processed entirely in your browser using the Canvas API. No data is ever uploaded to our servers, ensuring 100% privacy.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Lightning Fast</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Experience near-instant conversion speeds. Since processing happens locally, there&apos;s no network latency or upload wait times.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
            <ImageIcon size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Multiple Formats</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Convert between PNG, JPEG, WebP, and AVIF formats seamlessly. Perfect for optimizing images for web performance.
          </p>
        </div>
      </div>
    </div>
  );
}
