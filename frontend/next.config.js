/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable service worker in development
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Disable static optimization for development
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig; 