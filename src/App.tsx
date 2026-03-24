/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from './navigation';
import { useSearchParams } from 'next/navigation';
import { Locale } from './i18n/config';
import { 
  FileText, 
  Image as ImageIcon, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  FileSpreadsheet, 
  FileCode, 
  FileVideo, 
  Eraser, 
  Droplets, 
  Type, 
  Upload, 
  ChevronDown,
  ShieldCheck,
  Users,
  Zap,
  LayoutGrid,
  Search,
  Twitter,
  Linkedin,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BackgroundRemover from './components/tools/BackgroundRemover/BackgroundRemover';
import WatermarkTool from './components/tools/Watermark/WatermarkTool';
import WatermarkRemoverTool from './components/tools/WatermarkRemover/WatermarkRemoverTool';
import ImageToTextTool from './components/tools/ImageToText/ImageToTextTool';
import ImageResizerTool from './components/tools/ImageResizer/ImageResizerTool';
import CompressImagesTool from './components/tools/CompressImages/CompressImagesTool';
import CompressPdfTool from './components/tools/CompressPdf/CompressPdfTool';
import CompressVideoTool from './components/tools/CompressVideo/CompressVideoTool';
import ImageConverterTool from './components/tools/ImageConverter/ImageConverterTool';
import HeicConverterTool from './components/tools/HeicConverter/HeicConverterTool';

const sidebarTools = [
  { id: 'bg-remover', nameKey: 'Tools.bg-remover', icon: Eraser, color: 'text-orange-400', hover: 'hover:bg-orange-400/10' },
  { id: 'watermark', nameKey: 'Tools.watermark', icon: Droplets, color: 'text-blue-400', hover: 'hover:bg-blue-400/10' },
  { id: 'watermark-remover', nameKey: 'Tools.watermark-remover', icon: Droplets, color: 'text-purple-400', hover: 'hover:bg-purple-400/10' },
  { id: 'image-to-text', nameKey: 'Tools.image-to-text', icon: Type, color: 'text-pink-400', hover: 'hover:bg-pink-400/10' },
  { id: 'resize', nameKey: 'Tools.resize', icon: Maximize, color: 'text-cyan-400', hover: 'hover:bg-cyan-400/10' },
  { 
    id: 'compress', 
    nameKey: 'Tools.compress', 
    icon: Minimize, 
    color: 'text-green-400', 
    hover: 'hover:bg-green-400/10',
    children: [
      { id: 'compress-images', nameKey: 'Tools.compress-images' },
      { id: 'compress-pdf', nameKey: 'Tools.compress-pdf' },
      { id: 'compress-video', nameKey: 'Tools.compress-video' },
    ]
  },
  { 
    id: 'convert', 
    nameKey: 'Tools.convert', 
    icon: RefreshCw, 
    color: 'text-yellow-400', 
    hover: 'hover:bg-yellow-400/10',
    children: [
      { id: 'image-converter', nameKey: 'Tools.image-converter' },
      { id: 'heic-to-png', nameKey: 'Tools.heic-to-png' },
      { id: 'pdf-to-image', nameKey: 'Tools.pdf-to-image' },
      { id: 'svg-to-png', nameKey: 'Tools.svg-to-png' },
    ]
  },
  { id: 'pdf-to-csv', nameKey: 'Tools.pdf-to-csv', icon: FileCode, color: 'text-red-400', hover: 'hover:bg-red-400/10' },
  { id: 'pdf-to-excel', nameKey: 'Tools.pdf-to-excel', icon: FileSpreadsheet, color: 'text-lime-400', hover: 'hover:bg-lime-400/10' },
  { id: 'excel-csv', nameKey: 'Tools.excel-csv', icon: FileSpreadsheet, color: 'text-emerald-400', hover: 'hover:bg-emerald-400/10' },
  { id: 'pdf-to-word', nameKey: 'Tools.pdf-to-word', icon: FileText, color: 'text-blue-500', hover: 'hover:bg-blue-500/10' },
  { id: 'video-to-gif', nameKey: 'Tools.video-to-gif', icon: FileVideo, color: 'text-purple-500', hover: 'hover:bg-purple-500/10' },
];

interface ToolPageContent {
  titleKey: string;
  accentKey: string;
  descriptionKey: string;
  heroIcon: React.ElementType;
  features: {
    titleKey: string;
    descriptionKey: string;
    icon: React.ElementType;
    color: string;
  }[];
  stepsKeys: string[];
  faqsKeys: {
    questionKey: string;
    answerKey: string;
  }[];
}

const toolContent: Record<string, ToolPageContent> = {
  'bg-remover': {
    titleKey: 'Tools.bg-remover-title',
    accentKey: 'Tools.bg-remover-accent',
    descriptionKey: 'Tools.bg-remover-desc',
    heroIcon: Eraser,
    features: [
      { titleKey: 'Tools.bg-remover-f1-title', descriptionKey: 'Tools.bg-remover-f1-desc', icon: Zap, color: 'text-orange-400' },
      { titleKey: 'Tools.bg-remover-f2-title', descriptionKey: 'Tools.bg-remover-f2-desc', icon: LayoutGrid, color: 'text-blue-400' },
      { titleKey: 'Tools.bg-remover-f3-title', descriptionKey: 'Tools.bg-remover-f3-desc', icon: Maximize, color: 'text-green-400' },
    ],
    stepsKeys: [
      'Tools.bg-remover-step1',
      'Tools.bg-remover-step2',
      'Tools.bg-remover-step3',
      'Tools.bg-remover-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.bg-remover-faq1-q', answerKey: 'Tools.bg-remover-faq1-a' },
      { questionKey: 'Tools.bg-remover-faq2-q', answerKey: 'Tools.bg-remover-faq2-a' },
      { questionKey: 'Tools.bg-remover-faq3-q', answerKey: 'Tools.bg-remover-faq3-a' }
    ]
  },
  'watermark': {
    titleKey: 'Tools.watermark-title',
    accentKey: 'Tools.watermark-accent',
    descriptionKey: 'Tools.watermark-desc',
    heroIcon: Droplets,
    features: [
      { titleKey: 'Tools.watermark-f1-title', descriptionKey: 'Tools.watermark-f1-desc', icon: ShieldCheck, color: 'text-blue-400' },
      { titleKey: 'Tools.watermark-f2-title', descriptionKey: 'Tools.watermark-f2-desc', icon: Maximize, color: 'text-purple-400' },
      { titleKey: 'Tools.watermark-f3-title', descriptionKey: 'Tools.watermark-f3-desc', icon: Zap, color: 'text-yellow-400' },
    ],
    stepsKeys: [
      'Tools.watermark-step1',
      'Tools.watermark-step2',
      'Tools.watermark-step3',
      'Tools.watermark-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.watermark-faq1-q', answerKey: 'Tools.watermark-faq1-a' },
      { questionKey: 'Tools.watermark-faq2-q', answerKey: 'Tools.watermark-faq2-a' }
    ]
  },
  'watermark-remover': {
    titleKey: 'Tools.watermark-remover-title',
    accentKey: 'Tools.watermark-remover-accent',
    descriptionKey: 'Tools.watermark-remover-desc',
    heroIcon: Droplets,
    features: [
      { titleKey: 'Tools.watermark-remover-f1-title', descriptionKey: 'Tools.watermark-remover-f1-desc', icon: Zap, color: 'text-purple-400' },
      { titleKey: 'Tools.watermark-remover-f2-title', descriptionKey: 'Tools.watermark-remover-f2-desc', icon: ShieldCheck, color: 'text-blue-400' },
      { titleKey: 'Tools.watermark-remover-f3-title', descriptionKey: 'Tools.watermark-remover-f3-desc', icon: Maximize, color: 'text-green-400' },
    ],
    stepsKeys: [
      'Tools.watermark-remover-step1',
      'Tools.watermark-remover-step2',
      'Tools.watermark-remover-step3',
      'Tools.watermark-remover-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.watermark-remover-faq1-q', answerKey: 'Tools.watermark-remover-faq1-a' },
      { questionKey: 'Tools.watermark-remover-faq2-q', answerKey: 'Tools.watermark-remover-faq2-a' }
    ]
  },
  'image-to-text': {
    titleKey: 'Tools.image-to-text-title',
    accentKey: 'Tools.image-to-text-accent',
    descriptionKey: 'Tools.image-to-text-desc',
    heroIcon: Type,
    features: [
      { titleKey: 'Tools.image-to-text-f1-title', descriptionKey: 'Tools.image-to-text-f1-desc', icon: Search, color: 'text-pink-400' },
      { titleKey: 'Tools.image-to-text-f2-title', descriptionKey: 'Tools.image-to-text-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.image-to-text-f3-title', descriptionKey: 'Tools.image-to-text-f3-desc', icon: FileText, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.image-to-text-step1',
      'Tools.image-to-text-step2',
      'Tools.image-to-text-step3',
      'Tools.image-to-text-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.image-to-text-faq1-q', answerKey: 'Tools.image-to-text-faq1-a' },
      { questionKey: 'Tools.image-to-text-faq2-q', answerKey: 'Tools.image-to-text-faq2-a' }
    ]
  },
  'resize': {
    titleKey: 'Tools.resize-title',
    accentKey: 'Tools.resize-accent',
    descriptionKey: 'Tools.resize-desc',
    heroIcon: Maximize,
    features: [
      { titleKey: 'Tools.resize-f1-title', descriptionKey: 'Tools.resize-f1-desc', icon: Maximize, color: 'text-cyan-400' },
      { titleKey: 'Tools.resize-f2-title', descriptionKey: 'Tools.resize-f2-desc', icon: Minimize, color: 'text-blue-400' },
      { titleKey: 'Tools.resize-f3-title', descriptionKey: 'Tools.resize-f3-desc', icon: Zap, color: 'text-yellow-400' },
    ],
    stepsKeys: [
      'Tools.resize-step1',
      'Tools.resize-step2',
      'Tools.resize-step3',
      'Tools.resize-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.resize-faq1-q', answerKey: 'Tools.resize-faq1-a' },
      { questionKey: 'Tools.resize-faq2-q', answerKey: 'Tools.resize-faq2-a' }
    ]
  },
  'compress': {
    titleKey: 'Tools.compress-title',
    accentKey: 'Tools.compress-accent',
    descriptionKey: 'Tools.compress-desc',
    heroIcon: Minimize,
    features: [
      { titleKey: 'Tools.compress-f1-title', descriptionKey: 'Tools.compress-f1-desc', icon: Minimize, color: 'text-green-400' },
      { titleKey: 'Tools.compress-f2-title', descriptionKey: 'Tools.compress-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.compress-f3-title', descriptionKey: 'Tools.compress-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.compress-step1',
      'Tools.compress-step2',
      'Tools.compress-step3',
      'Tools.compress-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.compress-faq1-q', answerKey: 'Tools.compress-faq1-a' },
      { questionKey: 'Tools.compress-faq2-q', answerKey: 'Tools.compress-faq2-a' }
    ]
  },
  'compress-images': {
    titleKey: 'Tools.compress-images-title',
    accentKey: 'Tools.compress-images-accent',
    descriptionKey: 'Tools.compress-images-desc',
    heroIcon: ImageIcon,
    features: [
      { titleKey: 'Tools.compress-images-f1-title', descriptionKey: 'Tools.compress-images-f1-desc', icon: Minimize, color: 'text-green-400' },
      { titleKey: 'Tools.compress-images-f2-title', descriptionKey: 'Tools.compress-images-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.compress-images-f3-title', descriptionKey: 'Tools.compress-images-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.compress-images-step1',
      'Tools.compress-images-step2',
      'Tools.compress-images-step3',
      'Tools.compress-images-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.compress-images-faq1-q', answerKey: 'Tools.compress-images-faq1-a' },
      { questionKey: 'Tools.compress-images-faq2-q', answerKey: 'Tools.compress-images-faq2-a' }
    ]
  },
  'compress-pdf': {
    titleKey: 'Tools.compress-pdf-title',
    accentKey: 'Tools.compress-pdf-accent',
    descriptionKey: 'Tools.compress-pdf-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.compress-pdf-f1-title', descriptionKey: 'Tools.compress-pdf-f1-desc', icon: Minimize, color: 'text-red-400' },
      { titleKey: 'Tools.compress-pdf-f2-title', descriptionKey: 'Tools.compress-pdf-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.compress-pdf-f3-title', descriptionKey: 'Tools.compress-pdf-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.compress-pdf-step1',
      'Tools.compress-pdf-step2',
      'Tools.compress-pdf-step3',
      'Tools.compress-pdf-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.compress-pdf-faq1-q', answerKey: 'Tools.compress-pdf-faq1-a' },
      { questionKey: 'Tools.compress-pdf-faq2-q', answerKey: 'Tools.compress-pdf-faq2-a' }
    ]
  },
  'compress-video': {
    titleKey: 'Tools.compress-video-title',
    accentKey: 'Tools.compress-video-accent',
    descriptionKey: 'Tools.compress-video-desc',
    heroIcon: FileVideo,
    features: [
      { titleKey: 'Tools.compress-video-f1-title', descriptionKey: 'Tools.compress-video-f1-desc', icon: Minimize, color: 'text-purple-400' },
      { titleKey: 'Tools.compress-video-f2-title', descriptionKey: 'Tools.compress-video-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.compress-video-f3-title', descriptionKey: 'Tools.compress-video-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.compress-video-step1',
      'Tools.compress-video-step2',
      'Tools.compress-video-step3',
      'Tools.compress-video-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.compress-video-faq1-q', answerKey: 'Tools.compress-video-faq1-a' },
      { questionKey: 'Tools.compress-video-faq2-q', answerKey: 'Tools.compress-video-faq2-a' }
    ]
  },
  'pdf-to-csv': {
    titleKey: 'Tools.pdf-to-csv-title',
    accentKey: 'Tools.pdf-to-csv-accent',
    descriptionKey: 'Tools.pdf-to-csv-desc',
    heroIcon: FileCode,
    features: [
      { titleKey: 'Tools.pdf-to-csv-f1-title', descriptionKey: 'Tools.pdf-to-csv-f1-desc', icon: FileCode, color: 'text-red-400' },
      { titleKey: 'Tools.pdf-to-csv-f2-title', descriptionKey: 'Tools.pdf-to-csv-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.pdf-to-csv-f3-title', descriptionKey: 'Tools.pdf-to-csv-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.pdf-to-csv-step1',
      'Tools.pdf-to-csv-step2',
      'Tools.pdf-to-csv-step3',
      'Tools.pdf-to-csv-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.pdf-to-csv-faq1-q', answerKey: 'Tools.pdf-to-csv-faq1-a' },
      { questionKey: 'Tools.pdf-to-csv-faq2-q', answerKey: 'Tools.pdf-to-csv-faq2-a' }
    ]
  },
  'pdf-to-excel': {
    titleKey: 'Tools.pdf-to-excel-title',
    accentKey: 'Tools.pdf-to-excel-accent',
    descriptionKey: 'Tools.pdf-to-excel-desc',
    heroIcon: FileSpreadsheet,
    features: [
      { titleKey: 'Tools.pdf-to-excel-f1-title', descriptionKey: 'Tools.pdf-to-excel-f1-desc', icon: FileText, color: 'text-emerald-400' },
      { titleKey: 'Tools.pdf-to-excel-f2-title', descriptionKey: 'Tools.pdf-to-excel-f2-desc', icon: Users, color: 'text-blue-400' },
      { titleKey: 'Tools.pdf-to-excel-f3-title', descriptionKey: 'Tools.pdf-to-excel-f3-desc', icon: Zap, color: 'text-yellow-400' },
    ],
    stepsKeys: [
      'Tools.pdf-to-excel-step1',
      'Tools.pdf-to-excel-step2',
      'Tools.pdf-to-excel-step3',
      'Tools.pdf-to-excel-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.pdf-to-excel-faq1-q', answerKey: 'Tools.pdf-to-excel-faq1-a' },
      { questionKey: 'Tools.pdf-to-excel-faq2-q', answerKey: 'Tools.pdf-to-excel-faq2-a' },
      { questionKey: 'Tools.pdf-to-excel-faq3-q', answerKey: 'Tools.pdf-to-excel-faq3-a' }
    ]
  },
  'excel-csv': {
    titleKey: 'Tools.excel-csv-title',
    accentKey: 'Tools.excel-csv-accent',
    descriptionKey: 'Tools.excel-csv-desc',
    heroIcon: FileSpreadsheet,
    features: [
      { titleKey: 'Tools.excel-csv-f1-title', descriptionKey: 'Tools.excel-csv-f1-desc', icon: FileSpreadsheet, color: 'text-emerald-400' },
      { titleKey: 'Tools.excel-csv-f2-title', descriptionKey: 'Tools.excel-csv-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.excel-csv-f3-title', descriptionKey: 'Tools.excel-csv-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.excel-csv-step1',
      'Tools.excel-csv-step2',
      'Tools.excel-csv-step3',
      'Tools.excel-csv-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.excel-csv-faq1-q', answerKey: 'Tools.excel-csv-faq1-a' },
      { questionKey: 'Tools.excel-csv-faq2-q', answerKey: 'Tools.excel-csv-faq2-a' }
    ]
  },
  'pdf-to-word': {
    titleKey: 'Tools.pdf-to-word-title',
    accentKey: 'Tools.pdf-to-word-accent',
    descriptionKey: 'Tools.pdf-to-word-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.pdf-to-word-f1-title', descriptionKey: 'Tools.pdf-to-word-f1-desc', icon: FileText, color: 'text-blue-500' },
      { titleKey: 'Tools.pdf-to-word-f2-title', descriptionKey: 'Tools.pdf-to-word-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.pdf-to-word-f3-title', descriptionKey: 'Tools.pdf-to-word-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.pdf-to-word-step1',
      'Tools.pdf-to-word-step2',
      'Tools.pdf-to-word-step3',
      'Tools.pdf-to-word-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.pdf-to-word-faq1-q', answerKey: 'Tools.pdf-to-word-faq1-a' },
      { questionKey: 'Tools.pdf-to-word-faq2-q', answerKey: 'Tools.pdf-to-word-faq2-a' }
    ]
  },
  'video-to-gif': {
    titleKey: 'Tools.video-to-gif-title',
    accentKey: 'Tools.video-to-gif-accent',
    descriptionKey: 'Tools.video-to-gif-desc',
    heroIcon: FileVideo,
    features: [
      { titleKey: 'Tools.video-to-gif-f1-title', descriptionKey: 'Tools.video-to-gif-f1-desc', icon: FileVideo, color: 'text-purple-500' },
      { titleKey: 'Tools.video-to-gif-f2-title', descriptionKey: 'Tools.video-to-gif-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.video-to-gif-f3-title', descriptionKey: 'Tools.video-to-gif-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.video-to-gif-step1',
      'Tools.video-to-gif-step2',
      'Tools.video-to-gif-step3',
      'Tools.video-to-gif-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.video-to-gif-faq1-q', answerKey: 'Tools.video-to-gif-faq1-a' },
      { questionKey: 'Tools.video-to-gif-faq2-q', answerKey: 'Tools.video-to-gif-faq2-a' }
    ]
  },
  'image-converter': {
    titleKey: 'Tools.image-converter-title',
    accentKey: 'Tools.image-converter-accent',
    descriptionKey: 'Tools.image-converter-desc',
    heroIcon: ImageIcon,
    features: [
      { titleKey: 'Tools.image-converter-f1-title', descriptionKey: 'Tools.image-converter-f1-desc', icon: ImageIcon, color: 'text-blue-400' },
      { titleKey: 'Tools.image-converter-f2-title', descriptionKey: 'Tools.image-converter-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.image-converter-f3-title', descriptionKey: 'Tools.image-converter-f3-desc', icon: ShieldCheck, color: 'text-green-400' },
    ],
    stepsKeys: [
      'Tools.image-converter-step1',
      'Tools.image-converter-step2',
      'Tools.image-converter-step3',
      'Tools.image-converter-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.image-converter-faq1-q', answerKey: 'Tools.image-converter-faq1-a' },
      { questionKey: 'Tools.image-converter-faq2-q', answerKey: 'Tools.image-converter-faq2-a' }
    ]
  },
  'heic-to-png': {
    titleKey: 'Tools.heic-to-png-title',
    accentKey: 'Tools.heic-to-png-accent',
    descriptionKey: 'Tools.heic-to-png-desc',
    heroIcon: ImageIcon,
    features: [
      { titleKey: 'Tools.heic-to-png-f1-title', descriptionKey: 'Tools.heic-to-png-f1-desc', icon: ImageIcon, color: 'text-orange-400' },
      { titleKey: 'Tools.heic-to-png-f2-title', descriptionKey: 'Tools.heic-to-png-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.heic-to-png-f3-title', descriptionKey: 'Tools.heic-to-png-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.heic-to-png-step1',
      'Tools.heic-to-png-step2',
      'Tools.heic-to-png-step3',
      'Tools.heic-to-png-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.heic-to-png-faq1-q', answerKey: 'Tools.heic-to-png-faq1-a' },
      { questionKey: 'Tools.heic-to-png-faq2-q', answerKey: 'Tools.heic-to-png-faq2-a' }
    ]
  },
  'pdf-to-image': {
    titleKey: 'Tools.pdf-to-image-title',
    accentKey: 'Tools.pdf-to-image-accent',
    descriptionKey: 'Tools.pdf-to-image-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.pdf-to-image-f1-title', descriptionKey: 'Tools.pdf-to-image-f1-desc', icon: FileText, color: 'text-red-400' },
      { titleKey: 'Tools.pdf-to-image-f2-title', descriptionKey: 'Tools.pdf-to-image-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.pdf-to-image-f3-title', descriptionKey: 'Tools.pdf-to-image-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.pdf-to-image-step1',
      'Tools.pdf-to-image-step2',
      'Tools.pdf-to-image-step3',
      'Tools.pdf-to-image-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.pdf-to-image-faq1-q', answerKey: 'Tools.pdf-to-image-faq1-a' },
      { questionKey: 'Tools.pdf-to-image-faq2-q', answerKey: 'Tools.pdf-to-image-faq2-a' }
    ]
  },
  'svg-to-png': {
    titleKey: 'Tools.svg-to-png-title',
    accentKey: 'Tools.svg-to-png-accent',
    descriptionKey: 'Tools.svg-to-png-desc',
    heroIcon: FileCode,
    features: [
      { titleKey: 'Tools.svg-to-png-f1-title', descriptionKey: 'Tools.svg-to-png-f1-desc', icon: FileCode, color: 'text-emerald-400' },
      { titleKey: 'Tools.svg-to-png-f2-title', descriptionKey: 'Tools.svg-to-png-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.svg-to-png-f3-title', descriptionKey: 'Tools.svg-to-png-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.svg-to-png-step1',
      'Tools.svg-to-png-step2',
      'Tools.svg-to-png-step3',
      'Tools.svg-to-png-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.svg-to-png-faq1-q', answerKey: 'Tools.svg-to-png-faq1-a' },
      { questionKey: 'Tools.svg-to-png-faq2-q', answerKey: 'Tools.svg-to-png-faq2-a' }
    ]
  }
};

export default function App() {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTool = searchParams.get('tool') || 'pdf-to-excel';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const setActiveTool = (toolId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tool', toolId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Ensure URL has the tool param on mount if missing
  useEffect(() => {
    if (!searchParams.get('tool')) {
      setActiveTool('pdf-to-excel');
    }
  }, []);

  // Reset FAQ when tool changes
  useEffect(() => {
    setOpenFaq(null);
  }, [activeTool]);

  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`${pathname}?${params.toString()}`, { locale: newLocale });
    setIsLangMenuOpen(false);
  };

  const currentContent = toolContent[activeTool] || toolContent['pdf-to-excel'];
  const activeToolData = sidebarTools.find(t => t.id === activeTool) || 
                        sidebarTools.flatMap(t => t.children || []).find(c => c.id === activeTool);

  return (
    <div className="flex h-screen bg-[#0f1115] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d4ff33] rounded-lg flex items-center justify-center text-black font-bold text-xl">
            R
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Refindocs</span>
        </div>

        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-4">Tools</h2>
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
            {sidebarTools.map((tool) => {
              const isStrictlyActive = activeTool === tool.id;
              const isExpanded = tool.children?.some(c => c.id === activeTool) || isStrictlyActive;
              
              return (
                <div key={tool.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (tool.id === 'compress' && tool.children) {
                        setActiveTool(tool.children[0].id);
                      } else if (tool.children && tool.children.length > 0) {
                        // If it has children and we're clicking the parent, 
                        // we either select the first child or just toggle expansion by selecting the parent
                        // if the parent itself has no content, we should select the first child.
                        if (!toolContent[tool.id]) {
                          setActiveTool(tool.children[0].id);
                        } else {
                          setActiveTool(tool.id);
                        }
                      } else {
                        setActiveTool(tool.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isStrictlyActive 
                        ? 'bg-white/10 text-white' 
                        : isExpanded && tool.children
                          ? 'text-white'
                          : `text-gray-400 hover:text-gray-200 ${tool.hover}`
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${tool.color}`}>
                      <tool.icon size={18} />
                    </div>
                    <span className="text-sm font-medium flex-1 text-left">{tt(tool.nameKey.split('.')[1])}</span>
                    {tool.children && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {tool.children && isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="pl-11 space-y-1"
                    >
                      {tool.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setActiveTool(child.id)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                            activeTool === child.id ? 'text-[#d4ff33]' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {tt(child.nameKey.split('.')[1])}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto scroll-smooth">
        {/* Navbar */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 bg-[#0f1115] sticky top-0 z-50">
          <nav className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTool('bg-remover')}
              className={`text-sm font-medium transition-colors ${['bg-remover', 'image-to-text'].includes(activeTool) ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              {t('tools')}
            </button>
            <div className="relative group/menu">
              <button 
                onClick={() => setActiveTool('compress-images')}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  ['compress', 'resize', 'compress-images', 'compress-pdf', 'compress-video'].includes(activeTool) 
                    ? 'text-[#d4ff33]' 
                    : 'hover:text-white'
                }`}
              >
                {t('compress')} <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform" />
              </button>
              
              {/* Sub-menu (Tab Bar style) */}
              <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200">
                <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl min-w-[450px]">
                  <button 
                    onClick={() => setActiveTool('compress-images')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'compress-images' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('compress-images')}
                  </button>
                  <button 
                    onClick={() => setActiveTool('compress-pdf')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'compress-pdf' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('compress-pdf')}
                  </button>
                  <button 
                    onClick={() => setActiveTool('compress-video')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'compress-video' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('compress-video')}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative group/menu">
              <button 
                onClick={() => setActiveTool('image-converter')}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  ['image-converter', 'heic-to-png', 'pdf-to-image', 'svg-to-png'].includes(activeTool) 
                    ? 'text-[#d4ff33]' 
                    : 'hover:text-white'
                }`}
              >
                {t('convert')} <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform" />
              </button>
              
              {/* Sub-menu (Tab Bar style) */}
              <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200">
                <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl min-w-[550px]">
                  <button 
                    onClick={() => setActiveTool('image-converter')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'image-converter' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('image-converter')}
                  </button>
                  <button 
                    onClick={() => setActiveTool('heic-to-png')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'heic-to-png' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('heic-to-png')}
                  </button>
                  <button 
                    onClick={() => setActiveTool('pdf-to-image')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'pdf-to-image' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('pdf-to-image')}
                  </button>
                  <button 
                    onClick={() => setActiveTool('svg-to-png')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'svg-to-png' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tt('svg-to-png')}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTool('pdf-to-excel')}
              className={`text-sm font-medium transition-colors ${['pdf-to-excel', 'pdf-to-csv', 'excel-csv'].includes(activeTool) ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              {t('merge')}
            </button>
            <button 
              onClick={() => setActiveTool('watermark')}
              className={`text-sm font-medium transition-colors ${['watermark', 'watermark-remover'].includes(activeTool) ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              {t('edit')}
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors rounded-lg bg-white/5 hover:bg-white/10 hover:text-white"
              >
                <span>{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.name}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsLangMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c21] shadow-2xl"
                    >
                      <div className="py-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                              locale === lang.code ? 'text-[#d4ff33] bg-white/5' : 'text-gray-400'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="flex-1">{lang.name}</span>
                            {locale === lang.code && (
                              <CheckCircle2 size={14} className="text-[#d4ff33]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button className="text-sm font-medium hover:text-white transition-colors">{t('logIn')}</button>
            <button className="bg-[#d4ff33] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#c2eb2e] transition-colors">
              {t('freeTrial')}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-8 py-16 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              <a href="#" className="hover:text-gray-300">{t('home')}</a>
              <span>/</span>
              <span className="text-gray-400">{activeToolData?.nameKey ? tt(activeToolData.nameKey.split('.')[1]) : 'Tool'}</span>
            </nav>
            <h1 className="text-5xl font-bold text-white mb-6">
              {tt(currentContent.titleKey.split('.')[1])} <span className="italic text-[#d4ff33]">{tt(currentContent.accentKey.split('.')[1])}</span> Online
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {tt(currentContent.descriptionKey.split('.')[1])}
            </p>
          </div>

          {/* Tool Area */}
          <div className="mb-16">
            {activeTool === 'bg-remover' ? (
              <BackgroundRemover />
            ) : activeTool === 'compress-images' ? (
              <CompressImagesTool />
            ) : activeTool === 'compress-pdf' ? (
              <CompressPdfTool />
            ) : activeTool === 'compress-video' ? (
              <CompressVideoTool />
            ) : activeTool === 'watermark' ? (
              <WatermarkTool />
            ) : activeTool === 'watermark-remover' ? (
              <WatermarkRemoverTool />
            ) : activeTool === 'image-to-text' ? (
              <ImageToTextTool />
            ) : activeTool === 'resize' ? (
              <ImageResizerTool />
            ) : activeTool === 'image-converter' ? (
              <ImageConverterTool />
            ) : activeTool === 'heic-to-png' ? (
              <HeicConverterTool />
            ) : (
              <motion.div 
                whileHover={{ scale: 1.005 }}
                className="border-2 border-dashed border-lime-400/30 bg-lime-400/5 rounded-[32px] p-20 min-h-[500px] flex flex-col items-center justify-center group cursor-pointer transition-colors hover:border-lime-400/50"
              >
                <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <button className="bg-[#d4ff33] text-black px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#c2eb2e] transition-colors shadow-lg shadow-lime-400/20">
                    {t('chooseFiles')} <ChevronDown size={20} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm">{t('dropFilesHere')}</p>
              </motion.div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-12 text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-32">
            <span>{t('billionUsers')}</span>
            <span>{t('isoCompliance')}</span>
            <span>{t('gdprCompliant')}</span>
          </div>

          {/* Features Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{tt(currentContent.titleKey.split('.')[1])} {tt(currentContent.accentKey.split('.')[1])} in Seconds</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Our tool is designed to be fast, secure, and easy to use for everyone.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-32">
            {currentContent.features.map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors">
                <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center ${feature.color} mb-6`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-white font-bold mb-3">{tt(feature.titleKey.split('.')[1])}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {tt(feature.descriptionKey.split('.')[1])}
                </p>
              </div>
            ))}
          </div>

          {/* How To Section */}
          <div className="grid grid-cols-2 gap-16 items-center mb-32">
            <div className="relative group">
              <div className="absolute -inset-4 bg-lime-400/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative rounded-[32px] overflow-hidden border border-white/10 aspect-[4/3]">
                <img 
                  src={`https://picsum.photos/seed/${activeTool}/800/600`} 
                  alt="Process guide" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">How To {tt(currentContent.titleKey.split('.')[1])} {tt(currentContent.accentKey.split('.')[1])} for Free</h2>
              <div className="space-y-6">
                {currentContent.stepsKeys.map((stepKey, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#d4ff33] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <p className="text-gray-400 leading-relaxed">{tt(stepKey.split('.')[1])}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="max-w-3xl mx-auto mb-32">
            <h2 className="text-3xl font-bold text-white text-center mb-12">{tt(currentContent.titleKey.split('.')[1])} {tt(currentContent.accentKey.split('.')[1])} FAQs</h2>
            <div className="space-y-4">
              {currentContent.faqsKeys.map((faq, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-white">{tt(faq.questionKey.split('.')[1])}</span>
                    <ChevronDown className={`text-lime-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-6 text-gray-500 text-sm leading-relaxed"
                      >
                        {tt(faq.answerKey.split('.')[1])}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#d4ff33] py-24 px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-black mb-6 tracking-tight">{t('doBusinessBetter')}</h2>
            <p className="text-black/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('documentWorkEasy')}
            </p>
            <button className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 shadow-xl">
              {t('try7DaysFree')}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-20 px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-5 gap-12 mb-20">
              <div className="col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-sm">
                    R
                  </div>
                  <span className="text-white font-bold text-lg">Refindocs</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('weMakePdfEasy')}
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6">{t('solutions')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Sales</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Finance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Real Estate</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Education</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{t('company')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{t('product')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Teams</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Embed PDF</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">{t('apps')}</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Download Refindocs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">PDF Scanner</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Windows App</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-900 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-white transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-gray-600 hover:text-white transition-colors"><Twitter size={20} /></a>
              </div>
              <div className="flex items-center gap-8 text-[11px] text-gray-600 uppercase tracking-widest font-bold">
                <span>{t('copyright')}</span>
                <a href="#" className="hover:text-white transition-colors">{t('privacyNotice')}</a>
                <a href="#" className="hover:text-white transition-colors">{t('termsConditions')}</a>
                <a href="#" className="hover:text-white transition-colors">{t('imprint')}</a>
                <a href="#" className="hover:text-white transition-colors">{t('contactUs')}</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
