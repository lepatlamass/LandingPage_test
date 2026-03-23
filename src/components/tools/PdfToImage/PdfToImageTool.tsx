"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  FileArchive,
  ChevronDown,
  Settings,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type OutputFormat = 'jpeg' | 'png';

interface PdfFile {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  totalPages: number;
  processedPages: number;
  resultZip?: Blob;
  error?: string;
}

export default function PdfToImageTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
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
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      const folder = zip.folder("images");

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0 for high resolution
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) throw new Error('Could not get canvas context');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const mimeType = `image/${outputFormat}`;
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), mimeType, 0.9);
        });

        if (blob) {
          folder?.file(`page-${i}.${outputFormat}`, blob);
        }

        setPdfFile(prev => prev ? { ...prev, processedPages: i } : null);
      }

      const resultZip = await zip.generateAsync({ type: 'blob' });
      setPdfFile(prev => prev ? { ...prev, status: 'completed', resultZip } : null);
    } catch (error) {
      console.error('PDF Processing error:', error);
      setPdfFile(prev => prev ? { ...prev, status: 'error', error: 'Failed' } : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!pdfFile?.resultZip) return;
    const url = URL.createObjectURL(pdfFile.resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfFile.file.name.split('.')[0]}-images.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[#1a1c21] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">PDF to Image</h3>
              <p className="text-gray-500 text-sm">Convert PDF pages into high-quality images</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800">
              {(['png', 'jpeg'] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputFormat === f 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            {pdfFile && (
              <button 
                onClick={removeFile}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="Clear all"
              >
                <X size={20} />
              </button>
            )}
          </div>
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
              className="border-2 border-dashed border-red-400/30 bg-red-400/5 rounded-[24px] p-20 flex flex-col items-center justify-center group cursor-pointer transition-all hover:border-red-400/50 hover:bg-red-400/10"
            >
              <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{t('chooseFiles')}</h4>
              <p className="text-gray-500 text-sm mb-8">Select a PDF file to convert</p>
              <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
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
                        <span>Processing Pages...</span>
                        <span>{Math.round((pdfFile.processedPages / pdfFile.totalPages) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-500"
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
                        Converted
                      </div>
                      <button 
                        onClick={downloadResult}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                      >
                        <FileArchive size={18} /> Download ZIP
                      </button>
                    </div>
                  ) : pdfFile.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      Failed
                    </div>
                  ) : (
                    <button 
                      onClick={processPdf}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20"
                    >
                      {isProcessing ? (
                        <><Loader2 size={18} className="animate-spin" /> Converting...</>
                      ) : (
                        <><RefreshCw size={18} /> Convert to {outputFormat.toUpperCase()}</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <AlertCircle size={20} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every page of your PDF will be converted into a separate high-resolution image file. All images will be bundled into a single ZIP archive for easy downloading.
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
          <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 mb-6">
            <ImageIcon size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">High Fidelity</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            We render PDF pages at 2x scale to ensure your resulting images are sharp, clear, and professional-quality.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
            <Zap size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">Fast Extraction</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            Our optimized rendering engine processes multi-page documents quickly, converting dozens of pages in seconds.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-white font-bold mb-4">100% Private</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            All processing happens locally in your browser. Your sensitive documents never leave your computer.
          </p>
        </div>
      </div>
    </div>
  );
}
