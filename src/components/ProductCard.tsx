"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;       
  main_image?: string; 
  category?: string;
  original_price?: number; 
  discount?: number;       
  rating?: number;
  reviews_count?: number;
  tags?: string[];
  manual_reviews?: { rating: number }[]; 
}

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image || product.image || "/placeholder.jpg";

  // --- PRICE LOGIC ---
  const originalPrice = product.original_price && product.original_price > product.price
      ? product.original_price 
      : 0; 

  let discount = product.discount || 0;
  if (discount === 0 && originalPrice > product.price) {
      discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }

  // --- REVIEW LOGIC ---
  const realReviews = product.manual_reviews || [];
  const reviewCount = product.reviews_count && product.reviews_count > 0 ? product.reviews_count : realReviews.length;

  const avgRating = realReviews.length > 0
    ? (realReviews.reduce((acc, r) => acc + r.rating, 0) / realReviews.length).toFixed(1)
    : (product.rating || 5.0); 

  return (
    <Link href={`/product/${product.id}`} className="group block relative h-full">
      <div className="relative h-full bg-[#FAF9F6] rounded-[1.2rem] transition-all duration-300 flex flex-col overflow-hidden border border-aura-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]">
        
        {/* --- IMAGE AREA --- */}
        <div className="relative aspect-square w-full overflow-hidden">
            
            {/* SALE BADGE */}
            {discount > 0 && (
                <div className="absolute top-3 right-3 z-30 pointer-events-none">
                    <span className="bg-[#750000] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-widest font-sans">
                        -{discount}%
                    </span>
                </div>
            )}

            {/* TAGS */}
            {product.tags && product.tags.length > 0 && (
                 <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none max-w-[50%]">
                    {product.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="bg-[#C5A67C] text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-sm truncate">
                            {tag}
                        </span>
                    ))}
                 </div>
            )}

            {/* PRODUCT IMAGE */}
            <div className="relative w-full h-full">
                <Image
                    src={imageUrl}
                    alt={`Luxury watch: ${product.name}`}
                    fill
                    quality={85} 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="px-4 pb-4 md:px-5 md:pb-5 flex-1 flex flex-col justify-between">
            <div className="mt-3">
                <p className="text-[9px] md:text-[10px] text-[#C5A67C] font-extrabold tracking-[0.2em] uppercase mb-2">
                    {product.category || "LUXURY"}
                </p>
                <h3 className="text-[#1A1A1A] font-serif font-bold text-sm md:text-[1.05rem] leading-[1.3] line-clamp-2 group-hover:text-[#C5A67C] transition-colors mb-2">
                    {product.name}
                </h3>
            </div>

            <div className="space-y-3 mt-1">
                 <div className="flex items-center gap-1.5">
                    <div className="flex text-[#D4AF37]">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={10} 
                                fill={star <= Number(avgRating) ? "currentColor" : "none"} 
                                className={star <= Number(avgRating) ? "text-[#D4AF37]" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">
                        ({reviewCount} reviews)
                    </span>
                 </div>

                <div className="flex items-end justify-between border-t border-black/5 pt-3">
                    <div className="flex flex-col">
                        {originalPrice > product.price && (
                            <span className="text-[11px] text-gray-500 line-through mb-0.5 font-sans font-medium">
                                Rs {originalPrice.toLocaleString()}
                            </span>
                        )}
                        <span className="text-sm md:text-lg font-serif font-bold text-[#1A1A1A]">
                            Rs {product.price.toLocaleString()}
                        </span>
                    </div>
                    
                    <button 
                      className="w-8 h-8 md:w-9 md:h-9 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow-md group-hover:bg-[#C5A67C] group-hover:scale-110 transition-all duration-300"
                      aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingBag size={14} className="md:w-4 md:h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}