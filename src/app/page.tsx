"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight, ChevronRight, Sparkles, Star, Flame, Quote, Moon, Gift } from "lucide-react"; 

// 🚀 MASTER SWITCH: Set to false to hide all Eid/Ramzan content.
const IS_EID_LIVE = false; 

// 🚀 8 ITEMS EXACTLY FROM YOUR SCREENSHOT WITH DESCRIPTIVE TAGLINES & TITLES
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

// 🚀 GLOBAL MEMORY CACHE
let cachedProducts: any[] = [];
let cachedBrandSettings: Map<string, number> = new Map();
let cachedReviews: any[] = [];
let hasVisitedHomepage = false; 

const TrainProductCard = ({ product }: { product: any }) => (
    <div className="flex-none snap-center w-[75vw] sm:w-[45vw] md:w-[320px] lg:w-[30vw] max-w-[360px] h-full rounded-[1.5rem] shadow-[0_15px_35px_rgba(58,42,24,0.15)] bg-white/30 backdrop-blur-sm border border-[#3A2A18]/5 hover:-translate-y-2 transition-transform duration-500">
        <ProductCard product={product} priority={false} />
    </div>
);

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [allStoreProducts, setAllStoreProducts] = useState<any[]>(cachedProducts);
  const [brandSettingsMap, setBrandSettingsMap] = useState<Map<string, number>>(cachedBrandSettings);
  const [allReviews, setAllReviews] = useState<any[]>(cachedReviews); 
  
  const [isLoading, setIsLoading] = useState(cachedProducts.length === 0);
  
  const [renderBrands, setRenderBrands] = useState(hasVisitedHomepage);
  const [showReviews, setShowReviews] = useState(hasVisitedHomepage);


  // 🚀 Carousel Logic (Runs for all 8 items)
  useEffect(() => {
    const idleTimer = setTimeout(() => {
      const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % carouselItems.length), 3500);
      return () => clearInterval(timer);
    }, 500); 
    return () => clearTimeout(idleTimer);
  }, []);

  // 🚀 Position Fix: Show ONLY current image (no overlapping side items)
  const getPosition = (index: number) => {
    const diff = (index - currentIndex + carouselItems.length) % carouselItems.length;
    if (diff === 0) return { x: "0%", scale: 1, zIndex: 50, opacity: 1 };
    return { x: "0%", scale: 0.8, zIndex: 0, opacity: 0 };
  };

  useEffect(() => {
    if (hasVisitedHomepage) {
        setRenderBrands(true);
        setShowReviews(true);
        return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) setRenderBrands(true); 
      if (window.scrollY > 300) setShowReviews(true); 
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const t1 = setTimeout(() => setRenderBrands(true), 1500);
    const t2 = setTimeout(() => setShowReviews(true), 2500);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const fetchInTwoStages = async () => {
      if (cachedProducts.length === 0) setIsLoading(true);

      try {
          const { data: fastData } = await supabase
            .from('products')
            .select('*')
            .order('priority', { ascending: false })
            .limit(20);

          if (fastData) {
              setAllStoreProducts(fastData); 
              cachedProducts = fastData; 
          }
          
          setIsLoading(false); 

          const [brandsResponse, productsResponse] = await Promise.all([
              supabase.from('brand_settings').select('*'),
              supabase.from('products').select('*').order('priority', { ascending: false })
          ]);

          if (brandsResponse.data) {
              const bMap = new Map(brandsResponse.data.map(b => [b.brand_name.toUpperCase(), b.sort_order]));
              setBrandSettingsMap(bMap);
              cachedBrandSettings = bMap; 
          }

          if (productsResponse.data) {
              setAllStoreProducts(productsResponse.data); 
              cachedProducts = productsResponse.data; 

              let extractedReviews: any[] = [];
              productsResponse.data.forEach(p => {
                  if (p.manual_reviews && p.manual_reviews.length > 0) {
                      const shortName = p.name?.includes('|') ? p.name.split('|')[0].trim() : p.name;
                      extractedReviews.push(...p.manual_reviews.map((r: any) => ({ 
                          ...r, productName: shortName, productImage: p.main_image 
                      })));
                  }
              });
              const shuffledReviews = extractedReviews.sort(() => 0.5 - Math.random()).slice(0, 15);
              setAllReviews(shuffledReviews);
              cachedReviews = shuffledReviews; 
          }
          
          hasVisitedHomepage = true; 
      } catch (error) {
          console.error("Store loading error:", error);
          setIsLoading(false); 
      }
    };

    fetchInTwoStages();
  }, []);

  // 🚀 GET MIXED TRENDING ITEMS FOR "THE VAULT"
  const trendingVaultProducts = useMemo(() => {
      if (allStoreProducts.length === 0) return [];
      // Grab top 8 pinned items regardless of category to mix them up
      return allStoreProducts.filter(p => p.is_pinned === true).slice(0, 8);
  }, [allStoreProducts]);


  return (
    <main className="min-h-screen text-aura-brown bg-[#FDFBF7] relative w-full max-w-[100vw] overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 35s linear infinite; 
        }
        .animate-scroll:hover { animation-play-state: paused; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .bg-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
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

      {/* 🚀 HERO SECTION WITH LUXURY CSS BACKGROUND */}
      <section className="relative w-full h-auto flex flex-col items-center justify-start pt-[80px] md:pt-[100px] pb-4 overflow-hidden bg-luxury-gradient">
          
          <div className="absolute inset-0 z-0 bg-noise pointer-events-none mix-blend-multiply opacity-50"></div>
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

          <div className="relative z-20 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full h-auto px-6 max-w-7xl mx-auto min-h-[400px] md:min-h-[500px] mt-4">

            {/* LEFT SIDE (ITEMS ONLY, NO CIRCLE) */}
            <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex justify-center items-center pointer-events-none flex-shrink-0">
                <AnimatePresence initial={false}>
                    {carouselItems.map((item, index) => {
                        const pos = getPosition(index);
                        if (pos.opacity === 0) return null; 
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute flex justify-center items-center"
                            >
                                <div className="relative w-[220px] h-[220px] md:w-[400px] md:h-[400px]">
                                    <Image 
                                        src={item.src} 
                                        alt={`AURA-X Premium ${item.highlight}`} 
                                        fill 
                                        className={`object-contain transition-all duration-500 drop-shadow-[0_20px_30px_rgba(30,27,24,0.35)]`} 
                                        priority={index === 0} 
                                        sizes="(max-width: 768px) 300px, 500px"
                                        unoptimized={true}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* RIGHT SIDE (DYNAMIC TEXT ALIGNED START) */}
            <div className="relative flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center max-w-md md:max-w-xl h-auto md:h-full pb-4 md:pb-0">
               <AnimatePresence mode="wait">
                   <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex flex-col items-center md:items-start"
                   >
                      <p className="text-[10px] md:text-xs font-bold text-[#8B7355] tracking-[0.4em] uppercase mb-1 drop-shadow-sm">
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

          </div>
          
      </section>

      {/* ---------------- MULTI-CATEGORY DEPARTMENT STORE SECTIONS ---------------- */}

      <div className="relative z-10 flex flex-col min-h-screen w-full bg-gradient-to-b from-[#FDFBF7] via-[#F2EFE9] to-[#EBE4D8]">
          <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

          <div className="max-w-[1400px] mx-auto pb-24 flex-1 w-full relative z-30 px-4 md:px-8 mt-16">
              
              {/* 🚀 1. THE CATEGORY HUB (Visual Grid) */}
              <div className="mb-20">
                  <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
                      <p className="text-aura-brown/60 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1 md:mb-2 flex items-center justify-center gap-2">
                          <Sparkles size={14} className="text-aura-gold" /> Explore The Collections <Sparkles size={14} className="text-aura-gold" />
                      </p>
                      <h2 className="text-3xl md:text-5xl font-serif text-aura-brown leading-tight">Curated Masterpieces</h2>
                  </div>

                  {/* Visual Category Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                      {[
                        { title: "Timepieces", img: "/cat-watch.jpg", link: "/category/watches" },
                        { title: "Fragrances", img: "/cat-perfume.jpg", link: "/category/fragrances" },
                        { title: "Leather Essentials", img: "/cat-wallet.jpg", link: "/category/accessories" },
                        { title: "Smart Tech", img: "/cat-tech.jpg", link: "/category/smart-tech" }
                      ].map((cat, i) => (
                         <Link href={cat.link} key={i} className="group relative w-full aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl bg-[#EBE4D8] border border-[#D4AF37]/20 shadow-md">
                             <Image src={cat.img} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100 mix-blend-multiply" />
                             {/* Gradient Overlay for Text Readability */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                             <div className="absolute bottom-4 left-4 right-4 text-center">
                                <h3 className="text-white font-serif text-lg md:text-2xl tracking-wider">{cat.title}</h3>
                                <div className="mt-2 w-8 h-[2px] bg-[#D4AF37] mx-auto group-hover:w-full transition-all duration-500"></div>
                             </div>
                         </Link>
                      ))}
                  </div>
              </div>

              {/* 🚀 2. THE VAULT / MIXED TRENDING ITEMS */}
              {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 opacity-50">
                      <div className="w-12 h-12 border-4 border-aura-brown border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-serif text-aura-brown text-xl animate-pulse">Accessing Vault...</p>
                  </div>
              ) : (
                  <div className="mb-20">
                      {trendingVaultProducts.length > 0 && (
                          <div className="w-full">
                              <div className="flex justify-between items-end mb-3 md:mb-6">
                                  <div>
                                      <p className="text-aura-brown text-[10px] font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                                          <Star size={12} fill="#D4AF37" className="text-aura-gold"/> Highly Coveted
                                      </p>
                                      <h2 className="text-2xl md:text-5xl font-serif text-aura-brown leading-none">The Luxury Vault</h2>
                                  </div>
                                  <Link href="/all-products" className="hidden md:flex items-center gap-2 text-sm font-bold text-[#8B7355] hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
                                     View All <ArrowRight size={16}/>
                                  </Link>
                              </div>
                              
                              <div className="relative w-full">
                                  <div className="flex overflow-x-auto gap-6 md:gap-8 pb-10 pt-4 scrollbar-hide snap-x snap-mandatory px-2 md:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                                      {trendingVaultProducts.map((product: any) => (
                                          <TrainProductCard key={product.id} product={product} />
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* 🚀 3. THE GIFTING / COMBOS BANNER */}
              <div className="w-full rounded-[2rem] bg-[#1E1B18] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between border border-[#D4AF37]/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A97E]/10 blur-[100px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex flex-col text-center md:text-left z-10 max-w-lg mb-8 md:mb-0">
                     <p className="text-[#D4AF37] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                        <Gift size={14}/> Special Pairings
                     </p>
                     <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-4">The Perfect Gift Combos</h2>
                     <p className="text-gray-400 text-sm md:text-base">Carefully curated combinations of our finest watches, wallets, and fragrances. Perfect for gifting or treating yourself.</p>
                  </div>

                  <Link href="/category/combos" className="relative z-10 px-8 py-4 bg-white hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#8B7355] hover:text-white text-[#1E1B18] font-bold text-xs md:text-sm tracking-widest uppercase transition-all duration-300 rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.2)] flex items-center gap-3 group/btn">
                      Explore Combos <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                  </Link>
              </div>

          </div>

          {/* Reviews Section */}
          {showReviews && allReviews.length > 0 && (
              <div className="w-full py-16 md:py-24 relative z-10 bg-gradient-to-b from-[#1A1612] to-[#0A0908] text-white border-t border-aura-gold/20 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] mt-12 animate-fade-in-up">
                 <div className="text-center mb-10 px-4">
                     <p className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 flex justify-center items-center gap-2">
                        <Quote size={14} className="text-aura-gold/50" /> Word on the Street <Quote size={14} className="text-aura-gold/50" />
                     </p>
                     <h2 className="text-3xl md:text-5xl font-serif text-white drop-shadow-lg">Client Testimonials</h2>
                 </div>
                 
                 <div className="relative w-full overflow-hidden flex py-4">
                    <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#1A1612] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#1A1612] to-transparent z-10 pointer-events-none"></div>

                    <div className="animate-scroll gap-4 md:gap-6 px-4">
                        {(() => {
                            let repeated = [...allReviews];
                            if (repeated.length > 0) {
                                while (repeated.length < 10) {
                                    repeated = [...repeated, ...allReviews];
                                }
                            }
                            const finalScrollingReviews = [...repeated, ...repeated]; 

                            return finalScrollingReviews.map((review, i) => (
                                <div key={i} className="w-[260px] md:w-[350px] p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-3 flex-shrink-0 hover:bg-white/10 transition-colors shadow-lg">
                                   <div className="flex justify-between items-start mb-1">
                                      <div className="flex items-center gap-3">
                                          {review.productImage && (
                                              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20 flex-shrink-0 relative">
                                                  <Image src={review.productImage} alt="product" fill className="object-cover" unoptimized={true} loading="lazy" />
                                              </div>
                                          )}
                                          <div>
                                              <p className="font-bold text-sm text-white">{review.user}</p>
                                              <p className="text-[9px] text-aura-gold/80 uppercase tracking-widest line-clamp-1">{review.productName}</p>
                                          </div>
                                      </div>
                                      <div className="flex text-aura-gold mt-1">
                                          {[...Array(5)].map((_, starIdx) => <Star key={starIdx} size={10} fill={starIdx < (review.rating || 5) ? "currentColor" : "none"} />)}
                                      </div>
                                   </div>
                                   <p className="text-xs md:text-sm text-gray-300 italic line-clamp-4 leading-relaxed">"{review.comment}"</p>
                                </div>
                            ));
                        })()}
                    </div>
                 </div>
              </div>
          )}
      </div>
    </main>
  );
}