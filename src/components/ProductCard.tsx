"use client";

import React, { useState } from "react"; 
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import * as fbq from "@/lib/fpixel";

interface Product {
  id: string;
  name: string;
  brand?: string; 
  price: number;
  image?: string;       
  main_image?: string; 
  category?: string;
  sub_category?: string;
  original_price?: number; 
  discount?: number;       
  rating?: number;
  reviews_count?: number;
  tags?: string[];
  manual_reviews?: { rating: number }[]; 
  colors?: { name: string; hex: string; image: string }[]; 
  specs?: any; 
  variants?: any; // 🚀 ADDED TO HANDLE SIZES
  is_eid_exclusive?: boolean; 
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useCart();

  const initialColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
  const [activeImage, setActiveImage] = useState(initialColor?.image || product.main_image || product.image || "/placeholder.jpg");
  const [activeColorName, setActiveColorName] = useState(initialColor?.name || "");
  
  const hasVariants = product.colors && product.colors.length > 1;
  const hasSizes = product.variants?.sizes && product.variants.sizes.length > 0;
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
    : (product.rating && product.rating <= 5 ? product.rating : 5.0); 

  // 🚀 SMART TAGS: Changes label based on category
  const getCategoryLabel = () => {
      const cat = product.category?.toLowerCase() || '';
      const sub = product.sub_category?.toLowerCase() || '';
      if (['fragrances', 'perfume-men', 'perfume-women'].includes(cat)) return "FRAGRANCE";
      if (['wallets', 'belts'].includes(sub)) return "PREMIUM LEATHER";
      if (sub === 'sunglasses') return "EYEWEAR";
      if (sub === 'jewelry') return "JEWELRY";
      if (['smart-tech', 'smartwatches', 'earbuds'].includes(cat)) return "SMART TECH";
      return "TIMEPIECE";
  };

  const seoCategory = product.category?.toLowerCase() === 'women' ? "Women's" : product.category?.toLowerCase() === 'couple' ? "Couple" : "Men's";
  const seoAltText = `${product.name} - Premium ${getCategoryLabel()} in Pakistan | AURA-X`;
  
  const displayShortName = product.name?.includes('|') ? product.name.split('|')[0].trim() : product.name;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    // 🚀 If sizes exist, force user to product page to select size instead of direct add-to-cart
    if (hasSizes) {
       toast.error("Please select a size first!");
       return;
    }

    addToCart({
        id: product.id,
        name: displayShortName,
        price: product.price,
        image: activeImage, 
        quantity: 1,
        color: activeColorName || "Standard",
        isGift: false,
        addBox: false,
        isEidExclusive: product.is_eid_exclusive || false 
    });

    fbq.event('AddToCart', {
        content_name: displayShortName,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'PKR',
    });

    toast.success("Added to Cart");
  };

  return (
    <div className="group block relative h-full">
      <div className="relative h-full bg-gradient-to-br from-[#FDFBF7] via-[#F1E8D1] to-[#E3CBA1] rounded-2xl transition-all duration-300 flex flex-col overflow-hidden border border-aura-gold/40 shadow-[0_10px_30px_rgba(74,59,50,0.15)] hover:shadow-[0_20px_50px_rgba(74,59,50,0.35)] hover:-translate-y-1">
        
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none">
            {isOutOfStock && (
                <span className="bg-red-600/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                    Out of Stock
                </span>
            )}
            {product.tags && product.tags.length > 0 && !isOutOfStock && (
                 product.tags.slice(0, 1).map(tag => (
                    <span key={tag} className="bg-[#1E1B18]/95 backdrop-blur-sm text-aura-gold border border-aura-gold/30 text-[9px] font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider block">
                        {tag}
                    </span>
                ))
            )}
        </div>

        <Link href={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden block border-b border-aura-gold/10">
            <div className="relative w-full h-full mix-blend-multiply bg-white/20">
                <Image
                    src={activeImage}
                    alt={seoAltText} 
                    fill
                    className={`object-cover transition-transform duration-500 ease-out ${isOutOfStock ? 'grayscale opacity-75' : 'group-hover:scale-105'}`}
                    sizes="(max-width: 768px) 50vw, 300px" 
                    priority={priority}
                    loading={priority ? "eager" : "lazy"}
                    unoptimized={true} 
                />
            </div>
        </Link>

        <div className="p-3 md:p-4 flex flex-col justify-between flex-1 bg-white/30 backdrop-blur-sm">
            <div>
                <div className="flex justify-between items-start mb-1 min-h-[22px]">
                  <p className="text-[10px] text-[#1E1B18] font-black tracking-widest uppercase truncate max-w-[150px] opacity-80 pt-0.5">
                      {product.brand || "AURA-X"}
                  </p>
                  
                  {reviewCount > 0 && (
                      <div className="flex items-center gap-1 bg-white/60 px-1.5 py-0.5 rounded border border-black/5">
                          <Star size={10} className="text-[#D4AF37]" fill="currentColor" />
                          <span className="text-[10px] font-bold text-[#1E1B18]">{avgRating}</span>
                      </div>
                  )}
                </div>

                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-[#1E1B18] font-serif font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-[#C5A67C] transition-colors" title={product.name}>
                      {displayShortName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-[#8B6E4E] font-medium tracking-wide uppercase mt-0.5 min-h-[14px] truncate">
                        {getCategoryLabel()} {activeColorName && `• ${activeColorName}`}
                    </p>
                    {/* 🚀 If product has sizes, show a tiny indicator */}
                    {hasSizes && !hasVariants && (
                       <span className="text-[8px] bg-white/50 px-1.5 py-0.5 rounded border border-aura-gold/20 text-aura-brown font-bold tracking-widest uppercase">Sizes</span>
                    )}
                  </div>
                </Link>

                {hasVariants && product.colors && (
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {product.colors.map((color, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    if (color.image) setActiveImage(color.image);
                                    setActiveColorName(color.name);
                                }}
                                className={`w-4 h-4 rounded-full shadow-inner transition-all duration-300 ${
                                    activeColorName === color.name 
                                    ? 'ring-2 ring-offset-2 ring-aura-brown scale-110' 
                                    : 'ring-1 ring-gray-300 hover:scale-105 opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: color.hex || '#E5E7EB' }}
                                title={color.name}
                                aria-label={`Select ${color.name}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between border-t border-aura-gold/30 pt-3 mt-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5 min-h-[16px]">
                        {originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through decoration-gray-400 font-medium">
                                Rs {originalPrice.toLocaleString()}
                            </span>
                        )}
                        {discount > 0 && !isOutOfStock && (
                            <span className="bg-[#750000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-widest">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    <span className={`text-lg md:text-xl font-serif font-bold leading-none ${isOutOfStock ? 'text-gray-500' : 'text-[#1E1B18]'}`}>
                        Rs {product.price.toLocaleString()}
                    </span>
                </div>
                
                {/* 🚀 Changed to Link if sizes exist so user goes to detail page to select size */}
                {hasSizes ? (
                  <Link 
                    href={`/product/${product.id}`}
                    className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-20 ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1E1B18] text-white hover:bg-aura-gold hover:text-black hover:scale-110'}`}
                  >
                      <ShoppingBag size={14} className="md:w-5 md:h-5" />
                  </Link>
                ) : (
                  <button 
                    type="button"
                    onClick={isOutOfStock ? undefined : handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-20 ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1E1B18] text-white hover:bg-aura-gold hover:text-black hover:scale-110 cursor-pointer'}`}
                    aria-label={isOutOfStock ? "Out of stock" : `Add ${displayShortName} to cart`}
                  >
                      <ShoppingBag size={14} className="md:w-5 md:h-5" />
                  </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}