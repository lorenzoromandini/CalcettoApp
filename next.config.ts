import type { NextConfig } from "next";
import { execSync } from 'child_process';

const nextConfig: NextConfig = {
  // PWA configuration
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

  // Build service worker after Next.js build completes
  webpack: (config, { isServer, nextRuntime }) => {
    // Add workbox window for client-side SW registration
    if (!isServer && nextRuntime !== 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'workbox-window': 'workbox-window/build/workbox-window.prod.mjs',
      };
    }
    return config;
  },
};

export default nextConfig;
