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
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { useToolState } from '@/hooks/useToolState';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

type TargetFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'ico';

/** Standard favicon sizes baked into an ICO file. */
const ICO_SIZES = [16, 32, 48];

/**
 * Build a standards-compliant ICO file (ICONDIR + ICONDIRENTRY[] + PNG payloads)
 * from the given source image element.
 */
async function buildIco(sourceImg: HTMLImageElement): Promise<Blob> {
  // Render the source at each target size and export as PNG blobs
  const pngBuffers: ArrayBuffer[] = [];
  for (const size of ICO_SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(sourceImg, 0, 0, size, size);
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG export failed'))), 'image/png')
    );
    pngBuffers.push(await blob.arrayBuffer());
  }

  // ICO header sizes (in bytes)
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * pngBuffers.length;
  const totalPayload = pngBuffers.reduce((s, b) => s + b.byteLength, 0);
  const buffer = new ArrayBuffer(headerSize + totalPayload);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true);              // reserved
  view.setUint16(2, 1, true);              // type = 1 (ICO)
  view.setUint16(4, pngBuffers.length, true); // image count

  // ICONDIRENTRY for each size, followed by raw PNG data
  let dataOffset = headerSize;
  for (let i = 0; i < pngBuffers.length; i++) {
    const size = ICO_SIZES[i];
    const entryOffset = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE;
    view.setUint8(entryOffset + 0, size < 256 ? size : 0);  // width
    view.setUint8(entryOffset + 1, size < 256 ? size : 0);  // height
    view.setUint8(entryOffset + 2, 0);    // color palette
    view.setUint8(entryOffset + 3, 0);    // reserved
    view.setUint16(entryOffset + 4, 1, true);   // color planes
    view.setUint16(entryOffset + 6, 32, true);  // bits per pixel
    view.setUint32(entryOffset + 8, pngBuffers[i].byteLength, true); // data size
    view.setUint32(entryOffset + 12, dataOffset, true);              // data offset

    new Uint8Array(buffer, dataOffset).set(new Uint8Array(pngBuffers[i]));
    dataOffset += pngBuffers[i].byteLength;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

interface ImageFile {
  id: string;
  file: File;
  /** object URL — valid only in the current session */
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  /** data URL — serializable and survives page reloads */
  resultDataUrl?: string;
  /** cached file metadata for display after reload */
  fileName: string;
  fileSize: number;
  fileType: string;
  error?: string;
}

export default function ImageConverterTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [images, setImages, clearImages] = useToolState<ImageFile[]>('image-converter-images', []);
  const [targetFormat, setTargetFormat, ] = useToolState<TargetFormat>('image-converter-format', 'png');
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
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
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
    images.forEach(img => { if (img.preview) URL.revokeObjectURL(img.preview); });
    clearImages();
    setIsProcessing(false);
  };

  const convertImage = async (image: ImageFile, format: TargetFormat): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        // ICO path — build a multi-size ICO binary
        if (format === 'ico') {
          try {
            resolve(await buildIco(img));
          } catch (err) {
            reject(err);
          }
          return;
        }

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
    trackToolUsed('image-converter');

    const updatedImages = [...images];
    
    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      if (img.status === 'completed') continue;

      try {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'processing' } : item
        ));

        const resultBlob = await convertImage(img, targetFormat);
        // Convert to data URL so it survives locale-change page reloads
        const resultDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(resultBlob);
        });
        setImages(prev => prev.map(item =>
          item.id === img.id ? { ...item, status: 'completed', resultDataUrl } : item
        ));
      } catch (error) {
        setImages(prev => prev.map(item =>
          item.id === img.id ? { ...item, status: 'error', error: 'Failed' } : item
        ));
      }
    }

    setIsProcessing(false);
    trackToolCompleted('image-converter');
  };

  const downloadAll = () => {
    trackFileDownloaded('image-converter');
    const completedImages = images.filter(img => img.status === 'completed' && img.resultDataUrl);
    if (completedImages.length === 0) return;

    if (completedImages.length === 1) {
      downloadSingle(completedImages[0]);
    } else {
      guardedDownload(async () => {
        const zip = new JSZip();
        await Promise.all(completedImages.map(async (img) => {
          const blob = await fetch(img.resultDataUrl!).then(r => r.blob());
          zip.file(`${img.fileName.split('.')[0]}.${targetFormat === 'ico' ? 'ico' : targetFormat}`, blob);
        }));
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `converted-images.zip`;
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const downloadSingle = (img: ImageFile) => {
    if (!img.resultDataUrl) return;
    guardedDownload(() => {
      fetch(img.resultDataUrl!)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${img.fileName.split('.')[0]}.${targetFormat === 'ico' ? 'ico' : targetFormat}`;
          link.click();
          URL.revokeObjectURL(url);
        });
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-zinc-300 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">Image Converter</h3>
              <p className="text-black dark:text-gray-500 text-sm">Convert your images to PNG, JPEG, WebP, AVIF or Favicon ICO</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <div className="flex overflow-x-auto scrollbar-hide bg-black/40 p-1 rounded-xl border border-zinc-300 dark:border-gray-800 flex-1 md:flex-none">
              {(['png', 'jpeg', 'webp', 'avif', 'ico'] as TargetFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetFormat(f)}
                  className={`flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    targetFormat === f 
                      ? 'bg-blue-500 text-black dark:text-white shadow-lg' 
                      : 'text-black dark:text-gray-500 hover:text-black dark:text-gray-300'
                  }`}
                >
                  {f === 'ico' ? 'ICO' : f.toUpperCase()}
                </button>
              ))}
            </div>
            {images.length > 0 && (
              <button 
                onClick={clearAll}
                className="shrink-0 p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-black dark:text-white transition-all"
                title="Clear all"
              >
                <X size={18} />
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
              className="border-2 border-dashed border-blue-400/30 bg-blue-400/5 rounded-[24px] p-8 md:p-20 text-center flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-blue-400/50 hover:bg-blue-400/10"
            >
              <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-black dark:text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{t('chooseFiles')}</h4>
              <p className="text-black dark:text-gray-500 text-sm mb-8">{t('dropFilesHere')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-black dark:text-gray-500 font-medium">
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
                    className="bg-black/40 border border-zinc-300 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shrink-0 border border-zinc-300 dark:border-gray-800">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">{img.fileName}</p>
                      <p className="text-[10px] text-black dark:text-gray-500 uppercase tracking-wider mt-1">
                        {(img.fileSize / 1024).toFixed(1)} KB • {img.fileType.split('/')[1]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {img.status === 'completed' ? (
                        <button 
                          onClick={() => downloadSingle(img)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-black dark:text-white transition-all"
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
                          className="p-2 text-black dark:text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
                    className="border-2 border-dashed border-zinc-300 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-black dark:text-gray-500 hover:border-blue-400/30 hover:text-blue-400 transition-all group"
                  >
                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Add More</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-300 dark:border-gray-800">
                <div className="text-xs text-black dark:text-gray-500 text-center sm:text-left">
                  {images.filter(i => i.status === 'completed').length} of {images.length} converted
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  {images.some(i => i.status === 'completed') && (
                    <button onClick={downloadAll}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all whitespace-nowrap"
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:px-8 sm:py-3 bg-blue-500 text-black dark:text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
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
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Privacy First</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            Your images are processed entirely in your browser using the Canvas API. No data is ever uploaded to our servers, ensuring 100% privacy.
          </p>
        </div>
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Lightning Fast</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            Experience near-instant conversion speeds. Since processing happens locally, there&apos;s no network latency or upload wait times.
          </p>
        </div>
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
            <ImageIcon size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Multiple Formats</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            Convert between PNG, JPEG, WebP, AVIF, and Favicon ICO formats seamlessly. Perfect for optimizing images for web performance.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
