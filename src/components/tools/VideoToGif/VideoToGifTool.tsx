"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  X, 
  Download, 
  Loader2, 
  Settings,
  CheckCircle2,
  Video,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

interface VideoFile {
  file: File;
  originalSize: number;
  status: 'idle' | 'loading-ffmpeg' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  resultUrl?: string;
  error?: string;
  previewUrl?: string;
}



export default function VideoToGifTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [fps, setFps] = useState(10);
  const [scale, setScale] = useState(320);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    return () => {
      if (video?.previewUrl) {
        URL.revokeObjectURL(video.previewUrl);
      }
      if (video?.resultUrl) {
        URL.revokeObjectURL(video.resultUrl);
      }
    };
  }, [video]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('video/')) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'wmv', 'm4v'];
      if (!ext || !videoExts.includes(ext)) {
        return;
      }
    }

    if (video?.previewUrl) {
      URL.revokeObjectURL(video.previewUrl);
    }

    setVideo({
      file,
      originalSize: file.size,
      status: 'idle',
      previewUrl: URL.createObjectURL(file)
    });
  };

  const fetchWithTimeout = async (url: string, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const CDNs = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
    ];

    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    for (const baseURL of CDNs) {
      try {
        await fetchWithTimeout(`${baseURL}/ffmpeg-core.js`, 5000);
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegRef.current = ffmpeg;
        return ffmpeg;
      } catch (error) {
        console.warn(`Failed to load FFmpeg from ${baseURL}, trying next...`, error);
      }
    }

    throw new Error('Could not load the video engine. Please check your internet connection.');
  };

  const convertToGif = async () => {
    if (!video || video.status === 'processing') return;

    if (video.file.size > 100 * 1024 * 1024) {
      setVideo(prev => prev ? { ...prev, status: 'error', error: tt('video-to-gif-error-large') } : null);
      return;
    }

    setVideo(prev => prev ? { ...prev, status: 'loading-ffmpeg' } : null);
    
    try {
      const ffmpeg = await loadFFmpeg();
      setVideo(prev => prev ? { ...prev, status: 'processing' } : null);
      setProgress(0);

      const inputName = 'input' + video.file.name.substring(video.file.name.lastIndexOf('.'));
      const outputName = 'output.gif';
      const paletteName = 'palette.png';

      const arrayBuffer = await video.file.arrayBuffer();
      await ffmpeg.writeFile(inputName, new Uint8Array(arrayBuffer));
      
      // Step 1: Generate palette for better quality
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,palettegen`,
        paletteName
      ]);

      // Step 2: Use palette to generate GIF
      await ffmpeg.exec([
        '-i', inputName,
        '-i', paletteName,
        '-filter_complex', `fps=${fps},scale=${scale}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as ArrayBuffer], { type: 'image/gif' });
      const resultUrl = URL.createObjectURL(blob);
      
      setVideo(prev => prev ? { 
        ...prev, 
        status: 'completed', 
        resultBlob: blob,
        resultUrl
      } : null);

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(paletteName);
      await ffmpeg.deleteFile(outputName);

    } catch (error: any) {
      console.error('FFmpeg Error:', error);
      setVideo(prev => prev ? { ...prev, status: 'error', error: error.message || 'Conversion failed' } : null);
    }
  };

  const downloadGif = () => {
    if (!video?.resultUrl) return;
    const link = document.createElement('a');
    link.href = video.resultUrl;
    link.download = `${video.file.name.split('.')[0]}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {!video ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] p-20 flex flex-col items-center justify-center group hover:border-purple-400/50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
              setVideo({ 
                file, 
                originalSize: file.size, 
                status: 'idle',
                previewUrl: URL.createObjectURL(file)
              });
            }
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept="video/*" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-purple-400/10 rounded-full flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-400 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-400/20">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-500 text-sm">{t('dropFilesHere')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                {t('settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    {tt('video-to-gif-fps-label')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFps(f)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          fps === f 
                            ? 'bg-purple-400/10 border-purple-400 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    {tt('video-to-gif-scale-label')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[240, 320, 480].map((s) => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          scale === s 
                            ? 'bg-purple-400/10 border-purple-400 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={convertToGif}
                    disabled={video.status === 'processing' || video.status === 'loading-ffmpeg' || video.status === 'completed'}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      video.status === 'completed'
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-purple-400 text-white hover:bg-purple-500 shadow-lg shadow-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {video.status === 'loading-ffmpeg' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {tt('video-to-gif-loading-ffmpeg')}
                      </>
                    ) : video.status === 'processing' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {progress}%
                      </>
                    ) : video.status === 'completed' ? (
                      <>
                        <CheckCircle2 size={20} />
                        {tt('video-to-gif-ready')}
                      </>
                    ) : (
                      <>
                        <RefreshCw size={20} />
                        {tt('video-to-gif')}
                      </>
                    )}
                  </button>

                  {video.status === 'completed' && (
                    <button
                      onClick={downloadGif}
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                    >
                      <Download size={20} />
                      {tt('video-to-gif-download')}
                    </button>
                  )}

                  <button
                    onClick={() => setVideo(null)}
                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <X size={20} />
                    {t('chooseFiles')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400">
                    <Video size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm truncate max-w-[200px]">{video.file.name}</h4>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 group">
                  {video.status === 'completed' && video.resultUrl ? (
                    <img 
                      src={video.resultUrl} 
                      alt="GIF Result" 
                      className="w-full h-full object-contain"
                    />
                  ) : video.previewUrl ? (
                    <video 
                      src={video.previewUrl} 
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : null}
                  
                  <AnimatePresence>
                    {(video.status === 'processing' || video.status === 'loading-ffmpeg') && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
                      >
                        <div className="relative mb-6">
                          <Loader2 size={64} className="text-purple-400 animate-spin" />
                        </div>
                        <h4 className="text-white font-bold mb-2">
                          {video.status === 'loading-ffmpeg' ? tt('video-to-gif-loading-ffmpeg') : tt('video-to-gif-processing')}
                        </h4>
                        {video.status === 'processing' && (
                          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                            <motion.div 
                              className="h-full bg-purple-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-4">
                <div className="p-3 bg-blue-400/10 rounded-xl text-blue-400 h-fit">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm mb-1">{tt('video-to-gif-f3-title')}</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">{tt('video-to-gif-f3-desc')}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-4">
                <div className="p-3 bg-yellow-400/10 rounded-xl text-yellow-400 h-fit">
                  <Zap size={20} />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm mb-1">{tt('video-to-gif-f2-title')}</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">{tt('video-to-gif-f2-desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
