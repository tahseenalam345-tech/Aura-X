"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { products, Product } from "@/lib/mockData"; // Import Type
import { Navbar } from "@/components/Navbar";
import { Star, ShoppingCart, Heart, Share2, ShieldCheck, RefreshCw, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null); // Use correct type
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find product safely
    if (params?.id) {
        const found = products.find((p) => p.id === Number(params.id));
        if (found) {
            setProduct(found);
            setSelectedImage(found.image);
        }
    }
    setLoading(false);
  }, [params]);

  if (loading) return <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center">Product not found.</div>;

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* --- LEFT: GALLERY --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
             {/* Main Image */}
             <div className="relative h-[500px] w-full bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
                <Image 
                    src={selectedImage} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                />
                {product.isSale && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Sale {product.discount}% Off
                    </div>
                )}
             </div>

             {/* Thumbnails (FIXED: Added Optional Chaining just in case) */}
             <div className="flex gap-4 justify-center">
                {product.thumbnails?.map((thumb, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setSelectedImage(thumb)}
                        className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === thumb ? 'border-aura-brown' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                        <Image src={thumb} alt="" fill className="object-cover" unoptimized/>
                    </button>
                ))}
             </div>
          </motion.div>

          {/* --- RIGHT: DETAILS --- */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
             {/* Header */}
             <div className="mb-8">
                 <p className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-2">{product.brand || "AURA-X"}</p>
                 <h1 className="text-4xl md:text-5xl font-serif font-bold text-aura-brown mb-4">{product.name}</h1>
                 
                 <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex text-aura-gold">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span>({product.reviews} Reviews)</span>
                 </div>
             </div>

             {/* Price */}
             <div className="flex items-end gap-4 mb-8 pb-8 border-b border-aura-brown/10">
                <span className="text-4xl font-bold text-aura-brown">Rs {product.price.toLocaleString()}</span>
                {product.originalPrice > 0 && (
                    <span className="text-xl text-gray-400 line-through mb-1">Rs {product.originalPrice.toLocaleString()}</span>
                )}
             </div>

             {/* Description */}
             <p className="text-gray-600 leading-relaxed mb-8 font-light text-lg">
                {product.description}
             </p>

             {/* Selectors */}
             <div className="space-y-6 mb-10">
                {/* Colors */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Color</p>
                    <div className="flex gap-3">
                        {product.colors?.map((col, i) => (
                            <button key={i} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: col }}></button>
                        ))}
                    </div>
                </div>
                
                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Movement</p>
                        <p className="text-aura-brown font-medium">{product.movement}</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] uppercase text-gray-400 font-bold">Strap</p>
                        <p className="text-aura-brown font-medium">{product.strap}</p>
                     </div>
                </div>
             </div>

             {/* Actions */}
             <div className="flex gap-4 mb-10">
                 <button className="flex-1 bg-aura-brown text-white py-4 rounded-full font-bold uppercase tracking-wider hover:bg-aura-gold transition-colors flex items-center justify-center gap-2 shadow-xl">
                    <ShoppingCart size={20} /> Add to Cart
                 </button>
                 <button className="p-4 rounded-full border border-aura-brown/20 text-aura-brown hover:bg-aura-brown hover:text-white transition-colors">
                    <Heart size={20} />
                 </button>
                 <button className="p-4 rounded-full border border-aura-brown/20 text-aura-brown hover:bg-aura-brown hover:text-white transition-colors">
                    <Share2 size={20} />
                 </button>
             </div>

             {/* Trust Badges */}
             <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
                <div className="flex flex-col items-center gap-2">
                    <ShieldCheck size={24} className="text-aura-gold" />
                    <span>2 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Truck size={24} className="text-aura-gold" />
                    <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="text-aura-gold" />
                    <span>7 Day Returns</span>
                </div>
             </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}