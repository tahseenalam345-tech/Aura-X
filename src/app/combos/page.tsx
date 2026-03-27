"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { Sparkles, ArrowRight, Gift, ShoppingBag, Loader2 } from "lucide-react";

export default function CombosPage() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCombos() {
      // Fetch products where category is 'combos'
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'combos')
        .order('priority', { ascending: true });
        
      if (data && !error) {
        setCombos(data);
      }
      setLoading(false);
    }
    fetchCombos();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />

      {/* 🚀 HERO SECTION */}
      <div className="pt-28 md:pt-40 max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2">
             <Sparkles size={14} /> The Art of Gifting <Sparkles size={14} />
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-[#1E1B18] leading-tight">
            Curated Masterpieces & Bundles
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Discover our exclusively paired sets designed for absolute perfection, or take control and craft your very own signature bundle.
          </p>
        </div>
      </div>

      {/* 🚀 CUSTOM COMBO PROMO BANNER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="bg-[#1E1B18] rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-aura-gold/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-aura-gold/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                <Gift size={16} className="text-aura-gold"/>
                <span className="text-[10px] text-white font-bold tracking-widest uppercase">Special Offer</span>
             </div>
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Craft Your Own Custom Combo</h2>
             <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Why settle for pre-made? Select any 2 or more items from our Watches, Perfumes, and Accessories collections and instantly unlock <span className="text-aura-gold font-bold">Rs 200 OFF</span>.
             </p>
             <Link href="/custom-combo" className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-aura-gold to-yellow-600 text-[#1E1B18] px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                Start Building <ArrowRight size={16}/>
             </Link>
          </div>

          <div className="relative z-10 w-full md:w-[45%] aspect-video md:aspect-square max-h-[300px]">
             {/* Decorative representation of mixing items */}
             <div className="absolute top-0 right-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-2xl rotate-12 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                 <span className="text-white/20 font-serif font-bold text-xl">Watch</span>
             </div>
             <div className="absolute bottom-0 left-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 border border-white/10 rounded-2xl -rotate-6 backdrop-blur-md flex items-center justify-center shadow-2xl">
                 <span className="text-white/20 font-serif font-bold text-xl">Wallet</span>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 bg-aura-gold/20 border border-aura-gold/40 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                 <ShoppingBag size={32} className="text-aura-gold mb-2"/>
                 <span className="text-aura-gold font-bold text-xs uppercase tracking-widest">- Rs 200</span>
             </div>
          </div>
        </div>
      </div>

      {/* 🚀 PRE-MADE COMBOS GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-aura-brown">Exclusive Pre-Made Sets</h2>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-aura-gold" size={40} />
            </div>
        ) : combos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {combos.map((combo) => (
                    <ProductCard key={combo.id} product={combo} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-serif text-lg mb-2">No pre-made sets available right now.</p>
                <p className="text-sm text-gray-400 mb-6">Create your own bundle using our Custom Combo studio!</p>
                <Link href="/custom-combo" className="inline-block text-aura-gold font-bold hover:underline">
                    Craft a Combo →
                </Link>
            </div>
        )}
      </div>

    </main>
  );
}