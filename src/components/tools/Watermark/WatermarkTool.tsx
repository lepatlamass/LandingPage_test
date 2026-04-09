"use client";

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  Droplets, 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  AlertCircle,
  FileText,
  Settings2,
  Maximize2,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDocument, rgb } from 'pdf-lib';

interface WatermarkSettings {
  position: 'top' | 'center' | 'bottom';
  size: 'small' | 'medium' | 'large';
  opacity: number;
  color: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf';
  processed?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}



export default function WatermarkTool() {
  const t = useTranslations('Tools');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [watermarkType, setWatermarkType] = useState<'image' | 'text'>('image');
  const [watermark, setWatermark] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [settings, setSettings] = useState<WatermarkSettings>({
    position: 'center',
    size: 'medium',
    opacity: 50,
    color: '#ffffff'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach(file => {
      const isPdf = file.type === 'application/pdf';
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = isPdf ? '' : event.target?.result as string;
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          type: isPdf ? 'pdf' : 'image',
          status: 'pending'
        }]);
      };
      if (isPdf) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleWatermarkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWatermark(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const applyImageWatermark = async (imageSrc: string, watermarkSrc: string | null, text: string | null, settings: WatermarkSettings): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not available');

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw subject
        ctx.drawImage(img, 0, 0);

        if (watermarkSrc) {
          const wm = new Image();
          wm.onload = () => {
            // Calculate watermark size
            let wmWidth, wmHeight;
            const scale = settings.size === 'small' ? 0.1 : settings.size === 'medium' ? 0.2 : 0.3;
            
            if (wm.width > wm.height) {
              wmWidth = canvas.width * scale;
              wmHeight = (wm.height / wm.width) * wmWidth;
            } else {
              wmHeight = canvas.height * scale;
              wmWidth = (wm.width / wm.height) * wmHeight;
            }

            // Calculate position
            let x = (canvas.width - wmWidth) / 2;
            let y;
            if (settings.position === 'top') {
              y = canvas.height * 0.05;
            } else if (settings.position === 'center') {
              y = (canvas.height - wmHeight) / 2;
            } else {
              y = canvas.height - wmHeight - (canvas.height * 0.05);
            }

            // Draw watermark
            ctx.globalAlpha = settings.opacity / 100;
            ctx.drawImage(wm, x, y, wmWidth, wmHeight);
            ctx.globalAlpha = 1.0;

            resolve(canvas.toDataURL('image/png'));
          };
          wm.src = watermarkSrc;
        } else if (text) {
          // Draw text watermark
          const fontSize = settings.size === 'small' ? canvas.width * 0.03 : settings.size === 'medium' ? canvas.width * 0.06 : canvas.width * 0.1;
          ctx.font = `bold ${fontSize}px sans-serif`;
          
          // Convert hex to rgba
          const hex = settings.color.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${settings.opacity / 100})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Add a subtle shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          let x = canvas.width / 2;
          let y;
          if (settings.position === 'top') {
            y = canvas.height * 0.1;
          } else if (settings.position === 'center') {
            y = canvas.height / 2;
          } else {
            y = canvas.height * 0.9;
          }

          ctx.fillText(text, x, y);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = imageSrc;
    });
  };

  const applyPdfWatermark = async (pdfBuffer: ArrayBuffer, watermarkSrc: string | null, text: string | null, settings: WatermarkSettings): Promise<string> => {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const scale = settings.size === 'small' ? 0.1 : settings.size === 'medium' ? 0.2 : 0.3;

    if (watermarkSrc) {
      const watermarkImageBytes = await fetch(watermarkSrc).then(res => res.arrayBuffer());
      
      // Detect watermark type
      let watermarkImage;
      if (watermarkSrc.includes('image/png')) {
        watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
      } else {
        watermarkImage = await pdfDoc.embedJpg(watermarkImageBytes);
      }

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        let wmWidth, wmHeight;
        if (watermarkImage.width > watermarkImage.height) {
          wmWidth = width * scale;
          wmHeight = (watermarkImage.height / watermarkImage.width) * wmWidth;
        } else {
          wmHeight = height * scale;
          wmWidth = (watermarkImage.width / watermarkImage.height) * wmHeight;
        }

        let x = (width - wmWidth) / 2;
        let y;
        if (settings.position === 'top') {
          y = height - wmHeight - (height * 0.05);
        } else if (settings.position === 'center') {
          y = (height - wmHeight) / 2;
        } else {
          y = height * 0.05;
        }

        page.drawImage(watermarkImage, {
          x,
          y,
          width: wmWidth,
          height: wmHeight,
          opacity: settings.opacity / 100,
        });
      }
    } else if (text) {
      const font = await pdfDoc.embedFont('Helvetica-Bold');
      
      // Convert hex to RGB for pdf-lib
      const hex = settings.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = settings.size === 'small' ? 20 : settings.size === 'medium' ? 40 : 60;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x = (width - textWidth) / 2;
        let y;
        if (settings.position === 'top') {
          y = height * 0.9;
        } else if (settings.position === 'center') {
          y = (height - fontSize) / 2;
        } else {
          y = height * 0.1;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: settings.opacity / 100,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const startProcessing = async () => {
    if (files.length === 0 || (watermarkType === 'image' && !watermark) || (watermarkType === 'text' && !watermarkText)) return;
    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      if (fileObj.status === 'completed') continue;

      try {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'processing' } : f));

        let result: string;
        if (fileObj.type === 'image') {
          result = await applyImageWatermark(
            fileObj.preview, 
            watermarkType === 'image' ? watermark : null, 
            watermarkType === 'text' ? watermarkText : null, 
            settings
          );
        } else {
          const buffer = await fileObj.file.arrayBuffer();
          result = await applyPdfWatermark(
            buffer, 
            watermarkType === 'image' ? watermark : null, 
            watermarkType === 'text' ? watermarkText : null, 
            settings
          );
        }

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed', processed: result } : f));
      } catch (error) {
        console.error("Watermark error:", error);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: "Failed to apply watermark" } : f));
      }
    }

    setIsProcessing(false);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Upload Subject */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('watermark-upload-subject')}
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border border-gray-800 bg-[#1a1c21] rounded-2xl p-12 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                "hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                accept="image/*,application/pdf"
                className="hidden" 
              />
              <Upload className="w-10 h-10 text-gray-500 mb-4 group-hover:text-[#3b82f6] transition-colors" />
              <p className="text-sm font-bold text-white mb-1">
                {t('watermark-click-to-upload')} <span className="font-normal text-gray-400">{t('watermark-or-drag-drop')}</span>
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Images ou PDF
              </p>
            </div>
          </div>

          {/* Step 2: Configure Watermark */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('watermark-upload-watermark')}
            </h3>
            <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-6 space-y-6">
              <div className="flex gap-4">
                {(['image', 'text'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWatermarkType(type)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      watermarkType === type 
                        ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20" 
                        : "bg-black text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                    {t(`watermark-type-${type}`)}
                  </button>
                ))}
              </div>

              {watermarkType === 'image' ? (
                <div 
                  onClick={() => watermarkInputRef.current?.click()}
                  className={cn(
                    "relative border border-dashed border-gray-800 bg-black/40 rounded-xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                    watermark ? "border-[#3b82f6]/30" : "hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
                  )}
                >
                  <input 
                    type="file" 
                    ref={watermarkInputRef} 
                    onChange={handleWatermarkSelect} 
                    accept="image/*"
                    className="hidden" 
                  />
                  {watermark ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-800">
                      <img src={watermark} alt="Watermark" className="w-full h-full object-contain" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setWatermark(null); }}
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-500 mb-2 group-hover:text-[#3b82f6] transition-colors" />
                      <p className="text-xs font-bold text-white">{t('watermark-select-watermark')}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {t('watermark-text-label')}
                  </label>
                  <input 
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder={t('watermark-text-placeholder')}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Customization */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {t('watermark-customization')}
            </h3>
            <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Position */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={14} /> {t('watermark-position')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSettings(s => ({ ...s, position: pos }))}
                      className={cn(
                        "py-2 px-4 rounded-lg text-xs font-bold transition-all capitalize",
                        settings.position === pos ? "bg-[#3b82f6] text-white" : "bg-black text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 size={14} /> {t('watermark-size')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSettings(s => ({ ...s, size: sz }))}
                      className={cn(
                        "py-2 px-4 rounded-lg text-xs font-bold transition-all capitalize",
                        settings.size === sz ? "bg-[#3b82f6] text-white" : "bg-black text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14} /> {t('watermark-opacity')} ({settings.opacity}%)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.opacity}
                  onChange={(e) => setSettings(s => ({ ...s, opacity: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Color (Only for Text) */}
              {watermarkType === 'text' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Droplets size={14} /> {t('watermark-color')}
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={settings.color}
                      onChange={(e) => setSettings(s => ({ ...s, color: e.target.value }))}
                      className="w-12 h-12 bg-black border border-gray-800 rounded-lg cursor-pointer p-1"
                    />
                    <span className="text-xs font-mono text-gray-400 uppercase">{settings.color}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={startProcessing}
            disabled={isProcessing || files.length === 0 || (watermarkType === 'image' && !watermark) || (watermarkType === 'text' && !watermarkText)}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm",
              isProcessing || files.length === 0 || (watermarkType === 'image' && !watermark) || (watermarkType === 'text' && !watermarkText)
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-blue-500/20"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('watermark-processing')}
              </>
            ) : (
              <>
                <Droplets className="w-5 h-5" />
                {t('watermark-apply')}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-50">{t('watermark-preview')}</h3>
          <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <div className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center text-center p-8 overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                {files.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-medium text-gray-400">{t('watermark-empty-preview')}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="previews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide"
                  >
                    {files.map((f) => (
                      <div key={f.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {f.type === 'image' ? (
                              <img src={f.preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="text-gray-400" size={24} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{f.file.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{f.type}</p>
                          </div>
                          <button 
                            onClick={() => setFiles(prev => prev.filter(item => item.id !== f.id))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        {f.status === 'completed' && f.processed && (
                          <button 
                            onClick={() => downloadFile(f.processed!, `watermarked-${f.file.name}`)}
                            className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                          >
                            <Download size={12} />
                            {t('watermark-download')}
                          </button>
                        )}

                        {f.status === 'processing' && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500">
                            <Loader2 size={12} className="animate-spin" />
                            {t('watermark-processing')}
                          </div>
                        )}

                        {f.status === 'error' && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-red-500">
                            <AlertCircle size={12} />
                            Erreur
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {files.length > 0 && (
              <button 
                onClick={() => setFiles([])}
                className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors font-bold uppercase tracking-widest"
              >
                {t('watermark-clear-all')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
