import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Allow Supabase (For your uploaded products)
      {
        protocol: 'https',
        hostname: 'kdwpnvkgghdksnajalmj.supabase.co',
        port: '',
        pathname: '/**',
      },
      // 2. Allow Unsplash (For dummy images/categories)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;