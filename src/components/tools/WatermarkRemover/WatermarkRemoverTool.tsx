"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  AlertCircle,
  Eraser,
  Undo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useAIGate } from '@/hooks/useAIGate';
import AIGateModal from '@/components/auth/AIGateModal';
import { processWatermarkRemoval } from '@/lib/ai/gemini';
import { consumeAICredit } from '@/lib/firestore/licenses';
import { auth } from '@/lib/firebase';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

interface ProcessedImage {
  id: string;
  original: string;
  processed?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}



export default function WatermarkRemoverTool() {
  const t = useTranslations('Tools');
  const commonT = useTranslations('Common');
  const { guardedAction, modalState, closeModal, onLoginSuccess } = useAIGate();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImages([{
        id: Math.random().toString(36).substr(2, 9),
        original: base64,
        status: 'pending'
      }]);
      setHasDrawn(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (images.length > 0 && images[0].original && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions to fit container
        const container = containerRef.current;
        if (!container) return;
        
        const maxWidth = container.clientWidth;
        const maxHeight = 600;
        
        let width = img.width;
        let height = img.height;
        
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Initialize mask canvas
        if (maskCanvasRef.current) {
          const maskCanvas = maskCanvasRef.current;
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext('2d');
          if (maskCtx) {
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, width, height);
          }
        }
      };
      img.src = images[0].original;
    }
  }, [images]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    maskCtx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !maskCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!ctx || !maskCtx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(212, 255, 51, 0.5)'; // Semi-transparent lime

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Draw on mask (white on black)
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.strokeStyle = 'white';
    maskCtx.lineTo(x, y);
    maskCtx.stroke();
    maskCtx.beginPath();
    maskCtx.moveTo(x, y);
    
    setHasDrawn(true);
  };

  const clearMask = () => {
    if (!canvasRef.current || !images[0]?.original) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = images[0].original;

    if (maskCanvasRef.current) {
      const maskCanvas = maskCanvasRef.current;
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
    }
    setHasDrawn(false);
  };

  const handleProcess = async () => {
    guardedAction(async () => {
      if (images.length === 0 || isProcessing) return;
      setIsProcessing(true);
      trackToolUsed('watermark-remover');
      
      try {
        setImages(prev => [{ ...prev[0], status: 'processing' }]);

        // Get mask as base64
        const maskBase64 = maskCanvasRef.current?.toDataURL('image/png');
        if (!maskBase64) throw new Error('Failed to generate mask');
        
        // Call Gemini AI directly from the client
        const cleanedImageUri = await processWatermarkRemoval(images[0].original, maskBase64);

        setImages(prev => [{
          ...prev[0],
          status: 'completed',
          processed: cleanedImageUri
        }]);

        // Consume AI credit for this tool
        const user = auth.currentUser;
        if (user) {
          await consumeAICredit(user.uid, 'watermark-remover');
        }
      } catch (error: any) {
        console.error("Processing error:", error);
        const errorMessage = error.message || "Failed to remove watermark";
        setImages(prev => [{ ...prev[0], status: 'error', error: errorMessage }]);
      } finally {
        setIsProcessing(false);
        trackToolCompleted('watermark-remover');
      }
    });
  };

  const downloadImage = (base64: string, filename: string) => {
    trackFileDownloaded('watermark-remover');
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              {t('watermark-remover-step1')}
            </h3>
            <div 
              onClick={() => images.length === 0 && fileInputRef.current?.click()}
              className={cn(
                "relative border border-zinc-300 dark:border-gray-800 bg-white dark:bg-[#1a1c21] rounded-2xl p-12 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
                images.length > 0 ? "cursor-default" : "hover:border-[#d4ff33]/50 hover:bg-[#d4ff33]/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/png,image/jpeg,image/webp"
                className="hidden" 
              />
              {images.length === 0 ? (
                <>
                  <Upload className="w-10 h-10 text-black dark:text-gray-500 mb-4 group-hover:text-[#d4ff33] transition-colors" />
                  <p className="text-sm font-bold text-black dark:text-white mb-1">
                    {t('bg-remover-click-to-upload')} <span className="font-normal text-black dark:text-gray-400">{t('bg-remover-or-drag-drop')}</span>
                  </p>
                  <p className="text-[10px] text-black dark:text-gray-500 uppercase tracking-widest">
                    PNG, JPG or WEBP
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700">
                    <img src={images[0].original} alt={commonT('alt.original')} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-black dark:text-white">Image Uploaded</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages([]);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider mt-1"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Brush Settings */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  {t('watermark-remover-step2')}
                </h3>
                <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-2xl p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-black dark:text-gray-400 uppercase tracking-wider">Brush Size</label>
                      <span className="text-xs font-bold text-[#d4ff33]">{brushSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-[#d4ff33]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={clearMask}
                      className="flex-1 py-3 rounded-xl border border-zinc-300 dark:border-gray-800 text-xs font-bold text-black dark:text-gray-400 hover:text-black dark:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Undo size={14} />
                      Reset Brush
                    </button>
                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing || !hasDrawn}
                      className={cn(
                        "flex-[2] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs",
                        isProcessing || !hasDrawn
                          ? "bg-white dark:bg-gray-800 text-black dark:text-gray-500 cursor-not-allowed"
                          : "bg-[#84a12d] text-black hover:bg-[#d4ff33] shadow-lg"
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Eraser className="w-4 h-4" />
                          {t('watermark-remover-step3').split(' ')[0]} Watermark
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Canvas/Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider opacity-50">{t('bg-remover-preview')}</h3>
          <div className="bg-white dark:bg-[#1a1c21] border border-zinc-300 dark:border-gray-800 rounded-2xl p-6 min-h-[300px] md:min-h-[500px] flex flex-col overflow-hidden">
            <div ref={containerRef} className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[250px] md:min-h-[400px]">
              <AnimatePresence mode="wait">
                {images.length === 0 ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-black dark:text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-medium text-black dark:text-gray-400">{t('bg-remover-empty-preview')}</p>
                  </motion.div>
                ) : images[0].status === 'completed' && images[0].processed ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center p-4 relative"
                  >
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <img src={images[0].processed} alt={commonT('alt.result')} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                      <div className="absolute top-4 left-4 bg-[#d4ff33] px-3 py-1 rounded-full text-[10px] font-bold text-black uppercase shadow-lg z-10 whitespace-nowrap text-xs sm:text-sm">
                        Cleaned Result
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadImage(images[0].processed!, `cleaned-${images[0].id}.png`)}
                      className="mt-6 bg-black text-black dark:text-white px-4 py-2 sm:px-8 sm:py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white dark:bg-gray-900 transition-all shadow-xl whitespace-nowrap text-sm sm:text-base"
                    >
                      <Download size={18} />
                      {t('watermark-download')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  >
                    <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
                    <canvas ref={maskCanvasRef} className="hidden" />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-black dark:text-white rounded-lg">
                        <Loader2 className="w-12 h-12 text-[#d4ff33] animate-spin mb-4" />
                        <p className="text-lg font-bold">AI is removing watermark...</p>
                        <p className="text-sm text-black dark:text-gray-400">This may take a few seconds</p>
                      </div>
                    )}
                    
                    {!isProcessing && images[0].status === 'error' && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-black dark:text-white rounded-lg p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-lg font-bold text-red-500">Error</p>
                        <p className="text-sm text-black dark:text-gray-300 mt-2">{images[0].error}</p>
                        <button 
                          onClick={clearMask}
                          className="mt-6 bg-white/10 hover:bg-white/20 text-black dark:text-white px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                    
                    {!isProcessing && images[0].status !== 'error' && !hasDrawn && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="bg-black/80 px-6 py-3 rounded-full border border-[#d4ff33]/30 flex items-center gap-3">
                          <Eraser size={20} className="text-[#d4ff33]" />
                          <span className="text-sm font-bold text-black dark:text-white">Paint over the watermark</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <AIGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
