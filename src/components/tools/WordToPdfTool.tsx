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
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface WordToPdfFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  pdfBlob?: Blob;
  error?: string;
}

export default function WordToPdfTool() {
  const t = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [files, setFiles] = useState<WordToPdfFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.name.endsWith('.docx') || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        f.name.endsWith('.docx') || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const newWordFiles: WordToPdfFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'idle'
    }));
    setFiles(prev => [...prev, ...newWordFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (fileObj: WordToPdfFile) => {
    setFiles(prev => prev.map(f => 
      f.id === fileObj.id ? { ...f, status: 'processing', error: undefined } : f
    ));

    try {
      const arrayBuffer = await fileObj.file.arrayBuffer();
      
      // 1. Convert DOCX to HTML to extract both text and images
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      // 2. Create a new PDF document using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const width = 595.28; // A4 width in points
      const height = 841.89; // A4 height in points
      const maxWidth = width - margin * 2;

      // Custom wrapText function using font metrics from pdf-lib
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Parse the HTML to iterate through elements
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const nodes = Array.from(doc.body.childNodes);

      let page = pdfDoc.addPage([width, height]);
      let y = height - margin;
      const lineHeight = fontSize * 1.4;

      for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          
          if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(el.tagName)) {
            const text = el.innerText || el.textContent || '';
            if (!text.trim()) {
              y -= lineHeight; // Empty line
              continue;
            }

            const lines = wrapText(text, maxWidth);
            for (const line of lines) {
              if (y < margin + lineHeight) {
                page = pdfDoc.addPage([width, height]);
                y = height - margin;
              }
              page.drawText(line, {
                x: margin,
                y: y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
              y -= lineHeight;
            }
            y -= lineHeight * 0.5; // Spacing between blocks
          } else if (el.tagName === 'IMG') {
            const src = el.getAttribute('src');
            if (src && src.startsWith('data:image/')) {
              try {
                const base64Data = src.split(',')[1];
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                
                let image;
                if (src.includes('image/png')) {
                  image = await pdfDoc.embedPng(imageBytes);
                } else if (src.includes('image/jpeg') || src.includes('image/jpg')) {
                  image = await pdfDoc.embedJpg(imageBytes);
                } else {
                  continue; // Unsupported format for pdf-lib direct embedding
                }

                const dims = image.scaleToFit(maxWidth, height * 0.4);
                
                if (y < margin + dims.height) {
                  page = pdfDoc.addPage([width, height]);
                  y = height - margin;
                }

                page.drawImage(image, {
                  x: margin + (maxWidth - dims.width) / 2,
                  y: y - dims.height,
                  width: dims.width,
                  height: dims.height,
                });
                y -= dims.height + lineHeight;
              } catch (imgErr) {
                console.warn('Failed to embed image:', imgErr);
              }
            }
          }
        }
      }

      // 4. Output as Blob
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: 'completed',
          pdfBlob
        } : f
      ));

    } catch (error) {
      console.error('Error processing Word file:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        } : f
      ));
    }
  };

  const processAll = () => {
    files.filter(f => f.status === 'idle' || f.status === 'error').forEach(f => {
      trackToolUsed('word-to-pdf');
      processFile(f);
    });
  };

  const downloadFile = (fileObj: WordToPdfFile) => {
    if (!fileObj.pdfBlob) return;
    guardedDownload(() => {
      const url = URL.createObjectURL(fileObj.pdfBlob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileObj.file.name.replace(/\.docx$/i, '.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const downloadAll = () => {
    trackFileDownloaded('word-to-pdf');
    files.filter(f => f.status === 'completed').forEach(downloadFile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-[32px] p-6 md:p-12 text-center transition-all duration-300 ease-out overflow-hidden ${
          isDragging 
            ? 'border-[#d4ff33] bg-[#d4ff33]/10 scale-[1.02] shadow-2xl shadow-[#d4ff33]/20' 
            : 'border-gray-700 bg-white dark:bg-[#1a1c21] hover:border-gray-600 hover:bg-black/5 dark:hover:bg-[#22252b]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".docx"
          multiple
          className="hidden"
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
            isDragging ? 'bg-[#d4ff33] text-black scale-110' : 'bg-white dark:bg-gray-800 text-black dark:text-gray-400'
          }`}>
            <Upload size={32} className={isDragging ? 'animate-bounce' : ''} />
          </div>
          
          <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
            {tCommon('dropFilesHere')}
          </h3>
          <p className="text-black dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('word-to-pdf-desc')}
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#d4ff33] text-black px-5 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-[#c2eb2e] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#d4ff33]/20 flex items-center gap-3 whitespace-nowrap"
          >
            <FileText size={24} />
            {tCommon('chooseFiles')}
          </button>
          
          <p className="text-black dark:text-gray-500 text-sm mt-6 font-medium">
            Supports DOCX files
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <FileText className="text-[#d4ff33]" />
              Files ({files.length})
            </h3>
            <div className="flex gap-3">
              {files.some(f => f.status === 'idle' || f.status === 'error') && (
                <button
                  onClick={processAll}
                  className="bg-white/10 text-black dark:text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <RefreshCw size={18} />
                  Process All
                </button>
              )}
              {files.some(f => f.status === 'completed') && (
                <button
                  onClick={downloadAll}
                  className="bg-[#d4ff33] text-black px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-xl font-bold hover:bg-[#c2eb2e] transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={18} />
                  Download All
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {files.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="text-blue-400" size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-black dark:text-white font-medium truncate mb-1">
                    {fileObj.file.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-black dark:text-gray-500">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {fileObj.status === 'processing' && (
                      <span className="text-[#d4ff33] flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Processing...
                      </span>
                    )}
                    {fileObj.status === 'completed' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Ready
                      </span>
                    )}
                    {fileObj.status === 'error' && (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {fileObj.error || 'Error'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {fileObj.status === 'idle' && (
                    <button
                      onClick={() => processFile(fileObj)}
                      className="p-2 text-black dark:text-gray-400 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors whitespace-nowrap"
                      title="Convert to PDF"
                    >
                      <RefreshCw size={20} />
                    </button>
                  )}
                  {fileObj.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(fileObj)}
                      className="p-2 text-black dark:text-gray-400 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors whitespace-nowrap"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-2 text-black dark:text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors whitespace-nowrap"
                    title="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
