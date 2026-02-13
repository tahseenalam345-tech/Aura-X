/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERFORMANCE FIX: Re-enable build checks to ensure stability
  typescript: {
    ignoreBuildErrors: false, // Changed from true
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed from true
  },
  
  images: {
    // Advanced image optimization (AVIF is 20% smaller than WebP)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kdwpnvkgghdksnajalmj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // OPTIONAL: Add compiler optimization for faster production builds
  swcMinify: true, 
};

export default nextConfig;