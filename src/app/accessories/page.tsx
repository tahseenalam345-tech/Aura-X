"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingBag, Sparkles, Filter, ChevronDown, Check, Zap, LayoutGrid, Watch, Activity, Gem, Wallet, Headphones } from "lucide-react";

export default function MensAccessoriesPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("mixed"); 
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
      setVisibleCount(10);
  }, [activeCategory, sortOrder]);

  useEffect(() => {
      if (!loading && visibleCount < allProducts.length) {
          const timer = setTimeout(() => {
              setVisibleCount((prev) => prev + 10);
          }, 2500); 
          
          return () => clearTimeout(timer); 
      }
  }, [visibleCount, allProducts.length, loading]);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const validProducts = data.filter((p) => {
            const catStr = (String(p.category || "") + " " + String(p.sub_category || "") + " " + String(p.name || "")).toLowerCase();
            
            if (catStr.includes("women") || catStr.includes("ladies") || catStr.includes("girl")) {
                 if (!catStr.includes("smart") && !catStr.includes("earbud") && !catStr.includes("bud") && !catStr.includes("pod") && !catStr.includes("audio")) {
                     return false; 
                 }
            }

            return catStr.includes("men") || catStr.includes("watch") || catStr.includes("smart") || catStr.includes("wallet") || catStr.includes("bracelet") || catStr.includes("jewelry") || catStr.includes("earbud") || catStr.includes("bud") || catStr.includes("pod") || catStr.includes("tech") || catStr.includes("gadget") || catStr.includes("audio");
        });
        
        setAllProducts(validProducts);
      }
      setLoading(false);
    };

    fetchAccessories();
  }, []);

  const displayProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (activeCategory !== "all") {
        filtered = filtered.filter(p => {
            const catStr = (String(p.category || "") + " " + String(p.sub_category || "") + " " + String(p.name || "")).toLowerCase();
            
            if (activeCategory === "smartwatches") return catStr.includes("smart") || catStr.includes("tech") || catStr.includes("gadget");
            if (activeCategory === "watches") return catStr.includes("watch") && !catStr.includes("smart"); 
            if (activeCategory === "wallets") return catStr.includes("wallet");
            if (activeCategory === "bracelets") return catStr.includes("bracelet") || catStr.includes("jewelry");
            if (activeCategory === "audio") return catStr.includes("earbud") || catStr.includes("bud") || catStr.includes("pod") || catStr.includes("audio");
            return true;
        });
    }

    if (sortOrder === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOrder === "mixed" && activeCategory === "all") {
        
        const groups: Record<string, any[]> = { watches: [], smartwatches: [], wallets: [], bracelets: [], audio: [], other: [] };
        
        filtered.forEach(p => {
            const catStr = (String(p.category || "") + " " + String(p.sub_category || "") + " " + String(p.name || "")).toLowerCase();
            
            if (catStr.includes("smart") || catStr.includes("tech") || catStr.includes("gadget")) groups.smartwatches.push(p);
            else if (catStr.includes("watch")) groups.watches.push(p);
            else if (catStr.includes("wallet")) groups.wallets.push(p);
            else if (catStr.includes("bracelet") || catStr.includes("jewelry")) groups.bracelets.push(p);
            else if (catStr.includes("earbud") || catStr.includes("bud") || catStr.includes("pod") || catStr.includes("audio")) groups.audio.push(p);
            else groups.other.push(p);
        });

        const mixedArray = [];
        let w_idx = 0, wa_idx = 0, b_idx = 0, s_idx = 0, a_idx = 0, o_idx = 0;
        let itemsAdded = true;
        
        while(itemsAdded) {
            itemsAdded = false;
            
            for(let i=0; i<2; i++) {
                if (groups.watches[w_idx]) { mixedArray.push(groups.watches[w_idx++]); itemsAdded = true; }
            }
            if (groups.wallets[wa_idx]) { mixedArray.push(groups.wallets[wa_idx++]); itemsAdded = true; }
            if (groups.bracelets[b_idx]) { mixedArray.push(groups.bracelets[b_idx++]); itemsAdded = true; }
            if (groups.smartwatches[s_idx]) { mixedArray.push(groups.smartwatches[s_idx++]); itemsAdded = true; }
            if (groups.audio[a_idx]) { mixedArray.push(groups.audio[a_idx++]); itemsAdded = true; }
            if (groups.other[o_idx]) { mixedArray.push(groups.other[o_idx++]); itemsAdded = true; }
        }
        filtered = mixedArray;
    }

    filtered.sort((a, b) => {
        const aStock = a.specs?.stock !== undefined ? Number(a.specs.stock) : 1;
        const bStock = b.specs?.stock !== undefined ? Number(b.specs.stock) : 1;
        
        const aInStock = aStock > 0;
        const bInStock = bStock > 0;

        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;  
        return 0; 
    });

    return filtered;
  }, [allProducts, activeCategory, sortOrder]);

  const visibleProducts = displayProducts.slice(0, visibleCount);
  
  const loadMore = () => setVisibleCount((prev) => prev + 10);

  const categories = [
      { id: "all", label: "All", icon: LayoutGrid },
      { id: "watches", label: "Watches", icon: Watch },
      { id: "smartwatches", label: "Smart", icon: Activity },
      { id: "bracelets", label: "Bracelets", icon: Gem },
      { id: "wallets", label: "Wallets", icon: Wallet },
      { id: "audio", label: "Buds", icon: Headphones }
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-serif">
      <Navbar />

      {/* 🚀 UPDATED BANNER WITH 'OPEN PARCEL ALLOWED' */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-[8px] md:text-xs font-black uppercase tracking-widest py-2.5 flex justify-center items-center gap-1 md:gap-2 shadow-md relative z-30 mt-[56px] md:mt-[80px]">
          <Zap size={14} className="fill-white animate-pulse hidden md:block"/> 
          <span className="text-center flex flex-wrap justify-center gap-x-1 gap-y-0.5">
             <span>100% Free Delivery & Up To 30% OFF</span> 
             <span className="opacity-70 hidden md:inline">|</span>
             <span className="text-aura-gold underline decoration-aura-gold/50 decoration-wavy">OPEN PARCEL ALLOWED</span>
          </span>
          <Zap size={14} className="fill-white animate-pulse hidden md:block"/> 
      </div>

      <div className="pt-6 pb-2 px-4 text-center relative overflow-hidden">
        <h1 className="text-3xl md:text-5xl font-bold text-aura-brown mb-1 drop-shadow-sm capitalize">
          Men's Accessories
        </h1>
        <p className="max-w-xl mx-auto text-[11px] md:text-xs text-gray-500 italic px-4">
          Premium collection of watches, smart gear, wallets, and handcrafted jewelry.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 md:px-8 pb-20">
        
        <div className="flex items-center justify-between gap-2 mb-6 sticky top-[56px] md:top-[80px] z-40 bg-[#FDFBF7]/95 backdrop-blur-md pt-3 pb-2 px-1 md:px-4 border-b border-aura-gold/10 shadow-sm">
            
            <div className="flex-1 flex overflow-x-auto scrollbar-hide gap-3 md:gap-5 items-start pr-4">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button 
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setSortOrder(cat.id === 'all' ? 'mixed' : 'newest'); setShowSortMenu(false); }}
                            className="flex flex-col items-center gap-1.5 group flex-shrink-0 min-w-[48px]"
                        >
                            <div className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border shadow-sm ${
                                isActive 
                                ? 'bg-gradient-to-br from-aura-gold to-[#8B7355] border-transparent text-white shadow-md scale-105' 
                                : 'bg-white border-aura-gold/20 text-aura-brown group-hover:border-aura-gold/50 group-hover:bg-aura-gold/5'
                            }`}>
                                <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 1.5} />
                            </div>
                            <span className={`whitespace-nowrap text-[8px] md:text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${
                                isActive ? 'text-aura-brown drop-shadow-sm' : 'text-gray-400 group-hover:text-aura-brown'
                            }`}>
                                {cat.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="relative flex-shrink-0 border-l border-aura-gold/20 pl-3 md:pl-4 self-center pb-4 md:pb-5">
                <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-white border border-aura-gold/30 rounded-full text-aura-brown shadow-sm hover:border-aura-gold/60 transition-colors"
                >
                    <Filter size={14} className="text-aura-gold md:mr-1"/> 
                    <span className="hidden md:inline text-[9px] font-bold tracking-wider uppercase">Sort</span>
                </button>

                {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-aura-gold/20 rounded-xl shadow-xl overflow-hidden z-40">
                        {[
                          {id: 'mixed', label: 'Mixed Variety'},
                          {id: 'newest', label: 'New Arrivals'},
                          {id: 'price-asc', label: 'Price: Low to High'},
                          {id: 'price-desc', label: 'Price: High to Low'}
                        ].map((opt) => (
                          <button key={opt.id} onClick={() => { setSortOrder(opt.id); setShowSortMenu(false); }} className="w-full text-left px-4 py-3 text-[10px] font-bold text-aura-brown hover:bg-aura-gold/10 border-b border-gray-50 flex justify-between items-center last:border-0">
                              {opt.label} {sortOrder === opt.id && <Check size={12} className="text-aura-gold"/>}
                          </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-3 border-aura-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-aura-brown font-bold animate-pulse uppercase tracking-widest text-[10px]">Updating Gallery...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 pt-2">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleCount < displayProducts.length && (
                  <div className="flex justify-center pt-10 mt-4 mb-8">
                      <button 
                          onClick={loadMore}
                          className="flex items-center justify-center gap-3 px-10 py-4 w-[90%] md:w-auto min-w-[280px] bg-gradient-to-r from-[#3A2A18] to-[#1E1B18] border border-aura-gold/50 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 group"
                      >
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-aura-gold group-hover:text-white transition-colors">
                              Discover More
                          </span>
                          <ChevronDown size={18} className="text-aura-gold group-hover:translate-y-1 transition-transform" />
                      </button>
                  </div>
              )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-aura-gold/30">
            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-aura-brown">No Items Found</h3>
            <button onClick={() => { setActiveCategory('all'); setSortOrder('mixed'); }} className="mt-4 text-[10px] font-bold text-aura-gold underline tracking-widest uppercase">Reset Filters</button>
          </div>
        )}
      </div>
    </main>
  );
}