"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Search, Menu, X, ChevronRight, ChevronDown, User, LogOut, ArrowRight, Loader2, Star, Heart, Sparkles, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; 
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase"; 

const categoryStructure = [
  {
    name: "Watches",
    href: "/watches",
    subItems: [
      { name: "Men's Collection", href: "/men" },
      { name: "Women's Precision", href: "/women" },
      { name: "Couple Bonds", href: "/couple" },
    ]
  },
  // 🚀 UPDATED: Removed belts & sunglasses, kept Bracelets/Wallets
  {
    name: "Accessories",
    href: "/accessories",
    subItems: [
      { name: "Premium Wallets", href: "/wallets" },
      { name: "Bracelets & Rings", href: "/jewelry" },
    ]
  },
  // 🚀 NEW: Standalone Men's Collection Highlight Link
  {
    name: "Men's Edit",
    href: "/accessories",
    isHighlight: true, // Special styling added below
  },
  {
    name: "Smart Tech",
    href: "/smart-tech",
    subItems: [
      { name: "Smartwatches", href: "/smartwatches" },
      { name: "Wireless Earbuds", href: "/earbuds" },
    ]
  },
  // Fragrances removed temporarily as requested
  {
    name: "Combos",
    href: "/combos",
    isSpecial: true,
    subItems: [
      { name: "Pre-Made Combos", href: "/combos" },
      { name: "Craft Custom Combo ✨", href: "/custom-combo" },
    ]
  }
];

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, logout } = useAuth(); 
  const { totalItems } = useCart(); 

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isSidebarOpen || isSearchOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, [isSidebarOpen, isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length <= 1) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, main_image, category, brand')
          .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .limit(6); 
        if (!error && data) setSearchResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
        setSearchQuery("");
        setSearchResults([]);
    }
  }, [isSearchOpen]);

  const handleTagClick = useCallback((tag: string) => { setSearchQuery(tag); }, []);
  const handleCloseAll = useCallback(() => { setIsSidebarOpen(false); setIsSearchOpen(false); setExpandedCategory(null); }, []);
  const toggleCategory = (name: string) => { setExpandedCategory(prev => prev === name ? null : name); };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-gradient-to-r from-white/80 via-[#FDFBF7]/90 to-white/80 backdrop-blur-xl border-b border-white/50 shadow-[0_10px_40px_rgba(58,42,24,0.06)] flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 h-14 md:h-20 flex items-center justify-between relative">
          
          <div className="hidden md:flex items-center gap-6 h-full">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 -ml-2 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group">
                <Menu className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
             </button>
             <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-[#8B7355]/30 to-transparent"></div>
             
             {categoryStructure.map((cat) => (
               <div key={cat.name} className="relative group h-full flex items-center">
                 <Link 
                    href={cat.href} 
                    // 🚀 ADDED: Special glowing style for the new Men's Edit button
                    className={`flex items-center gap-1 text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-300 py-2 
                        ${cat.isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F9E596] animate-pulse drop-shadow-sm' : ''}
                        ${cat.isHighlight ? 'bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5' : ''}
                        ${!cat.isSpecial && !cat.isHighlight ? 'text-[#3A2A18] hover:text-[#D4AF37]' : ''}
                    `}
                  >
                    {cat.isHighlight && <Sparkles size={12} className="text-white mr-1" />}
                    {cat.name}
                    {cat.subItems && <ChevronDown size={12} className="opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300 ml-1" />}
                 </Link>

                 {cat.subItems && (
                   <div className="absolute top-[80%] left-0 w-[240px] pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <div className="bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden flex flex-col py-2">
                        {cat.subItems.map((sub) => (
                          <Link key={sub.name} href={sub.href} className="px-6 py-3 text-[10px] font-bold text-[#3A2A18] hover:text-[#D4AF37] hover:bg-[#FDFBF7] transition-colors uppercase tracking-[0.2em] flex items-center justify-between group/sub">
                            {sub.name}
                            <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-300 text-[#D4AF37]"/>
                          </Link>
                        ))}
                      </div>
                   </div>
                 )}
               </div>
             ))}
          </div>

          <div className="flex md:hidden items-center gap-2 z-20">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/60 transition-all active:scale-95 group"><Menu className="w-6 h-6 text-[#2A241D] group-hover:text-[#D4AF37]" /></button>
             <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-white/60 transition-all active:scale-95 group"><Search className="w-6 h-6 text-[#2A241D] group-hover:text-[#D4AF37]" /></button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <Link href="/" className="block relative w-28 h-10 md:w-44 md:h-16 hover:scale-105 transition-transform duration-500 drop-shadow-sm">
              <Image src="/logo.png" alt="Logo" fill className="object-contain invert" priority unoptimized />
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-4 ml-auto md:ml-0 z-20">
              <Link href="/wishlist" className="p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group">
                  <Heart className="w-5 h-5 text-[#2A241D] group-hover:fill-[#D4AF37] group-hover:text-[#D4AF37] transition-all duration-300" />
              </Link>
              <Link href="/cart" className="relative p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group">
                <ShoppingBag className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(212,175,55,0.6)] animate-in zoom-in border-[1.5px] border-white">{totalItems}</span>}
              </Link>
              <button onClick={() => setIsSearchOpen(true)} className="hidden md:block p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group">
                <Search className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
              </button>
              <div className="hidden md:flex items-center gap-4">
                  {user && <button onClick={logout} className="p-2.5 rounded-full border border-transparent hover:border-red-100 hover:bg-red-50 transition-all duration-300 text-[#2A241D] hover:text-red-500 group"><LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" /></button>}
              </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAll} className="fixed inset-0 bg-[#0f0c09]/60 backdrop-blur-md z-[90]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-gradient-to-b from-[#FDFBF7] to-[#F4EFE6] z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.15)] flex flex-col border-l border-white/60">
               <div className="p-6 border-b border-[#8B7355]/10 flex items-center gap-4 pt-16 md:pt-6 bg-white/40 backdrop-blur-md">
                  <Search className="w-6 h-6 text-[#D4AF37]" />
                  <input type="text" placeholder="Search masterpeices..." className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-[#1E1B18] placeholder:text-[#8B7355]/50" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button onClick={handleCloseAll} className="p-2 bg-white hover:bg-[#FDFBF7] border border-gray-100 shadow-sm rounded-full transition-transform active:scale-90"><X className="w-5 h-5 text-[#3A2A18]" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8">
                  {isSearching && <div className="flex flex-col items-center justify-center py-20 text-[#8B7355]"><Loader2 className="w-10 h-10 animate-spin mb-4 text-[#D4AF37]" /><p className="text-[10px] font-bold uppercase tracking-[0.3em]">Accessing Vault...</p></div>}
                  {!isSearching && searchResults.length > 0 && (
                      <div>
                          <h3 className="text-[10px] font-bold text-[#8B7355]/70 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Sparkles size={12} className="text-[#D4AF37]"/> Found {searchResults.length} Curations</h3>
                          <div className="space-y-4">
                             {searchResults.map((product) => (
                                <Link href={`/product/${product.id}`} key={product.id} onClick={handleCloseAll} className="flex gap-5 items-center group cursor-pointer p-3 bg-white/60 backdrop-blur-sm hover:bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.15)] rounded-2xl transition-all duration-300 border border-white hover:border-[#D4AF37]/30">
                                   <div className="w-16 h-16 bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-xl relative overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                      <Image src={product.main_image || "/placeholder.jpg"} alt={product.name} fill className="object-contain p-2" unoptimized={true} />
                                   </div>
                                   <div className="flex-1">
                                      <h4 className="font-serif font-bold text-[#1E1B18] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#8B7355] transition-all text-sm line-clamp-1">{product.name}</h4>
                                      <p className="text-[9px] text-[#8B7355] uppercase font-black tracking-[0.2em] mt-1">{product.brand || "Aura-X"}</p>
                                      <p className="text-sm font-medium text-[#3A2A18] mt-1">Rs {product.price.toLocaleString()}</p>
                                   </div>
                                   <button className="p-3 bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-full group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#8B7355] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm"><ArrowRight size={14} /></button>
                                </Link>
                             ))}
                          </div>
                      </div>
                  )}
                  {!isSearching && searchResults.length === 0 && searchQuery.trim() === "" && (
                      <div className="mb-10">
                          <h3 className="text-[10px] font-bold text-[#8B7355]/70 uppercase tracking-[0.3em] mb-6 flex items-center gap-2"><Star size={12} className="text-[#D4AF37]"/> Trending Now</h3>
                          <div className="flex flex-wrap gap-3">
                             {["Rolex", "Wallets", "Smartwatches", "Bracelets"].map(tag => (
                                <button key={tag} onClick={() => handleTagClick(tag)} className="px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#D4AF37]/20 text-[#3A2A18] text-xs font-bold tracking-widest uppercase hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#8B7355] hover:text-white hover:border-transparent hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-1">{tag}</button>
                             ))}
                          </div>
                      </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAll} className="fixed inset-0 bg-[#0f0c09]/60 backdrop-blur-md z-[60]" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 h-full w-[85%] sm:w-[380px] bg-gradient-to-br from-[#FDFBF7] via-[#F4EFE6] to-[#EAE0CB] z-[70] shadow-[20px_0_50px_rgba(0,0,0,0.2)] flex flex-col border-r border-white/60">
              <div className="p-8 flex justify-between items-center border-b border-[#8B7355]/10 pt-16 md:pt-8 bg-white/40 backdrop-blur-md">
                <span className="text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8B7355] tracking-[0.3em]">MENU</span>
                <button onClick={handleCloseAll} className="p-2 bg-white hover:bg-[#FDFBF7] border border-gray-100 shadow-sm rounded-full transition-transform active:scale-90"><X className="w-5 h-5 text-[#3A2A18]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 py-6">
                <div className="mb-10 relative md:hidden">
                    <div onClick={() => { setIsSidebarOpen(false); setIsSearchOpen(true); }} className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-[#D4AF37]/20 shadow-[0_4px_15px_rgba(0,0,0,0.03)] rounded-2xl flex items-center text-[#8B7355] cursor-text hover:border-[#D4AF37] transition-colors">
                       <Search className="absolute left-4 w-5 h-5 text-[#D4AF37]" />
                       <span className="text-xs font-bold tracking-widest uppercase opacity-70">Search store...</span>
                    </div>
                </div>
                <div className="space-y-6 mb-12">
                   {categoryStructure.map((cat) => (
                     <div key={cat.name} className="flex flex-col border-b border-[#D4AF37]/10 pb-4">
                       <div className="flex items-center justify-between cursor-pointer group" onClick={() => cat.subItems ? toggleCategory(cat.name) : handleCloseAll()}>
                         <Link 
                            href={cat.href} 
                            onClick={(e) => cat.subItems && e.preventDefault()} 
                            className={`text-2xl font-serif transition-all duration-300 
                                ${cat.isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8B7355] font-black animate-pulse' : ''}
                                ${cat.isHighlight ? 'inline-block bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white px-4 py-1.5 rounded-full text-lg shadow-md' : ''}
                                ${!cat.isSpecial && !cat.isHighlight ? 'text-[#1E1B18] group-hover:text-[#D4AF37]' : ''}
                            `}
                         >
                            {cat.name}
                         </Link>
                         {cat.subItems && <button className="p-2 rounded-full hover:bg-white/50 transition-colors"><ChevronDown className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 ${expandedCategory === cat.name ? '-rotate-180' : ''}`} /></button>}
                       </div>
                       <AnimatePresence>
                         {cat.subItems && expandedCategory === cat.name && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-4 pl-4 mt-4 border-l-2 border-[#D4AF37]/30 ml-2">
                             {cat.subItems.map(sub => (
                               <Link key={sub.name} href={sub.href} onClick={handleCloseAll} className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B7355] hover:text-[#D4AF37] flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-[#D4AF37]"></span> {sub.name}</Link>
                             ))}
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   ))}
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-10"></div>
                <div className="space-y-6">
                  <Link href="/wishlist" onClick={handleCloseAll} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#3A2A18] hover:text-[#D4AF37] hover:translate-x-2 transition-all duration-300 group"><div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full group-hover:border-[#D4AF37]/30 group-hover:bg-[#FDFBF7] transition-colors"><Heart size={16} /></div> My Wishlist</Link>
                  <Link href="/track-order" onClick={handleCloseAll} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#3A2A18] hover:text-[#D4AF37] hover:translate-x-2 transition-all duration-300 group"><div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full group-hover:border-[#D4AF37]/30 group-hover:bg-[#FDFBF7] transition-colors"><Truck size={16} /></div> Track Order</Link>
                  {user && <button onClick={() => { logout(); handleCloseAll(); }} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-red-400 hover:text-red-600 hover:translate-x-2 transition-all duration-300 mt-6 group"><div className="p-3 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors"><LogOut size={16} /></div>Logout</button>}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}