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
  FileText,
  ShieldCheck,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { extractTableFromPdf } from '@/lib/pdf_js_csv';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface PdfToExcelFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  totalPages: number;
  processedPages: number;
  excelBlob?: Blob;
  error?: string;
}

export default function PdfToExcelTool() {
  const t = useTranslations('Tools');
  const commonT = useTranslations('Common');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('pdf-to-excel');
  const [pdfFile, setPdfFile] = useState<PdfToExcelFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFile(files[0]);
    }
  };

  const addFile = async (file: File) => {
    setUploadError(null);
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a valid PDF file.');
      return;
    }

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjs = pdfjsLib.default || pdfjsLib;
      
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      setPdfFile({
        id: Math.random().toString(36).substring(2, 11),
        file,
        status: 'idle',
        totalPages: pdf.numPages,
        processedPages: 0
      });
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      setUploadError(error.message || 'Failed to load PDF file. Please try again.');
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setIsProcessing(false);
  };

  const processPdf = async () => {
    if (!pdfFile || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('pdf-to-excel');

    try {
      setPdfFile(prev => prev ? { ...prev, status: 'processing', processedPages: 0 } : null);

      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const rows = await extractTableFromPdf(arrayBuffer, (pageNumber) => {
        setPdfFile(prev => prev ? { ...prev, processedPages: pageNumber } : null);
      });
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setPdfFile(prev => prev ? { ...prev, status: 'completed', excelBlob: blob, processedPages: pdfFile.totalPages } : null);
    } catch (error) {
      console.error('PDF to Excel error:', error);
      setPdfFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('pdf-to-excel');
    }
  };

  const downloadExcel = () => {
    trackFileDownloaded('pdf-to-excel');
    if (!pdfFile?.excelBlob) return;
    guardedBlobDownload(pdfFile.excelBlob, `${pdfFile.file.name.split('.')[0]}.xlsx`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-zinc-300 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-black/5 dark:bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lime-400/10 rounded-2xl flex items-center justify-center text-lime-400 shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">{t('pdf-to-excel')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('pdf-to-excel-desc')}</p>
            </div>
          </div>
          {pdfFile && (
            <button 
              onClick={removeFile}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-400 transition-colors"
              title="Clear"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8">
          {!pdfFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFiles = Array.from(e.dataTransfer.files);
                if (droppedFiles.length > 0) addFile(droppedFiles[0]);
              }}
              className="border-2 border-dashed border-lime-400/30 bg-lime-400/5 rounded-[24px] p-8 md:p-20 text-center flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-lime-400/50 hover:bg-lime-400/10"
            >
              <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-black dark:text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{commonT('chooseFiles')}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">{t('pdf-to-excel-select-file-desc')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-600 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Secure Processing
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Instant Extraction
                </div>
              </div>
              {uploadError && (
                <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {uploadError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-100 dark:bg-black/40 border border-zinc-300 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shrink-0 border border-zinc-300 dark:border-gray-800 flex items-center justify-center">
                  <FileText size={32} className="text-lime-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white truncate">{pdfFile.file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                    {(pdfFile.file.size / (1024 * 1024)).toFixed(2)} MB • {pdfFile.totalPages} Pages
                  </p>
                  
                  {pdfFile.status === 'processing' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2">
                        <span>{t('pdf-to-excel-status-processing')}</span>
                        <span>{Math.round((pdfFile.processedPages / pdfFile.totalPages) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-lime-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(pdfFile.processedPages / pdfFile.totalPages) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {pdfFile.status === 'completed' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                        <CheckCircle2 size={20} />
                        {t('pdf-to-excel-status-completed')}
                      </div>
                      <button onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-lime-500 text-black rounded-xl text-xs sm:text-sm font-bold hover:bg-lime-600 transition-all border border-black shadow-md whitespace-nowrap"
                      >
                        <Download size={18} /> {t('pdf-to-excel-download')}
                      </button>
                    </div>
                  ) : pdfFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      {t('pdf-to-excel-status-error')}
                    </div>
                  ) : (
                    <button onClick={processPdf}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-lime-500 text-black rounded-xl text-xs sm:text-sm font-bold hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-black shadow-md whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> {t('pdf-to-excel-extracting')}</>
                      ) : (
                        <><RefreshCw size={18} /> {t('pdf-to-excel-apply')}</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-black dark:text-gray-400 leading-relaxed">
                  {t('pdf-to-excel-info-desc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="hidden"
      />
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
