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
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileArchive,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

type OutputFormat = 'png' | 'jpeg';

interface SvgFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  error?: string;
  width?: number;
  height?: number;
}



export default function SvgConverterTool() {
  const t = useTranslations('Common');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('svg-converter');
  const [files, setFiles] = useState<SvgFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [scale, setScale] = useState(2); // Default 2x scale for better quality
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles: File[]) => {
    const newFiles: SvgFile[] = selectedFiles
      .filter(file => file.type === 'image/svg+xml' || file.name.endsWith('.svg'))
      .map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        preview: URL.createObjectURL(file),
        status: 'idle'
      }));

    setFiles(prev => [...prev, ...newFiles].slice(0, 10));
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setIsProcessing(false);
  };

  const convertSvg = async (svgFile: SvgFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const width = img.width * scale;
        const height = img.height * scale;
        canvas.width = width;
        canvas.height = height;

        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = `image/${outputFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Conversion failed'));
          }
        }, mimeType, 0.95);
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = svgFile.preview;
    });
  };

  const processAll = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('svg-converter');

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed') continue;

      try {
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'processing' } : f
        ));

        const resultBlob = await convertSvg(item);
        
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'completed', resultBlob } : f
        ));
      } catch (error) {
        console.error('SVG Conversion error:', error);
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'error', error: 'Failed' } : f
        ));
      }
    }

    setIsProcessing(false);
    trackToolCompleted('svg-converter');
  };

  const downloadAll = () => {
    trackFileDownloaded('svg-converter');
    const completedFiles = files.filter(f => f.status === 'completed' && f.resultBlob);
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      downloadSingle(completedFiles[0]);
    } else {
      guardedBlobDownload(async () => {
        const zip = new JSZip();
        completedFiles.forEach((item) => {
          zip.file(`${item.file.name.split('.')[0]}.${outputFormat}`, item.resultBlob!);
        });
        return await zip.generateAsync({ type: 'blob' });
      }, `svg-converted.zip`);
    }
  };

  const downloadSingle = (item: SvgFile) => {
    if (!item.resultBlob) return;
    guardedBlobDownload(item.resultBlob, `${item.file.name.split('.')[0]}.${outputFormat}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-zinc-300 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-black/5 dark:bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-400/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">SVG Converter</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Convert vector SVG files to PNG or JPEG</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-wrap bg-gray-100 dark:bg-black/40 p-1 rounded-xl border border-zinc-300 dark:border-gray-800 w-full md:w-auto">
              {(['png', 'jpeg'] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`flex-1 md:flex-none px-2 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputFormat === f 
                      ? 'bg-indigo-500 text-white shadow-lg' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-black dark:text-gray-300'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            {files.length > 0 && (
              <button 
                onClick={clearAll}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors"
                title="Clear all"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(Array.from(e.dataTransfer.files));
              }}
              className="border-2 border-dashed border-indigo-400/30 bg-indigo-400/5 rounded-[24px] p-8 md:p-20 text-center flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-indigo-400/50 hover:bg-indigo-400/10"
            >
              <div className="w-16 h-16 bg-indigo-400/10 rounded-full flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-black dark:text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{t('chooseFiles')}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">Select SVG files to convert</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-600 dark:text-gray-400 font-medium">
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
              <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-300 dark:border-gray-800 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                    <Maximize2 size={16} className="text-indigo-400" />
                    Output Scale: {scale}x
                  </label>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full h-2 bg-white dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest font-bold">
                  <span>Standard</span>
                  <span>High Res</span>
                  <span>Ultra Res</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id}
                    className="bg-gray-100 dark:bg-black/40 border border-zinc-300 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-zinc-300 dark:border-gray-800 p-2">
                      <img src={item.preview} alt="preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">{item.file.name}</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                        {(item.file.size / 1024).toFixed(1)} KB • SVG
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-400" />
                          <button 
                            onClick={() => downloadSingle(item)}
                            className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-black dark:text-white transition-all"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ) : item.status === 'processing' ? (
                        <Loader2 size={16} className="text-indigo-400 animate-spin" />
                      ) : item.status === 'error' ? (
                        <AlertCircle size={16} className="text-red-400" />
                      ) : (
                        <button 
                          onClick={() => removeFile(item.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {files.length < 10 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 hover:border-indigo-400/30 hover:text-indigo-400 transition-all group"
                  >
                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Add More</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-300 dark:border-gray-800">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {files.filter(f => f.status === 'completed').length} of {files.length} converted
                </div>
                <div className="flex items-center gap-3">
                  {files.some(f => f.status === 'completed') && (
                    <button onClick={downloadAll}
                      className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-700 transition-all whitespace-nowrap"
                    >
                      {files.filter(f => f.status === 'completed').length > 1 ? (
                        <><FileArchive size={18} /> Download All (ZIP)</>
                      ) : (
                        <><Download size={18} /> Download Converted</>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={processAll}
                    disabled={isProcessing || files.every(f => f.status === 'completed')}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-indigo-600 shadow-md"
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /> Converting...</>
                    ) : (
                      <><RefreshCw size={18} /> Convert All to {outputFormat.toUpperCase()}</>
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
        accept=".svg"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-indigo-400/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
            <Maximize2 size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Scalable Quality</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Choose your output resolution. Since SVG is vector-based, we can render it at any scale (up to 5x) without losing quality.
          </p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Instant Export</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Convert complex vector graphics to raster images instantly. Our browser-based engine handles rendering locally on your device.
          </p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Privacy Guaranteed</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Your design files never leave your computer. All rendering and conversion happen locally in your browser session.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
