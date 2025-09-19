import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sapir-and-idan-henna-albums.s3.il-central-1.amazonaws.com',
        port: '',
        pathname: '/henna-uploads/**',
      },
    ],
  },
};

export default nextConfig;
