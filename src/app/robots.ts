import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aurax-watches.com'; 

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
    sitemap: `${baseUrl}/sitemap.xml`, // <--- Matches your real domain now
  };
}