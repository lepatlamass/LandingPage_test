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
  FileArchive,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

type OutputFormat = 'jpeg' | 'png' | 'webp';

interface HeicFile {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  error?: string;
}

export default function HeicConverterTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [files, setFiles] = useState<HeicFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles: File[]) => {
    const newFiles: HeicFile[] = selectedFiles
      .filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'heic' || ext === 'heif';
      })
      .map(file => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        preview: URL.createObjectURL(file), // Note: HEIC won't show preview in browser directly, but we'll use it as a placeholder
        status: 'idle'
      }));

    setFiles(prev => [...prev, ...newFiles].slice(0, 20));
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

  const processAll = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('heic-converter');

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed') continue;

      try {
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'processing' } : f
        ));

        const { heicTo } = await import('heic-to');
        const resultBlob = await heicTo({
          blob: item.file,
          type: `image/${outputFormat}` as any,
          quality: outputFormat === 'jpeg' ? quality : undefined
        });
        
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'completed', resultBlob } : f
        ));
      } catch (error) {
        console.error('HEIC Conversion error:', error);
        setFiles(prev => prev.map(f => 
          f.id === item.id ? { ...f, status: 'error', error: 'Failed' } : f
        ));
      }
    }

    setIsProcessing(false);
    trackToolCompleted('heic-converter');
  };

  const downloadAll = () => {
    trackFileDownloaded('heic-converter');
    const completedFiles = files.filter(f => f.status === 'completed' && f.resultBlob);
    if (completedFiles.length === 0) return;

    if (completedFiles.length === 1) {
      downloadSingle(completedFiles[0]);
    } else {
      guardedDownload(async () => {
        const zip = new JSZip();
        completedFiles.forEach((item) => {
          zip.file(`${item.file.name.split('.')[0]}.${outputFormat}`, item.resultBlob!);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `heic-converted.zip`;
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const downloadSingle = (item: HeicFile) => {
    if (!item.resultBlob) return;
    guardedDownload(() => {
      const url = URL.createObjectURL(item.resultBlob!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.file.name.split('.')[0]}.${outputFormat}`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#1a1c21] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-400/10 rounded-2xl flex items-center justify-center text-orange-400">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">HEIC Converter</h3>
              <p className="text-gray-500 text-sm">Convert Apple HEIC images to JPEG, PNG or WebP</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800">
              {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputFormat === f 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            {files.length > 0 && (
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
          {files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(Array.from(e.dataTransfer.files));
              }}
              className="border-2 border-dashed border-orange-400/30 bg-orange-400/5 rounded-[24px] p-20 flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-orange-400/50 hover:bg-orange-400/10"
            >
              <div className="w-16 h-16 bg-orange-400/10 rounded-full flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{t('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">Select up to 20 HEIC files</p>
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
              {outputFormat === 'jpeg' && (
                <div className="bg-black/20 p-6 rounded-2xl border border-gray-800 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings size={16} className="text-orange-400" />
                      JPEG Quality: {Math.round(quality * 100)}%
                    </label>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.1" 
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id}
                    className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-gray-800 flex items-center justify-center">
                      <ImageIcon size={24} className="text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB • HEIC
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-400" />
                          <button 
                            onClick={() => downloadSingle(item)}
                            className="p-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ) : item.status === 'processing' ? (
                        <Loader2 size={16} className="text-orange-400 animate-spin" />
                      ) : item.status === 'error' ? (
                        <AlertCircle size={16} className="text-red-400" />
                      ) : (
                        <button 
                          onClick={() => removeFile(item.id)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {files.length < 20 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-500 hover:border-orange-400/30 hover:text-orange-400 transition-all group"
                  >
                    <Upload size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Add More</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  {files.filter(f => f.status === 'completed').length} of {files.length} converted
                </div>
                <div className="flex items-center gap-3">
                  {files.some(f => f.status === 'completed') && (
                    <button 
                      onClick={downloadAll}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all"
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
                    className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
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
        accept=".heic,.heif"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-orange-400/10 rounded-2xl flex items-center justify-center text-orange-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Apple Compatible</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Specifically designed to handle HEIC and HEIF files from iPhones and iPads. Convert them to universally compatible formats in seconds.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Instant Conversion</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            No software installation required. Our browser-based converter processes your files instantly using your device&apos;s power.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Quality Control</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Adjust the quality of your JPEG output to balance file size and visual fidelity. Maintain the original resolution of your photos.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
