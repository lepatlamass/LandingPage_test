'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '../../lib/blog';
import PostCard from './PostCard';

interface BlogClientProps {
  initialPosts: BlogPost[];
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(initialPosts.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [initialPosts]);

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return initialPosts;
    return initialPosts.filter(p => p.category === selectedCategory);
  }, [initialPosts, selectedCategory]);

  return (
    <>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === category
                ? 'bg-[#d4ff33] text-black shadow-[0_0_15px_rgba(212,255,51,0.2)]'
                : 'bg-[#1a1c21] text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1a1c21] rounded-3xl border border-white/5">
          <p className="text-gray-400">No posts found in this category.</p>
        </div>
      )}
    </>
  );
}
