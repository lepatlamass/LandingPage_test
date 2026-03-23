"use client";

import React, { useState, useRef } from 'react';
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
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { extractTableFromPdf } from '@/lib/pdf_js_csv';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const [pdfFile, setPdfFile] = useState<PdfToExcelFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFile(files[0]);
    }
  };

  const addFile = async (file: File) => {
    if (file.type !== 'application/pdf') return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfFile({
        id: Math.random().toString(36).substring(2, 11),
        file,
        status: 'idle',
        totalPages: pdf.numPages,
        processedPages: 0
      });
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setIsProcessing(false);
  };

  const processPdf = async () => {
    if (!pdfFile || isProcessing) return;
    setIsProcessing(true);

    try {
      setPdfFile(prev => prev ? { ...prev, status: 'processing', processedPages: 0 } : null);

      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const rows = await extractTableFromPdf(arrayBuffer);
      
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setPdfFile(prev => prev ? { ...prev, status: 'completed', excelBlob: blob, processedPages: pdfFile.totalPages } : null);
    } catch (error) {
      console.error('PDF to Excel error:', error);
      setPdfFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExcel = () => {
    if (!pdfFile?.excelBlob) return;
    const url = URL.createObjectURL(pdfFile.excelBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfFile.file.name.split('.')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#1a1c21] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{tt('pdf-to-excel')}</h3>
              <p className="text-gray-500 text-sm">{tt('pdf-to-excel-desc')}</p>
            </div>
          </div>
          {pdfFile && (
            <button 
              onClick={removeFile}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
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
              className="border-2 border-dashed border-green-400/30 bg-green-400/5 rounded-[24px] p-20 flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-green-400/50 hover:bg-green-400/10"
            >
              <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{t('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">{tt('pdf-to-excel-step1')}</p>
              <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Secure Processing
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Instant Extraction
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 border border-gray-800 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-800 flex items-center justify-center">
                  <FileText size={32} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{pdfFile.file.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {(pdfFile.file.size / (1024 * 1024)).toFixed(2)} MB • {pdfFile.totalPages} Pages
                  </p>
                  
                  {pdfFile.status === 'processing' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                        <span>{tt('pdf-to-excel-status-processing')}</span>
                        <span>{Math.round((pdfFile.processedPages / pdfFile.totalPages) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-green-500"
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
                        {tt('pdf-to-excel-status-completed')}
                      </div>
                      <button 
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                      >
                        <Download size={18} /> {tt('pdf-to-excel-download')}
                      </button>
                    </div>
                  ) : pdfFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      {tt('pdf-to-excel-status-error')}
                    </div>
                  ) : (
                    <button 
                      onClick={processPdf}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> {tt('pdf-to-excel-status-processing')}</>
                      ) : (
                        <><RefreshCw size={18} /> {tt('pdf-to-excel-apply')}</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  {tt('pdf-to-excel-desc')}
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

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
            <Table size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{tt('pdf-to-excel-f1-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {tt('pdf-to-excel-f1-desc')}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{tt('pdf-to-excel-f2-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {tt('pdf-to-excel-f2-desc')}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{tt('pdf-to-excel-f3-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {tt('pdf-to-excel-f3-desc')}
          </p>
        </div>
      </div>
    </div>
  );
}
