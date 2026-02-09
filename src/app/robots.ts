import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aura-x-three.vercel.app'; 

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/cart/',
        '/checkout/',
        '/success/',
        '/login/',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // <--- This must match your real domain
  };
}