import { MetadataRoute } from 'next';

const SITE_URL = 'https://refinedocs.com';

const locales = ['en', 'es', 'fr', 'pt-PT', 'it'];

const toolSlugs = [
  'bg-remover', 'watermark', 'watermark-remover', 'image-to-text', 'resize',
  'compress-images', 'compress-pdf', 'compress-video',
  'image-converter', 'heic-to-png', 'pdf-to-image', 'svg-to-png',
  'pdf-to-csv', 'csv-to-pdf', 'pdf-to-excel', 'excel-to-pdf',
  'excel-to-csv', 'csv-to-excel', 'pdf-to-word', 'word-to-pdf',
  'video-to-gif',
];

const staticPages = ['', '/tools', '/blog', '/help', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split('T')[0];
  const entries: MetadataRoute.Sitemap = [];

  // Static pages across all locales
  for (const page of staticPages) {
    for (const locale of locales) {
      const priority = page === '' ? 1.0 : page === '/tools' ? 0.9 : page === '/blog' || page === '/help' ? 0.7 : 0.3;
      const changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' =
        page === '' ? 'daily' : page === '/tools' ? 'weekly' : page === '/blog' || page === '/help' ? 'weekly' : 'yearly';

      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  }

  // Tool pages — each tool × each locale = unique URL
  for (const slug of toolSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}/tools/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
