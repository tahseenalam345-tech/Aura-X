"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ShoppingBag, Search, Menu, X, ChevronRight, User, LogIn, LayoutDashboard, Truck, LogOut, ArrowRight, Loader2, Star, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; 
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase"; 

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // --- SEARCH STATES ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isAdmin, logout } = useAuth(); 
  const { totalItems } = useCart(); 

  // 🚀 UPDATED ANNOUNCEMENTS
  const announcements = useMemo(() => [
    "🇵🇰 Cash on Delivery Available Nationwide",
    "🛡️ 6-Month Official Movement Warranty",
    "✨ New Collection Dropping Soon - Stay Tuned",
    "💎 Premium Quality Luxury Watches",
    "⚡ Fast & Secure Nationwide Shipping"
  ], []);

  // --- LOCK BODY SCROLL ---
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isSidebarOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = originalStyle; };
  }, [isSidebarOpen, isSearchOpen]);

  // --- REAL TIME SEARCH LOGIC ---
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

  // --- CLEAR SEARCH ON CLOSE ---
  useEffect(() => {
    if (!isSearchOpen) {
        setSearchQuery("");
        setSearchResults([]);
    }
  }, [isSearchOpen]);

  const navLinks = useMemo<{ name: string; href: string; isSpecial?: boolean }[]>(() => [
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Couple', href: '/couple' },
  ], []);

  const handleTagClick = useCallback((tag: string) => {
      setSearchQuery(tag);
  }, []);

  const handleCloseAll = useCallback(() => {
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-gradient-to-r from-white/60 via-[#FDFBF7]/70 to-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_10px_40px_rgba(58,42,24,0.06)] flex flex-col">
        
        {/* 🚀 PREMIUM ANNOUNCEMENT BAR */}
        <div className="bg-gradient-to-r from-[#0f0c09] via-[#2a231a] to-[#0f0c09] h-9 overflow-hidden flex items-center relative z-20 border-b border-[#D4AF37]/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
           <div className="absolute inset-0 flex items-center w-full">
             <motion.div 
                className="flex whitespace-nowrap gap-16 md:gap-32 px-4"
                animate={{ x: ["0%", "-100%"] }}
                // 🚀 SPEED SLOWED DOWN (Duration changed from 80 to 150)
                transition={{ repeat: Infinity, ease: "linear", duration: 150 }}
             >
                 {[...announcements, ...announcements, ...announcements].map((text, i) => (
                    <span key={i} className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-[#E5C07B] to-[#D4AF37] drop-shadow-md">
                       {text}
                    </span>
                 ))}
             </motion.div>
           </div>
        </div>

        {/* --- MAIN NAVBAR CONTENT --- */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 h-16 md:h-24 flex items-center justify-between relative">
          
          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-6">
             <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2.5 -ml-2 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group"
                aria-label="Open navigation menu"
             >
                <Menu className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
             </button>

             <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-[#8B7355]/30 to-transparent"></div>
             
             {navLinks.map((item) => (
               <Link 
                 key={item.name} 
                 href={item.href} 
                 className={`text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 relative group py-2 
                    ${item.isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F9E596] animate-pulse drop-shadow-sm' : 'text-[#3A2A18] hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#8B7355]'}`}
               >
                  {item.name}
                  <span className={`absolute left-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B7355] transition-all duration-500 ease-out ${item.isSpecial ? 'w-full shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'w-0 group-hover:w-full opacity-0 group-hover:opacity-100'}`}></span>
               </Link>
             ))}
          </div>

          {/* MOBILE LEFT MENU */}
          <div className="flex md:hidden items-center gap-2 z-20">
             <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 rounded-full hover:bg-white/60 transition-all active:scale-95 group"
                aria-label="Open navigation menu"
             >
                <Menu className="w-6 h-6 text-[#2A241D] group-hover:text-[#D4AF37]" />
             </button>
             <button 
                onClick={() => setIsSearchOpen(true)} 
                className="p-2 rounded-full hover:bg-white/60 transition-all active:scale-95 group"
                aria-label="Search products"
             >
                <Search className="w-6 h-6 text-[#2A241D] group-hover:text-[#D4AF37]" />
             </button>
          </div>

          {/* LOGO */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <Link href="/" className="block relative w-32 h-16 md:w-56 md:h-28 hover:scale-105 transition-transform duration-500 drop-shadow-lg">
              <Image src="/logo.png" alt="Logo" fill className="object-contain invert" priority unoptimized />
            </Link>
          </div>

          {/* ICONS (RIGHT) */}
          <div className="flex items-center gap-1 md:gap-4 ml-auto md:ml-0 z-20">
              <Link 
                  href="/wishlist" 
                  className="p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group"
              >
                  <Heart className="w-5 h-5 text-[#2A241D] group-hover:fill-[#D4AF37] group-hover:text-[#D4AF37] transition-all duration-300" />
              </Link>

              <Link 
                href="/cart" 
                className="relative p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group"
              >
                <ShoppingBag className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
                {totalItems > 0 && (
                   <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(212,175,55,0.6)] animate-in zoom-in border-[1.5px] border-white">
                     {totalItems}
                   </span>
                )}
              </Link>

              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="hidden md:block p-2.5 rounded-full border border-transparent hover:border-white/60 hover:bg-gradient-to-br hover:from-white/80 hover:to-white/30 hover:shadow-[0_5px_15px_rgba(212,175,55,0.15)] transition-all duration-300 active:scale-95 group"
              >
                <Search className="w-5 h-5 text-[#2A241D] group-hover:text-[#D4AF37] transition-colors" />
              </button>

              <div className="hidden md:flex items-center gap-4">
                  {user && (
                     <button onClick={logout} className="p-2.5 rounded-full border border-transparent hover:border-red-100 hover:bg-red-50 transition-all duration-300 text-[#2A241D] hover:text-red-500 group">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                     </button>
                  )}
              </div>
          </div>
        </div>
      </nav>

      {/* 🚀 PREMIUM SEARCH DRAWER */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAll} className="fixed inset-0 bg-[#0f0c09]/60 backdrop-blur-md z-[90]" />
            <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-gradient-to-b from-[#FDFBF7] to-[#F4EFE6] z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.15)] flex flex-col border-l border-white/60"
            >
               <div className="p-6 border-b border-[#8B7355]/10 flex items-center gap-4 pt-16 md:pt-6 bg-white/40 backdrop-blur-md">
                  <Search className="w-6 h-6 text-[#D4AF37]" />
                  <input 
                    type="text" placeholder="Search masterpeices..." 
                    className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-[#1E1B18] placeholder:text-[#8B7355]/50"
                    autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button onClick={handleCloseAll} className="p-2 bg-white hover:bg-[#FDFBF7] border border-gray-100 shadow-sm rounded-full transition-transform active:scale-90"><X className="w-5 h-5 text-[#3A2A18]" /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                  {isSearching && (
                      <div className="flex flex-col items-center justify-center py-20 text-[#8B7355]">
                          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#D4AF37]" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Accessing Vault...</p>
                      </div>
                  )}

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
                             {["Rolex", "Gold", "Luxury", "Men", "Leather", "Silver"].map(tag => (
                                <button key={tag} onClick={() => handleTagClick(tag)} className="px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full border border-[#D4AF37]/20 text-[#3A2A18] text-xs font-bold tracking-widest uppercase hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#8B7355] hover:text-white hover:border-transparent hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                                   {tag}
                                </button>
                             ))}
                          </div>
                      </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🚀 PREMIUM MOBILE SIDEBAR */}
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
                       <span className="text-xs font-bold tracking-widest uppercase opacity-70">Search watches...</span>
                    </div>
                </div>

                <div className="space-y-8 mb-12">
                   {navLinks.map((item) => (
                     <Link key={item.name} href={item.href} onClick={handleCloseAll} className={`group flex items-center justify-between text-3xl font-serif transition-all duration-300 ${item.isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8B7355] font-black' : 'text-[#1E1B18] hover:text-[#D4AF37]'}`}>
                        <span className="group-hover:translate-x-2 transition-transform duration-300 drop-shadow-sm">{item.name}</span>
                        {item.isSpecial && <Star size={24} className="fill-[#D4AF37] text-[#D4AF37] animate-pulse" />}
                        {!item.isSpecial && <ChevronRight className="opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300 text-[#D4AF37]" />}
                     </Link>
                   ))}
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent mb-10"></div>

                <div className="space-y-6">
                  <Link href="/wishlist" onClick={handleCloseAll} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#3A2A18] hover:text-[#D4AF37] hover:translate-x-2 transition-all duration-300 group">
                      <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full group-hover:border-[#D4AF37]/30 group-hover:bg-[#FDFBF7] transition-colors"><Heart size={16} /></div> 
                      My Wishlist
                  </Link>
                  <Link href="/track-order" onClick={handleCloseAll} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[#3A2A18] hover:text-[#D4AF37] hover:translate-x-2 transition-all duration-300 group">
                      <div className="p-3 bg-white shadow-sm border border-gray-100 rounded-full group-hover:border-[#D4AF37]/30 group-hover:bg-[#FDFBF7] transition-colors"><Truck size={16} /></div> 
                      Track Order
                  </Link>
                  
                  {user && (
                      <button onClick={() => { logout(); handleCloseAll(); }} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-red-400 hover:text-red-600 hover:translate-x-2 transition-all duration-300 mt-6 group">
                          <div className="p-3 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors"><LogOut size={16} /></div>
                          Logout
                      </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}