import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ⚠️ REAL DOMAIN SET
  const baseUrl = 'https://aurax-watches.com'; 

  const { data: products } = await supabase
    .from('products')
    .select('id, created_at');

  const productUrls = products?.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/men`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/women`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/couple`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/support/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support/return`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...productUrls];
}