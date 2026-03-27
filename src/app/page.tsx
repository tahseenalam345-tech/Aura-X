"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight, ChevronRight, Sparkles, Star, Flame, Moon, Gift, ShoppingBag } from "lucide-react"; 

// 🚀 MASTER SWITCH: Set to false to hide all Eid/Ramzan content.
const IS_EID_LIVE = false; 

// 🚀 CAROUSEL ITEMS WITH UPDATED ASSETS
const carouselItems = [
  { src: "/pic1.webp", tag: "Premium Men's Watch", title: "Legacy in", highlight: "Motion" },       
  { src: "/pic2.webp", tag: "Signature Scent", title: "Aura of", highlight: "Prestige" },         
  { src: "/pic3.webp", tag: "Designer Eyewear", title: "Visionary", highlight: "Style" },         
  { src: "/pic4.webp", tag: "Handcrafted Leather", title: "Signature", highlight: "Craft" },         
  { src: "/pic5.webp", tag: "Next-Gen Tech", title: "Smart", highlight: "Evolution" },            
  { src: "/pic6.webp", tag: "Pure Acoustics", title: "Immersive", highlight: "Sound" },           
  { src: "/pic7.webp", tag: "Executive Wallets", title: "Refined", highlight: "Elegance" },         
  { src: "/pic8.webp", tag: "Luxury Fragrance", title: "Timeless", highlight: "Essence" }            
];

// 🚀 GLOBAL MEMORY CACHE
let cachedProducts: any[] = [];
let hasVisitedHomepage = false; 

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allStoreProducts, setAllStoreProducts] = useState<any[]>(cachedProducts);
  const [isLoading, setIsLoading] = useState(cachedProducts.length === 0);

  // 🚀 Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % carouselItems.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + carouselItems.length) % carouselItems.length;
    if (diff === 0) return { x: "0%", scale: 1, zIndex: 50, opacity: 1 };
    return { x: "0%", scale: 0.8, zIndex: 0, opacity: 0 };
  };

  useEffect(() => {
    const fetchFastData = async () => {
      if (cachedProducts.length > 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .order('priority', { ascending: false });

          if (productsData) {
              setAllStoreProducts(productsData); 
              cachedProducts = productsData; 
          }
          setIsLoading(false); 
      } catch (error) {
          console.error("Store loading error:", error);
          setIsLoading(false); 
      }
    };
    fetchFastData();
  }, []);

  // 🚀 MIXED TRENDING VAULT
  const trendingVaultProducts = useMemo(() => {
      if (allStoreProducts.length === 0) return [];
      return allStoreProducts.filter(p => p.is_pinned === true).slice(0, 8);
  }, [allStoreProducts]);


  return (
    <main className="min-h-screen text-aura-brown bg-[#FDFBF7] relative w-full max-w-[100vw] overflow-x-hidden">
      
      <Navbar />

      {/* 🚀 HERO SECTION */}
      <section className="relative w-full flex flex-col items-center justify-start pt-[100px] md:pt-[140px] pb-12 overflow-hidden bg-[#FDFBF7]">
          
          <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,#EBE2CD,transparent_70%)]"></div>

          {/* 🚀 DYNAMIC TOP TEXT */}
          <div className="relative z-20 flex flex-col items-center text-center px-4 w-full mb-8 order-2 md:order-1">
             <AnimatePresence mode="wait">
                 <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                 >
                    <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-aura-gold uppercase mb-3 drop-shadow-sm">
                        {carouselItems[currentIndex].tag}
                    </p>
                    <h1 className="text-[3.5rem] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-serif font-medium text-[#1E1B18] leading-[0.9] tracking-tighter">
                        {carouselItems[currentIndex].title} <br className="hidden md:block" />
                        <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#8B7355] to-[#D4AF37] animate-gradient-x">
                            {carouselItems[currentIndex].highlight}
                        </span>
                    </h1>
                 </motion.div>
             </AnimatePresence>
          </div>

          {/* Center Image Container */}
          <div className="relative w-full h-[250px] md:h-[450px] flex justify-center items-center z-30 pointer-events-none order-1 md:order-2 mb-8 md:mb-0">
              <AnimatePresence>
                  {carouselItems.map((item, index) => {
                      const pos = getPosition(index);
                      if (pos.opacity === 0) return null; 
                      return (
                          <motion.div
                              key={index}
                              initial={{ scale: 0.8, opacity: 0, rotateY: 45 }}
                              animate={{ scale: pos.scale, opacity: pos.opacity, rotateY: 0 }}
                              exit={{ scale: 1.1, opacity: 0, rotateY: -45 }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute flex justify-center items-center"
                          >
                              <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px]">
                                  <Image 
                                      src={item.src} 
                                      alt="AURA-X Luxury" 
                                      fill 
                                      className="object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.15)]" 
                                      priority={index === 0} 
                                      unoptimized={true}
                                  />
                              </div>
                          </motion.div>
                      );
                  })}
              </AnimatePresence>
          </div>
      </section>

      {/* 🚀 1. SMART CATEGORY HUB (Fixed Links) */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 relative z-30">
          <div className="text-center mb-12">
              <p className="text-aura-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-2">The Departments</p>
              <h2 className="text-4xl md:text-6xl font-serif text-aura-brown leading-tight font-medium">Curated Essentials</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "Timepieces", img: "/pic1.webp", link: "/watches" },
                { title: "Fragrances", img: "/pic8.webp", link: "/fragrances" },
                { title: "Leather", img: "/pic7.webp", link: "/accessories" },
                { title: "Tech", img: "/pic5.webp", link: "/smart-tech" }
              ].map((cat, i) => (
                 <Link href={cat.link} key={i} className="group relative w-full aspect-[3/4] overflow-hidden rounded-[2rem] bg-white border border-aura-gold/10 shadow-sm hover:shadow-2xl hover:border-aura-gold/40 transition-all duration-500">
                     <Image src={cat.img} alt={cat.title} fill className="object-contain p-4 md:p-8 group-hover:scale-110 transition-transform duration-700 opacity-90" unoptimized={true} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="absolute bottom-6 left-0 right-0 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <h3 className="text-aura-brown group-hover:text-white font-serif text-xl md:text-2xl tracking-wide">{cat.title}</h3>
                        <p className="text-[9px] text-aura-gold font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-1">Shop Collection</p>
                     </div>
                 </Link>
              ))}
          </div>
      </div>

      {/* 🚀 2. THE LUXURY VAULT (Mixed Trending) */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24 relative z-30">
          {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-8 h-8 border-2 border-aura-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-xs font-bold tracking-widest uppercase">Opening Vault...</p>
              </div>
          ) : trendingVaultProducts.length > 0 && (
              <div className="w-full">
                  <div className="flex justify-between items-end mb-10">
                      <div>
                          <p className="text-aura-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                              <Star size={12} fill="#D4AF37" /> Global Favorites
                          </p>
                          <h2 className="text-3xl md:text-5xl font-serif text-aura-brown leading-none">Trending Now</h2>
                      </div>
                      <Link href="/men" className="hidden md:flex items-center gap-2 text-[10px] font-black text-aura-gold border-b-2 border-aura-gold/20 pb-1 hover:border-aura-gold transition-all uppercase tracking-widest">
                         Explore All <ArrowRight size={14}/>
                      </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                      {trendingVaultProducts.map((product: any) => (
                          <div key={product.id} className="will-change-transform">
                              <ProductCard product={product} priority={false} />
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* 🚀 3. CUSTOM COMBO MASTER SECTION (Multi-Item Focus) */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-32">
          <div className="w-full rounded-[3rem] bg-[#1E1B18] p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between border border-aura-gold/20 shadow-2xl relative overflow-hidden group">
              {/* Background Luxury Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aura-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col text-center lg:text-left z-10 max-w-2xl">
                 <div className="inline-flex items-center gap-2 bg-aura-gold/10 border border-aura-gold/20 px-4 py-2 rounded-full mb-6 w-fit mx-auto lg:mx-0">
                    <Gift size={16} className="text-aura-gold"/>
                    <span className="text-[10px] text-white font-bold tracking-[0.2em] uppercase">The Art of Pairing</span>
                 </div>
                 
                 <h2 className="text-4xl md:text-6xl font-serif text-white leading-[1.1] mb-6">Craft Your Own <br/> <span className="italic text-aura-gold">Signature Bundle</span></h2>
                 
                 <p className="text-gray-400 text-sm md:text-lg mb-10 leading-relaxed">
                    Why settle for one? Pair our master-crafted timepieces with signature fragrances or premium leather accessories to create a gift that speaks volumes.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Link href="/custom-combo" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-[#1E1B18] font-black text-xs tracking-[0.2em] uppercase rounded-full shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-3">
                        <Sparkles size={18}/> START BUILDING
                    </Link>
                    <div className="text-center sm:text-left">
                        <p className="text-white font-bold text-lg">Instant Rs. 200 OFF</p>
                        <p className="text-gray-500 text-xs tracking-widest uppercase">Unlocked on every combo</p>
                    </div>
                 </div>
              </div>

              <div className="relative mt-16 lg:mt-0 w-full lg:w-[400px] aspect-square flex items-center justify-center">
                  {/* Decorative Multi-Item Visual */}
                  <div className="absolute inset-0 bg-aura-gold/10 rounded-full animate-pulse"></div>
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <ShoppingBag size={120} className="text-aura-gold opacity-20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="text-white font-serif text-6xl">2+</span>
                          <span className="text-aura-gold font-bold text-xs tracking-widest">ITEMS</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

    </main>
  );
}