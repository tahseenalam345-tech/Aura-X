import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from "@/lib/supabase";
import ProductClient from "./ProductClient"; 

// FIX: Define params as a Promise for Next.js 15 compatibility
type Props = {
  params: Promise<{ id: string }>
}

// 1. THIS RUNS ON THE SERVER (For Google/SEO/Social Media)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  
  // Await the params before using them
  const { id } = await params;

  // 🚀 SEO FIX: Added 'category' to the select query so we can make the SEO tag smart
  const { data: product } = await supabase
    .from('products')
    .select('name, description, main_image, price, category')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | AURA-X' }
  }

  // 🚀 SEO MAGIC: Dynamically generate the perfect SEO tag
  const seoCategory = product.category?.toLowerCase() === 'women' ? "Women's" : product.category?.toLowerCase() === 'couple' ? "Couple" : "Men's";
  const seoAltText = `${product.name} - Premium Luxury ${seoCategory} Watch in Pakistan | AURA-X`;

  const title = `${product.name} | Luxury Watches Pakistan`;
  const description = product.description?.slice(0, 160) || `Buy ${product.name} online at AURA-X. Discover Swiss precision and timeless elegance.`;
  
  // 🚀 OFFICIAL DOMAIN UPDATE: Now pointing to your custom URL
  const productImageUrl = product.main_image || 'https://www.aurax-watches.com/og-image.jpg';

  return {
    title: title,
    description: description,
    // 🚀 OFFICIAL DOMAIN UPDATE
    metadataBase: new URL('https://www.aurax-watches.com'),
    openGraph: {
      title: title,
      description: `Rs. ${product.price?.toLocaleString()} - Shop ${product.name} at AURA-X. Swiss Precision, Timeless Elegance.`,
      url: `/product/${id}`,
      siteName: 'AURA-X',
      images: [
        {
          url: productImageUrl,
          width: 1200,
          height: 630,
          alt: seoAltText, // 🚀 SEO INJECTED HERE FOR SOCIAL MEDIA & GOOGLE BOTS
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [productImageUrl],
    },
  }
}

// 2. THIS RENDERS THE PAGE
export default function ProductPage() {
  return <ProductClient />;
}