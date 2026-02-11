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

  const { data: product } = await supabase
    .from('products')
    .select('name, description, main_image, price')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | AURA-X' }
  }

  const title = `${product.name} | Luxury Watches Pakistan`;
  const description = product.description?.slice(0, 160) || `Buy ${product.name} online at AURA-X. Discover Swiss precision and timeless elegance.`;
  const productImageUrl = product.main_image || 'https://aura-x-three.vercel.app/og-image.jpg';

  return {
    title: title,
    description: description,
    // Base URL is required for absolute image paths in OG tags
    metadataBase: new URL('https://aura-x-three.vercel.app'),
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
          alt: product.name,
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