import React from 'react';
import { ArrowRight, FileText, Image as ImageIcon, Sparkles, FileSpreadsheet, Droplets, Minimize, Maximize } from 'lucide-react';
import { Link } from '@/navigation';

interface WorkflowAction {
  slug: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const WORKFLOW_MAPPING: Record<string, WorkflowAction[]> = {
  'compress-pdf': [
    { slug: 'pdf-to-word', label: 'Convert to Word', description: 'Need to edit this PDF?', icon: FileText, color: 'text-blue-500' },
    { slug: 'watermark', label: 'Add Watermark', description: 'Protect your document', icon: Droplets, color: 'text-purple-500' },
  ],
  'pdf-to-word': [
    { slug: 'compress-pdf', label: 'Compress PDF', description: 'Make the file smaller', icon: Minimize, color: 'text-green-500' },
    { slug: 'word-to-pdf', label: 'Convert Back to PDF', description: 'Lock formatting', icon: FileText, color: 'text-red-500' },
  ],
  'word-to-pdf': [
    { slug: 'compress-pdf', label: 'Compress PDF', description: 'Reduce file size', icon: Minimize, color: 'text-green-500' },
    { slug: 'pdf-to-excel', label: 'Convert to Excel', description: 'Extract tables', icon: FileSpreadsheet, color: 'text-emerald-500' },
  ],
  'bg-remover': [
    { slug: 'resize', label: 'Resize Image', description: 'Perfect for social media', icon: Maximize, color: 'text-cyan-500' },
    { slug: 'compress-images', label: 'Compress Image', description: 'Optimize for web', icon: Minimize, color: 'text-green-500' },
  ],
  'resize': [
    { slug: 'compress-images', label: 'Compress Image', description: 'Reduce file size', icon: Minimize, color: 'text-green-500' },
    { slug: 'image-converter', label: 'Change Format', description: 'Convert to PNG/JPG', icon: ImageIcon, color: 'text-blue-500' },
  ],
  // Fallback default
  'default': [
    { slug: 'compress-pdf', label: 'Compress PDF', description: 'Reduce file size', icon: Minimize, color: 'text-green-500' },
    { slug: 'bg-remover', label: 'Remove Background', description: 'Make background transparent', icon: Sparkles, color: 'text-yellow-500' },
  ]
};

export default function WorkflowPrompts({ currentTool }: { currentTool: string }) {
  const actions = WORKFLOW_MAPPING[currentTool] || WORKFLOW_MAPPING['default'];

  return (
    <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 w-full text-left">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={16} className="text-[#84a12d] dark:text-[#d4ff33]" />
        Next Steps
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.slug}
            href={`/tools/${action.slug}`}
            className="group p-4 bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl flex items-center gap-4 hover:border-[#84a12d]/30 dark:hover:border-[#d4ff33]/30 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-black/20 shrink-0 ${action.color} border border-black/5 dark:border-white/5`}>
              <action.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{action.description}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#84a12d] dark:group-hover:text-[#d4ff33] transition-colors truncate">
                {action.label}
              </p>
            </div>
            <div className="shrink-0">
              <ArrowRight size={18} className="text-gray-400 group-hover:text-[#84a12d] dark:group-hover:text-[#d4ff33] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
