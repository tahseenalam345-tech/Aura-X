"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight, ChevronRight, Sparkles, Star, Flame, Moon, Gift, X } from "lucide-react"; 

// 🚀 MASTER SWITCH: Set to false to hide all Eid/Ramzan content.
const IS_EID_LIVE = false; 

// 🚀 8 ITEMS EXACTLY FROM YOUR SCREENSHOT
const carouselItems = [
  { src: "/pic1.webp", tag: "Premium Men's Watch", title: "Legacy in", highlight: "Motion" },       
  { src: "/pic2.webp", tag: "Signature Pour Homme Scent", title: "Aura of", highlight: "Prestige" },        
  { src: "/pic3.webp", tag: "Designer Aviator Sunglasses", title: "Visionary", highlight: "Style" },        
  { src: "/pic4.webp", tag: "Classic Casual Leather Belt", title: "Signature", highlight: "Craft" },        
  { src: "/pic5.webp", tag: "Next-Gen Smartwatch", title: "Smart", highlight: "Evolution" },            
  { src: "/pic6.webp", tag: "Active Noise Cancelling acoustics", title: "Immersive", highlight: "Sound" },           
  { src: "/pic7.webp", tag: "Luxury Leather Wallet", title: "Refined", highlight: "Elegance" },         
  { src: "/pic8.webp", tag: "Luxury Eau De Parfum Notes", title: "Timeless", highlight: "Essence" }            
];

let cachedProducts: any[] = [];
let hasVisitedHomepage = false; 

// 🚀 CLOUDFLARE SHIELD APPLIED HERE
const optimizeCloudinaryUrl = (url: string) => {
    if (!url) return url;
    if (url.includes('cloudinary.com')) {
        if (url.includes('f_auto') || url.includes('q_auto')) return url; 
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    
    // 🚀 Routing Traffic to Cloudflare Worker
    if (url.includes('kdwpnvkgghdksnajalmj.supabase.co')) {
        return url.replace(
            'https://kdwpnvkgghdksnajalmj.supabase.co', 
            'https://image-proxy-aurax.tahseenalam345.workers.dev' 
        );
    }
    
    return url;
};

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allStoreProducts, setAllStoreProducts] = useState<any[]>(cachedProducts);
  const [isLoading, setIsLoading] = useState(cachedProducts.length === 0);
  
  // 🚀 GLOBAL GENDER STATE
  const [globalGender, setGlobalGender] = useState<"all" | "men" | "women" | "couple">("all");
  
  // 🚀 NEW STATE: For the Category Selection Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    // Load previously selected gender if customer returns to home page
    if (typeof window !== 'undefined') {
        const savedGender = localStorage.getItem('aura_gender') as any;
        if (savedGender && ['all', 'men', 'women', 'couple'].includes(savedGender)) {
            setGlobalGender(savedGender);
        }
    }

    const idleTimer = setTimeout(() => {
      const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % carouselItems.length), 3500);
      return () => clearInterval(timer);
    }, 500); 
    return () => clearTimeout(idleTimer);
  }, []);

  const handleGenderSelect = (gender: "all" | "men" | "women" | "couple") => {
      setGlobalGender(gender);
      if (typeof window !== 'undefined') {
          localStorage.setItem('aura_gender', gender);
      }
  };

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + carouselItems.length) % carouselItems.length;
    if (diff === 0) return { x: "0%", scale: 1, zIndex: 50, opacity: 1 };
    return { x: "0%", scale: 0.8, zIndex: 0, opacity: 0 };
  };

  useEffect(() => {
    if (hasVisitedHomepage) return;
    const fetchFastData = async () => {
      if (cachedProducts.length === 0) setIsLoading(true);
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
          hasVisitedHomepage = true; 
      } catch (error) {
          setIsLoading(false); 
      }
    };
    fetchFastData();
  }, []);

  // 🚀 SMART VAULT FILTERING (ONE ITEM PER CATEGORY)
  const trendingVaultProducts = useMemo(() => {
      if (allStoreProducts.length === 0) return [];
      
      let filteredProducts = allStoreProducts;

      // 1. Filter by Gender if selected
      if (globalGender !== 'all') {
          filteredProducts = filteredProducts.filter(p => {
              const cat = p.category?.toLowerCase() || '';
              const subCat = p.sub_category?.toLowerCase() || '';
              
              if (globalGender === 'men') return ['men', 'accessories', 'smart-tech'].includes(cat) || subCat === 'perfume-men';
              if (globalGender === 'women') return ['women'].includes(cat) || subCat === 'perfume-women' || subCat === 'jewelry';
              if (globalGender === 'couple') return cat === 'couple';
              return true;
          });
      }

      // 2. Select ONE item from each unique category/subcategory combination
      const uniqueItemsMap = new Map();
      const diverseList: any[] = [];
      
      // Shuffle first to ensure we don't always pick the exact same item from a category
      const shuffledProducts = [...filteredProducts].sort(() => 0.5 - Math.random());

      for (const p of shuffledProducts) {
          // Create a unique key for this product type (e.g., 'watches-men', 'fragrances-perfume-men')
          const categoryKey = `${p.category || ''}-${p.sub_category || ''}`;
          
          if (!uniqueItemsMap.has(categoryKey)) {
              uniqueItemsMap.set(categoryKey, true);
              diverseList.push(p);
          }
          
          // Stop when we have 8 diverse items
          if (diverseList.length >= 8) break;
      }

      // 3. Fallback: If we don't have 8 diverse categories, fill the rest with other random items
      if (diverseList.length < 8) {
          const usedIds = new Set(diverseList.map(p => p.id));
          for (const p of shuffledProducts) {
              if (!usedIds.has(p.id)) {
                  diverseList.push(p);
                  usedIds.add(p.id);
              }
              if (diverseList.length >= 8) break;
          }
      }

      return diverseList;
  }, [allStoreProducts, globalGender]);

  return (
    <main className="min-h-screen text-aura-brown bg-[#FDFBF7] relative w-full max-w-[100vw] overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .bg-luxury-gradient {
            background: linear-gradient(135deg, #FDFBF7 0%, #EBE2CD 40%, #D4AF37 80%, #6B4E31 100%);
        }
        .bg-bubbles {
            background-image: 
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, rgba(212, 175, 55, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 85% 20%, rgba(139, 115, 85, 0.15) 0%, transparent 40%);
        }
      `}} />

      <Navbar />

      {/* HERO SECTION - Original UI */}
      <section className="relative w-full flex flex-col items-center justify-start pt-[76px] md:pt-[90px] pb-8 overflow-hidden bg-luxury-gradient">
          <div className="absolute inset-0 z-0 bg-bubbles pointer-events-none"></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="50%" stopColor="#FFF2CD" />
                      <stop offset="100%" stopColor="#8B7355" />
                  </linearGradient>
              </defs>
              <path d="M-10,40 Q30,100 110,20" fill="none" stroke="url(#goldGrad)" strokeWidth="0.3"/>
              <path d="M-10,80 Q50,-10 110,50" fill="none" stroke="url(#goldGrad)" strokeWidth="0.15" className="opacity-70"/>
              <path d="M-20,20 Q40,120 120,30" fill="none" stroke="#ffffff" strokeWidth="1" className="opacity-60"/>
          </svg>

          <div className="relative z-20 flex flex-col items-center text-center px-4 w-full mt-2 md:mt-4 mb-4 order-2 md:order-1">
             <AnimatePresence mode="wait">
                 <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center"
                 >
                    <p className="text-[10px] md:text-xs font-bold font-serif text-[#1E1B18] tracking-normal uppercase mb-1 drop-shadow-sm">
                        {carouselItems[currentIndex].tag}
                    </p>
                    <h1 className="text-[3.2rem] sm:text-6xl md:text-7xl lg:text-[6.5rem] font-serif font-medium text-[#1E1B18] leading-[1] tracking-tight">
                        {carouselItems[currentIndex].title} <br className="md:hidden" />
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8B7355] pb-1">
                            {carouselItems[currentIndex].highlight}
                        </span>
                    </h1>
                 </motion.div>
             </AnimatePresence>
          </div>

          <div className="relative w-full h-[220px] md:h-[400px] flex justify-center items-center z-30 pointer-events-none order-1 md:order-2">
              <AnimatePresence>
                  {carouselItems.map((item, index) => {
                      const pos = getPosition(index);
                      if (pos.opacity === 0) return null; 
                      return (
                          <motion.div
                              key={index}
                              initial={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity }}
                              animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="absolute flex justify-center items-center"
                          >
                              <div className="relative w-[220px] h-[220px] md:w-[400px] md:h-[400px]">
                                  <Image src={item.src} alt="" fill className="object-contain drop-shadow-[0_20px_30px_rgba(30,27,24,0.35)]" priority={index === 0} unoptimized={true} />
                              </div>
                          </motion.div>
                      );
                  })}
              </AnimatePresence>
          </div>
      </section>

      <div className="relative z-10 flex flex-col w-full bg-gradient-to-b from-[#FDFBF7] via-[#F2EFE9] to-[#EBE4D8]">
          <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

          <div className="max-w-[1400px] mx-auto pb-24 flex-1 w-full relative z-30 px-4 md:px-8 mt-8">
              
              {/* 🚀 BOX SHAPE BUTTONS IN ONE LINE */}
              <div className="flex flex-col items-center justify-center mb-10 relative z-40 animate-fade-in-up">
                  <p className="text-[10px] font-bold text-aura-brown/60 tracking-[0.3em] uppercase mb-3 font-serif italic">
                      Select Your Experience
                  </p>
                  <div className="grid grid-cols-4 gap-2 w-full max-w-2xl px-2">
                      {['all', 'men', 'women', 'couple'].map((gender) => (
                          <button
                              key={gender}
                              onClick={() => handleGenderSelect(gender as any)}
                              className={`py-3 md:py-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-tighter transition-all duration-300 border shadow-sm ${
                                  globalGender === gender
                                  ? 'bg-aura-brown text-white border-aura-brown shadow-md scale-105'
                                  : 'bg-white text-gray-500 border-aura-gold/20 hover:border-aura-brown'
                              }`}
                          >
                              {gender === 'all' ? 'All' : gender}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="mb-16">
                  <div className="text-center mb-6 md:mb-10 animate-fade-in-up">
                      <p className="text-aura-brown/60 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1 flex items-center justify-center gap-2">
                          <Sparkles size={14} className="text-aura-gold" /> Explore The Collections <Sparkles size={14} className="text-aura-gold" />
                      </p>
                      <h2 className="text-3xl md:text-5xl font-serif text-aura-brown leading-tight">Curated Masterpieces</h2>
                  </div>

                  {/* 🚀 FIXED: Replaced Fragrances with Bracelets & Updated cat-ring Image */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                      {[
                        { title: "Timepieces", img: "/cat-watch.jpg", link: "/watches" },
                        { title: "Men's Bracelets", img: "/cat-perfume.jpg", link: "/bracelets" }, 
                        { title: "Wallets & Belts", img: "/cat-wallet.jpg", link: "/wallets" }, 
                        { title: "Smart Tech", img: "/cat-tech.jpg", link: "/smart-tech" }
                      ].map((cat, i) => (
                         <Link href={cat.link} key={i} className="group relative w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl bg-[#EBE4D8] border border-[#D4AF37]/20 shadow-md">
                             <Image src={cat.img} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100 mix-blend-multiply" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                             <div className="absolute bottom-4 left-4 right-4 text-center">
                                <h3 className="text-white font-serif text-lg md:text-2xl tracking-wider">{cat.title}</h3>
                                <div className="mt-2 w-8 h-[2px] bg-[#D4AF37] mx-auto group-hover:w-full transition-all duration-500"></div>
                             </div>
                         </Link>
                      ))}
                  </div>
              </div>

              {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                      <div className="w-10 h-10 border-4 border-aura-brown border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-serif text-aura-brown text-lg animate-pulse">Accessing Vault...</p>
                  </div>
              ) : (
                  <div className="mb-16">
                      {trendingVaultProducts.length > 0 && (
                          <div className="w-full">
                              <div className="flex justify-between items-end mb-3 md:mb-6">
                                  <div>
                                      <p className="text-aura-brown text-[10px] font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                                          <Star size={12} fill="#D4AF37" className="text-aura-gold"/> Highly Coveted
                                      </p>
                                      <h2 className="text-2xl md:text-5xl font-serif text-aura-brown leading-none">The Luxury Vault</h2>
                                  </div>
                                  
                                  <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold text-[#8B7355] hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
                                      View All <ArrowRight size={16}/>
                                  </button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full pt-4">
                                  {trendingVaultProducts.map((product: any) => (
                                      <div key={product.id} className="w-full h-full rounded-[1rem] md:rounded-[1.5rem] shadow-sm bg-white border border-[#3A2A18]/5 transition-transform duration-300 will-change-transform">
                                          <ProductCard product={product} priority={false} />
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="flex justify-center mt-10 md:mt-12 w-full">
                                  <button onClick={() => setShowCategoryModal(true)} className="px-8 py-3.5 rounded-full border border-[#D4AF37]/50 text-aura-brown font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all flex items-center gap-2 shadow-sm">
                                      View All Collections <ArrowRight size={16} />
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              <div className="w-full rounded-[2rem] bg-[#1E1B18] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between border border-[#D4AF37]/20 shadow-2xl relative overflow-hidden group mt-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A97E]/10 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="flex flex-col text-center lg:text-left z-10 max-w-xl mb-8 lg:mb-0">
                     <p className="text-[#D4AF37] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 flex items-center justify-center lg:justify-start gap-2">
                        <Gift size={14}/> Special Pairings
                     </p>
                     <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-4">The Perfect Gift Combos</h2>
                     <p className="text-gray-400 text-sm md:text-base mb-6">Carefully curated combinations of our finest watches, wallets, and bracelets.</p>
                     <div>
                        <span className="inline-block bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-[#1E1B18] font-black text-[10px] md:text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-[#F9E596]">
                            Extra Rs. 200 Off In Custom Combos
                        </span>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
                      <Link href="/custom-combo" className="px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-[#1E1B18] font-black text-xs tracking-widest uppercase transition-all duration-300 rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 hover:scale-105 border border-[#F9E596]/50">
                          <Sparkles size={16} className="text-[#1E1B18]"/> Create Custom Combo 
                      </Link>
                      <Link href="/combos" className="px-6 py-4 bg-transparent border border-[#D4AF37]/50 text-white hover:bg-white hover:text-[#1E1B18] font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded-full flex items-center justify-center gap-2 group/btn">
                          Pre-Made Combos <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                      </Link>
                  </div>
              </div>

          </div>
      </div>

      {/* 🚀 NEW: CATEGORY SELECTION MODAL */}
      <AnimatePresence>
          {showCategoryModal && (
              <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              >
                  <div className="bg-[#FDFBF7] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative">
                      <div className="p-4 flex justify-between items-center border-b border-[#D4AF37]/20 bg-white">
                          <h3 className="text-lg md:text-xl font-serif text-aura-brown font-bold tracking-wide">Choose a Collection</h3>
                          <button onClick={() => setShowCategoryModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <X size={20} />
                          </button>
                      </div>
                      
                      {/* 🚀 FIXED: Modal Categories Also Updated */}
                      <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 bg-[#FDFBF7]">
                          {[
                            { title: "Timepieces", img: "/cat-watch.jpg", link: "/watches" },
                            { title: "Men's Bracelets", img: "/cat-ring.jpg", link: "/bracelets" }, 
                            { title: "Wallets & Belts", img: "/cat-wallet.jpg", link: "/wallets" }, 
                            { title: "Tech", img: "/cat-tech.jpg", link: "/smart-tech" }
                          ].map((cat, i) => (
                             <Link href={cat.link} key={i} className="group relative w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-[#EBE4D8] border border-[#D4AF37]/20 shadow-sm hover:shadow-md">
                                 <Image src={cat.img} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100 mix-blend-multiply" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                 <div className="absolute bottom-3 md:bottom-4 left-2 right-2 text-center">
                                    <h3 className="text-white font-serif text-xs md:text-lg tracking-wider">{cat.title}</h3>
                                    <div className="mt-1 md:mt-2 w-6 md:w-8 h-[2px] bg-[#D4AF37] mx-auto group-hover:w-full transition-all duration-500"></div>
                                 </div>
                             </Link>
                          ))}
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </main>
  );
}