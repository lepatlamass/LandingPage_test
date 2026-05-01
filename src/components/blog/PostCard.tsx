import { Link } from '../../navigation';
import { Youtube, Clock, Calendar } from 'lucide-react';
import { BlogPost } from '../../lib/blog';

interface PostCardProps {
  post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group h-full">
      <article className="h-full bg-white dark:bg-[#1a1c21] border border-black/10 dark:border-white/5 border-l-[4px] border-l-[#d4ff33] rounded-2xl p-6 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 hover:transform hover:-translate-y-1 hover:shadow-2xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-[#d4ff33]/10 text-[#d4ff33] text-xs font-bold rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          {post.youtubeUrl && (
            <Youtube className="w-5 h-5 text-[#ff0000]" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-[#d4ff33] transition-colors leading-tight line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-black dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-black dark:text-gray-500 pt-4 border-t border-black/10 dark:border-white/5 mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
