"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

  // 🚀 SUPERFAST SCROLL STATES
  const [visibleCount, setVisibleCount] = useState(8);
  const observerTarget = useRef(null);

  useEffect(() => {
      setVisibleCount(8);
  }, [activeCategory, sortOrder]);

  useEffect(() => {
    const observer = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => prev + 8);
            }
        },
        { threshold: 0.1 }
    );

    if (observerTarget.current) {
        observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [observerTarget]);

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

            return catStr.includes("men") || 
                   catStr.includes("watch") || 
                   catStr.includes("smart") || 
                   catStr.includes("wallet") || 
                   catStr.includes("bracelet") || 
                   catStr.includes("jewelry") || 
                   catStr.includes("earbud") || 
                   catStr.includes("bud") || 
                   catStr.includes("pod") || 
                   catStr.includes("tech") ||
                   catStr.includes("gadget") ||
                   catStr.includes("audio");
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
        let i = 0;
        let itemsAdded = true;
        const keys = Object.keys(groups);
        
        while(itemsAdded) {
            itemsAdded = false;
            for(const key of keys) {
                if (groups[key][i]) {
                    mixedArray.push(groups[key][i]);
                    itemsAdded = true;
                }
            }
            i++;
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

  // 🚀 CIRCULAR CATEGORIES WITH ICONS
  const categories = [
      { id: "all", label: "All Items", icon: LayoutGrid },
      { id: "watches", label: "Watches", icon: Watch },
      { id: "smartwatches", label: "Smart Gear", icon: Activity },
      { id: "bracelets", label: "Bracelets", icon: Gem },
      { id: "wallets", label: "Wallets", icon: Wallet },
      { id: "audio", label: "Earbuds", icon: Headphones }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F5EEDC] font-serif">
      <Navbar />

      <div className="pt-16 md:pt-20 pb-4 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-aura-gold/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* 🚀 PROMO TAGS */}
        <div className="flex flex-col items-center gap-3 mb-2 mt-4 md:mt-0">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-aura-gold/30 rounded-full text-[8px] md:text-[9px] font-bold text-aura-gold uppercase tracking-[0.2em] shadow-sm">
                <Sparkles size={10} /> The Gentleman's Edit
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg transform -skew-x-6 animate-pulse">
                <Zap size={12} className="fill-white"/> 100% Free Delivery & Up To 30% OFF
            </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-aura-brown mb-1 drop-shadow-sm capitalize">
          Men's Accessories
        </h1>
        <p className="max-w-xl mx-auto text-[11px] md:text-xs text-gray-500 italic px-4 mb-4">
          Premium collection of watches, smart gear, wallets, and handcrafted jewelry.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-8 pb-20">
        
        {/* 🚀 CIRCULAR ICONS ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sticky top-[60px] md:top-[75px] z-30 bg-[#FDFBF7]/95 backdrop-blur-md pt-4 pb-4 border-b border-aura-gold/10">
            
            {/* Scrollable Circles */}
            <div className="flex overflow-x-auto scrollbar-hide gap-4 md:gap-6 pb-2 -mx-3 px-4 md:mx-0 md:px-0 items-start">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button 
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setSortOrder(cat.id === 'all' ? 'mixed' : 'newest'); setShowSortMenu(false); }}
                            className="flex flex-col items-center gap-2 group flex-shrink-0"
                        >
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 border shadow-sm ${
                                isActive 
                                ? 'bg-gradient-to-br from-aura-gold to-[#8B7355] border-transparent text-white shadow-lg scale-105' 
                                : 'bg-white border-aura-gold/20 text-aura-brown group-hover:border-aura-gold/50 group-hover:bg-aura-gold/5 group-hover:scale-105'
                            }`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                            </div>
                            <span className={`whitespace-nowrap text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                                isActive ? 'text-aura-brown drop-shadow-sm' : 'text-gray-400 group-hover:text-aura-brown'
                            }`}>
                                {cat.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative self-end md:self-center mt-2 md:mt-0 px-2 md:px-0">
                <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-aura-gold/30 rounded-full text-aura-brown text-[10px] font-bold tracking-wider uppercase shadow-sm hover:border-aura-gold/60 transition-colors"
                >
                    <Filter size={12} className="text-aura-gold"/> Sort By 
                    <ChevronDown size={12} className={`transition-transform duration-300 ${showSortMenu ? 'rotate-180' : ''}`}/>
                </button>

                {showSortMenu && (
                    <div className="absolute right-0 md:right-0 top-full mt-2 w-44 bg-white border border-aura-gold/20 rounded-xl shadow-xl overflow-hidden z-40">
                        {[
                          {id: 'mixed', label: 'Mixed Variety'},
                          {id: 'newest', label: 'New Arrivals'},
                          {id: 'price-asc', label: 'Price: Low to High'},
                          {id: 'price-desc', label: 'Price: High to Low'}
                        ].map((opt) => (
                          <button key={opt.id} onClick={() => { setSortOrder(opt.id); setShowSortMenu(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-aura-brown hover:bg-aura-gold/10 border-b border-gray-50 flex justify-between items-center last:border-0">
                              {opt.label} {sortOrder === opt.id && <Check size={12} className="text-aura-gold"/>}
                          </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* 🚀 PRODUCT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-3 border-aura-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-aura-brown font-bold animate-pulse uppercase tracking-widest text-[10px]">Updating Gallery...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {visibleCount < displayProducts.length && (
                  <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
                      <div className="w-6 h-6 border-2 border-aura-gold border-t-transparent rounded-full animate-spin"></div>
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