"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Read from LocalStorage
    const stored = localStorage.getItem('wishlist');
    if (stored) {
        setWishlist(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const clearWishlist = () => {
      localStorage.removeItem('wishlist');
      setWishlist([]);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-20">
      <Navbar />
      
      <div className="pt-32 md:pt-40 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-aura-brown mb-2">My Wishlist</h1>
                <p className="text-gray-500 text-sm">{wishlist.length} items saved</p>
            </div>
            
            {wishlist.length > 0 && (
                <button 
                    onClick={clearWishlist}
                    className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-full transition-colors mt-4 md:mt-0"
                >
                    <Trash2 size={16} /> Clear All
                </button>
            )}
        </div>

        {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-aura-brown">Loading...</div>
        ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {wishlist.map((item) => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
                <div className="bg-gray-100 p-6 rounded-full mb-6 text-gray-300">
                    <Heart size={48} />
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-400 mb-2">Your wishlist is empty</h2>
                <p className="text-sm text-gray-400 mb-8">Save items you love to view them here.</p>
                <Link href="/men" className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-aura-gold transition-colors">
                    Start Shopping
                </Link>
            </div>
        )}
      </div>
    </main>
  );
}