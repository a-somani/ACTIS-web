import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('./', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'paddle-billing.vercel.app',
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
