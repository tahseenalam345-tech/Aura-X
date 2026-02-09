"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; 
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react"; 
import { useParams, notFound } from "next/navigation"; // Added notFound
import { supabase } from "@/lib/supabase"; 

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string; 
  
  // --- SAFETY CHECK (NEW CODE) ---
  // This prevents the Category Page from stealing system pages like Privacy Policy
  const reservedRoutes = ['privacy-policy', 'support', 'track-order', 'admin', 'login', 'cart', 'eid-collection'];
  
  // If the URL matches a reserved page, stop rendering this component immediately.
  if (reservedRoutes.includes(categorySlug)) {
      return null; 
  }
  // --------------------------------

  // --- NEW: STATE FOR REAL DATA ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceRange, setPriceRange] = useState(500000); 
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [selectedStraps, setSelectedStraps] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const movements = ["Automatic", "Mechanical", "Quartz"];
  const straps = ["Leather", "Metal", "Chain", "Silicon"];

  // --- NEW: FETCH FROM SUPABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Fetch items matching category AND ensure they are NOT Eid Exclusive
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categorySlug)
        .eq('is_eid_exclusive', false); // <--- THIS LINE HIDES THEM
      
      if (data) setProducts(data);
      setLoading(false);
    };

    // Only run fetch if it's NOT a reserved route
    if (categorySlug && !reservedRoutes.includes(categorySlug)) {
        fetchProducts();
    }
  }, [categorySlug]);

  // --- FILTERING LOGIC (Applied to Real Data) ---
  const filteredProducts = products.filter((product) => {
    // 1. Price Check
    if (product.price > priceRange) return false;
    
    // 2. Movement Check
    if (selectedMovements.length > 0) {
        const move = product.specs?.movement || "Quartz";
        if (!selectedMovements.includes(move)) return false;
    }

    // 3. Strap Check
    if (selectedStraps.length > 0) {
        const strap = product.specs?.strap || "Leather";
        const hasStrap = selectedStraps.some(s => strap.includes(s));
        if (!hasStrap) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    return 0; // Featured (Default)
  });

  const toggleFilter = (item: string, state: string[], setState: any) => {
    if (state.includes(item)) setState(state.filter((i: string) => i !== item));
    else setState([...state, item]);
  };

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
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />

      {/* --- MOBILE FILTER DRAWER --- */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-xs bg-[#F2F0E9] z-[101] p-8 shadow-2xl lg:hidden overflow-y-auto"
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

      <div className="pt-32 md:pt-44 pb-12 text-center bg-gradient-to-b from-white to-[#F2F0E9]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase block mb-3">Collection</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-aura-brown capitalize px-4">
            {categorySlug === 'couple' ? "Couple's Timepieces" : `${categorySlug}'s Collection`}
          </h1>
        </motion.div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:gap-16 pb-20">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:block w-64 flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-2 pb-4 border-b border-aura-brown/10 mb-8">
                <Filter size={20} className="text-aura-gold" />
                <span className="text-xl font-serif font-bold">Filters</span>
            </div>
            <FilterContent />
        </aside>

        {/* --- MAIN GRID --- */}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-aura-brown/10">
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-aura-brown text-white px-4 py-2 rounded-full"
                >
                  <Filter size={14} /> Filter
                </button>

                <p className="hidden md:block text-sm text-gray-500 italic">Showing {filteredProducts.length} masterpieces</p>
                
                <div className="relative group z-20">
                    <button className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-aura-brown hover:text-aura-gold transition">
                        Sort By <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
                            {["featured", "low-high", "high-low"].map((option) => (
                              <button 
                                key={option}
                                onClick={() => setSortBy(option)} 
                                className="block w-full text-left px-4 py-3 text-sm hover:bg-aura-gold/10 transition capitalize"
                              >
                                {option.replace('-', ' ')}
                              </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-aura-brown animate-pulse">Loading Collection...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => (
                            <motion.div 
                                key={product.id}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-white/40 rounded-[2rem] border border-dashed border-aura-gold/40">
                    <p className="text-xl md:text-2xl font-serif text-gray-400 mb-6">No pieces match these criteria.</p>
                    <button 
                      onClick={() => {setPriceRange(150000); setSelectedMovements([]); setSelectedStraps([]);}} 
                      className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-aura-gold transition-colors"
                    >
                      CLEAR ALL FILTERS
                    </button>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}