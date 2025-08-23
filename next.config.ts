import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Allow up to 2MB to handle 1MB images + form data
    },
  },
};

export default nextConfig;
