/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    // This stops Vercel from processing images, stopping the 5k limit count.
    unoptimized: true, 
    qualities: [60, 75, 90], // 🚀 FIX: Ab 60 aur 90 quality par error nahi aayega
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kdwpnvkgghdksnajalmj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  swcMinify: true,
  // 🚀 NAYA RULE: Supabase ko cdn-images ke peechay chhupana taake Cloudflare cache kare
  async rewrites() {
    return [
      {
        source: '/cdn-images/:path*',
        destination: 'https://kdwpnvkgghdksnajalmj.supabase.co/storage/v1/object/public/product-images/:path*'
      }
    ]
  }
};

export default nextConfig;