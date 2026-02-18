"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ShoppingBag, Search, Menu, X, ChevronRight, User, LogIn, LayoutDashboard, Truck, LogOut, ArrowRight, Loader2, Star, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; 
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase"; 

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- SEARCH STATES ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { user, isAdmin, logout } = useAuth(); 
  const { totalItems } = useCart(); 

  const announcements = useMemo(() => [
    "🚚 Free Shipping on Orders Above Rs 5,000",
    "🇵🇰 Cash on Delivery Available Nationwide",
    "🛡️ 1-Year Official Movement Warranty",
    "✨ New Collection Dropping Soon - Stay Tuned"
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

  const navLinks = useMemo(() => [
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Couple', href: '/couple' },
    { name: 'Eid Edit', href: '/eid-collection', isSpecial: true } 
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
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#F2F0E9]/80 backdrop-blur-xl border-b border-aura-brown/5 flex flex-col">
        
        {/* --- ANNOUNCEMENT BAR --- */}
        <div className="bg-[#1E1B18] text-aura-gold h-9 overflow-hidden flex items-center relative z-20">
           <div className="absolute inset-0 flex items-center w-full">
             <motion.div 
                className="flex whitespace-nowrap gap-16 md:gap-32 px-4"
                animate={{ x: ["0%", "-100%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 80 }}
             >
                  {[...announcements, ...announcements, ...announcements].map((text, i) => (
                    <span key={i} className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase flex items-center gap-2">
                       {text}
                    </span>
                  ))}
             </motion.div>
           </div>
        </div>

        {/* --- MAIN NAVBAR CONTENT --- */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 h-16 md:h-24 flex items-center justify-between relative">
          
          <div className="hidden md:flex items-center gap-6">
             <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 -ml-2 hover:bg-aura-gold/10 rounded-full transition active:scale-95"
                aria-label="Open navigation menu"
             >
                <Menu className="w-6 h-6 text-aura-brown" />
             </button>

             <div className="h-6 w-[1px] bg-aura-brown/20"></div>
             
             {navLinks.map((item) => (
               <Link 
                 key={item.name} 
                 href={item.href} 
                 className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors relative group py-2 
                    ${item.isSpecial ? 'text-aura-gold animate-pulse' : 'text-aura-brown hover:text-aura-gold'}`}
               >
                  {item.name}
                  <span className={`absolute left-0 bottom-0 h-[1.5px] bg-aura-gold transition-all duration-300 ${item.isSpecial ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
               </Link>
             ))}
          </div>

          <div className="flex md:hidden items-center gap-3 z-20">
             <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 hover:bg-aura-gold/10 rounded-full transition active:scale-95"
                aria-label="Open navigation menu"
             >
                <Menu className="w-6 h-6 text-aura-brown" />
             </button>
             <button 
                onClick={() => setIsSearchOpen(true)} 
                className="p-2 hover:bg-aura-gold/10 rounded-full transition active:scale-95"
                aria-label="Search products"
             >
                <Search className="w-6 h-6 text-aura-brown" />
             </button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <Link href="/" className="block relative w-32 h-16 md:w-56 md:h-28 hover:scale-105 transition-transform duration-500">
              <Image src="/logo.png" alt="Logo" fill className="object-contain invert" priority unoptimized />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-6 ml-auto md:ml-0 z-20">
              <Link 
                  href="/wishlist" 
                  className="p-2 rounded-full hover:bg-aura-gold/10 transition-all active:scale-90 text-aura-brown group"
              >
                  <Heart className="w-6 h-6 group-hover:fill-aura-brown transition-colors duration-300" />
              </Link>

              <Link 
                href="/cart" 
                className="relative p-2 rounded-full hover:bg-aura-gold/10 transition-colors active:scale-90"
              >
                <ShoppingBag className="w-6 h-6 text-aura-brown" />
                {totalItems > 0 && (
                   <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                     {totalItems}
                   </span>
                )}
              </Link>

              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="hidden md:block p-2 rounded-full hover:bg-aura-gold/10 transition-colors"
              >
                <Search className="w-6 h-6 text-aura-brown" />
              </button>

              <div className="hidden md:flex items-center gap-4">
                  {/* --- FIXED: REMOVED LOGIN ICON IF NO USER --- */}
                  {user && (
                     <button onClick={logout} className="p-2 rounded-full hover:bg-aura-gold/10 transition-colors text-aura-brown">
                        <LogOut className="w-6 h-6" />
                     </button>
                  )}
              </div>
          </div>
        </div>
      </nav>

      {/* --- SEARCH DRAWER --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAll} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
            <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#FDFBF7] z-[100] shadow-2xl flex flex-col"
            >
               <div className="p-6 border-b border-gray-100 flex items-center gap-4 pt-16 md:pt-6">
                  <Search className="w-6 h-6 text-gray-400" />
                  <input 
                    type="text" placeholder="Search watches..." 
                    className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-aura-brown"
                    autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button onClick={handleCloseAll} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                  {isSearching && (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                          <Loader2 className="w-8 h-8 animate-spin mb-2 text-aura-gold" />
                          <p className="text-xs font-bold uppercase tracking-widest">Searching...</p>
                      </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                      <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Found {searchResults.length} Results</h3>
                          <div className="space-y-4">
                             {searchResults.map((product) => (
                                <Link href={`/product/${product.id}`} key={product.id} onClick={handleCloseAll} className="flex gap-4 items-center group cursor-pointer p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-100">
                                   <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg relative overflow-hidden">
                                      {/* ADDED unoptimized={true} HERE */}
                                      <Image src={product.main_image || "/placeholder.jpg"} alt={product.name} fill className="object-contain p-1" unoptimized={true} />
                                   </div>
                                   <div className="flex-1">
                                      <h4 className="font-serif font-bold text-aura-brown group-hover:text-aura-gold transition-colors text-sm line-clamp-1">{product.name}</h4>
                                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{product.brand || "Aura-X"}</p>
                                      <p className="text-sm font-bold text-aura-brown mt-1">Rs {product.price.toLocaleString()}</p>
                                   </div>
                                   <button className="p-2 bg-gray-50 rounded-full group-hover:bg-aura-brown group-hover:text-white transition-colors"><ArrowRight size={16} /></button>
                                </Link>
                             ))}
                          </div>
                      </div>
                  )}

                  {!isSearching && searchResults.length === 0 && searchQuery.trim() === "" && (
                      <div className="mb-10">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trending Now</h3>
                          <div className="flex flex-wrap gap-2">
                             {["Rolex", "Gold", "Luxury", "Men", "Leather", "Silver"].map(tag => (
                                <button key={tag} onClick={() => handleTagClick(tag)} className="px-4 py-2 rounded-full border border-aura-gold/30 text-aura-brown text-sm font-medium hover:bg-aura-gold hover:text-white transition-colors">
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

      {/* --- MOBILE SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseAll} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-[85%] md:w-[450px] bg-aura-cream z-[70] shadow-2xl flex flex-col border-l border-aura-gold/20">
              
              <div className="p-8 flex justify-between items-center border-b border-aura-gold/10 pt-16 md:pt-8">
                <span className="text-xl font-serif font-bold text-aura-brown tracking-widest">MENU</span>
                <button onClick={handleCloseAll} className="p-2 hover:bg-aura-gold/10 rounded-full transition"><X className="w-6 h-6 text-aura-brown" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 py-4">
                <div className="mb-8 relative md:hidden">
                    <div onClick={() => { setIsSidebarOpen(false); setIsSearchOpen(true); }} className="w-full pl-12 pr-4 py-3 bg-white border border-aura-gold/20 rounded-xl flex items-center text-gray-400 cursor-text">
                       <Search className="absolute left-4 w-5 h-5" />
                       <span>Search watches...</span>
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                   {navLinks.map((item) => (
                     <Link key={item.name} href={item.href} onClick={handleCloseAll} className={`group flex items-center justify-between text-3xl font-serif transition-colors ${item.isSpecial ? 'text-aura-gold font-bold' : 'text-aura-brown hover:text-aura-gold'}`}>
                        {item.name} 
                        {item.isSpecial && <Star size={24} className="fill-aura-gold animate-pulse" />}
                        {!item.isSpecial && <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-aura-gold" />}
                     </Link>
                   ))}
                </div>

                <div className="h-[1px] w-full bg-aura-gold/20 mb-8"></div>

                <div className="space-y-4">
                  <Link href="/wishlist" onClick={handleCloseAll} className="flex items-center gap-4 text-lg font-bold text-aura-brown hover:pl-2 transition-all"><Heart size={18} /> My Wishlist</Link>
                  <Link href="/track-order" onClick={handleCloseAll} className="flex items-center gap-4 text-lg font-bold text-aura-brown hover:pl-2 transition-all"><Truck size={18} /> Track Order</Link>
                  
                  {/* --- LOGIN/ADMIN LINKS REMOVED --- */}

                  {user && <button onClick={() => { logout(); handleCloseAll(); }} className="flex items-center gap-4 text-lg font-medium text-red-400 hover:text-red-500 transition-all mt-4"><LogOut size={18} /> Logout</button>}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}