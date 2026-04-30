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

// No longer using jsPDF

const sanitizeText = (text: string): string => {
  // pdf-lib's standard fonts only support WinAnsi encoding.
  // Characters outside this range (like 0x009f) will cause a crash.
  // We'll replace non-WinAnsi characters with a placeholder.
  return text.replace(/[^\x00-\x7F\xA0-\xFF\u20AC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u2122\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192]/g, '?');
};

const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
        // Check if the single word is still too long
        if (font.widthOfTextAtSize(currentLine, fontSize) > maxWidth) {
          let remainingWord = currentLine;
          currentLine = '';
          while (remainingWord.length > 0) {
            let breakIndex = 1;
            while (breakIndex <= remainingWord.length && font.widthOfTextAtSize(remainingWord.substring(0, breakIndex), fontSize) <= maxWidth) {
              breakIndex++;
            }
            breakIndex--;
            if (breakIndex === 0) breakIndex = 1;
            lines.push(remainingWord.substring(0, breakIndex));
            remainingWord = remainingWord.substring(breakIndex);
          }
        }
      } else {
        // Word itself is too long, must break it
        let remainingWord = word;
        while (remainingWord.length > 0) {
          let breakIndex = 1;
          while (breakIndex <= remainingWord.length && font.widthOfTextAtSize(remainingWord.substring(0, breakIndex), fontSize) <= maxWidth) {
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

interface CsvToPdfFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultPdf?: Blob;
  error?: string;
}

export default function CsvToPdfTool() {
  const t = useTranslations('Common');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [csvFile, setCsvFile] = useState<CsvToPdfFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFile(files[0]);
    }
  };

  const addFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) return;

    setCsvFile({
      id: Math.random().toString(36).substring(2, 11),
      file,
      status: 'idle'
    });
  };

  const removeFile = () => {
    setCsvFile(null);
    setIsProcessing(false);
  };

  const processCsv = async () => {
    if (!csvFile || isProcessing) return;
    setIsProcessing(true);
    trackToolUsed('csv-to-pdf');

    try {
      setCsvFile(prev => prev ? { ...prev, status: 'processing' } : null);

      const arrayBuffer = await csvFile.file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (rows.length === 0) throw new Error('Empty CSV file');

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 50;
      const fontSize = 8;
      const colPadding = 5;

      let page = pdfDoc.addPage();
      let { width, height } = page.getSize();
      let y = height - margin;

      // Calculate column widths based on content
      const numCols = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
      const colWidths: number[] = new Array(numCols).fill(0);
      
      for (let j = 0; j < numCols; j++) {
        let maxW = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!Array.isArray(row)) continue;
          const text = sanitizeText(String(row[j] || ''));
          const w = font.widthOfTextAtSize(text, fontSize);
          if (w > maxW) maxW = w;
        }
        colWidths[j] = Math.min(maxW + colPadding * 2, 200);
      }

      // Adjust colWidths if they exceed page width
      const totalWidth = colWidths.reduce((a, b) => a + b, 0);
      const availableWidth = width - margin * 2;
      if (totalWidth > availableWidth) {
        const scale = availableWidth / totalWidth;
        for (let j = 0; j < colWidths.length; j++) {
          colWidths[j] *= scale;
        }
      }

      for (let i = 0; i < rows.length; i++) {
        const isHeader = i === 0;
        const currentFont = isHeader ? boldFont : font;

        // Pre-calculate wrapped lines for the whole row to determine row height
        const currentRow = rows[i] || [];
        const cellLines = currentRow.map((cell, j) => 
          wrapText(sanitizeText(String(cell || '')), colWidths[j] - colPadding * 2, currentFont, fontSize)
        );
        
        const maxLines = cellLines.reduce((max, lines) => Math.max(max, lines.length), 1);
        const currentRowHeight = maxLines * (fontSize + 2) + 10;

        if (y < margin + currentRowHeight) {
          page = pdfDoc.addPage();
          y = height - margin;
        }

        let x = margin;
        for (let j = 0; j < numCols; j++) {
          // Draw cell border
          page.drawRectangle({
            x,
            y: y - currentRowHeight,
            width: colWidths[j],
            height: currentRowHeight,
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 0.5,
            color: isHeader ? rgb(0.95, 0.95, 0.95) : undefined,
          });

          // Draw wrapped text
          const lines = cellLines[j] || [];
          lines.forEach((line, lineIdx) => {
            page.drawText(line, {
              x: x + colPadding,
              y: y - (lineIdx + 1) * (fontSize + 2) - 4,
              size: fontSize,
              font: currentFont,
              color: rgb(0, 0, 0),
            });
          });

          x += colWidths[j];
        }
        y -= currentRowHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setCsvFile(prev => prev ? { ...prev, status: 'completed', resultPdf: pdfBlob } : null);
    } catch (error) {
      console.error('CSV to PDF error:', error);
      setCsvFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
      trackToolCompleted('csv-to-pdf');
    }
  };

  const downloadPdf = () => {
    trackFileDownloaded('csv-to-pdf');
    if (!csvFile?.resultPdf) return;
    guardedDownload(() => {
      const url = URL.createObjectURL(csvFile!.resultPdf!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${csvFile!.file.name.split('.')[0]}.pdf`;
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
              <h3 className="text-xl font-bold text-white">CSV to PDF</h3>
              <p className="text-gray-500 text-sm">Convert structured CSV data into professional PDF tables</p>
            </div>
          </div>
          {csvFile && (
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
          {!csvFile ? (
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
              <h4 className="text-white font-bold text-base md:text-lg mb-2 whitespace-nowrap">{t('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">Select a CSV file to convert</p>
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
                  <FileSpreadsheet size={32} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{csvFile.file.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {(csvFile.file.size / 1024).toFixed(1)} KB • CSV
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {csvFile.status === 'completed' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                        <CheckCircle2 size={20} />
                        Converted
                      </div>
                      <button onClick={downloadPdf}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                      >
                        <Download size={18} /> Download PDF
                      </button>
                    </div>
                  ) : csvFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      Failed
                    </div>
                  ) : (
                    <button onClick={processCsv}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 sm:px-8 sm:py-3 bg-red-500 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> Converting...</>
                      ) : (
                        <><RefreshCw size={18} /> Convert to PDF</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Table size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your CSV data will be formatted into a clean, professional grid table within a PDF document. This is perfect for generating reports or sharing data in a non-editable format.
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
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 mb-6 whitespace-nowrap">
            <Table size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Professional Tables</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Automatically generates clean, readable tables with headers and grid lines from your raw CSV data.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Instant Conversion</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            No waiting for server uploads. Your PDF is generated instantly in your browser session.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Secure & Private</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your data stays on your device. All processing happens locally, ensuring maximum privacy for your sensitive information.
          </p>
        </div>
      </div>
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
