"use client";

import React, { useRef, useState, useEffect } from 'react';
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
  FileText,
  Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument } from 'pdf-lib';
import { useToolState } from '@/hooks/useToolState';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

type CompressionLevel = 'recommended' | 'extreme' | 'low';

/** Serializable snapshot — no File / Blob references */
interface PdfState {
  fileName: string;
  originalSize: number;
  compressedSize?: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  /** Base64 data URL of the compressed result */
  resultDataUrl?: string;
  error?: string;
}

export default function CompressPdfTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [pdfState, setPdfState, resetPdfState] = useToolState<PdfState | null>('compress-pdf', null);
  const [level, setLevel, ] = useToolState<CompressionLevel>('compress-pdf-level', 'recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  // Keep a live File reference for the current session (not persisted)
  const fileRef = useRef<File | null>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    setPdfState({
      fileName: file.name,
      originalSize: file.size,
      status: 'idle'
    });
  };

  const compressPdf = async () => {
    const file = fileRef.current;
    if (!pdfState || !file || isProcessing) return;

    setIsProcessing(true);
    trackToolUsed('compress-pdf');
    setPdfState(prev => prev ? { ...prev, status: 'processing' } : null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const compressedDoc = await PDFDocument.create();
      const copiedPages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => compressedDoc.addPage(page));

      compressedDoc.setTitle('');
      compressedDoc.setAuthor('');
      compressedDoc.setSubject('');
      compressedDoc.setKeywords([]);
      compressedDoc.setProducer('');
      compressedDoc.setCreator('');
      
      const compressedBytes = await compressedDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateFieldAppearances: false,
        objectsPerTick: 50
      });

      // Convert to base64 data URL for persistence across locale changes
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      const resultDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setPdfState(prev => prev ? {
        ...prev,
        status: 'completed',
        resultDataUrl,
        compressedSize: blob.size
      } : null);
    } catch (error: any) {
      setPdfState(prev => prev ? { ...prev, status: 'error', error: error.message } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('compress-pdf');
    }
  };

  const downloadPdf = () => {
    if (!pdfState?.resultDataUrl) return;
    trackFileDownloaded('compress-pdf');
    guardedDownload(() => {
      // Re-create Blob from the persisted data URL
      fetch(pdfState.resultDataUrl!)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `compressed-${pdfState.fileName}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        });
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number) => {
    if (!compressed) return 0;
    const savings = ((original - compressed) / original) * 100;
    return Math.max(0, Math.round(savings));
  };

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-[40px] p-8 md:p-20 text-center flex flex-col items-center justify-center min-h-[300px]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {!pdfState ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[40px] p-8 md:p-20 text-center flex flex-col items-center justify-center group hover:border-red-400/50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
              fileRef.current = file;
              setPdfState({ fileName: file.name, originalSize: file.size, status: 'idle' });
            }
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept="application/pdf" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform whitespace-nowrap">
            <Upload size={32} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-400 text-black px-4 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium flex items-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-400/20 whitespace-nowrap text-xs sm:text-sm">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-black dark:text-gray-500 text-sm">{t('dropFilesHere')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-black dark:text-white font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-red-400" />
                {t('settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-black dark:text-gray-500 uppercase tracking-wider mb-4 block">
                    {tt('compress-pdf-level-label')}
                  </label>
                  <div className="space-y-3">
                    {(['recommended', 'extreme', 'low'] as CompressionLevel[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          level === l 
                            ? 'bg-red-400/10 border-red-400 text-black dark:text-white' 
                            : 'bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-gray-400 hover:border-black/20 dark:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-sm mb-1 capitalize">
                          {tt(`compress-pdf-level-${l}`)}
                        </div>
                        <div className="text-[10px] opacity-60">
                          {tt(`compress-pdf-level-${l}-desc`)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={compressPdf}
                    disabled={isProcessing || pdfState.status === 'completed'}
                    className={`w-full py-4 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap text-xs sm:text-sm ${
                      pdfState.status === 'completed'
                        ? 'bg-green-500 text-black cursor-default'
                        : 'bg-red-400 text-black hover:bg-red-500 shadow-lg shadow-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {tt('compress-pdf-processing')}
                      </>
                    ) : pdfState.status === 'completed' ? (
                      <>
                        <CheckCircle2 size={20} />
                        {tt('compress-pdf-ready')}
                      </>
                    ) : (
                      <>
                        <Minimize size={20} />
                        {tt('compress-pdf')}
                      </>
                    )}
                  </button>

                  {pdfState.status === 'completed' && (
                    <button
                      onClick={downloadPdf}
                      className="w-full py-4 px-4 rounded-2xl bg-red-400 text-black font-medium flex items-center justify-center gap-2 hover:bg-red-500 transition-all whitespace-nowrap text-xs sm:text-sm shadow-xl"
                    >
                      <Download size={20} />
                      {tt('compress-pdf-download')}
                    </button>
                  )}

                  <button
                    onClick={resetPdfState}
                    className="w-full py-4 px-4 rounded-2xl bg-black/5 dark:bg-white/5 text-black dark:text-white font-medium flex items-center justify-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 transition-all whitespace-nowrap text-xs sm:text-sm border border-black/10 dark:border-white/10"
                  >
                    <X size={20} />
                    {t('chooseFiles')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-400/10 rounded-lg text-red-400 whitespace-nowrap">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-black dark:text-white font-bold text-sm">{pdfState.fileName}</h4>
                    <p className="text-[10px] text-black dark:text-gray-500 uppercase tracking-widest font-bold">
                      {formatSize(pdfState.originalSize)}
                    </p>
                  </div>
                </div>
                {pdfState.status === 'completed' && pdfState.compressedSize && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-black dark:text-gray-500 uppercase tracking-widest font-bold mb-1">{tt('compress-pdf-new-size')}</p>
                      <p className="text-green-400 font-mono font-bold">{formatSize(pdfState.compressedSize)}</p>
                    </div>
                    <div className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-400/20">
                      -{calculateSavings(pdfState.originalSize, pdfState.compressedSize)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="p-12 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {pdfState.status === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="space-y-4"
                    >
                      <div className="w-20 h-20 bg-red-400/10 rounded-3xl flex items-center justify-center text-red-400 mx-auto">
                        <FileText size={40} />
                      </div>
                      <p className="text-black dark:text-gray-400 text-sm max-w-xs mx-auto">
                        {tt('compress-pdf-idle-desc')}
                      </p>
                    </motion.div>
                  )}

                  {pdfState.status === 'processing' && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <Loader2 size={64} className="text-red-400 animate-spin mx-auto" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText size={24} className="text-red-400/50" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-black dark:text-white font-bold">{tt('compress-pdf-optimizing')}</p>
                        <p className="text-black dark:text-gray-500 text-xs">{tt('compress-pdf-processing-desc')}</p>
                      </div>
                    </motion.div>
                  )}

                  {pdfState.status === 'completed' && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="space-y-6"
                    >
                      <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-black dark:text-white font-bold">{tt('compress-pdf-complete')}</p>
                        <p className="text-black dark:text-gray-500 text-xs">{tt('compress-pdf-complete-desc')}</p>
                      </div>
                      <button onClick={downloadPdf}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black rounded-xl font-medium hover:bg-green-600 transition-colors whitespace-nowrap text-xs sm:text-sm shadow-lg shadow-green-500/20"
                      >
                        <Download size={18} />
                        {tt('compress-pdf-download')}
                      </button>
                    </motion.div>
                  )}

                  {pdfState.status === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="space-y-4"
                    >
                      <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
                        <AlertCircle size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-black dark:text-white font-bold">{tt('compress-pdf-failed')}</p>
                        <p className="text-red-400/70 text-xs">{pdfState.error}</p>
                      </div>
                      <button
                        onClick={() => setPdfState(prev => prev ? { ...prev, status: 'idle' } : null)}
                        className="text-black dark:text-gray-400 hover:text-black dark:text-white text-sm font-bold underline underline-offset-4"
                      >
                        {tt('compress-pdf-try-again')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
