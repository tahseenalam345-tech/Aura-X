"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; 
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown, Filter, X, Loader2 } from "lucide-react"; 
import { useParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// 🚀 GLOBAL MEMORY CACHE
const categoryCache: Record<string, any[]> = {};
let lastVisitedCategory = "";
let globalVisibleCount = 8;
let globalPriceRange = 500000;
let globalSelectedMovements: string[] = [];
let globalSelectedStraps: string[] = [];
let globalSortBy = "featured";

// 🚀 SMART TITLES MAP
const getCategoryTitle = (slug: string) => {
  const titles: Record<string, string> = {
    'watches': 'Luxury Timepieces',
    'accessories': 'Premium Accessories',
    'smart-tech': 'Smart Technology',
    'fragrances': 'Signature Fragrances',
    'wallets': 'Premium Wallets',
    'belts': 'Classic Leather Belts',
    'bracelets': 'Luxury Bracelets', 
    'sunglasses': 'Designer Sunglasses',
    'jewelry': 'Bracelets & Rings',
    'smartwatches': 'Advanced Smartwatches',
    'earbuds': 'Wireless Earbuds',
    'perfume-men': "Men's Fragrances",
    'perfume-women': "Women's Fragrances",
    'men': "Men's Collection",
    'women': "Women's Precision",
    'couple': "Couple's Bonds",
    'combos': "Curated Combos"
  };
  return titles[slug.toLowerCase()] || slug.replace('-', ' ').toUpperCase();
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string; 
  const reservedRoutes = ['privacy-policy', 'support', 'track-order', 'admin', 'login', 'cart', 'eid-collection', 'style-quiz', 'custom-combo'];

  const isReturning = lastVisitedCategory === categorySlug;

  const [products, setProducts] = useState<any[]>(categoryCache[categorySlug] || []);
  const [loading, setLoading] = useState(!categoryCache[categorySlug]); 
  const [visibleCount, setVisibleCount] = useState(isReturning ? globalVisibleCount : 8);
  
  const [priceRange, setPriceRange] = useState(isReturning ? globalPriceRange : 500000); 
  const [selectedMovements, setSelectedMovements] = useState<string[]>(isReturning ? globalSelectedMovements : []);
  const [selectedStraps, setSelectedStraps] = useState<string[]>(isReturning ? globalSelectedStraps : []);
  const [sortBy, setSortBy] = useState(isReturning ? globalSortBy : "featured");
  
  const [sortOpen, setSortOpen] = useState(false); 
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const initialRender = useRef(true);

  // 🚀 DYNAMIC CATEGORY CHECKS
  const isWatchCategory = ['men', 'women', 'couple', 'watches'].includes(categorySlug.toLowerCase());
  
  const movements = ["Automatic", "Mechanical", "Quartz"];
  const straps = ["Leather", "Metal", "Chain", "Silicon"];

  const [globalGender, setGlobalGender] = useState<string>("all");

  useEffect(() => {
      lastVisitedCategory = categorySlug;
      globalVisibleCount = visibleCount;
      globalPriceRange = priceRange;
      globalSelectedMovements = selectedMovements;
      globalSelectedStraps = selectedStraps;
      globalSortBy = sortBy;
  }, [categorySlug, visibleCount, priceRange, selectedMovements, selectedStraps, sortBy]);

  // 🚀 FIXED: AUTO-SELECT PILL BASED ON URL
  useEffect(() => {
      if (!categorySlug) return;
      
      const slugLower = categorySlug.toLowerCase();
      // Agar route direct /men, /women, ya /couple hai toh auto select karo
      if (['men', 'women', 'couple'].includes(slugLower)) {
          setGlobalGender(slugLower);
          if (typeof window !== 'undefined') localStorage.setItem('aura_gender', slugLower);
      } else if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const genderFromUrl = urlParams.get('gender');
          if (genderFromUrl) {
              setGlobalGender(genderFromUrl);
          } else {
              const savedGender = localStorage.getItem('aura_gender');
              if (savedGender) setGlobalGender(savedGender);
          }
      }
  }, [categorySlug]);

  const handleGenderSelect = (gender: string) => {
      setGlobalGender(gender);
      if (typeof window !== 'undefined') {
          localStorage.setItem('aura_gender', gender);
      }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (reservedRoutes.includes(categorySlug)) {
        setLoading(false);
        return;
      }

      if (!categoryCache[categorySlug]) {
          setLoading(true);
      }

      let query = supabase.from('products').select('*');
      const slug = categorySlug.toLowerCase();

      if (slug === 'watches') {
          query = query.in('category', ['men', 'women', 'couple', 'watches']);
      } 
      else if (slug === 'bracelets') {
          query = query.or('category.ilike.%bracelet%,sub_category.ilike.%bracelet%,sub_category.ilike.%jewelry%');
      } 
      else if (slug === 'wallets') {
          query = query.or('category.ilike.%wallet%,sub_category.ilike.%wallet%,sub_category.ilike.%belt%');
      } 
      else {
          query = query.or(`category.ilike.%${slug}%,sub_category.ilike.%${slug}%`);
      }

      const { data } = await query;
      
      if (data) {
          setProducts(data);
          categoryCache[categorySlug] = data; 
      }
      setLoading(false);
    };

    if (categorySlug) fetchProducts();
  }, [categorySlug]);

  useEffect(() => {
    if (initialRender.current) {
        initialRender.current = false;
        return;
    }
    setVisibleCount(8);
  }, [priceRange, selectedMovements, selectedStraps, sortBy, globalGender]);

  const filteredProducts = products.filter((product) => {
    
    // 🚀 FIXED: GENDER FILTER (Blocks "women" from showing up in "men")
    if (globalGender !== "all") {
        const cat = (product.category || '').toLowerCase();
        const subCat = (product.sub_category || '').toLowerCase();
        const nameStr = (product.name || '').toLowerCase();

        if (globalGender === 'men') {
            if (cat.includes('women') || subCat.includes('women') || nameStr.includes('women')) return false;
        }
        if (globalGender === 'women') {
            if (cat === 'men' || subCat === 'men' || subCat === 'wallets' || subCat === 'wallet' || subCat === 'belts') return false;
        }
        if (globalGender === 'couple') {
            if (cat !== 'couple' && !subCat.includes('couple')) return false;
        }
    }

    if (product.price > priceRange) return false;
    
    if (isWatchCategory) {
        if (selectedMovements.length > 0) {
            const move = product.specs?.movement || "Quartz";
            if (!selectedMovements.includes(move)) return false;
        }

        if (selectedStraps.length > 0) {
            const strap = product.specs?.strap || "Leather";
            const hasStrap = selectedStraps.some(s => strap.includes(s));
            if (!hasStrap) return false;
        }
    }

    return true;
  }).sort((a, b) => {
    // 🚀 FIXED: OUT OF STOCK TO BOTTOM LOGIC
    const aStock = a.specs?.stock !== undefined ? Number(a.specs.stock) : 1;
    const bStock = b.specs?.stock !== undefined ? Number(b.specs.stock) : 1;
    
    const aInStock = aStock > 0;
    const bInStock = bStock > 0;

    // Send Out of stock to bottom FIRST
    if (aInStock && !bInStock) return -1;
    if (!aInStock && bInStock) return 1;

    // Then apply user sorting
    if (sortBy === "featured") return (b.priority || 0) - (a.priority || 0);
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    return 0; 
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => setVisibleCount((prev) => prev + 8);

  const toggleFilter = (item: string, state: string[], setState: any) => {
    if (state.includes(item)) setState(state.filter((i: string) => i !== item));
    else setState([...state, item]);
  };

  if (reservedRoutes.includes(categorySlug)) return null;

  const FilterContent = () => (
    <div className="space-y-10">
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-aura-brown/70">Price Limit</h3>
        <input 
          type="range" min="0" max="500000" step="1000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1 bg-aura-gold/30 rounded-lg appearance-none cursor-pointer accent-aura-brown"
        />
        <div className="flex justify-between text-sm mt-3 font-medium text-aura-brown">
          <span>Rs. 0</span>
          <span>Rs. {priceRange.toLocaleString()}</span>
        </div>
      </div>

      {isWatchCategory && (
          <>
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-aura-brown/70">Movement</h3>
              <div className="space-y-3">
                {movements.map((move) => (
                  <div key={move} onClick={() => toggleFilter(move, selectedMovements, setSelectedMovements)} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border border-aura-brown rounded flex items-center justify-center transition-all ${selectedMovements.includes(move) ? 'bg-aura-brown' : 'bg-transparent'}`}>
                      {selectedMovements.includes(move) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-aura-brown">{move}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-aura-brown/70">Strap Material</h3>
              <div className="space-y-3">
                {straps.map((strap) => (
                  <div key={strap} onClick={() => toggleFilter(strap, selectedStraps, setSelectedStraps)} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border border-aura-brown rounded flex items-center justify-center transition-all ${selectedStraps.includes(strap) ? 'bg-aura-brown' : 'bg-transparent'}`}>
                      {selectedStraps.includes(strap) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-aura-brown">{strap}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown">
      <Navbar />

      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-xs bg-[#FDFBF7] z-[101] p-8 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-aura-brown/10">
                <span className="text-2xl font-serif font-bold">Filters</span>
                <button onClick={() => setMobileFilterOpen(false)}><X size={24} /></button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pt-32 md:pt-40 pb-8 text-center bg-gradient-to-b from-white to-[#FDFBF7]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {globalGender !== 'all' ? `For ${globalGender}` : 'Collection'}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-aura-brown capitalize px-4">
            {getCategoryTitle(categorySlug)}
          </h1>
        </motion.div>
      </div>

      {!loading && products.length > 0 && (
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 mb-8">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide items-center justify-start md:justify-center">
                  {['all', 'men', 'women', 'couple'].map(gender => (
                      <button
                          key={gender}
                          onClick={() => handleGenderSelect(gender)}
                          className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm ${
                              globalGender === gender
                              ? 'bg-aura-brown text-white border-aura-brown shadow-md scale-105'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold hover:text-aura-brown'
                          }`}
                      >
                          {gender}
                      </button>
                  ))}
              </div>
          </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:gap-16 pb-20">
        
        <aside className="hidden lg:block w-64 flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-2 pb-4 border-b border-aura-brown/10 mb-8">
                <Filter size={20} className="text-aura-gold" />
                <span className="text-xl font-serif font-bold">Filters</span>
            </div>
            <FilterContent />
        </aside>

        <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-aura-brown/10">
                <button 
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase bg-aura-brown text-white px-4 py-2 rounded-full"
                >
                  <Filter size={14} /> Filter
                </button>

                <p className="hidden md:block text-sm text-gray-500 italic">Showing {filteredProducts.length} masterpieces</p>
                
                <div className="relative z-20">
                    <button 
                        onClick={() => setSortOpen(!sortOpen)} 
                        className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase text-aura-brown hover:text-aura-gold transition"
                    >
                        Sort By: {sortBy.replace('-', ' ')} 
                        <ChevronDown size={16} className={`${sortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {sortOpen && <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />}

                    <AnimatePresence>
                        {sortOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full pt-2 w-48 z-20"
                            >
                                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
                                    {[
                                        { val: "featured", label: "Featured" },
                                        { val: "newest", label: "Newest" },
                                        { val: "low-high", label: "Price: Low to High" },
                                        { val: "high-low", label: "Price: High to Low" }
                                    ].map((option) => (
                                      <button 
                                        key={option.val} 
                                        onClick={() => { setSortBy(option.val); setSortOpen(false); }} 
                                        className={`block w-full text-left px-4 py-3 text-sm ${sortBy === option.val ? 'bg-aura-gold/10 text-aura-gold font-bold' : 'hover:bg-gray-50'}`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-aura-brown/60">
                    <Loader2 className="animate-spin mb-4 text-aura-gold" size={32} /> 
                    <p className="text-sm font-serif italic tracking-wider">Accessing Vault...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {visibleProducts.map((product, index) => (
                                <motion.div 
                                    key={product.id}
                                    variants={fadeInUp}
                                    initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }} layout
                                >
                                    <ProductCard product={product} priority={index < 4} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {visibleCount < filteredProducts.length && (
                        <div className="flex justify-center pt-8">
                            <button 
                                onClick={loadMore}
                                className="flex items-center gap-3 px-8 py-4 bg-white border border-aura-gold/30 rounded-full shadow-sm hover:shadow-lg transition-all"
                            >
                                <span className="text-xs font-bold uppercase text-aura-brown">Load More</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-white/40 rounded-[2rem] border border-dashed border-aura-gold/40">
                    <p className="text-xl md:text-2xl font-serif text-gray-400 mb-2">No masterpieces found.</p>
                    <p className="text-sm text-gray-400 mb-6">Our collection in this category is currently being curated.</p>
                </div>
            )}
            
            {!loading && products.length > 0 && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-white/40 rounded-[2rem] border border-dashed border-aura-gold/40">
                    <p className="text-xl md:text-2xl font-serif text-gray-400 mb-6">No pieces match these criteria.</p>
                    <button onClick={() => {setPriceRange(500000); setSelectedMovements([]); setSelectedStraps([]); setSortBy("featured"); setGlobalGender("all"); localStorage.setItem('aura_gender', 'all')}} className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-aura-gold transition-colors">
                      CLEAR ALL FILTERS
                    </button>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}