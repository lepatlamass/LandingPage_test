import { Youtube } from 'lucide-react';

export default function YouTubeBanner() {
  return (
    <div className="bg-white dark:bg-[#1a1c21] border border-black/10 dark:border-white/5 rounded-3xl p-8 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#ff0000]/10 flex items-center justify-center shrink-0">
          <Youtube className="w-8 h-8 text-[#ff0000]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Subscribe to our YouTube Channel</h2>
          <p className="text-black dark:text-gray-400">Get step-by-step video tutorials and feature updates.</p>
        </div>
      </div>
      <a 
        href="https://www.youtube.com/@konwolorentz7285" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-6 py-3 bg-[#ff0000] text-black dark:text-white font-bold rounded-xl hover:bg-[#cc0000] transition-colors whitespace-nowrap"
      >
        Subscribe & Watch
      </a>
    </div>
  );
}
