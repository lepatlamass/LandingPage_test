/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

const sidebarTools = [
  { id: 'bg-remover', name: 'Background Remover', icon: Eraser, color: 'text-orange-400', hover: 'hover:bg-orange-400/10' },
  { id: 'watermark', name: 'Watermark', icon: Droplets, color: 'text-blue-400', hover: 'hover:bg-blue-400/10' },
  { id: 'watermark-remover', name: 'Watermark Remover', icon: Droplets, color: 'text-purple-400', hover: 'hover:bg-purple-400/10' },
  { id: 'image-to-text', name: 'Image to Text', icon: Type, color: 'text-pink-400', hover: 'hover:bg-pink-400/10' },
  { id: 'resize', name: 'Resize', icon: Maximize, color: 'text-cyan-400', hover: 'hover:bg-cyan-400/10' },
  { id: 'compress', name: 'Compress', icon: Minimize, color: 'text-green-400', hover: 'hover:bg-green-400/10' },
  { 
    id: 'convert', 
    name: 'Convert', 
    icon: RefreshCw, 
    color: 'text-yellow-400', 
    hover: 'hover:bg-yellow-400/10',
    children: [
      { id: 'compress-images', name: 'Compress Images' },
      { id: 'compress-pdf', name: 'Compress PDF' },
      { id: 'compress-video', name: 'Compress Video' },
    ]
  },
  { id: 'pdf-to-csv', name: 'PDF to CSV', icon: FileCode, color: 'text-red-400', hover: 'hover:bg-red-400/10' },
  { id: 'pdf-to-excel', name: 'PDF to Excel', icon: FileSpreadsheet, color: 'text-lime-400', hover: 'hover:bg-lime-400/10' },
  { id: 'excel-csv', name: 'Excel / CSV', icon: FileSpreadsheet, color: 'text-emerald-400', hover: 'hover:bg-emerald-400/10' },
  { id: 'pdf-to-word', name: 'PDF to Word', icon: FileText, color: 'text-blue-500', hover: 'hover:bg-blue-500/10' },
  { id: 'video-to-gif', name: 'Video to GIF', icon: FileVideo, color: 'text-purple-500', hover: 'hover:bg-purple-500/10' },
];

interface ToolPageContent {
  title: string;
  accent: string;
  description: string;
  heroIcon: React.ElementType;
  features: {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[];
  steps: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

const toolContent: Record<string, ToolPageContent> = {
  'bg-remover': {
    title: 'Background',
    accent: 'Remover',
    description: 'Remove backgrounds from your images instantly with AI-powered precision. Perfect for product photos and portraits.',
    heroIcon: Eraser,
    features: [
      { title: 'AI-Powered Precision', description: 'Our advanced AI automatically detects and removes backgrounds with pixel-perfect accuracy.', icon: Zap, color: 'text-orange-400' },
      { title: 'Batch Processing', description: 'Upload multiple images at once and remove backgrounds in seconds.', icon: LayoutGrid, color: 'text-blue-400' },
      { title: 'High Resolution', description: 'Download your processed images in high resolution without any quality loss.', icon: Maximize, color: 'text-green-400' },
    ],
    steps: [
      'Upload your image file (JPG, PNG, WebP).',
      'Wait a few seconds for the AI to process.',
      'Review the result and make fine adjustments if needed.',
      'Download your transparent PNG instantly.'
    ],
    faqs: [
      { question: 'What image formats are supported?', answer: 'We support JPG, PNG, WebP, and BMP formats for background removal.' },
      { question: 'Is it free to use?', answer: 'Yes, you can remove backgrounds for free with some daily limits.' },
      { question: 'Is my data safe?', answer: 'Absolutely. All images are processed securely and deleted automatically.' }
    ]
  },
  'watermark': {
    title: 'Add',
    accent: 'Watermark',
    description: 'Protect your creative work by adding custom text or image watermarks to your photos and documents.',
    heroIcon: Droplets,
    features: [
      { title: 'Custom Branding', description: 'Add your logo or custom text to any image or PDF document.', icon: ShieldCheck, color: 'text-blue-400' },
      { title: 'Full Control', description: 'Adjust opacity, position, rotation, and size of your watermarks.', icon: Maximize, color: 'text-purple-400' },
      { title: 'Bulk Watermarking', description: 'Apply watermarks to hundreds of files at once to save time.', icon: Zap, color: 'text-yellow-400' },
    ],
    steps: [
      'Select the files you want to watermark.',
      'Upload your logo or type your custom text.',
      'Adjust the watermark placement and transparency.',
      'Process and download your protected files.'
    ],
    faqs: [
      { question: 'Can I use my own logo?', answer: 'Yes, you can upload any image file to use as a watermark.' },
      { question: 'Does it work with PDFs?', answer: 'Yes, our tool supports both images and PDF documents.' }
    ]
  },
  'watermark-remover': {
    title: 'Watermark',
    accent: 'Remover',
    description: 'Remove unwanted watermarks, logos, or text from your images using advanced AI inpainting technology.',
    heroIcon: Droplets,
    features: [
      { title: 'AI Inpainting', description: 'Our AI intelligently fills in the gaps after removing watermarks.', icon: Zap, color: 'text-purple-400' },
      { title: 'Clean Results', description: 'Get high-quality images without any visible traces of the original watermark.', icon: CheckCircle2, color: 'text-green-400' },
      { title: 'Fast Processing', description: 'Remove watermarks in seconds with our optimized cloud servers.', icon: Zap, color: 'text-cyan-400' },
    ],
    steps: [
      'Upload the image containing the watermark.',
      'Highlight the area you want to remove.',
      'Click "Remove" and wait for the AI to process.',
      'Download your clean, watermark-free image.'
    ],
    faqs: [
      { question: 'Will it affect image quality?', answer: 'Our AI is designed to preserve the original quality as much as possible.' },
      { question: 'Can it remove complex logos?', answer: 'Yes, it can handle most logos and text overlays effectively.' }
    ]
  },
  'image-to-text': {
    title: 'Image to',
    accent: 'Text',
    description: 'Convert images, screenshots, and scanned documents into editable text using high-accuracy OCR technology.',
    heroIcon: Type,
    features: [
      { title: 'High Accuracy OCR', description: 'Extract text from images with industry-leading accuracy.', icon: FileText, color: 'text-pink-400' },
      { title: 'Multi-Language Support', description: 'Recognize text in over 100 different languages.', icon: RefreshCw, color: 'text-blue-400' },
      { title: 'Export Options', description: 'Save your extracted text as TXT, Word, or PDF files.', icon: FileCode, color: 'text-yellow-400' },
    ],
    steps: [
      'Upload your image or scanned document.',
      'Select the language of the text in the image.',
      'Wait for the OCR engine to scan and extract text.',
      'Copy the text or download it as a document.'
    ],
    faqs: [
      { question: 'Does it work with handwriting?', answer: 'It works best with printed text, but can handle clear handwriting.' },
      { question: 'Can I convert multiple images?', answer: 'Yes, you can upload and process multiple images in a batch.' }
    ]
  },
  'resize': {
    title: 'Image',
    accent: 'Resize',
    description: 'Resize your images to specific dimensions or percentages while maintaining the best possible quality.',
    heroIcon: Maximize,
    features: [
      { title: 'Precise Dimensions', description: 'Set exact width and height or resize by percentage.', icon: Maximize, color: 'text-cyan-400' },
      { title: 'Aspect Ratio Lock', description: 'Keep your images from stretching by locking the aspect ratio.', icon: ShieldCheck, color: 'text-blue-400' },
      { title: 'Social Media Presets', description: 'Quickly resize for Instagram, Facebook, Twitter, and more.', icon: LayoutGrid, color: 'text-purple-400' },
    ],
    steps: [
      'Upload the images you want to resize.',
      'Choose your target dimensions or a preset.',
      'Select the output format and quality settings.',
      'Download your perfectly sized images.'
    ],
    faqs: [
      { question: 'Will my images look blurry?', answer: 'We use advanced resampling to minimize quality loss during resizing.' },
      { question: 'Can I resize in bulk?', answer: 'Yes, you can resize hundreds of images at once.' }
    ]
  },
  'compress': {
    title: 'File',
    accent: 'Compress',
    description: 'Reduce the file size of your images, PDFs, and videos without sacrificing visible quality.',
    heroIcon: Minimize,
    features: [
      { title: 'Smart Compression', description: 'Our algorithms find the perfect balance between size and quality.', icon: Zap, color: 'text-green-400' },
      { title: 'Huge Savings', description: 'Reduce file sizes by up to 90% for faster sharing and storage.', icon: Minimize, color: 'text-emerald-400' },
      { title: 'Privacy First', description: 'Your files are processed locally or on secure servers and deleted.', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    steps: [
      'Select the files you want to compress.',
      'Choose your desired compression level.',
      'Wait for the optimization process to finish.',
      'Download your smaller, optimized files.'
    ],
    faqs: [
      { question: 'Is there a file size limit?', answer: 'Free users can compress files up to 50MB. Pro users have higher limits.' },
      { question: 'Will it ruin my video quality?', answer: 'No, we use high-efficiency codecs to maintain visual clarity.' }
    ]
  },
  'pdf-to-excel': {
    title: 'PDF to',
    accent: 'Excel',
    description: 'Extract tables from your PDF files into editable Excel spreadsheets with high accuracy, no signups or downloads necessary.',
    heroIcon: FileSpreadsheet,
    features: [
      { title: 'Work With Scanned Documents', description: 'Easily extract text from scanned PDFs using optical character recognition (OCR).', icon: FileText, color: 'text-emerald-400' },
      { title: 'Teamwork Made Easy', description: 'After converting, easily share your Excel files with teammates via cloud links.', icon: Users, color: 'text-blue-400' },
      { title: 'Fast, Hassle-Free Conversion', description: 'No complex software, no long installations—just quick, hassle-free conversion.', icon: Zap, color: 'text-yellow-400' },
    ],
    steps: [
      'Import or drag & drop your PDF file to our converter.',
      'Apply OCR to PDFs without editable text (Pro feature).',
      'Click "Convert" and wait just a few seconds.',
      'Download or share your converted XLSX file—easy!'
    ],
    faqs: [
      { question: 'Can I convert a scanned PDF to Excel?', answer: 'Yes! Our OCR technology can extract text and tables from scanned PDF documents.' },
      { question: 'Is it free to use?', answer: 'Smallpdf offers a free version for basic tasks. Pro plan offers unlimited conversions.' },
      { question: 'Is it safe?', answer: 'Absolutely. We use high-level SSL encryption to ensure your documents are handled securely.' }
    ]
  },
  'pdf-to-csv': {
    title: 'PDF to',
    accent: 'CSV',
    description: 'Convert PDF tables to CSV format for easy data analysis and import into any database or spreadsheet software.',
    heroIcon: FileCode,
    features: [
      { title: 'Data Ready', description: 'Get clean CSV files ready for import into Python, R, or SQL.', icon: FileCode, color: 'text-red-400' },
      { title: 'Table Detection', description: 'Our AI automatically identifies table structures within your PDFs.', icon: LayoutGrid, color: 'text-blue-400' },
      { title: 'Fast Export', description: 'Convert large documents to CSV in just a few seconds.', icon: Zap, color: 'text-yellow-400' },
    ],
    steps: [
      'Upload your PDF document.',
      'Select the pages containing the tables.',
      'Choose CSV as your output format.',
      'Download your structured data file.'
    ],
    faqs: [
      { question: 'What is the difference between Excel and CSV?', answer: 'CSV is a plain text format, while Excel is a binary format with more features.' },
      { question: 'Can I choose the delimiter?', answer: 'Yes, you can choose between comma, semicolon, or tab delimiters.' }
    ]
  },
  'excel-csv': {
    title: 'Excel to',
    accent: 'CSV',
    description: 'Quickly convert your Excel spreadsheets (XLSX, XLS) to CSV format or vice versa with perfect data integrity.',
    heroIcon: FileSpreadsheet,
    features: [
      { title: 'Bidirectional', description: 'Convert Excel to CSV or CSV to Excel with one click.', icon: RefreshCw, color: 'text-emerald-400' },
      { title: 'Data Integrity', description: 'We ensure all your numbers, dates, and text remain exactly as they were.', icon: ShieldCheck, color: 'text-blue-400' },
      { title: 'No Data Loss', description: 'Handle large datasets without worrying about row limits or data truncation.', icon: LayoutGrid, color: 'text-purple-400' },
    ],
    steps: [
      'Upload your Excel or CSV file.',
      'Select the target format you want to convert to.',
      'Review the data preview if needed.',
      'Download your converted file instantly.'
    ],
    faqs: [
      { question: 'Does it support multiple sheets?', answer: 'Yes, you can choose which sheet to convert from an Excel file.' },
      { question: 'Is there a row limit?', answer: 'We support very large files, up to 1 million rows for Excel.' }
    ]
  },
  'pdf-to-word': {
    title: 'PDF to',
    accent: 'Word',
    description: 'Convert your PDF documents into editable Word files (DOCX) while preserving the original layout and formatting.',
    heroIcon: FileText,
    features: [
      { title: 'Perfect Layout', description: 'We keep your fonts, images, and alignment exactly like the original PDF.', icon: FileText, color: 'text-blue-500' },
      { title: 'Editable Text', description: 'Turn non-editable PDFs into fully editable Word documents.', icon: Type, color: 'text-pink-400' },
      { title: 'Cloud Integration', description: 'Save your Word files directly to Google Drive or Dropbox.', icon: RefreshCw, color: 'text-cyan-400' },
    ],
    steps: [
      'Upload your PDF file to the converter.',
      'Choose "Word" as the output format.',
      'Wait for the conversion to complete.',
      'Download your editable DOCX file.'
    ],
    faqs: [
      { question: 'Can I convert back to PDF?', answer: 'Yes, we also offer a Word to PDF converter tool.' },
      { question: 'Will the images be preserved?', answer: 'Yes, all images and graphics will be included in the Word file.' }
    ]
  },
  'video-to-gif': {
    title: 'Video to',
    accent: 'GIF',
    description: 'Create high-quality animated GIFs from your video clips. Perfect for social media, memes, and tutorials.',
    heroIcon: FileVideo,
    features: [
      { title: 'High Quality', description: 'Generate crisp, clear GIFs with optimized color palettes.', icon: FileVideo, color: 'text-purple-500' },
      { title: 'Trim & Crop', description: 'Select the exact part of the video you want to turn into a GIF.', icon: Maximize, color: 'text-cyan-400' },
      { title: 'Small File Size', description: 'Our optimization ensures your GIFs load fast everywhere.', icon: Minimize, color: 'text-green-400' },
    ],
    steps: [
      'Upload your video file (MP4, MOV, AVI).',
      'Select the start and end time for your GIF.',
      'Adjust the frame rate and resolution.',
      'Generate and download your animated GIF.'
    ],
    faqs: [
      { question: 'What video formats are supported?', answer: 'We support all major formats including MP4, MOV, AVI, and WebM.' },
      { question: 'Can I add text to my GIF?', answer: 'Yes, you can add custom text overlays in the editor.' }
    ]
  },
  'compress-images': {
    title: 'Compress',
    accent: 'Images',
    description: 'Reduce image file size without losing quality. Support for JPG, PNG, WebP, and more.',
    heroIcon: ImageIcon,
    features: [
      { title: 'Lossless Compression', description: 'Reduce size without any visible change in quality.', icon: Zap, color: 'text-green-400' },
      { title: 'Format Support', description: 'Works with all popular image formats.', icon: LayoutGrid, color: 'text-blue-400' },
      { title: 'Fast & Secure', description: 'Process images in seconds right in your browser.', icon: ShieldCheck, color: 'text-purple-400' },
    ],
    steps: [
      'Upload your images.',
      'Select compression level.',
      'Wait for optimization.',
      'Download compressed images.'
    ],
    faqs: [
      { question: 'Is there a limit?', answer: 'Free users can process up to 20 images at once.' }
    ]
  },
  'compress-pdf': {
    title: 'Compress',
    accent: 'PDF',
    description: 'Make your PDF files smaller for easier emailing and faster web loading.',
    heroIcon: FileText,
    features: [
      { title: 'Strong Compression', description: 'Reduce PDF size by up to 90%.', icon: Minimize, color: 'text-red-400' },
      { title: 'Maintain Quality', description: 'Text and images stay sharp and readable.', icon: CheckCircle2, color: 'text-green-400' },
      { title: 'Batch Mode', description: 'Compress multiple PDFs simultaneously.', icon: LayoutGrid, color: 'text-blue-400' },
    ],
    steps: [
      'Upload your PDF files.',
      'Choose compression strength.',
      'Download optimized PDFs.'
    ],
    faqs: [
      { question: 'Will it affect text?', answer: 'No, text remains fully searchable and sharp.' }
    ]
  },
  'compress-video': {
    title: 'Compress',
    accent: 'Video',
    description: 'Shrink video files for social media, email, or storage without losing clarity.',
    heroIcon: FileVideo,
    features: [
      { title: 'Efficient Codecs', description: 'Uses H.264 and H.265 for maximum efficiency.', icon: Zap, color: 'text-purple-400' },
      { title: 'Preset Sizes', description: 'Choose presets for Discord, WhatsApp, or Email.', icon: LayoutGrid, color: 'text-cyan-400' },
      { title: 'Preview Results', description: 'Check the quality before downloading.', icon: Search, color: 'text-yellow-400' },
    ],
    steps: [
      'Upload your video file.',
      'Select target size or quality.',
      'Wait for transcoding.',
      'Download compressed video.'
    ],
    faqs: [
      { question: 'How long does it take?', answer: 'Depends on video length, but usually just a few minutes.' }
    ]
  },
  'tools': {
    title: 'All',
    accent: 'Tools',
    description: 'Explore our full suite of document, image, and video processing tools. Everything you need in one place.',
    heroIcon: LayoutGrid,
    features: [
      { title: 'PDF Tools', description: 'Convert, merge, split, and compress PDF documents with ease.', icon: FileText, color: 'text-red-400' },
      { title: 'Image Tools', description: 'Remove backgrounds, resize, and watermark your photos.', icon: ImageIcon, color: 'text-blue-400' },
      { title: 'Video Tools', description: 'Compress videos and convert them to animated GIFs.', icon: FileVideo, color: 'text-purple-400' },
    ],
    steps: [
      'Browse our collection of online tools.',
      'Select the tool that fits your needs.',
      'Upload your files and process them instantly.',
      'Download your results for free.'
    ],
    faqs: [
      { question: 'Are all tools free?', answer: 'Yes, all our tools have a free tier for basic usage.' },
      { question: 'Do I need to install anything?', answer: 'No, all tools work directly in your web browser.' }
    ]
  },
  'merge': {
    title: 'Merge',
    accent: 'PDF',
    description: 'Combine multiple PDF files into a single document in seconds. Reorder pages as needed.',
    heroIcon: FileText,
    features: [
      { title: 'Easy Reordering', description: 'Drag and drop pages to arrange them in the perfect order.', icon: LayoutGrid, color: 'text-orange-400' },
      { title: 'Fast Merging', description: 'Combine dozens of files into one instantly.', icon: Zap, color: 'text-yellow-400' },
      { title: 'Secure Handling', description: 'Your documents are encrypted and deleted after processing.', icon: ShieldCheck, color: 'text-blue-400' },
    ],
    steps: [
      'Upload the PDF files you want to merge.',
      'Arrange the files in your preferred order.',
      'Click "Merge PDF" to combine them.',
      'Download your new single PDF document.'
    ],
    faqs: [
      { question: 'Is there a limit to how many files I can merge?', answer: 'Free users can merge up to 20 files at once.' }
    ]
  },
  'edit': {
    title: 'Edit',
    accent: 'PDF',
    description: 'Add text, shapes, comments, and highlights to your PDF documents directly in your browser.',
    heroIcon: FileText,
    features: [
      { title: 'Full Editing', description: 'Add text, images, and shapes to any PDF page.', icon: Type, color: 'text-pink-400' },
      { title: 'Annotation Tools', description: 'Highlight text and add comments for collaboration.', icon: FileText, color: 'text-blue-400' },
      { title: 'Form Filling', description: 'Easily fill out PDF forms and add your signature.', icon: CheckCircle2, color: 'text-green-400' },
    ],
    steps: [
      'Upload the PDF document you want to edit.',
      'Use our toolbar to add text, shapes, or highlights.',
      'Save your changes and preview the document.',
      'Download your edited PDF file.'
    ],
    faqs: [
      { question: 'Can I edit existing text?', answer: 'Our editor allows you to add new text and whiteout existing text.' }
    ]
  }
};

export default function App() {
  const [activeTool, setActiveTool] = useState('pdf-to-excel');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              const isActive = activeTool === tool.id || tool.children?.some(c => c.id === activeTool);
              return (
                <div key={tool.id} className="space-y-1">
                  <button
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-white/10 text-white' 
                        : `text-gray-400 hover:text-gray-200 ${tool.hover}`
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${tool.color}`}>
                      <tool.icon size={18} />
                    </div>
                    <span className="text-sm font-medium flex-1 text-left">{tool.name}</span>
                    {tool.children && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {tool.children && isActive && (
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
                          {child.name}
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
              onClick={() => setActiveTool('tools')}
              className={`text-sm font-medium transition-colors ${activeTool === 'tools' ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              Tools
            </button>
            <button 
              onClick={() => setActiveTool('compress')}
              className={`text-sm font-medium transition-colors ${activeTool === 'compress' ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              Compress
            </button>
            <div className="relative group/menu">
              <button 
                onClick={() => setActiveTool('convert')}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTool === 'convert' || ['compress-images', 'compress-pdf', 'compress-video'].includes(activeTool) 
                    ? 'text-[#d4ff33]' 
                    : 'hover:text-white'
                }`}
              >
                Convert <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform" />
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
                    Compress Images
                  </button>
                  <button 
                    onClick={() => setActiveTool('compress-pdf')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'compress-pdf' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Compress PDF
                  </button>
                  <button 
                    onClick={() => setActiveTool('compress-video')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeTool === 'compress-video' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Compress Video
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveTool('merge')}
              className={`text-sm font-medium transition-colors ${activeTool === 'merge' ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              Merge
            </button>
            <button 
              onClick={() => setActiveTool('edit')}
              className={`text-sm font-medium transition-colors ${activeTool === 'edit' ? 'text-[#d4ff33]' : 'hover:text-white'}`}
            >
              Edit
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-white transition-colors">Log In</button>
            <button className="bg-[#d4ff33] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#c2eb2e] transition-colors">
              Free Trial
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-8 py-16 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              <a href="#" className="hover:text-gray-300">Home</a>
              <span>/</span>
              <span className="text-gray-400">{activeToolData?.name || 'Tool'}</span>
            </nav>
            <h1 className="text-5xl font-bold text-white mb-6">
              {currentContent.title} <span className="italic text-[#d4ff33]">{currentContent.accent}</span> Online
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {currentContent.description}
            </p>
          </div>

          {/* Upload Area */}
          <motion.div 
            whileHover={{ scale: 1.005 }}
            className="border-2 border-dashed border-lime-400/30 bg-lime-400/5 rounded-[32px] p-20 flex flex-col items-center justify-center mb-8 group cursor-pointer transition-colors hover:border-lime-400/50"
          >
            <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 mb-6 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button className="bg-[#d4ff33] text-black px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#c2eb2e] transition-colors shadow-lg shadow-lime-400/20">
                CHOOSE FILES <ChevronDown size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm">or drop files here</p>
          </motion.div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-12 text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-32">
            <span>1.7 billion users</span>
            <span>ISO/IEC 27001</span>
            <span>GDPR Compliant</span>
          </div>

          {/* Features Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{currentContent.title} {currentContent.accent} in Seconds</h2>
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
                <h3 className="text-white font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
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
              <h2 className="text-3xl font-bold text-white mb-8">How To {currentContent.title} {currentContent.accent} for Free</h2>
              <div className="space-y-6">
                {currentContent.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#d4ff33] text-black flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <p className="text-gray-400 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="max-w-3xl mx-auto mb-32">
            <h2 className="text-3xl font-bold text-white text-center mb-12">{currentContent.title} {currentContent.accent} FAQs</h2>
            <div className="space-y-4">
              {currentContent.faqs.map((faq, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-white">{faq.question}</span>
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
                        {faq.answer}
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
            <h2 className="text-5xl font-bold text-black mb-6 tracking-tight">Do Business Better</h2>
            <p className="text-black/70 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Document work should be easy. Speed through your admin and document management with our suite of premium tools.
            </p>
            <button className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 shadow-xl">
              Try 7 Days Free
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
                  We make PDF easy.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6">Solutions</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Sales</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Finance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Real Estate</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Education</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Product</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Teams</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Embed PDF</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Apps</h4>
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
                <span>© 2026 Refindocs AG</span>
                <a href="#" className="hover:text-white transition-colors">Privacy Notice</a>
                <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-white transition-colors">Imprint</a>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
