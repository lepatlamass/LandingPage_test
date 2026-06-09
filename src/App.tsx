/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter, Link } from './navigation';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Image as ImageIcon, 
  Maximize, 
  Minimize, 
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
  Youtube,
  Menu,
  X as XIcon
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
import PdfToImageTool from './components/tools/PdfToImage/PdfToImageTool';
import SvgConverterTool from './components/tools/SvgConverter/SvgConverterTool';
import PdfToCsvTool from './components/tools/PdfToCsv/PdfToCsvTool';
import CsvToPdfTool from './components/tools/CsvToPdf/CsvToPdfTool';
import PdfToExcelTool from './components/tools/PdfToExcel/PdfToExcelTool';
import ExcelToPdfTool from './components/tools/ExcelToPdf/ExcelToPdfTool';

import ExcelToCsvTool from './components/tools/ExcelToCsv/ExcelToCsvTool';
import CsvToExcelTool from './components/tools/CsvToExcel/CsvToExcelTool';
import PdfToWordTool from './components/tools/PdfToWordTool';
import WordToPdfTool from './components/tools/WordToPdfTool';
import VideoToGifTool from './components/tools/VideoToGif/VideoToGifTool';
import NavigationLoginButton from './components/auth/NavigationLoginButton';
import AIFeatureGate from './components/auth/AIFeatureGate';
import LanguageSwitcher from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import MainSidebar from './components/layout/MainSidebar';
import { sidebarTools } from './lib/sidebarData';
import { useAuth } from './providers/AuthProvider';
import { seoPages, type SeoPageData } from './lib/seoData';

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
  'csv-to-pdf': {
    titleKey: 'Tools.csv-to-pdf-title',
    accentKey: 'Tools.csv-to-pdf-accent',
    descriptionKey: 'Tools.csv-to-pdf-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.csv-to-pdf-f1-title', descriptionKey: 'Tools.csv-to-pdf-f1-desc', icon: FileText, color: 'text-red-400' },
      { titleKey: 'Tools.csv-to-pdf-f2-title', descriptionKey: 'Tools.csv-to-pdf-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.csv-to-pdf-f3-title', descriptionKey: 'Tools.csv-to-pdf-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.csv-to-pdf-step1',
      'Tools.csv-to-pdf-step2',
      'Tools.csv-to-pdf-step3',
      'Tools.csv-to-pdf-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.csv-to-pdf-faq1-q', answerKey: 'Tools.csv-to-pdf-faq1-a' },
      { questionKey: 'Tools.csv-to-pdf-faq2-q', answerKey: 'Tools.csv-to-pdf-faq2-a' }
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
  'excel-to-pdf': {
    titleKey: 'Tools.excel-to-pdf-title',
    accentKey: 'Tools.excel-to-pdf-accent',
    descriptionKey: 'Tools.excel-to-pdf-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.excel-to-pdf-f1-title', descriptionKey: 'Tools.excel-to-pdf-f1-desc', icon: FileText, color: 'text-lime-400' },
      { titleKey: 'Tools.excel-to-pdf-f2-title', descriptionKey: 'Tools.excel-to-pdf-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.excel-to-pdf-f3-title', descriptionKey: 'Tools.excel-to-pdf-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.excel-to-pdf-step1',
      'Tools.excel-to-pdf-step2',
      'Tools.excel-to-pdf-step3',
      'Tools.excel-to-pdf-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.excel-to-pdf-faq1-q', answerKey: 'Tools.excel-to-pdf-faq1-a' },
      { questionKey: 'Tools.excel-to-pdf-faq2-q', answerKey: 'Tools.excel-to-pdf-faq2-a' }
    ]
  },
  'excel-to-csv': {
    titleKey: 'Tools.excel-to-csv-title',
    accentKey: 'Tools.excel-to-csv-accent',
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
  'csv-to-excel': {
    titleKey: 'Tools.csv-to-excel-title',
    accentKey: 'Tools.csv-to-excel-accent',
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
  'word-to-pdf': {
    titleKey: 'Tools.word-to-pdf-title',
    accentKey: 'Tools.word-to-pdf-accent',
    descriptionKey: 'Tools.word-to-pdf-desc',
    heroIcon: FileText,
    features: [
      { titleKey: 'Tools.word-to-pdf-f1-title', descriptionKey: 'Tools.word-to-pdf-f1-desc', icon: FileText, color: 'text-blue-500' },
      { titleKey: 'Tools.word-to-pdf-f2-title', descriptionKey: 'Tools.word-to-pdf-f2-desc', icon: Zap, color: 'text-yellow-400' },
      { titleKey: 'Tools.word-to-pdf-f3-title', descriptionKey: 'Tools.word-to-pdf-f3-desc', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    stepsKeys: [
      'Tools.word-to-pdf-step1',
      'Tools.word-to-pdf-step2',
      'Tools.word-to-pdf-step3',
      'Tools.word-to-pdf-step4'
    ],
    faqsKeys: [
      { questionKey: 'Tools.word-to-pdf-faq1-q', answerKey: 'Tools.word-to-pdf-faq1-a' },
      { questionKey: 'Tools.word-to-pdf-faq2-q', answerKey: 'Tools.word-to-pdf-faq2-a' }
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

export default function App({ toolSlug, seoOverride }: { toolSlug?: string; seoOverride?: SeoPageData }) {
  const t = useTranslations('Common');
  const tt = useTranslations('Tools');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasActiveLicense, loading: authLoading } = useAuth();

  // Use path-based toolSlug if provided, fall back to query param for backward compat
  const activeTool = toolSlug || searchParams.get('tool') || 'pdf-to-excel';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setActiveTool = (toolId: string) => {
    // Navigate to clean path-based URL
    router.push(`/tools/${toolId}`, { scroll: false });
  };

  // Reset FAQ when tool changes
  useEffect(() => {
    setOpenFaq(null);
  }, [activeTool]);


  const currentContent = toolContent[activeTool] || toolContent['pdf-to-excel'];
  const activeToolData = sidebarTools.find(t => t.id === activeTool) || 
                        sidebarTools.flatMap(t => t.children || []).find(c => c.id === activeTool);

  const combinedFaqs = seoOverride
    ? [
        ...seoOverride.faqs,
        {
          question: t('securityFaqQuestion'),
          answer: t('securityFaqAnswer')
        },
        {
          question: t('loginFaqQuestion'),
          answer: t('loginFaqAnswer')
        }
      ]
    : [
        ...currentContent.faqsKeys.map((faq) => ({
          question: tt(faq.questionKey.split('.')[1]),
          answer: tt(faq.answerKey.split('.')[1])
        })),
        {
          question: t('securityFaqQuestion'),
          answer: t('securityFaqAnswer')
        },
        {
          question: t('loginFaqQuestion'),
          answer: t('loginFaqAnswer')
        }
      ];

  const coreToolSlug = activeTool;
  const relatedUseCases = Object.values(seoPages).filter(
    (page) => page.coreTool === coreToolSlug
  );
  const filteredUseCases = seoOverride
    ? relatedUseCases.filter((page) => page.slug !== seoOverride.slug)
    : relatedUseCases;

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f1115] text-black dark:text-gray-300 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-[70] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <MainSidebar activeTool={activeTool} onToolSelect={(toolId) => {
          setActiveTool(toolId);
          setIsSidebarOpen(false);
        }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto scroll-smooth w-full lg:w-auto">
        {/* Navbar */}
        <header className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white dark:bg-[#0f1115] sticky top-0 z-50">
          <div className="flex items-center gap-4 lg:gap-6 flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 text-black dark:text-gray-400 hover:text-black dark:text-white transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <XIcon size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="hidden sm:block text-sm font-medium text-black dark:text-gray-400 hover:text-black dark:text-white transition-colors">
              Home
            </Link>
            <Link href="/tools" className="text-sm font-medium text-black dark:text-white transition-colors">
              Tools
            </Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <NavigationLoginButton />
            {!authLoading && !hasActiveLicense && (
              <Link 
                href="/account/subscription"
                className="hidden md:block bg-[#d4ff33] text-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-[#c2eb2e] transition-colors whitespace-nowrap"
              >
                {t('goPro')}
              </Link>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4 md:px-8 py-8 md:py-16 max-w-5xl mx-auto w-full">
          <div className="text-center mb-8 md:mb-12">
            <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-black dark:text-gray-500 mb-4">
              <a href="#" className="hover:text-black dark:text-gray-300">{t('home')}</a>
              <span>/</span>
              <span className="text-black dark:text-gray-400">{activeToolData?.nameKey ? tt(activeToolData.nameKey.split('.')[1]) : 'Tool'}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-bold text-black dark:text-white mb-4 md:mb-6">
              {seoOverride ? seoOverride.h1 : tt(currentContent.titleKey.split('.')[1])} <span className="italic text-black dark:text-[#d4ff33]">{seoOverride ? seoOverride.h1Accent : tt(currentContent.accentKey.split('.')[1])}</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
              {seoOverride ? seoOverride.subtitle : tt(currentContent.descriptionKey.split('.')[1])}
            </p>
          </div>

          {/* Tool Area */}
          <div className="mb-16">
            {activeTool === 'bg-remover' ? (
              <AIFeatureGate toolId="bg-remover">
                <BackgroundRemover />
              </AIFeatureGate>
            ) : activeTool === 'compress-images' ? (
              <CompressImagesTool />
            ) : activeTool === 'compress-pdf' ? (
              <CompressPdfTool />
            ) : activeTool === 'compress-video' ? (
              <CompressVideoTool />
            ) : activeTool === 'watermark' ? (
              <WatermarkTool />
            ) : activeTool === 'watermark-remover' ? (
              <AIFeatureGate toolId="watermark-remover">
                <WatermarkRemoverTool />
              </AIFeatureGate>
            ) : activeTool === 'image-to-text' ? (
              <AIFeatureGate toolId="image-to-text">
                <ImageToTextTool />
              </AIFeatureGate>
            ) : activeTool === 'resize' ? (
              <ImageResizerTool />
            ) : activeTool === 'image-converter' ? (
              <ImageConverterTool />
            ) : activeTool === 'heic-to-png' ? (
              <HeicConverterTool />
            ) : activeTool === 'pdf-to-image' ? (
              <PdfToImageTool />
            ) : activeTool === 'svg-to-png' ? (
              <SvgConverterTool />
            ) : activeTool === 'pdf-to-csv' ? (
              <PdfToCsvTool />
            ) : activeTool === 'csv-to-pdf' ? (
              <CsvToPdfTool />
            ) : activeTool === 'pdf-to-excel' ? (
              <PdfToExcelTool />
            ) : activeTool === 'excel-to-pdf' ? (
              <ExcelToPdfTool />
            ) : activeTool === 'excel-to-csv' ? (
              <ExcelToCsvTool />
            ) : activeTool === 'csv-to-excel' ? (
              <CsvToExcelTool />
            ) : activeTool === 'pdf-to-word' ? (
              <PdfToWordTool />
            ) : activeTool === 'word-to-pdf' ? (
              <WordToPdfTool />
            ) : activeTool === 'video-to-gif' ? (
              <VideoToGifTool />
            ) : (
              <motion.div 
                whileHover={{ scale: 1.005 }}
                className="border-2 border-dashed border-lime-400/30 bg-lime-400/5 rounded-[32px] p-8 md:p-20 min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center group cursor-pointer transition-colors hover:border-lime-400/50 mx-4 md:mx-0"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <button className="bg-[#d4ff33] text-black px-4 py-2.5 sm:px-6 sm:py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center gap-1 sm:gap-2 hover:bg-[#c2eb2e] transition-colors shadow-lg shadow-lime-400/20 text-xs sm:text-sm md:text-base whitespace-nowrap">
                    {t('chooseFiles')} <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="text-black dark:text-gray-500 text-xs md:text-sm text-center">{t('dropFilesHere')}</p>
              </motion.div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-12 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-16 md:mb-32 px-4">
            <span>{t('billionUsers')}</span>
            <span>{t('isoCompliance')}</span>
            <span>{t('gdprCompliant')}</span>
          </div>

          {/* Features Section */}
          <div className="text-center mb-10 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4">{tt(currentContent.titleKey.split('.')[1])} {tt(currentContent.accentKey.split('.')[1])} {t('inSeconds')}</h2>
            <p className="text-black dark:text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              {t('toolDesignedSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 md:mb-32 px-4 md:px-0">
            {currentContent.features.map((feature, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors">
                <div className={`w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center ${feature.color} mb-6`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-black dark:text-white font-bold mb-3">{tt(feature.titleKey.split('.')[1])}</h3>
                <p className="text-black dark:text-gray-500 text-sm leading-relaxed">
                  {tt(feature.descriptionKey.split('.')[1])}
                </p>
              </div>
            ))}
          </div>

          {/* How To Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-32 px-4 md:px-0">
            <div className="relative group order-2 lg:order-1">
              <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-[4/3] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-4 md:mx-0">
                <Image
                  src="/amico.svg"
                  alt={t('alt.processGuide')}
                  width={500}
                  height={375}
                  className="object-contain p-6 md:p-8 w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 px-4 md:px-0">
              <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-6 md:mb-8">{t('howTo')} {tt(currentContent.titleKey.split('.')[1])} {tt(currentContent.accentKey.split('.')[1])} {t('forFree')}</h2>
              <div className="space-y-4 md:space-y-6">
                {currentContent.stepsKeys.map((stepKey, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#d4ff33] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <p className="text-black dark:text-gray-400 leading-relaxed">{tt(stepKey.split('.')[1])}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="max-w-3xl mx-auto mb-16 md:mb-32 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white text-center mb-8 md:mb-12">
              {seoOverride ? `${seoOverride.h1} ${seoOverride.h1Accent} FAQs` : `${tt(currentContent.titleKey.split('.')[1])} ${tt(currentContent.accentKey.split('.')[1])} ${t('faqs')}`}
            </h2>
            <div className="space-y-3 md:space-y-4">
              {combinedFaqs.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-black dark:text-white">{faq.question}</span>
                    <ChevronDown className={`text-lime-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-6 text-gray-600 dark:text-gray-500 text-sm leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Related Use Cases Section */}
          {filteredUseCases.length > 0 && (
            <div className="max-w-3xl mx-auto mb-16 md:mb-32 px-4 md:px-0 border-t border-black/5 dark:border-white/5 pt-16">
              <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white text-center mb-8 md:mb-12">
                {t('directoryPopularTasks')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredUseCases.map((useCase) => (
                  <Link
                    key={useCase.slug}
                    href={`/${useCase.slug}`}
                    className="group flex flex-col justify-center p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#d4ff33] dark:hover:border-[#d4ff33] transition-all hover:scale-[1.01] duration-200"
                  >
                    <span className="text-sm font-bold text-black dark:text-white group-hover:text-[#d4ff33] dark:group-hover:text-[#d4ff33] transition-colors">
                      {useCase.title.split('|')[0].trim()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {useCase.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black py-12 md:py-20 px-6 md:px-16 border-t border-black/10 dark:border-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="w-6 h-6 bg-[#d4ff33] rounded flex items-center justify-center text-black font-bold text-sm">
                    R
                  </div>
                  <span className="text-black dark:text-white font-bold text-lg">Refinedocs</span>
                </div>
                <p className="text-black dark:text-gray-600 text-sm leading-relaxed max-w-sm">
                  {t('weMakePdfEasy')}
                </p>
              </div>
              
              <div>
                <h4 className="text-black dark:text-white font-bold mb-6">{t('solutions')}</h4>
                <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
                  <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{t('sales')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{t('finance')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{t('realEstate')}</Link></li>
                  <li><Link href="/#solutions" className="hover:text-black dark:text-white transition-colors">{t('education')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-black dark:text-white font-bold mb-6">{t('company')}</h4>
                <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
                  <li><Link href="/#about" className="hover:text-black dark:text-white transition-colors">{t('about')}</Link></li>
                  <li><Link href="/help" className="hover:text-black dark:text-white transition-colors">{t('help')}</Link></li>
                  <li><Link href="/blog" className="hover:text-black dark:text-white transition-colors">{t('blog')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-black dark:text-white font-bold mb-6">{t('product')}</h4>
                <ul className="space-y-4 text-black dark:text-gray-500 text-sm">
                  <li><Link href="/#price" className="hover:text-black dark:text-white transition-colors">{t('pricing')}</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 md:pt-10 border-t border-black/10 dark:border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            <div className="flex items-center gap-6">
                <a href="https://www.linkedin.com/in/konwolorentz/" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on LinkedIn" className="text-black dark:text-gray-600 hover:opacity-80 transition-opacity"><Linkedin size={20} /></a>
                <a href="https://x.com/LorentzKonwo" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on X" className="text-black dark:text-gray-600 hover:opacity-80 transition-opacity"><Twitter size={20} /></a>
                <a href="https://www.youtube.com/@konwolorentz7285" target="_blank" rel="noopener noreferrer" aria-label="Lorentz Konwo on YouTube" className="text-black dark:text-gray-600 hover:opacity-80 transition-opacity"><Youtube size={20} /></a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[10px] md:text-[11px] text-black dark:text-gray-600 uppercase tracking-widest font-bold">
                <span>{t('copyright')}</span>
                <Link href="/privacy" className="hover:text-black dark:text-white transition-colors">{t('privacyNotice')}</Link>
                <Link href="/terms" className="hover:text-black dark:text-white transition-colors">{t('termsConditions')}</Link>
                <a href="mailto:contact@refinedocs.com" className="hover:text-black dark:text-white transition-colors">{t('contactUs')}</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
