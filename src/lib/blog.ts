import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const contentDir = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  author: string;
  youtubeUrl?: string;
  readTime: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      return getPostBySlug(slug);
    })
    .filter(Boolean) as BlogPost[];

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const filePath = path.join(contentDir, `${slug}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const readStats = readingTime(content);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      category: data.category,
      tags: data.tags || [],
      author: data.author,
      youtubeUrl: data.youtubeUrl,
      readTime: readStats.text,
      content,
    };
  } catch (err) {
    return null;
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  
  return fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}
