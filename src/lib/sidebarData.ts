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
  Type
} from 'lucide-react';

export const sidebarTools = [
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
  { 
    id: 'pdf-to-csv-menu', 
    nameKey: 'Tools.pdf-to-csv', 
    icon: FileCode, 
    color: 'text-red-400', 
    hover: 'hover:bg-red-400/10',
    children: [
      { id: 'pdf-to-csv', nameKey: 'Tools.pdf-to-csv' },
      { id: 'csv-to-pdf', nameKey: 'Tools.csv-to-pdf' },
    ]
  },
  { 
    id: 'pdf-to-excel-menu', 
    nameKey: 'Tools.pdf-to-excel', 
    icon: FileSpreadsheet, 
    color: 'text-lime-400', 
    hover: 'hover:bg-lime-400/10',
    children: [
      { id: 'pdf-to-excel', nameKey: 'Tools.pdf-to-excel' },
      { id: 'excel-to-pdf', nameKey: 'Tools.excel-to-pdf' },
    ]
  },
  { 
    id: 'excel-csv-menu', 
    nameKey: 'Tools.excel-csv', 
    icon: FileSpreadsheet, 
    color: 'text-emerald-400', 
    hover: 'hover:bg-emerald-400/10',
    children: [
      { id: 'excel-to-csv', nameKey: 'Tools.excel-to-csv' },
      { id: 'csv-to-excel', nameKey: 'Tools.csv-to-excel' },
    ]
  },
  { 
    id: 'pdf-word-menu', 
    nameKey: 'Tools.pdf-to-word', 
    icon: FileText, 
    color: 'text-blue-500', 
    hover: 'hover:bg-blue-500/10',
    children: [
      { id: 'pdf-to-word', nameKey: 'Tools.pdf-to-word' },
      { id: 'word-to-pdf', nameKey: 'Tools.word-to-pdf' },
    ]
  },
  { id: 'video-to-gif', nameKey: 'Tools.video-to-gif', icon: FileVideo, color: 'text-purple-500', hover: 'hover:bg-purple-500/10' },
];
