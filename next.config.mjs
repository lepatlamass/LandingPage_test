import createNextIntlPlugin from 'next-intl/plugin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Increase timeout for static page generation during CI (238 pages)
  staticPageGenerationTimeout: 180,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/help',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/:locale/help',
        destination: '/:locale/faq',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    // Fix for pdfjs-dist + eval-source-map conflict
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    
    // Ensure proper resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default withNextIntl(nextConfig);
