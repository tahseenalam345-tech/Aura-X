"use client";

import React, { useState } from "react"; 
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

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
  colors?: { name: string; hex: string; image: string }[]; 
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useCart();

  // --- COLOR & IMAGE SWITCHING LOGIC ---
  const [activeImage, setActiveImage] = useState(product.main_image || product.image || "/placeholder.jpg");
  const [activeColorName, setActiveColorName] = useState("");
  
  const hasVariants = product.colors && product.colors.length > 1;

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

  // --- ADD TO CART HANDLER ---
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: activeImage, 
        quantity: 1,
        color: activeColorName || "Standard",
        isGift: false,
        addBox: false
    });
    toast.success("Added to Cart");
  };

  return (
    <div className="group block relative h-full">
      <div className="relative h-full bg-[#FAF9F6] rounded-[1.2rem] transition-all duration-300 flex flex-col overflow-hidden border border-aura-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]">
        
        <Link href={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden">
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
                 <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none w-auto max-w-[70%]">
                    {product.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="bg-[#1E1B18] text-aura-gold border border-aura-gold/30 text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-md whitespace-normal leading-tight">
                            {tag}
                        </span>
                    ))}
                 </div>
            )}

            {/* PRODUCT IMAGE - UPDATED FOR PERFORMANCE */}
            <div className="relative w-full h-full">
                <Image
                    src={activeImage}
                    alt={`Luxury watch: ${product.name}`}
                    fill
                    quality={85} 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={priority}
                    // EMERGENCY FIX: Stop Vercel from transforming these 79 product images
                    unoptimized={true} 
                    // ONLY load when in view to keep site speed high
                    loading={priority ? undefined : "lazy"}
                    decoding="async"
                />
            </div>
        </Link>

        {/* --- CONTENT AREA --- */}
        <div className="px-4 pb-4 md:px-5 md:pb-5 flex-1 flex flex-col justify-between">
            <div className="mt-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] md:text-xs text-[#8B6E4E] font-black tracking-[0.2em] uppercase">
                      {product.category || "LUXURY"}
                  </p>
                  
                  {/* --- COLOR SWATCHES --- */}
                  {hasVariants && (
                    <div className="flex gap-1.5 bg-white/50 p-1 rounded-full border border-black/5">
                      {product.colors?.map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => { setActiveImage(color.image); setActiveColorName(color.name); }}
                          onClick={(e) => { e.preventDefault(); setActiveImage(color.image); }}
                          className={`w-3 h-3 rounded-full border border-black/10 transition-transform hover:scale-125 ${activeImage === color.image ? 'ring-1 ring-aura-gold ring-offset-1' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Link href={`/product/${product.id}`}>
                  <h3 className="text-[#1A1A1A] font-serif font-bold text-sm md:text-[1.05rem] leading-[1.3] line-clamp-2 group-hover:text-[#C5A67C] transition-colors mb-1">
                      {product.name}
                  </h3>
                  {activeColorName && <p className="text-[10px] text-aura-gold font-medium italic mb-2">{activeColorName}</p>}
                </Link>
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
                        ({reviewCount})
                    </span>
                 </div>

                <div className="flex items-end justify-between border-t border-black/5 pt-3">
                    <div className="flex flex-col">
                        {originalPrice > product.price && (
                            <span className="text-[11px] text-gray-900 line-through mb-0.5 font-sans font-bold opacity-80">
                                Rs {originalPrice.toLocaleString()}
                            </span>
                        )}
                        <span className="text-sm md:text-lg font-serif font-bold text-[#1A1A1A]">
                            Rs {product.price.toLocaleString()}
                        </span>
                    </div>
                    
                <button 
                      type="button"
                      onClick={handleAddToCart}
                      className="w-8 h-8 md:w-9 md:h-9 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#C5A67C] hover:scale-110 transition-all duration-300 cursor-pointer z-20"
                      aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingBag size={14} className="md:w-4 md:h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}