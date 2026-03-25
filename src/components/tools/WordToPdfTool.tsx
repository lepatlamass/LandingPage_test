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
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

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
      
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Create PDF
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(text, 180);
      
      let y = 10;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(splitText[i], 10, y);
        y += 7;
      }

      const pdfBlob = doc.output('blob');

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
    files.filter(f => f.status === 'idle' || f.status === 'error').forEach(processFile);
  };

  const downloadFile = (fileObj: WordToPdfFile) => {
    if (!fileObj.pdfBlob) return;
    
    const url = URL.createObjectURL(fileObj.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.file.name.replace(/\.docx$/i, '.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.filter(f => f.status === 'completed').forEach(downloadFile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-300 ease-out overflow-hidden ${
          isDragging 
            ? 'border-[#d4ff33] bg-[#d4ff33]/10 scale-[1.02] shadow-2xl shadow-[#d4ff33]/20' 
            : 'border-gray-700 bg-[#1a1c21] hover:border-gray-600 hover:bg-[#22252b]'
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
            isDragging ? 'bg-[#d4ff33] text-black scale-110' : 'bg-gray-800 text-gray-400'
          }`}>
            <Upload size={32} className={isDragging ? 'animate-bounce' : ''} />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            {tCommon('dropFilesHere')}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {t('word-to-pdf-desc')}
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#d4ff33] text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#c2eb2e] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#d4ff33]/20 flex items-center gap-3"
          >
            <FileText size={24} />
            {tCommon('chooseFiles')}
          </button>
          
          <p className="text-gray-500 text-sm mt-6 font-medium">
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
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#d4ff33]" />
              Files ({files.length})
            </h3>
            <div className="flex gap-3">
              {files.some(f => f.status === 'idle' || f.status === 'error') && (
                <button
                  onClick={processAll}
                  className="bg-white/10 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Process All
                </button>
              )}
              {files.some(f => f.status === 'completed') && (
                <button
                  onClick={downloadAll}
                  className="bg-[#d4ff33] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#c2eb2e] transition-colors flex items-center gap-2"
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
                className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="text-blue-400" size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate mb-1">
                    {fileObj.file.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">
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
                      className="p-2 text-gray-400 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors"
                      title="Convert to PDF"
                    >
                      <RefreshCw size={20} />
                    </button>
                  )}
                  {fileObj.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(fileObj)}
                      className="p-2 text-gray-400 hover:text-[#d4ff33] hover:bg-[#d4ff33]/10 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
    </div>
  );
}
