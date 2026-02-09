"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;       // Support for old mock data
  main_image?: string; // Support for new Supabase data
  category?: string;
  original_price?: number; // Real DB field
  discount?: number;       // Real DB field
  rating?: number;
  reviews_count?: number;
  tags?: string[];
}

export function ProductCard({ product }: { product: Product }) {
  // 1. Resolve Image
  const imageUrl = product.main_image || product.image || "/placeholder.jpg";

  // 2. Resolve Original Price
  const originalPrice = product.original_price && product.original_price > product.price
      ? product.original_price 
      : Math.round(product.price * 1.2); 

  // 3. Resolve Discount %
  const discount = product.discount 
      ? product.discount 
      : Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // 4. Resolve Reviews
  const rating = product.rating || 5.0;
  const reviewCount = product.reviews_count || 120;

  return (
    <Link href={`/product/${product.id}`} className="group block relative h-full touch-manipulation">
      {/* FIX: Added 'transform-gpu' and 'will-change-transform'. 
         This forces mobile phones to use the GPU for rendering, fixing the "stuck" scroll feel.
      */}
      <div className="relative h-full bg-gradient-to-b from-[#ffffff] to-[#fffdf5] rounded-[1.5rem] p-0 shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-aura-gold/20 group-hover:border-aura-gold group-hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all duration-500 flex flex-col overflow-hidden transform-gpu will-change-transform z-0">
        
        {/* SALE BADGE */}
        {discount > 0 && (
            <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="bg-[#8B0000] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wider">
                    -{discount}%
                </span>
            </div>
        )}

        {/* TAGS */}
        {product.tags && product.tags.length > 0 && (
             <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
                {product.tags.slice(0, 1).map(tag => (
                    <span key={tag} className="bg-aura-gold/20 backdrop-blur-sm text-aura-brown border border-aura-brown/10 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {tag}
                    </span>
                ))}
             </div>
        )}

        {/* IMAGE AREA - FIXED FOR MOBILE */}
        {/* Added 'w-full' and explicit aspect ratio container to prevent collapse/overlap */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#F4F1EA]/30 group-hover:bg-[#F4F1EA] transition-colors duration-500">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
            /* FIX: Optimized sizes for mobile grid (2 columns) vs desktop (4 columns). 
               This stops the phone from downloading huge images.
            */
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
            <div>
                {/* Category Label */}
                <p className="text-[10px] text-aura-gold font-bold tracking-[0.2em] uppercase mb-1">
                    {product.category || "Luxury"}
                </p>
                
                {/* Title */}
                <h3 className="text-aura-brown font-serif font-bold text-sm md:text-base leading-tight line-clamp-2 group-hover:text-aura-gold transition-colors">
                    {product.name}
                </h3>
            </div>

            {/* Bottom Section */}
            <div className="mt-2">
                 {/* Rating */}
                 <div className="flex items-center gap-1 mb-2">
                    <Star size={10} className="fill-aura-gold text-aura-gold" />
                    <span className="text-[10px] text-gray-500 font-medium">{rating} ({reviewCount} reviews)</span>
                 </div>

                <div className="flex items-end justify-between border-t border-aura-gold/10 pt-3">
                    {/* Prices */}
                    <div className="flex flex-col">
                        {originalPrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through decoration-aura-gold/50">
                                Rs {originalPrice.toLocaleString()}
                            </span>
                        )}
                        <span className="text-sm md:text-lg font-serif font-bold text-aura-brown">
                            Rs {product.price.toLocaleString()}
                        </span>
                    </div>
                    
                    {/* Stylish Button */}
                    <button className="bg-aura-brown text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:bg-aura-gold group-hover:scale-110 transition-all duration-300 active:scale-95">
                        <ShoppingBag size={14} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}