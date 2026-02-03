"use client";

import { useState } from "react";
import { products } from "@/lib/mockData";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; // IMPORTED
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter } from "lucide-react"; 
import { useParams } from "next/navigation";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string; 

  const [priceRange, setPriceRange] = useState(15000); 
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [selectedStraps, setSelectedStraps] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");

  const movements = ["Automatic", "Mechanical", "Quartz"];
  const straps = ["Leather", "Metal", "Chain"];

  const filteredProducts = products.filter((product) => {
    if (product.category !== categorySlug) return false;
    if (product.price > priceRange) return false;
    if (selectedMovements.length > 0 && !selectedMovements.includes(product.movement)) return false;
    if (selectedStraps.length > 0 && !selectedStraps.includes(product.strap)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price;
    if (sortBy === "high-low") return b.price - a.price;
    return 0;
  });

  const toggleFilter = (item: string, state: string[], setState: any) => {
    if (state.includes(item)) setState(state.filter((i) => i !== item));
    else setState([...state, item]);
  };

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />

      <div className="pt-44 pb-12 text-center bg-gradient-to-b from-white to-[#F2F0E9]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-aura-gold text-xs font-bold tracking-[0.3em] uppercase block mb-3">
              Collection
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-aura-brown capitalize">
              {categorySlug === 'couple' ? "Couple's Timepieces" : `${categorySlug}'s Collection`}
            </h1>
        </motion.div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16 pb-20">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-10 lg:sticky lg:top-32 h-fit">
            <div className="flex items-center gap-2 pb-4 border-b border-aura-brown/10">
                <Filter size={20} className="text-aura-gold" />
                <span className="text-xl font-serif font-bold">Filters</span>
            </div>

            <div>
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-aura-brown/70">Price Limit</h3>
                <input 
                    type="range" 
                    min="500" 
                    max="15000" 
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-aura-gold/30 rounded-lg appearance-none cursor-pointer accent-aura-brown"
                />
                <div className="flex justify-between text-sm mt-3 font-medium text-aura-brown">
                    <span>$500</span>
                    <span>${priceRange.toLocaleString()}</span>
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
                            <span className="text-sm font-medium text-gray-600 group-hover:text-aura-brown transition-colors">{move}</span>
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
                            <span className="text-sm font-medium text-gray-600 group-hover:text-aura-brown transition-colors">{strap}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        {/* --- RIGHT PRODUCT GRID --- */}
        <div className="flex-1">
            
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-aura-brown/10">
                <p className="text-sm text-gray-500">Showing <span className="font-bold text-aura-brown">{filteredProducts.length}</span> results</p>
                
                <div className="relative group z-20">
                    <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-aura-brown hover:text-aura-gold transition py-2">
                        Sort By <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
                            <button onClick={() => setSortBy("featured")} className="block w-full text-left px-4 py-3 text-sm hover:bg-aura-gold/10 transition text-gray-600 hover:text-aura-brown">Featured</button>
                            <button onClick={() => setSortBy("low-high")} className="block w-full text-left px-4 py-3 text-sm hover:bg-aura-gold/10 transition text-gray-600 hover:text-aura-brown">Price: Low to High</button>
                            <button onClick={() => setSortBy("high-low")} className="block w-full text-left px-4 py-3 text-sm hover:bg-aura-gold/10 transition text-gray-600 hover:text-aura-brown">Price: High to Low</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredProducts.map((product) => (
                        <motion.div 
                            key={product.id}
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            {/* USING THE REUSABLE COMPONENT HERE TOO */}
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-dashed border-aura-gold/30">
                    <p className="text-2xl font-serif text-gray-400 mb-2">No watches match your filter.</p>
                    <button onClick={() => {setPriceRange(15000); setSelectedMovements([]); setSelectedStraps([]);}} className="text-aura-brown font-bold underline hover:text-aura-gold">Reset Filters</button>
                </div>
            )}

        </div>
      </div>
    </main>
  );
}