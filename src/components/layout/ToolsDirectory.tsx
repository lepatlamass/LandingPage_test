import { getTranslations } from 'next-intl/server';
import { Link } from '../../navigation';
import { 
  Minimize, 
  Image as ImageIcon, 
  Video, 
  RefreshCw, 
  FileText, 
  Eraser, 
  Droplets, 
  Type, 
  Maximize, 
  FileSpreadsheet, 
  FileCode, 
  FileVideo 
} from 'lucide-react';

export default async function ToolsDirectory() {
  const tCommon = await getTranslations('Common');
  const tTools = await getTranslations('Tools');

  const toolDirectory = [
    {
      title: tCommon('directoryCompress'),
      tools: [
        { id: "compress-pdf", name: tTools('compress-pdf'), icon: Minimize },
        { id: "compress-images", name: tTools('compress-images'), icon: ImageIcon },
        { id: "compress-video", name: tTools('compress-video'), icon: Video },
      ]
    },
    {
      title: tCommon('directoryConvert'),
      tools: [
        { id: "image-converter", name: tTools('image-converter'), icon: RefreshCw },
        { id: "heic-to-png", name: tTools('heic-to-png'), icon: ImageIcon },
        { id: "pdf-to-image", name: tTools('pdf-to-image'), icon: FileText },
        { id: "svg-to-png", name: tTools('svg-to-png'), icon: ImageIcon },
      ]
    },
    {
      title: tCommon('directoryAiTools'),
      tools: [
        { id: "bg-remover", name: tTools('bg-remover'), icon: Eraser },
        { id: "watermark-remover", name: tTools('watermark-remover'), icon: Droplets },
        { id: "image-to-text", name: tTools('image-to-text'), icon: Type },
      ]
    },
    {
      title: tCommon('directoryViewEdit'),
      tools: [
        { id: "watermark", name: tTools('watermark'), icon: Droplets },
        { id: "resize", name: tTools('resize'), icon: Maximize },
      ]
    },
    {
      title: tCommon('directoryConvertFromPdf'),
      tools: [
        { id: "pdf-to-word", name: tTools('pdf-to-word'), icon: FileText },
        { id: "pdf-to-excel", name: tTools('pdf-to-excel'), icon: FileSpreadsheet },
        { id: "pdf-to-csv", name: tTools('pdf-to-csv'), icon: FileCode },
      ]
    },
    {
      title: tCommon('directoryConvertToPdf'),
      tools: [
        { id: "word-to-pdf", name: tTools('word-to-pdf'), icon: FileText },
        { id: "excel-to-pdf", name: tTools('excel-to-pdf'), icon: FileSpreadsheet },
        { id: "csv-to-pdf", name: tTools('csv-to-pdf'), icon: FileCode },
      ]
    },
    {
      title: tCommon('directorySpreadsheet'),
      tools: [
        { id: "excel-to-csv", name: tTools('excel-to-csv'), icon: FileSpreadsheet },
        { id: "csv-to-excel", name: tTools('csv-to-excel'), icon: FileSpreadsheet },
      ]
    },
    {
      title: tCommon('directoryMedia'),
      tools: [
        { id: "video-to-gif", name: tTools('video-to-gif'), icon: FileVideo },
      ]
    }
  ];

  return (
    <section className="py-20 bg-[#0a0b0e] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-12 text-white">{tCommon('allTools')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
          {toolDirectory.map((category, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-6 border-b border-white/5 pb-2">
                {category.title}
              </h3>
              <ul className="space-y-4">
                {category.tools.map((tool, toolIdx) => (
                  <li key={toolIdx}>
                    <Link
                      href={`/tools?tool=${tool.id}`}
                      className="group flex items-center gap-3 text-gray-400 hover:text-[#d4ff33] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#d4ff33]/10 transition-colors">
                        <tool.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-sm font-medium">{tool.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
