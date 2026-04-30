import { setRequestLocale } from 'next-intl/server';
import { getAllPosts } from '../../../lib/blog';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import YouTubeBanner from '../../../components/blog/YouTubeBanner';
import BlogClient from '../../../components/blog/BlogClient';

import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Blog | Refinedocs',
    description: 'Tips, Guides, and Tools for Mastering Your Documents',
    alternates: {
      canonical: `https://refinedocs.com/${locale}/blog`,
    },
    openGraph: {
      title: 'Blog | Refinedocs',
      description: 'Tips, Guides, and Tools for Mastering Your Documents',
      url: `https://refinedocs.com/${locale}/blog`,
      type: 'website',
    },
  };
}

export function generateStaticParams() {
  return ['en', 'es', 'fr', 'it', 'pt-PT'].map((locale) => ({ locale }));
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#d4ff33] selection:text-black">
      <Navbar />

      <main className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Refinedocs <span className="text-[#d4ff33]">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tips, guides, and masterclasses to help you get the most out of your documents and images.
          </p>
        </div>

        <YouTubeBanner />

        <div className="mt-16">
          <BlogClient initialPosts={posts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
