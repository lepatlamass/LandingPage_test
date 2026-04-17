import React from 'react';
import '../index.css';
import type { Metadata } from 'next';

const SITE_URL = 'https://backgrounds-on-demand.web.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Refinedocs – Free All-in-One Document & Image Tools',
    template: '%s | Refinedocs',
  },
  description:
    'Convert PDF to Excel, Word & CSV. Remove backgrounds, watermarks, extract text with OCR, resize, compress images & more — all free, fast & secure.',
  keywords: [
    'PDF to Excel',
    'PDF to Word',
    'PDF to CSV',
    'background remover',
    'watermark remover',
    'image to text',
    'OCR',
    'image compressor',
    'image resizer',
    'video to GIF',
    'file converter',
    'free document tools',
    'Refinedocs',
  ],
  authors: [{ name: 'Refinedocs' }],
  creator: 'Refinedocs',
  publisher: 'Refinedocs',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Refinedocs',
    title: 'Refinedocs – Free All-in-One Document & Image Tools',
    description:
      'Convert PDF to Excel, Word & CSV. Remove backgrounds, watermarks, extract text with OCR, resize, compress images & more — all free, fast & secure.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1024,
        height: 1024,
        alt: 'Refinedocs – All-in-One Document & Image Tools',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refinedocs – Free All-in-One Document & Image Tools',
    description:
      'Convert PDF to Excel, Word & CSV. Remove backgrounds, watermarks, extract text with OCR, resize, compress images & more — all free, fast & secure.',
    images: ['/og-image.jpg'],
    creator: '@refinedocs',
  },
  icons: {
    icon: '/favicon.ico',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': `${SITE_URL}/en`,
      'es': `${SITE_URL}/es`,
      'fr': `${SITE_URL}/fr`,
      'it': `${SITE_URL}/it`,
      'pt-BR': `${SITE_URL}/pt-BR`,
      'pt-PT': `${SITE_URL}/pt-PT`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
