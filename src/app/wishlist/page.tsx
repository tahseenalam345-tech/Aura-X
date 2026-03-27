"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-aura-brown mb-2">My Wishlist</h1>
                <p className="text-gray-500 text-sm">{wishlist.length} masterpiece{wishlist.length !== 1 ? 's' : ''} saved</p>
            </div>
            
            {wishlist.length > 0 && (
                <button 
                    onClick={clearWishlist}
                    className="flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-full transition-colors mt-4 md:mt-0"
                >
                    <Trash2 size={16} /> Clear List
                </button>
            )}
        </div>

        {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-aura-brown">Loading your favorites...</div>
        ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {wishlist.map((item) => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-aura-gold/30 bg-white/50 rounded-[2rem] shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-gray-50 p-6 rounded-full mb-6 text-gray-300 shadow-inner">
                    <Heart size={48} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-500 mb-2">Your Wishlist is Empty</h2>
                <p className="text-sm text-gray-400 mb-8 text-center max-w-sm">Save items you love by clicking the heart icon on any product page, and they will wait for you here.</p>
                <Link href="/" className="bg-aura-brown text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-aura-gold hover:shadow-xl transition-all flex items-center gap-2">
                    <ShoppingBag size={16}/> Start Exploring
                </Link>
            </div>
        )}
      </div>
    </main>
  );
}