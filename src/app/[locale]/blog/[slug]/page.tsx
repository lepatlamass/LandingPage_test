import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '../../../../navigation';
import { getPostBySlug, getAllSlugs, getAllPosts } from '../../../../lib/blog';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Calendar, Youtube } from 'lucide-react';
import PostCard from '../../../../components/blog/PostCard';

interface BlogPostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const locales = ['en', 'es', 'fr', 'it', 'pt-BR', 'pt-PT'];
  
  const params: { locale: string; slug: string }[] = [];
  slugs.forEach((slug) => {
    locales.forEach((locale) => {
      params.push({ locale, slug });
    });
  });

  return params;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Refinedocs',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} | Refinedocs Blog`,
    description: post.description,
    alternates: {
      canonical: `https://refinedocs.com/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `https://refinedocs.com/${locale}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3); // Max 3 related posts

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#d4ff33] mb-12 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
          
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1.5 bg-[#d4ff33]/10 text-[#d4ff33] text-sm font-bold rounded-full uppercase tracking-wider">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 font-medium text-white">
              <div className="w-8 h-8 rounded-full bg-[#2a2d39] flex items-center justify-center text-[#d4ff33]">
                {post.author.charAt(0)}
              </div>
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span suppressHydrationWarning>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        {post.youtubeUrl && (
          <div className="mb-16 bg-[#1a1c21] rounded-2xl p-6 sm:p-8 border border-[#ff0000]/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,0,0,0.05)]">
            <div className="flex items-center gap-4 text-[#ff0000]">
              <Youtube className="w-8 h-8" />
              <div className="text-left">
                <h3 className="font-bold text-white text-lg">Watch the Video Tutorial</h3>
                <p className="text-sm text-gray-400">Prefer watching? Catch the full guide on YouTube.</p>
              </div>
            </div>
            <a 
              href={post.youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#ff0000] text-white font-bold rounded-xl hover:bg-[#cc0000] transition-colors whitespace-nowrap w-full sm:w-auto text-center"
            >
              Watch on YouTube
            </a>
          </div>
        )}

        <article className="prose prose-invert prose-lg max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
          prose-a:text-[#d4ff33] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-strong:font-bold
          prose-ul:list-disc prose-ul:text-gray-300 prose-ul:ml-6
          prose-ol:list-decimal prose-ol:text-gray-300 prose-ol:ml-6
          prose-li:pl-2 prose-li:marker:text-gray-500
          prose-blockquote:border-l-[#d4ff33] prose-blockquote:bg-[#1a1c21] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-200">
          <ReactMarkdown
            components={{
              h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-12 mb-6 text-white" {...props}/>,
              h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-8 mb-4 text-white" {...props}/>,
              p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6 text-lg" {...props}/>,
              ul: ({node, ...props}) => <ul className="list-disc text-gray-300 ml-6 mb-8 space-y-2" {...props}/>,
              ol: ({node, ...props}) => <ol className="list-decimal text-gray-300 ml-6 mb-8 space-y-2" {...props}/>,
              li: ({node, ...props}) => <li className="pl-2 marker:text-gray-500" {...props}/>,
              strong: ({node, ...props}) => <strong className="text-white font-bold" {...props}/>,
              a: ({node, ...props}) => <a className="text-[#d4ff33] font-medium hover:underline transition-all" {...props}/>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#1a1c21] py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">Related Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <PostCard key={related.slug} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
