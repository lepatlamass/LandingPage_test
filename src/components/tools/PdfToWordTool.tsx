"use client";

import React, { useState, useRef } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
import { useTranslations } from 'next-intl';
import WorkflowPrompts from './WorkflowPrompts';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface PdfToWordFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  totalPages: number;
  processedPages: number;
  wordBlob?: Blob;
  error?: string;
}

export default function PdfToWordTool() {
  const t = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const { guardedBlobDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate('pdf-to-word');
  const [files, setFiles] = useState<PdfToWordFile[]>([]);
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const newPdfFiles: PdfToWordFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'idle',
      totalPages: 0,
      processedPages: 0
    }));
    setFiles(prev => [...prev, ...newPdfFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFile = async (fileObj: PdfToWordFile) => {
    trackToolUsed('pdf-to-word');
    setFiles(prev => prev.map(f => 
      f.id === fileObj.id ? { ...f, status: 'processing', error: undefined } : f
    ));

    try {
      const arrayBuffer = await fileObj.file.arrayBuffer();
      
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjs = pdfjsLib.default || pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, totalPages: pdf.numPages } : f
      ));

      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];
        
        // Extract images
        const ops = await page.getOperatorList();
        const images: { buffer: ArrayBuffer, width: number, height: number }[] = [];

        for (let j = 0; j < ops.fnArray.length; j++) {
          const fn = ops.fnArray[j];
          if (
            fn === pdfjs.OPS.paintImageXObject ||
            fn === pdfjs.OPS.paintInlineImageXObject
          ) {
            try {
              let img: any = null;
              if (fn === pdfjs.OPS.paintImageXObject) {
                const objId = ops.argsArray[j][0];
                try {
                  // Synchronous get, as getOperatorList should have resolved it
                  img = page.objs.get(objId);
                } catch (e) {
                  console.warn('Object not resolved synchronously, trying callback...', e);
                  img = await new Promise<any>((resolve) => {
                    try {
                      page.objs.get(objId, (image: any) => {
                        resolve(image);
                      });
                    } catch (err) {
                      resolve(null);
                    }
                  });
                }
              } else {
                // paintInlineImageXObject passes the image object directly
                img = ops.argsArray[j][0];
              }

              if (img) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = img.width || 100;
                  canvas.height = img.height || 100;
                  
                  if (img.bitmap) {
                    ctx.drawImage(img.bitmap, 0, 0, canvas.width, canvas.height);
                  } else if (img instanceof HTMLImageElement || img instanceof ImageBitmap || img instanceof HTMLCanvasElement) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  } else if (img.data && img.width && img.height) {
                    const imgData = ctx.createImageData(img.width, img.height);
                    const data = img.data;
                    const out = imgData.data;
                    const pixels = img.width * img.height;
                    
                    if (data.length === pixels * 4) {
                      out.set(data);
                    } else if (data.length === pixels * 3) {
                      for (let i = 0, k = 0; i < pixels; i++) {
                        out[k++] = data[i * 3];
                        out[k++] = data[i * 3 + 1];
                        out[k++] = data[i * 3 + 2];
                        out[k++] = 255;
                      }
                    } else if (data.length === pixels) {
                      for (let i = 0, k = 0; i < pixels; i++) {
                        const val = data[i];
                        out[k++] = val;
                        out[k++] = val;
                        out[k++] = val;
                        out[k++] = 255;
                      }
                    } else {
                      const expected1Bpp = Math.ceil(img.width / 8) * img.height;
                      if (data.length === expected1Bpp) {
                        for (let y = 0; y < img.height; y++) {
                          for (let x = 0; x < img.width; x++) {
                            const byteIdx = y * Math.ceil(img.width / 8) + Math.floor(x / 8);
                            const bitIdx = 7 - (x % 8);
                            const val = ((data[byteIdx] >> bitIdx) & 1) ? 255 : 0;
                            const outIdx = (y * img.width + x) * 4;
                            out[outIdx] = val;
                            out[outIdx + 1] = val;
                            out[outIdx + 2] = val;
                            out[outIdx + 3] = 255;
                          }
                        }
                      } else {
                        for (let i = 0, k = 0; i < data.length && k < out.length; i++, k += 4) {
                          out[k] = data[i];
                          out[k + 1] = data[i];
                          out[k + 2] = data[i];
                          out[k + 3] = 255;
                        }
                      }
                    }
                    ctx.putImageData(imgData, 0, 0);
                  }
                  
                  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                  if (blob) {
                    const arrayBuffer = await blob.arrayBuffer();
                    images.push({ buffer: arrayBuffer, width: canvas.width, height: canvas.height });
                  }
                }
              }
            } catch (e) {
              console.error('Error extracting image:', e);
            }
          }
        }

        let lastY = -1;
        let currentLine = '';

        // Sort items to try to reconstruct lines
        const sortedItems = items.sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        for (const item of sortedItems) {
          const y = item.transform[5];
          if (lastY !== -1 && Math.abs(lastY - y) > 5) {
            if (currentLine.trim()) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun({ text: currentLine.trim(), size: 24 })],
                  spacing: { after: 120 }
                })
              );
            }
            currentLine = '';
          }
          currentLine += item.str + ' ';
          lastY = y;
        }

        if (currentLine.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: currentLine.trim(), size: 24 })],
              spacing: { after: 120 }
            })
          );
        }

        // Add extracted images
        for (const img of images) {
          const maxWidth = 600;
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (maxWidth / w) * h;
            w = maxWidth;
          }
          
          paragraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.buffer,
                  transformation: {
                    width: w,
                    height: h,
                  },
                  type: 'png'
                }),
              ],
              spacing: { after: 120 }
            })
          );
        }

        // Add page break if not last page
        if (i < pdf.numPages) {
          paragraphs.push(new Paragraph({ pageBreakBefore: true }));
        }

        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, processedPages: i } : f
        ));
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ children: [new TextRun("No text found in PDF.")] })],
        }],
      });

      const blob = await Packer.toBlob(doc);

      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: 'completed',
          wordBlob: blob
        } : f
      ));

    } catch (error) {
      console.error('Error processing PDF:', error);
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
    files.filter(f => f.status === 'idle' || f.status === 'error').forEach(processFile);
  };

  const downloadFile = (fileObj: PdfToWordFile) => {
    if (!fileObj.wordBlob) return;
    guardedBlobDownload(fileObj.wordBlob, fileObj.file.name.replace(/\.pdf$/i, '.docx'));
  };

  const downloadAll = () => {
    trackFileDownloaded('pdf-to-word');
    files.filter(f => f.status === 'completed').forEach(downloadFile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        multiple
        className="hidden"
      />

      {files.length === 0 ? (
        /* Upload Area */
        <div 
          className={`relative border-2 border-dashed rounded-[32px] p-6 md:p-12 text-center transition-all duration-300 ease-out overflow-hidden ${
            isDragging 
              ? 'border-[#d4ff33] bg-[#d4ff33]/10 scale-[1.02] shadow-md' 
              : 'border-gray-700 bg-white dark:bg-[#1a1c21] hover:border-gray-600 hover:bg-black/5 dark:hover:bg-[#22252b]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
              {t('pdf-to-word-desc')}
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#d4ff33] text-black px-5 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-[#c2eb2e] transition-all hover:scale-105 active:scale-95 border border-black shadow-md flex items-center gap-3 whitespace-nowrap"
            >
              <FileText size={24} />
              {tCommon('chooseFiles')}
            </button>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-6 font-medium">
              Supports PDF files
            </p>
          </div>
        </div>
      ) : (
        /* Redesigned Staged Files View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1c21] border border-zinc-200 dark:border-gray-800 rounded-[32px] p-6 md:p-8 shadow-xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-gray-850">
            <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <FileText className="text-[#d4ff33]" />
              Staged Files ({files.length})
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#d4ff33]/10 text-black dark:text-[#d4ff33] border border-[#d4ff33]/20 dark:border-[#d4ff33]/30 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#d4ff33]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus size={16} />
                Add Files
              </button>
              <button
                onClick={() => setFiles([])}
                className="text-gray-500 hover:text-red-400 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
                title="Clear all files"
              >
                <X size={16} />
                Clear All
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="grid gap-4 max-h-[320px] overflow-y-auto pr-1">
            {files.map((fileObj) => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-gray-400 dark:hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/5 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-black dark:text-white font-medium truncate mb-1">
                    {fileObj.file.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {fileObj.status === 'processing' && (
                      <span className="text-[#d4ff33] flex items-center gap-1 font-medium">
                        <Loader2 size={14} className="animate-spin" />
                        Processing ({fileObj.processedPages}/{fileObj.totalPages})
                      </span>
                    )}
                    {fileObj.status === 'completed' && (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={14} />
                        Ready
                      </span>
                    )}
                    {fileObj.status === 'error' && (
                      <span className="text-red-400 flex items-center gap-1 font-medium">
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
                      className="p-2 text-black dark:text-gray-450 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors whitespace-nowrap"
                      title="Convert to Word"
                    >
                      <RefreshCw size={20} />
                    </button>
                  )}
                  {fileObj.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(fileObj)}
                      className="p-2 text-black dark:text-gray-450 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors whitespace-nowrap"
                      title="Download Word"
                    >
                      <Download size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-2 text-gray-600 dark:text-gray-455 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors whitespace-nowrap"
                    title="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Button Panel */}
          <div className="pt-4 border-t border-zinc-150 dark:border-gray-800">
            {files.some(f => f.status === 'processing') ? (
              <button
                disabled
                className="w-full bg-zinc-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 cursor-not-allowed border border-transparent dark:border-white/5"
              >
                <Loader2 className="animate-spin text-[#d4ff33]" size={22} />
                Converting document(s)...
              </button>
            ) : files.some(f => f.status === 'idle' || f.status === 'error') ? (
              <button
                onClick={processAll}
                className="w-full bg-[#d4ff33] text-black hover:bg-[#c2eb2e] py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 border border-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              >
                <RefreshCw size={22} />
                Convert to Word
              </button>
            ) : files.some(f => f.status === 'completed') ? (
              <button
                onClick={downloadAll}
                className="w-full bg-emerald-450 hover:bg-emerald-500 text-black py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 border border-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 bg-[#d4ff33] hover:bg-[#c2eb2e]"
              >
                <Download size={22} />
                Download Word Document{files.filter(f => f.status === 'completed').length > 1 ? 's' : ''}
              </button>
            ) : null}
          </div>

          {files.some(f => f.status === 'completed') && (
            <WorkflowPrompts currentTool="pdf-to-word" />
          )}
        </motion.div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
