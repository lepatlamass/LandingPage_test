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
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  RefreshCw,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface ExcelToCsvFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  csvData?: string;
  error?: string;
}

export default function ExcelToCsvTool() {
  const t = useTranslations('Common');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [excelFile, setExcelFile] = useState<ExcelToCsvFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFile(files[0]);
    }
  };

  const addFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) return;

    setExcelFile({
      id: Math.random().toString(36).substring(2, 11),
      file,
      status: 'idle'
    });
  };

  const removeFile = () => {
    setExcelFile(null);
    setIsProcessing(false);
  };

  const processExcel = async () => {
    if (!excelFile || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('excel-to-csv');

    try {
      setExcelFile(prev => prev ? { ...prev, status: 'processing' } : null);

      const arrayBuffer = await excelFile.file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      setExcelFile(prev => prev ? { ...prev, status: 'completed', csvData: csv } : null);
    } catch (error) {
      console.error('Excel to CSV error:', error);
      setExcelFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('excel-to-csv');
    }
  };

  const downloadCsv = () => {
    trackFileDownloaded('excel-to-csv');
    if (!excelFile?.csvData) return;
    guardedDownload(() => {
      const blob = new Blob([excelFile!.csvData!], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${excelFile!.file.name.split('.')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-zinc-300 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">Excel to CSV</h3>
              <p className="text-black dark:text-gray-500 text-sm">Convert Excel spreadsheets to CSV format</p>
            </div>
          </div>
          {excelFile && (
            <button 
              onClick={removeFile}
              className="p-2 text-black dark:text-gray-500 hover:text-emerald-400 transition-colors"
              title="Clear"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8">
          {!excelFile ? (
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
              <p className="text-black dark:text-gray-500 text-sm mb-8">Select an Excel file (.xlsx, .xls) to convert</p>
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
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 border border-zinc-300 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shrink-0 border border-zinc-300 dark:border-gray-800 flex items-center justify-center">
                  <FileSpreadsheet size={32} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white truncate">{excelFile.file.name}</p>
                  <p className="text-xs text-black dark:text-gray-500 uppercase tracking-wider mt-1">
                    {(excelFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {excelFile.status === 'completed' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                        <CheckCircle2 size={20} />
                        Converted
                      </div>
                      <button onClick={downloadCsv}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-emerald-500 text-black dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                      >
                        <Download size={18} /> Download CSV
                      </button>
                    </div>
                  ) : excelFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      Failed
                    </div>
                  ) : (
                    <button onClick={processExcel}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-emerald-500 text-black dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> Converting...</>
                      ) : (
                        <><RefreshCw size={18} /> Convert to CSV</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-black dark:text-gray-400 leading-relaxed">
                  Our tool converts the first sheet of your Excel file into a CSV format. This is perfect for importing data into other systems or databases.
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
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <Table size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Format Preserved</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            Ensures your data remains intact and correctly formatted during conversion.
          </p>
        </div>
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Instant Results</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            Fast processing engine that handles large spreadsheets in seconds, right in your browser.
          </p>
        </div>
        <div className="bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-black dark:text-white font-bold mb-4">Secure & Private</h4>
          <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
            No data is uploaded to our servers. All conversion happens locally on your machine.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
