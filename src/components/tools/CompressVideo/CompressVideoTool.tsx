"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useDownloadGate } from '@/hooks/useDownloadGate';
import DownloadGateModal from '@/components/auth/DownloadGateModal';
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
  Minimize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { trackToolUsed, trackToolCompleted, trackFileDownloaded } from '@/lib/analytics';

type Resolution = 'original' | '1080p' | '720p' | '480p';
type Format = 'mp4' | 'webm';

interface VideoFile {
  file: File;
  originalSize: number;
  compressedSize?: number;
  status: 'idle' | 'loading-ffmpeg' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  error?: string;
  previewUrl?: string;
}

export default function CompressVideoTool() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const { guardedDownload, modalState, closeModal, onLoginSuccess } = useDownloadGate();
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [resolution, setResolution] = useState<Resolution>('original');
  const [format, setFormat] = useState<Format>('mp4');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    return () => {
      if (video?.previewUrl) {
        URL.revokeObjectURL(video.previewUrl);
      }
    };
  }, [video]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type?.startsWith('video/')) {
      // If the browser can't determine the type, we check the extension as a fallback
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
        // Test if the CDN is accessible before loading
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

    throw new Error('Could not load the video engine. This is likely due to your browser blocking the connection to our content delivery networks (unpkg.com or jsdelivr). Please check your internet connection or try disabling extensions like ad-blockers.');
  };

  const compressVideo = async () => {
    if (!video || video.status === 'processing') return;

    // Check file size - browser WASM has limits (usually around 2GB, but practically much less)
    // 200MB is a safer limit for most browsers to avoid memory access out of bounds
    if (video.file.size > 200 * 1024 * 1024) {
      setVideo(prev => prev ? { ...prev, status: 'error', error: 'Video file is too large (>200MB). Browser-based compression is limited by memory. Please try a smaller file or use a desktop application for large videos.' } : null);
      return;
    }

    setVideo(prev => prev ? { ...prev, status: 'loading-ffmpeg' } : null);
    
    try {
      const ffmpeg = await loadFFmpeg();
      setVideo(prev => prev ? { ...prev, status: 'processing' } : null);
      trackToolUsed('compress-video');
      setProgress(0);

      const inputName = 'input' + video.file.name.substring(video.file.name.lastIndexOf('.'));
      const outputName = `output.${format}`;

      // Use Uint8Array directly to avoid extra copies if possible
      let arrayBuffer: ArrayBuffer | null = await video.file.arrayBuffer();
      let fileData: Uint8Array | null = new Uint8Array(arrayBuffer);
      await ffmpeg.writeFile(inputName, fileData);
      
      // Explicitly null out large buffers to help garbage collection
      fileData = null;
      arrayBuffer = null;

      const args = ['-i', inputName, '-threads', '1'];

      // Resolution scaling
      if (resolution === '1080p') {
        args.push('-vf', 'scale=-2:1080,format=yuv420p');
      } else if (resolution === '720p') {
        args.push('-vf', 'scale=-2:720,format=yuv420p');
      } else if (resolution === '480p') {
        args.push('-vf', 'scale=-2:480,format=yuv420p');
      } else {
        args.push('-pix_fmt', 'yuv420p');
      }

      // Compression settings
      // libx264 for mp4, libvpx for webm (VP8 is more memory efficient than VP9 in WASM)
      if (format === 'mp4') {
        args.push('-vcodec', 'libx264', '-crf', '28', '-preset', 'ultrafast', '-acodec', 'aac', outputName);
      } else {
        // Use libvpx (VP8) instead of libvpx-vp9 for better stability and memory usage
        // -deadline realtime and -cpu-used 8 are the fastest/lowest memory settings
        args.push('-vcodec', 'libvpx', '-crf', '30', '-b:v', '1M', '-deadline', 'realtime', '-cpu-used', '8', '-acodec', 'libopus', outputName);
      }

      await ffmpeg.exec(args);

      // Delete input file immediately after processing to free up memory for the output file
      await ffmpeg.deleteFile(inputName);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: `video/${format}` });
      
      setVideo(prev => prev ? { 
        ...prev, 
        status: 'completed', 
        resultBlob: blob,
        compressedSize: blob.size 
      } : null);
      trackToolCompleted('compress-video');

      // Final cleanup
      await ffmpeg.deleteFile(outputName);

    } catch (error: any) {
      console.error('FFmpeg Error:', error);
      let errorMessage = error.message || 'Compression failed';
      if (errorMessage.includes('memory access out of bounds')) {
        errorMessage = format === 'webm' 
          ? 'WebM compression is very memory-intensive. Try a smaller file or use MP4 format instead.'
          : 'Video is too large for browser memory. Try a smaller file or a different format.';
        // Reset FFmpeg on memory error as the WASM instance might be corrupted
        ffmpegRef.current = null;
      }
      setVideo(prev => prev ? { ...prev, status: 'error', error: errorMessage } : null);
    }
  };

  const downloadVideo = () => {
    if (!video?.resultBlob) return;
    trackFileDownloaded('compress-video');
    guardedDownload(() => {
      const url = URL.createObjectURL(video!.resultBlob!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed-${video!.file.name.split('.')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number) => {
    if (!compressed) return 0;
    const savings = ((original - compressed) / original) * 100;
    return Math.max(0, Math.round(savings));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {!video ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] p-8 md:p-20 text-center flex flex-col items-center justify-center group hover:border-purple-400/50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;

            let isVideo = file.type?.startsWith('video/');
            if (!isVideo) {
              const ext = file.name.split('.').pop()?.toLowerCase();
              const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', 'wmv', 'm4v'];
              isVideo = ext ? videoExts.includes(ext) : false;
            }

            if (isVideo) {
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
            <div className="bg-purple-400 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-500 transition-colors shadow-lg shadow-purple-400/20 whitespace-nowrap text-sm sm:text-base">
              {t('chooseFiles')}
            </div>
          </div>
          <p className="text-gray-500 text-sm">{t('dropFilesHere')}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 sticky top-24">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                {t('settings')}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    {tt('compress-video-res-label')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['original', '1080p', '720p', '480p'] as Resolution[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setResolution(r)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          resolution === r 
                            ? 'bg-purple-400/10 border-purple-400 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {r === 'original' ? 'Original' : r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    {tt('compress-video-format-label')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['mp4', 'webm'] as Format[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all uppercase ${
                          format === f 
                            ? 'bg-purple-400/10 border-purple-400 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={compressVideo}
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
                        {tt('compress-video-loading-ffmpeg')}
                      </>
                    ) : video.status === 'processing' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {progress}%
                      </>
                    ) : video.status === 'completed' ? (
                      <>
                        <CheckCircle2 size={20} />
                        {tt('compress-video-ready')}
                      </>
                    ) : (
                      <>
                        <Minimize size={20} />
                        {tt('compress-video')}
                      </>
                    )}
                  </button>

                  {video.status === 'completed' && (
                    <button
                      onClick={downloadVideo}
                      className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                    >
                      <Download size={20} />
                      {tt('compress-video-download')}
                    </button>
                  )}

                  <button
                    onClick={() => setVideo(null)}
                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    <X size={20} />
                    {t('chooseFiles')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Preview & List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400">
                    <Video size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm truncate max-w-[200px]">{video.file.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      {formatSize(video.originalSize)}
                    </p>
                  </div>
                </div>
                {video.status === 'completed' && video.compressedSize && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{tt('compress-video-compressed')}</p>
                      <p className="text-green-400 font-mono font-bold">{formatSize(video.compressedSize)}</p>
                    </div>
                    <div className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-400/20">
                      -{calculateSavings(video.originalSize, video.compressedSize)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 group">
                  {video.previewUrl && (
                    <video 
                      src={video.previewUrl} 
                      className="w-full h-full object-contain"
                      controls
                    />
                  )}
                  
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
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video size={24} className="text-purple-400/50" />
                          </div>
                        </div>
                        <h4 className="text-white font-bold mb-2">
                          {video.status === 'loading-ffmpeg' ? tt('compress-video-loading-ffmpeg') : tt('compress-video-processing')}
                        </h4>
                        {video.status === 'processing' && (
                          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto whitespace-nowrap">
                            <motion.div 
                              className="h-full bg-purple-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        <p className="text-gray-500 text-xs mt-4 max-w-xs">
                          {video.status === 'processing' ? 'This happens entirely in your browser. Larger videos take more time.' : 'Preparing the video engine...'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-4">
                <div className="p-3 bg-blue-400/10 rounded-xl text-blue-400 h-fit">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm mb-1">{tt('compress-video-f3-title')}</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">{tt('compress-video-f3-desc')}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-4">
                <div className="p-3 bg-yellow-400/10 rounded-xl text-yellow-400 h-fit">
                  <Zap size={20} />
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm mb-1">{tt('compress-video-f1-title')}</h5>
                  <p className="text-xs text-gray-500 leading-relaxed">{tt('compress-video-f1-desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <DownloadGateModal state={modalState} onClose={closeModal} onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
