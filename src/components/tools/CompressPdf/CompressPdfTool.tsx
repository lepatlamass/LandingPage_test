"use client";

import React, { useRef } from 'react';
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
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {!pdfState ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] p-8 md:p-20 text-center flex flex-col items-center justify-center group hover:border-red-400/50 transition-all cursor-pointer"
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
            <div className="bg-red-400 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-500 transition-colors shadow-lg shadow-red-400/20 whitespace-nowrap text-sm sm:text-base">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-500 text-sm">{t('dropFilesHere')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-red-400" />
                {t('settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">
                    {tt('compress-pdf-level-label')}
                  </label>
                  <div className="space-y-3">
                    {(['recommended', 'extreme', 'low'] as CompressionLevel[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          level === l 
                            ? 'bg-red-400/10 border-red-400 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
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
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      pdfState.status === 'completed'
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-red-400 text-white hover:bg-red-500 shadow-lg shadow-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed'
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
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                    >
                      <Download size={20} />
                      {tt('compress-pdf-download')}
                    </button>
                  )}

                  <button
                    onClick={resetPdfState}
                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all whitespace-nowrap"
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
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-400/10 rounded-lg text-red-400 whitespace-nowrap">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{pdfState.fileName}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      {formatSize(pdfState.originalSize)}
                    </p>
                  </div>
                </div>
                {pdfState.status === 'completed' && pdfState.compressedSize && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">New Size</p>
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
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-500 mx-auto">
                        <FileText size={40} />
                      </div>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Ready to compress your PDF. Select your compression level and click the button.
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
                        <p className="text-white font-bold">Optimizing Document...</p>
                        <p className="text-gray-500 text-xs">This may take a few seconds depending on file size.</p>
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
                        <p className="text-white font-bold">Compression Complete!</p>
                        <p className="text-gray-500 text-xs">Your PDF has been successfully optimized.</p>
                      </div>
                      <button onClick={downloadPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors whitespace-nowrap text-xs sm:text-sm"
                      >
                        <Download size={18} />
                        Download Now
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
                        <p className="text-white font-bold">Compression Failed</p>
                        <p className="text-red-400/70 text-xs">{pdfState.error}</p>
                      </div>
                      <button
                        onClick={() => setPdfState(prev => prev ? { ...prev, status: 'idle' } : null)}
                        className="text-gray-400 hover:text-white text-sm font-bold underline underline-offset-4"
                      >
                        Try Again
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
