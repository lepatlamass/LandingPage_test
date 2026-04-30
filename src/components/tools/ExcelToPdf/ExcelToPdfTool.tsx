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
  FileText,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface ExcelToPdfFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultPdf?: Blob;
  error?: string;
}

const sanitizeText = (text: string): string => {
  return text.replace(/[^\x00-\x7F\xA0-\xFF\u20AC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u2122\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192]/g, '?');
};

const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  const safeMaxWidth = isNaN(maxWidth) || maxWidth <= 0 ? 100 : maxWidth;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= safeMaxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        if (font.widthOfTextAtSize(currentLine, fontSize) > safeMaxWidth) {
          let remainingWord = currentLine;
          currentLine = '';
          while (remainingWord.length > 0) {
            let breakIndex = 1;
            while (breakIndex <= remainingWord.length && font.widthOfTextAtSize(remainingWord.substring(0, breakIndex), fontSize) <= safeMaxWidth) {
              breakIndex++;
            }
            breakIndex--;
            if (breakIndex === 0) breakIndex = 1;
            lines.push(remainingWord.substring(0, breakIndex));
            remainingWord = remainingWord.substring(breakIndex);
          }
        }
      } else {
        let remainingWord = word;
        while (remainingWord.length > 0) {
          let breakIndex = 1;
          while (breakIndex <= remainingWord.length && font.widthOfTextAtSize(remainingWord.substring(0, breakIndex), fontSize) <= safeMaxWidth) {
            breakIndex++;
          }
          breakIndex--;
          if (breakIndex === 0) breakIndex = 1;
          lines.push(remainingWord.substring(0, breakIndex));
          remainingWord = remainingWord.substring(breakIndex);
        }
        currentLine = '';
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export default function ExcelToPdfTool() {
  const t = useTranslations('Tools');
  const commonT = useTranslations('Common');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [excelFile, setExcelFile] = useState<ExcelToPdfFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFile(files[0]);
    }
  };

  const addFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') return;

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
    trackToolUsed('excel-to-pdf');

    try {
      setExcelFile(prev => prev ? { ...prev, status: 'processing' } : null);

      const arrayBuffer = await excelFile.file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 50;
      const fontSize = 8;
      const colPadding = 5;

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (rows.length === 0) continue;

        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();
        
        if (isNaN(width) || width <= 0) width = 595.27;
        if (isNaN(height) || height <= 0) height = 841.89;

        let y = height - margin;

        // Add sheet name as title
        page.drawText(`Sheet: ${sheetName}`, {
          x: margin,
          y: y,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 20;

        const numCols = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
        if (numCols === 0) continue;

        const colWidths: number[] = new Array(numCols).fill(0);
        
        for (let j = 0; j < numCols; j++) {
          let maxW = 0;
          for (let i = 0; i < rows.length; i++) {
            const val = rows[i] ? rows[i][j] : undefined;
            const text = sanitizeText(val !== undefined && val !== null ? String(val) : '');
            const w = font.widthOfTextAtSize(text, fontSize);
            if (w > maxW) maxW = w;
          }
          colWidths[j] = Math.min(maxW + colPadding * 2, 200);
        }

        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        const availableWidth = width - margin * 2;
        if (totalWidth > 0 && totalWidth > availableWidth) {
          const scale = availableWidth / totalWidth;
          for (let j = 0; j < colWidths.length; j++) {
            colWidths[j] *= scale;
          }
        }

        for (let i = 0; i < rows.length; i++) {
          const isHeader = i === 0;
          const currentFont = isHeader ? boldFont : font;

          const cellLines = new Array(numCols).fill(['']);
          for (let j = 0; j < numCols; j++) {
            const val = rows[i] ? rows[i][j] : undefined;
            const text = sanitizeText(val !== undefined && val !== null ? String(val) : '');
            cellLines[j] = wrapText(text, colWidths[j] - colPadding * 2, currentFont, fontSize);
          }
          
          const maxLines = Math.max(...cellLines.map(l => l.length), 1);
          let currentRowHeight = maxLines * (fontSize + 2) + 10;
          if (isNaN(currentRowHeight) || currentRowHeight <= 0) currentRowHeight = 20;

          if (y < margin + currentRowHeight) {
            page = pdfDoc.addPage();
            y = height - margin;
          }

          let x = margin;
          for (let j = 0; j < numCols; j++) {
            const safeY = isNaN(y - currentRowHeight) ? 0 : y - currentRowHeight;
            page.drawRectangle({
              x,
              y: safeY,
              width: colWidths[j],
              height: currentRowHeight,
              borderColor: rgb(0.8, 0.8, 0.8),
              borderWidth: 0.5,
              color: isHeader ? rgb(0.95, 0.95, 0.95) : undefined,
            });

            const lines = cellLines[j] || [];
            lines.forEach((line: string, lineIdx: number) => {
              const textY = y - (lineIdx + 1) * (fontSize + 2) - 4;
              const safeTextY = isNaN(textY) ? 0 : textY;
              page.drawText(line, {
                x: x + colPadding,
                y: safeTextY,
                size: fontSize,
                font: currentFont,
                color: rgb(0, 0, 0),
              });
            });

            x += colWidths[j];
          }
          y -= currentRowHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setExcelFile(prev => prev ? { ...prev, status: 'completed', resultPdf: pdfBlob } : null);
    } catch (error) {
      console.error('Excel to PDF error:', error);
      setExcelFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('excel-to-pdf');
    }
  };

  const downloadPdf = () => {
    trackFileDownloaded('excel-to-pdf');
    if (!excelFile?.resultPdf) return;
    guardedDownload(() => {
      const url = URL.createObjectURL(excelFile!.resultPdf!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${excelFile!.file.name.split('.')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#1a1c21] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 gap-6 md:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 whitespace-nowrap">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t('excel-to-pdf')}</h3>
              <p className="text-gray-500 text-sm">{t('excel-to-pdf-desc')}</p>
            </div>
          </div>
          {excelFile && (
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
          {!excelFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFiles = Array.from(e.dataTransfer.files);
                if (droppedFiles.length > 0) addFile(droppedFiles[0]);
              }}
              className="border-2 border-dashed border-red-400/30 bg-red-400/5 rounded-[24px] p-8 md:p-20 text-center flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-red-400/50 hover:bg-red-400/10 whitespace-nowrap"
            >
              <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform whitespace-nowrap">
                <Upload size={32} />
              </div>
              <h4 className="text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{commonT('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">{t('excel-to-pdf-select-file-desc')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500 font-medium">
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
                className="bg-black/40 border border-gray-800 rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-800 flex items-center justify-center">
                  <FileSpreadsheet size={32} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{excelFile.file.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {(excelFile.file.size / 1024).toFixed(1)} KB • Excel
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {excelFile.status === 'completed' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                        <CheckCircle2 size={20} />
                        {t('excel-to-pdf-status-completed')}
                      </div>
                      <button onClick={downloadPdf}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                      >
                        <Download size={18} /> {t('excel-to-pdf-download')}
                      </button>
                    </div>
                  ) : excelFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      {t('excel-to-pdf-status-error')}
                    </div>
                  ) : (
                    <button onClick={processExcel}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-red-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> {t('excel-to-pdf-status-processing')}</>
                      ) : (
                        <><RefreshCw size={18} /> {t('excel-to-pdf-apply')}</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('excel-to-pdf-info-desc')}
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
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* SEO Content Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 mb-6 whitespace-nowrap">
            <Table size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{t('excel-to-pdf-f1-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('excel-to-pdf-f1-desc')}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{t('excel-to-pdf-f2-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('excel-to-pdf-f2-desc')}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">{t('excel-to-pdf-f3-title')}</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('excel-to-pdf-f3-desc')}
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
