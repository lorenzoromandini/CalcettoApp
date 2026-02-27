import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

const nextConfig: NextConfig = {
  // turbopack: {},
  
  // Enable logging for server actions
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Non riscrivere file statici di Next.js
        {
          source: '/_next/:path*',
          destination: '/_next/:path*',
        },
        // Non riscrivere API routes
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
        // Rewrite all other routes to /it prefix (hidden from URL)
        {
          source: '/:path((?!_next|api).*)',
          destination: '/it/:path*',
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
