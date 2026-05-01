'use client';

import React, { useState, useRef } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
import { useTranslations } from 'next-intl';
import { Upload, FileText, Download, Loader2, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

const PdfToImageTool = () => {
  const t = useTranslations('Common');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultZip, setResultZip] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResultZip(null);
      setError(null);
    } else if (selectedFile) {
      setError('Please upload a valid PDF file.');
    }
  };

  const processPdf = async () => {
    if (!file) return;

    setIsProcessing(true);
    trackToolUsed('pdf-to-image');
    setProgress(0);
    setError(null);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjs = pdfjsLib.default || pdfjsLib;
      
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // High quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) throw new Error('Could not get canvas context');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL('image/png').split(',')[1];
        zip.file(`page-${i}.png`, imageData, { base64: true });
        
        setProgress(Math.round((i / numPages) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setResultZip(content);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError('An error occurred while processing the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
      trackToolCompleted('pdf-to-image');
    }
  };

  const downloadZip = () => {
    trackFileDownloaded('pdf-to-image');
    if (!resultZip) return;
    guardedDownload(() => {
      const url = URL.createObjectURL(resultZip!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file?.name.replace('.pdf', '') || 'pdf-images'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const reset = () => {
    setFile(null);
    setResultZip(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-red-400/30 bg-red-400/5 rounded-[32px] p-8 md:p-20 text-center min-h-[250px] md:min-h-[400px] flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-red-400/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform whitespace-nowrap">
              <Upload size={32} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black dark:text-white mb-2 whitespace-nowrap">{t('chooseFiles')}</h3>
            <p className="text-black dark:text-gray-500 text-sm mb-6">{t('dropFilesHere')}</p>
            <div className="bg-[#d4ff33] text-black px-4 py-2 sm:px-8 sm:py-3 rounded-xl font-bold hover:bg-[#c2eb2e] transition-colors shadow-lg shadow-lime-400/10 whitespace-nowrap text-xs sm:text-sm">
              Select PDF
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] p-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-400/10 rounded-xl flex items-center justify-center text-red-400 whitespace-nowrap">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-black dark:text-white font-bold truncate max-w-[300px]">{file.name}</h3>
                  <p className="text-black dark:text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!isProcessing && (
                <button onClick={reset} className="text-black dark:text-gray-500 hover:text-black dark:text-white transition-colors whitespace-nowrap text-xs sm:text-sm">
                  <X size={20} />
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {!resultZip ? (
              <div className="space-y-6">
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-black dark:text-gray-400">Converting pages...</span>
                      <span className="text-[#d4ff33] font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[#d4ff33] whitespace-nowrap"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-black dark:text-gray-500 text-sm pt-4">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing PDF pages into images...</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={processPdf}
                    className="w-full bg-[#d4ff33] text-black py-4 rounded-2xl font-bold text-lg hover:bg-[#c2eb2e] transition-all flex items-center justify-center gap-2 shadow-xl shadow-lime-400/10 whitespace-nowrap"
                  >
                    Convert to Images
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-black dark:text-white text-xl font-bold">Conversion Complete!</h4>
                <p className="text-black dark:text-gray-500">All pages have been converted to images and bundled into a ZIP file.</p>
                
                <div className="flex gap-4">
                  <button
                    onClick={downloadZip}
                    className="flex-1 bg-[#d4ff33] text-black py-4 rounded-2xl font-bold text-lg hover:bg-[#c2eb2e] transition-all flex items-center justify-center gap-2 shadow-xl shadow-lime-400/10 whitespace-nowrap"
                  >
                    <Download size={20} /> Download ZIP
                  </button>
                  <button onClick={reset}
                    className="px-5 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-black dark:text-gray-400 hover:text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap text-xs sm:text-sm"
                  >
                    Convert Another
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default PdfToImageTool;
