"use client";

import React, { useState } from "react"; 
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import * as fbq from "@/lib/fpixel";

interface Product {
  id: string;
  name: string;
  brand?: string; 
  price: number;
  image?: string; // Yeh aapki hover image hai
  main_image?: string; 
  category?: string;
  sub_category?: string;
  original_price?: number; 
  discount?: number;
  tags?: string[];
  colors?: { name: string; hex: string; image: string }[]; 
  specs?: any; 
  variants?: any; 
  is_eid_exclusive?: boolean; 
}

const optimizeCloudinaryUrl = (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return url; 
    if (url.includes('f_auto') || url.includes('q_auto')) return url; 
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart } = useCart();
  
  // 🚀 Logic for Hover Image Toggle
  const [isHovered, setIsHovered] = useState(false);
  
  const mainImg = product.main_image || "/placeholder.jpg";
  const hoverImg = product.image || mainImg; // Agar hover pic na ho toh main hi dikhaye
  
  const hasSizes = product.variants?.sizes && product.variants.sizes.length > 0;
  const isOutOfStock = product.specs?.stock !== undefined && Number(product.specs.stock) <= 0;

  const originalPrice = product.original_price && product.original_price > product.price ? product.original_price : 0; 
  let discount = product.discount || 0;
  if (discount === 0 && originalPrice > product.price) {
      discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }

  const displayShortName = product.name?.includes('|') ? product.name.split('|')[0].trim() : product.name;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (hasSizes) {
       toast.error("Please select a size first!");
       return;
    }

    addToCart({
        id: product.id,
        name: displayShortName,
        price: product.price,
        image: mainImg, 
        quantity: 1,
        color: product.colors?.[0]?.name || "Standard",
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
    <div 
      className="group block relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="relative h-full bg-white rounded-2xl transition-all duration-500 flex flex-col overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1">
        
        {/* 🚀 New Minimal & Dim Tag UI */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-1 pointer-events-none">
            {isOutOfStock ? (
                <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                    Sold Out
                </span>
            ) : (
                product.tags && product.tags.length > 0 && (
                    <span className="bg-black/5 text-black/40 backdrop-blur-[2px] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-black/5 animate-pulse">
                        {product.tags[0]}
                    </span>
                )
            )}
        </div>

        <Link href={`/product/${product.id}`} className="relative aspect-[4/5] w-full overflow-hidden block bg-[#F9F9F9]">
            <Image
                src={isHovered ? hoverImg : mainImg}
                alt={product.name} 
                fill
                className={`object-cover transition-all duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'} ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                sizes="(max-width: 768px) 50vw, 300px" 
                priority={priority}
                unoptimized={true} 
            />
        </Link>

        <div className="p-3 md:p-4 flex flex-col justify-between flex-1">
            <div>
                {/* 🚀 Luxury Brand Styling */}
                <p className="text-[9px] text-aura-gold font-serif italic tracking-[0.2em] uppercase mb-1 opacity-80">
                    {product.brand || "AURA-X"}
                </p>

                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-[#1E1B18] font-bold text-sm md:text-base leading-tight line-clamp-1 group-hover:text-aura-brown transition-colors">
                      {displayShortName}
                  </h3>
                </Link>

                {/* 🚀 Visual Color Boxes (Tiny Pictures Instead of Hex) */}
                {product.colors && product.colors.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {product.colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200 shadow-sm"
                                title={color.name}
                            >
                                {color.image ? (
                                    <Image 
                                        src={optimizeCloudinaryUrl(color.image)} 
                                        alt={color.name} 
                                        fill 
                                        className="object-cover"
                                        sizes="20px"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-full" style={{ backgroundColor: color.hex || '#E5E7EB' }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between mt-4">
                <div className="flex flex-col">
                    {originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through font-medium">
                            Rs {originalPrice.toLocaleString()}
                        </span>
                    )}
                    <span className={`text-base md:text-lg font-serif font-black ${isOutOfStock ? 'text-gray-400' : 'text-[#1E1B18]'}`}>
                        Rs {product.price.toLocaleString()}
                    </span>
                </div>
                
                {hasSizes ? (
                  <Link 
                    href={`/product/${product.id}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isOutOfStock ? 'bg-gray-100 text-gray-400' : 'bg-[#1E1B18] text-white hover:bg-aura-gold hover:text-black hover:scale-110'}`}
                  >
                      <ShoppingBag size={16} />
                  </Link>
                ) : (
                  <button 
                    type="button"
                    onClick={isOutOfStock ? undefined : handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#1E1B18] text-white hover:bg-aura-gold hover:text-black hover:scale-110 cursor-pointer'}`}
                  >
                      <ShoppingBag size={16} />
                  </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}