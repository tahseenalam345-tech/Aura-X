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
  specs?: any; 
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(product.main_image || product.image || "/placeholder.jpg");
  const [activeColorName, setActiveColorName] = useState("");
  
  const hasVariants = product.colors && product.colors.length > 1;
  const isOutOfStock = product.specs?.stock !== undefined && Number(product.specs.stock) <= 0;

  const originalPrice = product.original_price && product.original_price > product.price
      ? product.original_price 
      : 0; 

  let discount = product.discount || 0;
  if (discount === 0 && originalPrice > product.price) {
      discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }

  const realReviews = product.manual_reviews || [];
  const reviewCount = product.reviews_count && product.reviews_count > 0 ? product.reviews_count : realReviews.length;

  const avgRating = realReviews.length > 0
    ? (realReviews.reduce((acc, r) => acc + r.rating, 0) / realReviews.length).toFixed(1)
    : (product.rating || 5.0); 

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
      {/* UPGRADED: Champagne Luxury Gradient instead of Flat White */}
      <div className="relative h-full bg-gradient-to-br from-[#FDFBF7] via-[#F1E8D1] to-[#E3CBA1] rounded-[1.2rem] transition-all duration-300 flex flex-col overflow-hidden border border-aura-gold/40 shadow-[0_4px_15px_rgba(212,175,55,0.1)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:-translate-y-1 ring-1 ring-white/50">
        
        <Link href={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden">
            
            {/* OUT OF STOCK BADGE */}
            {isOutOfStock && (
                <div className="absolute top-2 left-2 z-30 pointer-events-none">
                    <span className="bg-red-600/90 backdrop-blur-sm text-white text-[9px] md:text-xs font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest border border-red-500 whitespace-nowrap">
                        Out of Stock
                    </span>
                </div>
            )}

            {/* SALE BADGE */}
            {discount > 0 && !isOutOfStock && (
                <div className="absolute top-2 right-2 z-30 pointer-events-none">
                    <span className="bg-[#750000] text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-widest font-sans">
                        -{discount}%
                    </span>
                </div>
            )}

            {/* FIXED TAGS */}
            {product.tags && product.tags.length > 0 && !isOutOfStock && (
                 <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none max-w-[85%]">
                    {product.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="bg-[#1E1B18]/95 backdrop-blur-sm text-aura-gold border border-aura-gold/30 text-[8px] md:text-[9px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis block">
                            {tag}
                        </span>
                    ))}
                 </div>
            )}

            {/* UPGRADE: mix-blend-multiply makes image white backgrounds disappear and blend into the champagne card */}
            <div className="relative w-full h-full mix-blend-multiply">
                <Image
                    src={activeImage}
                    alt={`Luxury watch: ${product.name}`}
                    fill
                    quality={85} 
                    className={`object-cover transition-transform duration-500 ease-out ${isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={priority}
                    unoptimized={true} 
                    loading={priority ? undefined : "lazy"}
                    decoding="async"
                />
            </div>
        </Link>

        <div className="px-3 pb-3 md:px-4 md:pb-4 flex-1 flex flex-col justify-between z-10 relative">
            <div className="mt-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] md:text-[11px] text-[#8B6E4E] font-black tracking-[0.2em] uppercase">
                      {product.category || "LUXURY"}
                  </p>
                  
                  {hasVariants && (
                    <div className="flex gap-1 bg-white/50 p-0.5 rounded-full border border-black/5">
                      {product.colors?.slice(0,3).map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => { setActiveImage(color.image); setActiveColorName(color.name); }}
                          onClick={(e) => { e.preventDefault(); setActiveImage(color.image); }}
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-black/20 transition-transform ${activeImage === color.image ? 'ring-1 ring-aura-gold ring-offset-1 scale-125' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Link href={`/product/${product.id}`}>
                  {/* FIXED TITLE HEIGHT */}
                  <h3 className="text-[#1E1B18] font-serif font-bold text-xs md:text-sm leading-[1.3] line-clamp-2 min-h-[32px] md:min-h-[38px] group-hover:text-[#C5A67C] transition-colors mb-0.5">
                      {product.name}
                  </h3>
                  <div className="h-[14px]">
                      {activeColorName && <p className="text-[9px] text-[#8B6E4E] font-medium italic line-clamp-1">{activeColorName}</p>}
                  </div>
                </Link>
            </div>

            {/* UPGRADE: Fixed height wrapper. Stars ONLY show if reviews > 0 */}
            <div className="h-[18px] mt-1 flex items-center">
                {reviewCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-[#D4AF37]">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={10} 
                                    fill={star <= Number(avgRating) ? "currentColor" : "none"} 
                                    className={star <= Number(avgRating) ? "text-[#D4AF37]" : "text-gray-400"}
                                />
                            ))}
                        </div>
                        <span className="text-[9px] text-[#8B6E4E] font-bold">
                            ({reviewCount})
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between border-t border-aura-gold/20 pt-2 md:pt-3">
                <div className="flex flex-col">
                    {originalPrice > product.price && (
                        <span className="text-xs md:text-sm text-[#8B6E4E] line-through decoration-2 decoration-[#8B6E4E]/60 mb-0.5 font-serif font-bold">
                            Rs {originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={`text-sm md:text-base font-serif font-bold ${isOutOfStock ? 'text-gray-500' : 'text-[#1E1B18]'}`}>
                        Rs {product.price.toLocaleString()}
                    </span>
                </div>
                
                <button 
                  type="button"
                  onClick={isOutOfStock ? undefined : handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-20 ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1E1B18] text-white hover:bg-aura-gold hover:text-black hover:scale-110 cursor-pointer'}`}
                  aria-label={isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
                >
                    <ShoppingBag size={12} className="md:w-4 md:h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}