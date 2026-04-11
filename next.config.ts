/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    // This stops Vercel from processing images, stopping the 5k limit count.
    unoptimized: true, 
    qualities: [60, 75, 90], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kxsthielcdurxinctkxi.supabase.co', // 🚀 Naya Supabase ID
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'image-proxy-aurax.tahseenalam345.workers.dev', // 🚀 Aapka Cloudflare Shield Worker
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  swcMinify: true, 
};

export default nextConfig;