import { writeFileSync, readdirSync, existsSync } from 'fs';

const SITE = 'https://refinedocs.com';
const API_KEY = '2ea7f78466e549dd981da16cfd3dd02d';
const locales = ['en', 'es', 'fr', 'pt-PT', 'it'];
const today = new Date().toISOString().split('T')[0];

const tools = [
  'bg-remover','watermark','watermark-remover','image-to-text','resize',
  'compress-images','compress-pdf','compress-video','image-converter',
  'heic-to-png','pdf-to-image','svg-to-png','pdf-to-csv','csv-to-pdf',
  'pdf-to-excel','excel-to-pdf','excel-to-csv','csv-to-excel',
  'pdf-to-word','word-to-pdf','video-to-gif'
];

const blogDir = './src/content/blog';
const blogs = existsSync(blogDir)
  ? readdirSync(blogDir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''))
  : [];

const pages = [
  { path: '', priority: '1.0', freq: 'daily' },
  { path: '/tools', priority: '0.9', freq: 'weekly' },
  { path: '/blog', priority: '0.7', freq: 'weekly' },
  { path: '/help', priority: '0.6', freq: 'monthly' },
  { path: '/contact', priority: '0.5', freq: 'monthly' },
  { path: '/privacy', priority: '0.3', freq: 'yearly' },
  { path: '/terms', priority: '0.3', freq: 'yearly' },
  { path: '/imprint', priority: '0.3', freq: 'yearly' },
];

let urlsXml = '';
let urlList = [];

const addUrl = (loc, priority, freq) => {
  urlsXml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  urlList.push(loc);
};

// Core pages per locale
for (const p of pages) {
  for (const l of locales) {
    addUrl(`${SITE}/${l}${p.path}`, p.priority, p.freq);
  }
}

// Tool pages per locale
for (const t of tools) {
  for (const l of locales) {
    addUrl(`${SITE}/${l}/tools?tool=${t}`, '0.8', 'weekly');
  }
}

// Blog posts per locale
for (const b of blogs) {
  for (const l of locales) {
    addUrl(`${SITE}/${l}/blog/${b}`, '0.7', 'monthly');
  }
}

// Write sitemap.xml
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}</urlset>
`;
writeFileSync('public/sitemap.xml', xml);

// Write indexnow.json
const indexNowData = {
  host: "refinedocs.com",
  key: API_KEY,
  keyLocation: `https://refinedocs.com/${API_KEY}.txt`,
  urlList: urlList
};
writeFileSync('public/indexnow.json', JSON.stringify(indexNowData, null, 2));

console.log('✅ sitemap.xml written with ' + urlList.length + ' URLs');
console.log('✅ indexnow.json written with ' + urlList.length + ' URLs');
