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

const faqs = [
  {
    question: "Can I convert a scanned PDF to Excel?",
    answer: "Yes! Our OCR (Optical Character Recognition) technology can extract text and tables from scanned PDF documents and convert them into editable Excel spreadsheets."
  },
  {
    question: "Is the PDF to Excel converter free to use?",
    answer: "Smallpdf offers a free version for basic tasks. For unlimited conversions and advanced features like OCR, you can sign up for a 7-day free trial of our Pro plan."
  },
  {
    question: "Is the Convert PDF to Excel tool safe to use?",
    answer: "Absolutely. We use high-level SSL encryption to ensure your documents are handled securely. Files are automatically deleted from our servers after processing."
  }
];

export default function App() {
  const [activeTool, setActiveTool] = useState('pdf-to-excel');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            {sidebarTools.map((tool) => (
              <div key={tool.id} className="space-y-1">
                <button
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    activeTool === tool.id 
                      ? 'bg-white/10 text-white' 
                      : `text-gray-400 hover:text-gray-200 ${tool.hover}`
                  }`}
                >
                  <div className={`p-1.5 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${tool.color}`}>
                    <tool.icon size={18} />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{tool.name}</span>
                  {tool.children && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeTool === tool.id ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {tool.children && activeTool === tool.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="pl-11 space-y-1"
                  >
                    {tool.children.map((child) => (
                      <button
                        key={child.id}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {child.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto scroll-smooth">
        {/* Navbar */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 bg-[#0f1115] sticky top-0 z-50">
          <nav className="flex items-center gap-8">
            <a href="#" className="text-sm font-medium hover:text-white transition-colors">Tools</a>
            <a href="#" className="text-sm font-medium hover:text-white transition-colors">Compress</a>
            <div className="relative group/menu">
              <a href="#" className="text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
                Convert <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform" />
              </a>
              
              {/* Sub-menu (Tab Bar style) */}
              <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200">
                <div className="bg-[#1a1c21] border border-gray-800 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl min-w-[450px]">
                  <button className="flex-1 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-bold transition-all whitespace-nowrap">
                    Compress Images
                  </button>
                  <button className="flex-1 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-sm font-medium transition-all whitespace-nowrap">
                    Compress PDF
                  </button>
                  <button className="flex-1 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-sm font-medium transition-all whitespace-nowrap">
                    Compress Video
                  </button>
                </div>
              </div>
            </div>
            <a href="#" className="text-sm font-medium hover:text-white transition-colors">Merge</a>
            <a href="#" className="text-sm font-medium hover:text-white transition-colors">Edit</a>
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
              <span className="text-gray-400">PDF to Excel</span>
            </nav>
            <h1 className="text-5xl font-bold text-white mb-6">
              PDF to <span className="italic text-[#d4ff33]">Excel</span> Converter Online
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Extract tables from your PDF files into editable Excel spreadsheets with high accuracy, no signups or downloads necessary.
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
            <h2 className="text-3xl font-bold text-white mb-4">Convert PDF to Excel in Seconds</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Our tool accurately extracts tables, numbers, and formatting, making it easy to edit however you want.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-32">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-white font-bold mb-3">Work With Scanned Documents</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Easily extract text from scanned PDFs using optical character recognition (OCR). Turn photos of invoices into editable Excel files.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-white font-bold mb-3">Teamwork Made Easy</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                After converting, easily share your Excel files with teammates. Generate a shareable link or email it directly from the Smallpdf cloud.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-white font-bold mb-3">Fast, Hassle-Free Conversion</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                No complex software, no long installations, no sign-ups—just quick, hassle-free conversion. Upload your PDF and get back to work.
              </p>
            </div>
          </div>

          {/* How To Convert Section */}
          <div className="grid grid-cols-2 gap-16 items-center mb-32">
            <div className="relative group">
              <div className="absolute -inset-4 bg-lime-400/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative rounded-[32px] overflow-hidden border border-white/10 aspect-[4/3]">
                <img 
                  src="https://picsum.photos/seed/office-warm/800/600" 
                  alt="Conversion process" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">How To Convert PDF to Excel for Free</h2>
              <div className="space-y-6">
                {[
                  "Import or drag & drop your PDF file to our converter.",
                  "Apply OCR to PDFs without editable text (Pro feature).",
                  "Click \"Convert\" and wait just a few seconds.",
                  "Download or share your converted XLSX file—easy!"
                ].map((step, i) => (
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
            <h2 className="text-3xl font-bold text-white text-center mb-12">PDF to Excel FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
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
