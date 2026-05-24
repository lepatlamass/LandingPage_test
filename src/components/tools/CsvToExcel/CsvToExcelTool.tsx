"use client";

import React, { useRef } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import { dataUrlToBlob } from '@/lib/fileCache';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Zap,
  RefreshCw,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
// @ts-ignore
import Papa from 'papaparse';
import { useToolState } from '@/hooks/useToolState';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface CsvFileState {
  fileName: string;
  fileSize: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultDataUrl?: string;
  error?: string;
}

export default function CsvToExcelTool() {
  const t = useTranslations('Common');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('csv-to-excel');
  const [csvState, setCsvState, resetCsvState] = useToolState<CsvFileState | null>('csv-to-excel', null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Live File reference for the current session — not persisted
  const fileRef = useRef<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFile(files[0]);
  };

  const addFile = (file: File) => {
    if (!file.name.match(/\.csv$/i)) return;
    fileRef.current = file;
    setCsvState({ fileName: file.name, fileSize: file.size, status: 'idle' });
  };

  const removeFile = () => {
    fileRef.current = null;
    resetCsvState();
    setIsProcessing(false);
  };

  const processCsv = async () => {
    const file = fileRef.current;
    if (!csvState || !file || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('csv-to-excel');

    try {
      setCsvState(prev => prev ? { ...prev, status: 'processing' } : null);

      const text = await file.text();
      const parsed = Papa.parse(text, { skipEmptyLines: true });
      const worksheet = XLSX.utils.aoa_to_sheet(parsed.data as any[][]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Store as data URL so it survives locale-change reloads
      const resultDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setCsvState(prev => prev ? { ...prev, status: 'completed', resultDataUrl } : null);
    } catch (error) {
      console.error('CSV to Excel error:', error);
      setCsvState(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('csv-to-excel');
    }
  };

  const downloadExcel = () => {
    trackFileDownloaded('csv-to-excel');
    if (!csvState?.resultDataUrl) return;
    guardedBlobDownload(
      () => dataUrlToBlob(csvState.resultDataUrl!),
      `${csvState.fileName.split('.')[0]}.xlsx`
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-zinc-300 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-black/5 dark:bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
              <FileCode size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">CSV to Excel</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Convert CSV files to Excel spreadsheets</p>
            </div>
          </div>
          {csvState && (
            <button 
              onClick={removeFile}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-400 transition-colors"
              title="Clear"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8">
          {!csvState ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFiles = Array.from(e.dataTransfer.files);
                if (droppedFiles.length > 0) addFile(droppedFiles[0]);
              }}
              className="border-2 border-dashed border-emerald-400/30 bg-emerald-400/5 rounded-[24px] p-8 md:p-20 text-center flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-emerald-400/50 hover:bg-emerald-400/10"
            >
              <div className="w-16 h-16 bg-emerald-400/10 rounded-full flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-black dark:text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{t('chooseFiles')}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">Select a CSV file (.csv) to convert</p>
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
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-100 dark:bg-black/40 border border-zinc-300 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shrink-0 border border-zinc-300 dark:border-gray-800 flex items-center justify-center">
                  <FileCode size={32} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white truncate">{csvState.fileName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                    {(csvState.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {csvState.status === 'completed' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                        <CheckCircle2 size={20} />
                        Converted
                      </div>
                      <button onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-emerald-500 text-black dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-600 transition-all border border-emerald-600 shadow-md whitespace-nowrap"
                      >
                        <Download size={18} /> Download Excel
                      </button>
                    </div>
                  ) : csvState.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      Failed
                    </div>
                  ) : (
                    <button onClick={processCsv}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-emerald-500 text-black dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-emerald-600 shadow-md whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> Converting...</>
                      ) : (
                        <><RefreshCw size={18} /> Convert to Excel</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-black dark:text-gray-400 leading-relaxed">
                  Our tool converts your CSV file into a proper Excel spreadsheet (.xlsx), making it easier to format and analyze your data.
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
        accept=".csv"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <Table size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Format Preserved</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Ensures your data remains intact and correctly formatted during conversion.
          </p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Instant Results</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Fast processing engine that handles large files in seconds, right in your browser.
          </p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Secure &amp; Private</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            No data is uploaded to our servers. All conversion happens locally on your machine.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
