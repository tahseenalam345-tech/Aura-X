"use client";

import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; 
import { Moon, Filter, Flame } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

const Lantern = ({ className, delay = "0s" }: { className?: string, delay?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-xl`} style={{ animationDelay: delay }}>
    <line x1="50" y1="0" x2="50" y2="20" stroke="#8B7355" strokeWidth="2" />
    <circle cx="50" cy="20" r="3" fill="none" stroke="#8B7355" strokeWidth="2" />
    <path d="M35 30 L65 30 L70 60 L50 80 L30 60 Z" fill="#D4AF37" opacity="0.3" stroke="#8B7355" strokeWidth="2" />
    <circle cx="50" cy="50" r="6" fill="#FFF" className="animate-pulse" />
    <path d="M35 30 Q50 90 65 30" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.8" />
  </svg>
);

export default function EidCollectionPage() {
  const [eidProducts, setEidProducts] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("All");

  // Fetch only the watches instantly
  useEffect(() => {
    const fetchEidItems = async () => {
        const { data } = await supabase.from('products').select('*').eq('is_eid_exclusive', true).order('priority', { ascending: false });
        if (data && data.length > 0) {
            setEidProducts(data);
        }
    };
    fetchEidItems();
  }, []);

  const brands = useMemo(() => {
      const brandCounts: Record<string, number> = {};
      const originalNames: Record<string, string> = {}; 

      eidProducts.forEach(p => {
          const rawBrand = (p.brand || "AURA-X").trim();
          const upperBrand = rawBrand.toUpperCase();

          if (!brandCounts[upperBrand]) {
              brandCounts[upperBrand] = 0;
              originalNames[upperBrand] = rawBrand; 
          }
          brandCounts[upperBrand]++;
      });

      const sortedBrands = Object.keys(brandCounts)
          .sort((a, b) => brandCounts[b] - brandCounts[a])
          .map(upper => originalNames[upper]);

      return ["All", ...sortedBrands];
  }, [eidProducts]);

  const displayProducts = useMemo(() => {
      let filtered = eidProducts;
      
      if (selectedBrand !== "All") {
          filtered = filtered.filter(p => (p.brand || "AURA-X").trim().toUpperCase() === selectedBrand.toUpperCase());
      }
      
      return filtered.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return (b.priority || 0) - (a.priority || 0);
      });
  }, [eidProducts, selectedBrand]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32 relative overflow-hidden">
      <Navbar /> 
      
      {/* 🚀 HIGH CONVERTING AD BANNER */}
      <div className="pt-[100px] md:pt-[125px] w-full relative z-40">
          <div className="bg-[#750000] text-white py-2 md:py-2.5 px-2 text-center text-[10px] md:text-sm font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-1.5">
              <Flame size={14} className="animate-pulse text-yellow-400" /> 
              EIDI READY: 30% OFF + FREE DELIVERY NATIONWIDE 🇵🇰
          </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 mt-[110px]">
          <Moon className="absolute top-0 -right-20 w-[400px] h-[400px] text-[#D4AF37] opacity-10 rotate-[15deg]" />
          <div className="absolute top-5 left-4 md:left-20 animate-in slide-in-from-top duration-[2000ms]">
             <div className="h-8 md:h-24 w-[1.5px] bg-[#D4AF37] mx-auto opacity-30"></div>
             <Lantern className="w-10 h-10 md:w-20 md:h-20 -mt-2" />
          </div>
          <div className="absolute top-5 right-4 md:right-20 animate-in slide-in-from-top duration-[2200ms]">
             <div className="h-12 md:h-32 w-[1.5px] bg-[#D4AF37] mx-auto opacity-30"></div>
             <Lantern className="w-8 h-8 md:w-16 md:h-16 -mt-2" />
          </div>
      </div>

      {/* 🚀 COMPACTED TEXT SECTION */}
      <div className="pt-4 pb-2 text-center px-2 relative z-10">
         <div className="flex justify-center mb-1">
            <span className="inline-block border px-4 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase border-aura-brown/20 text-aura-brown bg-white/60 backdrop-blur-sm shadow-sm">
                ✨ Collection Unlocked ✨
            </span>
         </div>
         
         <h1 className="text-4xl md:text-6xl font-serif leading-none text-[#3E3025] drop-shadow-sm mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#8B7355] italic">Unseen</span>
         </h1>
      </div>

      {/* 🚀 COMPACTED GRID SPACING */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 relative z-10 pt-2">
         <div className="animate-in fade-in duration-1000">
             
             <div className="flex flex-row justify-between items-center gap-2 mb-3 border-b border-aura-brown/10 pb-2 px-2">
                <div className="flex gap-1.5 overflow-x-auto w-full pb-1 scrollbar-hide items-center">
                    <Filter size={14} className="text-gray-400 flex-shrink-0" />
                    {brands.map(b => (
                        <button 
                            key={b} 
                            onClick={() => setSelectedBrand(b)} 
                            className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${selectedBrand === b ? 'bg-aura-brown text-white' : 'bg-white text-aura-brown border border-gray-200'}`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
             </div>

             {/* 🚀 SMALLER GAP ON MOBILE TO FIT MORE WATCHES ON SCREEN */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-1">
                {displayProducts.length > 0 ? displayProducts.map((product) => (
                    <div key={product.id} className="bg-white/50 rounded-2xl p-1 border border-black/5 shadow-sm">
                        <ProductCard product={product} />
                    </div>
                )) : (
                    <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300 mt-4">
                        <p className="text-gray-400 font-serif text-xl mb-2">No watches found.</p>
                        <p className="text-gray-400 text-xs">Try selecting a different brand.</p>
                    </div>
                )}
             </div>
         </div>
      </div>
    </main>
  );
}