import { Link } from '../../navigation';
import { ArrowRight, Zap } from 'lucide-react';

// Maps blog post tags/categories to relevant tool slugs
const TOOL_MAPPING: Record<string, { slug: string; label: string }[]> = {
  // By category
  'PDF Tools': [
    { slug: 'pdf-to-excel', label: 'PDF to Excel' },
    { slug: 'pdf-to-word', label: 'PDF to Word' },
    { slug: 'pdf-to-csv', label: 'PDF to CSV' },
    { slug: 'compress-pdf', label: 'Compress PDF' },
  ],
  'Image Tools': [
    { slug: 'bg-remover', label: 'Background Remover' },
    { slug: 'image-converter', label: 'Image Converter' },
    { slug: 'compress-images', label: 'Compress Images' },
    { slug: 'resize', label: 'Image Resizer' },
  ],
  'Compression': [
    { slug: 'compress-pdf', label: 'Compress PDF' },
    { slug: 'compress-images', label: 'Compress Images' },
    { slug: 'compress-video', label: 'Compress Video' },
  ],
  'Media Tools': [
    { slug: 'video-to-gif', label: 'Video to GIF' },
    { slug: 'compress-video', label: 'Compress Video' },
  ],
  // By tag (more specific)
  'heic': [{ slug: 'heic-to-png', label: 'HEIC to PNG Converter' }],
  'png': [{ slug: 'image-converter', label: 'Image Converter' }],
  'svg': [{ slug: 'svg-to-png', label: 'SVG to PNG Converter' }],
  'ocr': [{ slug: 'image-to-text', label: 'Image to Text (OCR)' }],
  'watermark': [{ slug: 'watermark', label: 'Add Watermark' }],
  'background-removal': [{ slug: 'bg-remover', label: 'Background Remover' }],
  'pdf to csv': [{ slug: 'pdf-to-csv', label: 'PDF to CSV Converter' }],
  'convert pdf': [{ slug: 'pdf-to-excel', label: 'PDF to Excel' }],
  'compress': [{ slug: 'compress-pdf', label: 'Compress PDF' }],
  'video': [{ slug: 'video-to-gif', label: 'Video to GIF' }],
  'gif': [{ slug: 'video-to-gif', label: 'Video to GIF' }],
  'excel': [{ slug: 'pdf-to-excel', label: 'PDF to Excel' }],
  'csv': [{ slug: 'pdf-to-csv', label: 'PDF to CSV' }],
  'word': [{ slug: 'pdf-to-word', label: 'PDF to Word' }],
  'image': [{ slug: 'image-converter', label: 'Image Converter' }],
};

function getRelatedTools(category: string, tags: string[]): { slug: string; label: string }[] {
  const seen = new Set<string>();
  const tools: { slug: string; label: string }[] = [];

  // Tag-based matches first (more specific)
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    const matches = TOOL_MAPPING[tagLower] || TOOL_MAPPING[tag];
    if (matches) {
      for (const tool of matches) {
        if (!seen.has(tool.slug)) {
          seen.add(tool.slug);
          tools.push(tool);
        }
      }
    }
  }

  // Category-based matches
  const categoryMatches = TOOL_MAPPING[category];
  if (categoryMatches) {
    for (const tool of categoryMatches) {
      if (!seen.has(tool.slug)) {
        seen.add(tool.slug);
        tools.push(tool);
      }
    }
  }

  return tools.slice(0, 4); // Max 4 tools
}

interface RelatedToolsCTAProps {
  category: string;
  tags: string[];
}

export default function RelatedToolsCTA({ category, tags }: RelatedToolsCTAProps) {
  const relatedTools = getRelatedTools(category, tags);

  if (relatedTools.length === 0) return null;

  return (
    <section className="my-16 bg-zinc-50 dark:bg-[#1a1c21] rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#d4ff33]/10 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#d4ff33]" />
        </div>
        <div>
          <h3 className="text-black dark:text-white font-bold text-lg">Try These Tools</h3>
          <p className="text-black dark:text-gray-400 text-sm">Put what you learned into practice — instantly, for free.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {relatedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111111] rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#d4ff33] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-black dark:text-gray-200 group-hover:text-black dark:group-hover:text-[#d4ff33] transition-colors">
              {tool.label}
            </span>
            <ArrowRight className="w-4 h-4 text-black dark:text-gray-500 group-hover:text-black dark:group-hover:text-[#d4ff33] group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  );
}
