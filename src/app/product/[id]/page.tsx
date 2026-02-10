import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from "@/lib/supabase";
import ProductClient from "./ProductClient"; 

// FIX: Define params as a Promise
type Props = {
  params: Promise<{ id: string }>
}

// 1. THIS RUNS ON THE SERVER (For Google/SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  
  // FIX: Await the params before using them
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('name, description, main_image')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | AURA-X' }
  }

  return {
    title: `${product.name} | Luxury Watches Pakistan`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online at AURA-X.`,
    openGraph: {
      images: [product.main_image || '/placeholder.jpg'],
      title: product.name,
      description: `Shop ${product.name} - AURA-X Luxury Timepieces.`,
    },
  }
}

// 2. THIS RENDERS THE PAGE
export default function ProductPage() {
  return <ProductClient />;
}