"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";

// Define the shape of a Product
interface ProductProps {
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating?: number;
    image: string;
    isSale?: boolean;
    colors?: string[];
    category: string;
  };
}

export function ProductCard({ product }: ProductProps) {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group block relative bg-[#FDFBF7] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col"
    >
      
      {/* 1. IMAGE AREA */}
      <div className="relative h-[300px] w-full bg-gray-50 overflow-hidden">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized={true}
        />
        
        {/* Sale Badge */}
        {product.isSale && (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-10">
            Sale
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 2. DETAILS AREA */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Name & Desc */}
        <div className="mb-4">
          <h3 className="text-xl font-serif font-bold text-aura-brown mb-1 line-clamp-1 group-hover:text-aura-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {product.description || "Luxury timepiece defined by precision."}
          </p>
        </div>

        {/* Colors & Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {product.colors?.map((col, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: col }}></div>
            )) || <div className="w-5 h-5 rounded-full bg-gray-300"></div>}
          </div>
          
          <div className="flex items-center gap-1 bg-aura-gold/10 px-2 py-1 rounded-lg">
            <Star size={12} className="text-aura-brown fill-aura-brown" />
            <span className="text-xs font-bold text-aura-brown">{product.rating || 5.0}</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="mt-auto pt-4 border-t border-gray-200/50 flex items-end justify-between">
          <div>
            {product.originalPrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
                <span className="text-xs text-gray-400 line-through">
                  Rs {product.originalPrice.toLocaleString()}
                </span>
              </div>
            )}
            <div className="text-xl font-bold text-aura-brown">
              Rs {product.price.toLocaleString()}
            </div>
          </div>

          <button className="bg-aura-brown text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-aura-gold transition-colors shadow-lg flex items-center gap-2 group/btn">
            Buy Now 
            <ShoppingCart size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Link>
  );
}