"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight, ChevronRight, Sparkles, Star, Flame, Quote, Moon } from "lucide-react"; 

// 🚀 THE MASTER EID SWITCH
const IS_EID_LIVE = true; 

const watchImages = ["/pic1.webp", "/pic2.webp", "/pic3.webp", "/pic4.webp"]; 

const TrainProductCard = ({ product }: { product: any }) => (
    <div className="flex-none snap-center w-[75vw] sm:w-[45vw] md:w-[320px] lg:w-[30vw] max-w-[360px] h-full rounded-[1.5rem] shadow-[0_15px_35px_rgba(58,42,24,0.15)] bg-white/30 backdrop-blur-sm border border-[#3A2A18]/5">
        <ProductCard product={product} priority={false} />
    </div>
);

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [activeMasterCategory, setActiveCategory] = useState<"eid" | "men" | "women" | "couple">(IS_EID_LIVE ? "eid" : "men");
  
  const [pinnedProducts, setPinnedProducts] = useState<any[]>([]);
  const [brandGroups, setBrandGroups] = useState<{ brand: string; products: any[]; sortOrder: number }[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [gridCols, setGridCols] = useState<number>(2);

  useEffect(() => {
    const idleTimer = setTimeout(() => {
      const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % watchImages.length), 4000);
      return () => clearInterval(timer);
    }, 500); 
    return () => clearTimeout(idleTimer);
  }, []);

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + watchImages.length) % watchImages.length;
    if (diff === 0) return { x: 0, scale: 1.1, zIndex: 50, opacity: 1 };
    if (diff === 1) return { x: "50%", scale: 0.8, zIndex: 30, opacity: 0.6 }; 
    if (diff === watchImages.length - 1) return { x: "-50%", scale: 0.8, zIndex: 30, opacity: 0.6 };
    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0 };
  };

  useEffect(() => {
    const fetchGlobalReviews = async () => {
       const { data: allProductsData } = await supabase.from('products').select('manual_reviews, name, main_image');
       if (allProductsData) {
           let globalReviews: any[] = [];
           allProductsData.forEach(p => {
               if (p.manual_reviews && p.manual_reviews.length > 0) {
                   const shortName = p.name?.includes('|') ? p.name.split('|')[0].trim() : p.name;
                   const reviewsWithName = p.manual_reviews.map((r: any) => ({ 
                       ...r, 
                       productName: shortName,
                       productImage: p.main_image
                   }));
                   globalReviews.push(...reviewsWithName);
               }
           });
           globalReviews = globalReviews.sort(() => 0.5 - Math.random());
           setAllReviews(globalReviews);
       }
    };
    fetchGlobalReviews();
  }, []);

  useEffect(() => {
    const fetchAndGroupProducts = async () => {
      setIsLoading(true);

      const { data: brandSettingsData } = await supabase.from('brand_settings').select('*');
      const brandSettingsMap = new Map(brandSettingsData?.map(b => [b.brand_name.toUpperCase(), b.sort_order]) || []);

      let query = supabase.from('products').select('*').order('priority', { ascending: false });
      
      // 🚀 FIX: If Eid Tab is active, only show Eid exclusives. 
      // If ANY OTHER tab is active, show ALL products in that category (including Eid ones!)
      if (activeMasterCategory === "eid") {
          query = query.eq('is_eid_exclusive', true);
      } else {
          query = query.eq('category', activeMasterCategory);
      }

      const { data: products } = await query;

      if (!products) {
          setIsLoading(false);
          return;
      }

      if (activeMasterCategory === "eid") {
          const sortedEid = [...products].sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              return (b.priority || 0) - (a.priority || 0);
          });
          
          setPinnedProducts(sortedEid.slice(0, 12)); 
          setBrandGroups([]); 
          setIsLoading(false);
          return;
      }

      const pinned = products.filter(p => p.is_pinned === true).slice(0, 8);
      setPinnedProducts(pinned);

      const unpinned = products.filter(p => p.is_pinned !== true);
      
      const grouped = unpinned.reduce((acc, product) => {
          const rawBrand = (product.brand || "AURA-X").trim();
          const existingKey = Object.keys(acc).find(k => k.toUpperCase() === rawBrand.toUpperCase());
          let safeBrandName: string = existingKey ? existingKey : (rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1));
          
          if (safeBrandName.toUpperCase() === "AURA-X") {
              safeBrandName = "AURA-X";
          }

          if (!acc[safeBrandName]) {
              acc[safeBrandName] = [];
          }
          acc[safeBrandName].push(product);
          return acc;
      }, {} as Record<string, any[]>);

      const consolidatedGroups: Record<string, any[]> = {};
      const auraXKey = Object.keys(grouped).find(k => k.toUpperCase() === "AURA-X") || "AURA-X";
      consolidatedGroups["AURA-X"] = grouped[auraXKey] || [];

      for (const brand in grouped) {
          if (brand.toUpperCase() === "AURA-X") continue;
          if (grouped[brand].length <= 3) {
              consolidatedGroups["AURA-X"] = [...consolidatedGroups["AURA-X"], ...grouped[brand]];
          } else {
              consolidatedGroups[brand] = grouped[brand];
          }
      }

      if (consolidatedGroups["AURA-X"].length === 0) {
          delete consolidatedGroups["AURA-X"];
      }

      const groupedArray = Object.entries(consolidatedGroups).map(([brand, prods]: [string, any]) => {
          const catSpecificKey = `${activeMasterCategory}__${brand}`.toUpperCase();
          const sortOrder = Number(brandSettingsMap.get(catSpecificKey) ?? brandSettingsMap.get(brand.toUpperCase()) ?? 99);
          return { brand, products: (prods as any[]).slice(0, 8), sortOrder: sortOrder };
      });

      groupedArray.sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.brand.localeCompare(b.brand);
      });

      setBrandGroups(groupedArray);
      setIsLoading(false);
    };

    fetchAndGroupProducts();
  }, [activeMasterCategory]);

  return (
    <main className="min-h-screen text-aura-brown bg-gradient-to-b from-[#F9F6F0] via-[#EBE2CD] to-[#D5C6AA] relative w-full max-w-[100vw] overflow-x-hidden">
      
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
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}} />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-evenly opacity-[0.06] select-none mix-blend-color-burn">
          <div className="whitespace-nowrap animate-[pulse_5s_ease-in-out_infinite] text-[120px] md:text-[200px] font-serif font-black tracking-[0.2em] -ml-20 text-[#3A2A18]">
              AURA-X • ROLEX • RADO • PATEK PHILIPPE • AUDEMARS PIGUET
          </div>
          <div className="whitespace-nowrap animate-[pulse_6s_ease-in-out_infinite] text-[140px] md:text-[220px] font-serif italic -ml-60 text-[#3A2A18]">
              ARMANI • CARTIER • OMEGA • TISSOT • SEIKO
          </div>
          <div className="whitespace-nowrap animate-[pulse_7s_ease-in-out_infinite] text-[100px] md:text-[180px] font-serif font-black tracking-[0.3em] ml-[-10%] text-[#3A2A18]">
              RICHARD MILLE • BREITLING • TAG HEUER • AURA-X
          </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
          <Navbar />

          <section className="relative min-h-[90vh] flex items-center pt-28 pb-12 px-6 overflow-hidden bg-[#F2F0E9] shadow-xl w-full">
            <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-radial from-aura-gold/20 to-transparent opacity-50 -z-10" />
            
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left z-20">
                <div className="animate-fade-in-up">
                   <p className="text-xs font-bold text-aura-gold tracking-[0.3em] uppercase mb-4">The Art of Timing</p>
                   <h1 className="text-5xl sm:text-7xl font-serif font-bold leading-tight mb-6">
                     Legacy in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-yellow-600 italic">Every Tick</span>
                   </h1>
                   <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                     Experience the pinnacle of Swiss precision. Designed for those who command their own time.
                   </p>
                   <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="bg-aura-brown text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold transition-all shadow-xl">
                     SHOP THE VAULT
                   </button>
                </div>
              </div>
              
              <div className="relative h-[350px] md:h-[550px] w-full flex justify-center items-center">
                 {watchImages.map((src, index) => {
                  const pos = getPosition(index);
                  if (pos.opacity === 0) return null; 
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity }}
                      animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity }}
                      transition={{ duration: 0.8 }}
                      className="absolute"
                    >
                      <div className="relative w-[200px] h-[300px] md:w-[320px] md:h-[480px]">
                        <Image 
                            src={src} 
                            alt="AURA-X Premium Watch" 
                            fill 
                            className="object-contain drop-shadow-2xl" 
                            priority={index === currentIndex} 
                            sizes="(max-width: 768px) 250px, 400px"
                        />
                      </div>
                    </motion.div>
                  );
                })}
                <div className="absolute -z-10 text-gray-200 font-bold text-9xl opacity-20 select-none pointer-events-none">AURA</div>
              </div>
            </div>
          </section>

          {IS_EID_LIVE && (
              <div className="bg-[#0A0908] border-y border-aura-gold/40 py-2.5 px-2 relative z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-aura-gold/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
                <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 md:gap-3 text-[9px] md:text-sm font-bold tracking-widest uppercase text-white leading-tight">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded-[3px] shadow-[0_0_12px_rgba(220,38,38,0.8)] flex items-center gap-1 animate-pulse">
                    <Flame size={12} className="hidden md:block"/> BREAKING
                  </span>
                  <span className="text-aura-gold drop-shadow-md">10th Ramzan Drop:</span> 
                  <span>Upto 30% Off + Free Delivery  on all Eid Exclusive Pieces.</span>
                  <span className="text-aura-gold hidden sm:inline">Limited Stock 🌙</span>
                </div>
              </div>
          )}

          <div className="sticky top-16 md:top-20 z-40 bg-[#FDFBF7]/90 backdrop-blur-md py-3 md:py-5 shadow-sm border-b border-aura-gold/10 w-full overflow-x-auto scrollbar-hide">
              <div className="max-w-7xl mx-auto px-4 flex justify-start md:justify-center gap-2 md:gap-6 min-w-max">
                  {[
                      ...(IS_EID_LIVE ? [{ id: "eid", label: "Eid Edit 🌙", special: true }] : []),
                      { id: "men", label: "Gents Collection" },
                      { id: "women", label: "Ladies Precision" },
                      { id: "couple", label: "Timeless Bonds" }
                  ].map((cat) => (
                      <button 
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`text-[10px] md:text-sm font-bold tracking-widest uppercase transition-all px-5 py-2.5 md:px-8 md:py-3 rounded-full border whitespace-nowrap ${
                              activeMasterCategory === cat.id && cat.special
                              ? 'bg-gradient-to-r from-aura-gold to-yellow-600 text-black border-transparent shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-105 animate-[pulse_2s_ease-in-out_infinite]' 
                              : activeMasterCategory === cat.id 
                              ? 'bg-aura-brown text-white border-aura-brown shadow-[0_4px_15px_rgba(74,59,50,0.3)] scale-105'
                              : cat.special 
                              ? 'bg-[#1E1B18] text-aura-gold border-aura-gold hover:bg-aura-gold hover:text-black'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold hover:text-aura-brown'
                          }`}
                      >
                          {cat.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="max-w-[1400px] mx-auto pb-24 flex-1 min-h-[50vh] w-full">
              
              <div className="text-center mt-8 md:mt-14 mb-4 md:mb-8 px-4">
                  {activeMasterCategory === 'eid' ? (
                      <div className="animate-fade-in-up">
                          <p className="text-[#750000] text-[9px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1.5 flex items-center justify-center gap-1.5">
                              <Moon size={12} className="text-aura-gold" /> The Ramzan Drop <Moon size={12} className="text-aura-gold" />
                          </p>
                          <h2 className="text-3xl md:text-5xl font-serif text-aura-brown leading-tight mb-2">Eid Royal</h2>
                          <p className="text-[10px] md:text-sm text-gray-500 max-w-[250px] md:max-w-md mx-auto leading-snug">Limited stock. Free delivery applied at checkout.</p>
                      </div>
                  ) : (
                      <div className="animate-fade-in-up">
                          <p className="text-aura-brown/60 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1 md:mb-2 flex items-center justify-center gap-2">
                              <Sparkles size={14} className="text-aura-gold" /> The Vault <Sparkles size={14} className="text-aura-gold" />
                          </p>
                          <h2 className="text-3xl md:text-5xl font-serif text-aura-brown leading-tight">Curated Masterpieces</h2>
                      </div>
                  )}
              </div>

              {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 opacity-50">
                      <div className="w-12 h-12 border-4 border-aura-brown border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="font-serif text-aura-brown text-xl animate-pulse">Accessing Vault...</p>
                  </div>
              ) : (
                  <div className="flex flex-col gap-6 md:gap-12 w-full">
                      
                      {activeMasterCategory === 'eid' && pinnedProducts.length > 0 && (
                          <div className="w-full bg-[#1E1B18] rounded-[2rem] p-4 md:p-8 shadow-[0_20px_50px_rgba(30,27,24,0.4)] border border-[#C8A97E]/20 mt-4 relative overflow-hidden mx-4 md:mx-auto max-w-[calc(100%-2rem)] md:max-w-full">
                              
                              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A97E]/5 blur-[100px] rounded-full pointer-events-none"></div>
                              
                              <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 border-b border-[#C8A97E]/10 pb-4 relative z-10">
                                  <div className="text-center md:text-left">
                                      <p className="text-aura-gold text-[10px] font-bold tracking-[0.3em] uppercase flex items-center justify-center md:justify-start gap-2 mb-1">
                                          <Star size={12} fill="#D4AF37"/> Festive Highlights
                                      </p>
                                      <h2 className="text-2xl md:text-4xl font-serif text-white leading-none">The Vault Selection</h2>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                      <button onClick={() => setGridCols(1)} className={`p-2 rounded-lg transition-all ${gridCols === 1 ? 'bg-[#C8A97E] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                                      </button>
                                      <button onClick={() => setGridCols(2)} className={`p-2 rounded-lg transition-all ${gridCols === 2 ? 'bg-[#C8A97E] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                                      </button>
                                      <button onClick={() => setGridCols(3)} className={`hidden md:block p-2 rounded-lg transition-all ${gridCols === 3 ? 'bg-[#C8A97E] text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="5" height="18" rx="1"/><rect x="9.5" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>
                                      </button>
                                  </div>
                              </div>

                              <div className={`grid gap-3 md:gap-6 relative z-10 ${gridCols === 1 ? 'grid-cols-1 max-w-sm mx-auto' : gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                  {pinnedProducts.map(product => (
                                      <div key={product.id} className="bg-white/5 rounded-2xl p-1 border border-white/10 shadow-lg">
                                          <ProductCard product={product} />
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="mt-8 flex justify-center relative z-10">
                                  <Link href="/eid-collection" className="bg-[#C8A97E] text-[#1E1B18] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors shadow-[0_5px_15px_rgba(200,169,126,0.3)]">
                                      View Full Collection <ArrowRight size={16} />
                                  </Link>
                              </div>
                          </div>
                      )}

                      {activeMasterCategory !== 'eid' && pinnedProducts.length > 0 && (
                          <div className="w-full">
                              <div className="flex justify-between items-end mb-3 md:mb-6 px-4 md:px-8">
                                  <div>
                                      <p className="text-aura-brown text-[10px] font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
                                          <Star size={12} fill="#D4AF37" className="text-aura-gold"/> Highly Coveted
                                      </p>
                                      <h2 className="text-2xl md:text-5xl font-serif text-aura-brown leading-none">Aura Exclusives</h2>
                                  </div>
                              </div>
                              
                              <div className="relative w-full">
                                  <div className="flex overflow-x-auto gap-6 md:gap-8 pb-10 pt-4 scrollbar-hide snap-x snap-mandatory px-[12.5vw] md:px-8" style={{ WebkitOverflowScrolling: 'touch' }}>
                                      {pinnedProducts.map(product => (
                                          <TrainProductCard key={product.id} product={product} />
                                      ))}
                                  </div>
                                  
                                  <div className="md:hidden absolute right-0 top-[40%] -translate-y-1/2 z-20 pointer-events-none bg-gradient-to-l from-[#D5C6AA] via-[#D5C6AA]/80 to-transparent w-16 h-24 flex items-center justify-end pr-1">
                                      <div className="bg-aura-gold text-white rounded-full p-1 shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
                                          <ChevronRight size={20} />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeMasterCategory !== 'eid' && brandGroups.map((group, index) => (
                          <div key={group.brand} className="bg-gradient-to-br from-[#2A241D] via-[#14120F] to-[#0A0908] rounded-[1.5rem] py-6 md:py-8 shadow-[inset_0_2px_4px_rgba(212,175,55,0.2),0_15px_30px_rgba(0,0,0,0.3)] border border-[#4A3B32]/50 relative ring-1 ring-black/50 w-full md:mx-8 md:w-auto">
                              
                              <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] pointer-events-none z-0">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[70px] md:text-[160px] font-serif italic font-black text-white/[0.04] whitespace-nowrap animate-pulse tracking-[0.1em]">
                                      {group.brand}
                                  </div>
                              </div>

                              <div className="relative z-10 flex flex-row justify-between items-end mb-6 px-5 md:px-8">
                                  <div>
                                      <p className="text-aura-gold/70 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                                          Brand Showcase
                                      </p>
                                      <h2 className="text-2xl md:text-4xl font-serif italic tracking-wider text-white leading-tight drop-shadow-md animate-[pulse_4s_ease-in-out_infinite]">{group.brand}</h2>
                                  </div>
                                  
                                  <Link 
                                    href={`/${activeMasterCategory}?brand=${encodeURIComponent(group.brand)}`} 
                                    className="relative z-20 bg-aura-gold/10 border border-aura-gold/30 text-aura-gold px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:bg-aura-gold hover:text-black transition-colors"
                                  >
                                      View All <ChevronRight size={14} />
                                  </Link>
                              </div>

                              <div className="relative z-10 w-full">
                                  <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 pt-4 scrollbar-hide snap-x snap-mandatory px-[12.5vw] md:px-8" style={{ WebkitOverflowScrolling: 'touch' }}>
                                      {group.products.map(product => (
                                          <TrainProductCard key={product.id} product={product} />
                                      ))}
                                      
                                      <div className="flex-none snap-center w-[75vw] sm:w-[45vw] md:w-[320px] lg:w-[30vw] max-w-[360px] h-full flex items-center justify-center pb-2">
                                          <Link href={`/${activeMasterCategory}?brand=${encodeURIComponent(group.brand)}`} className="w-full h-full min-h-[200px] md:min-h-[280px] border border-dashed border-aura-gold/40 rounded-[1.2rem] flex flex-col items-center justify-center text-white hover:bg-aura-gold/10 transition-colors group bg-black/20 backdrop-blur-sm shadow-inner">
                                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-aura-gold to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] mb-3 md:mb-4 group-hover:scale-110 transition-transform text-black">
                                                  <ArrowRight size={18} className="md:w-5 md:h-5" />
                                              </div>
                                              <p className="font-serif font-bold text-base md:text-xl mb-1 text-white drop-shadow-md">Discover</p>
                                              <p className="text-[8px] md:text-[10px] text-aura-gold/80 uppercase tracking-widest">{group.brand}</p>
                                          </Link>
                                      </div>
                                  </div>

                                  <div className="md:hidden absolute right-0 top-[40%] -translate-y-1/2 z-20 pointer-events-none bg-gradient-to-l from-[#0A0908] via-[#0A0908]/90 to-transparent w-16 h-24 flex items-center justify-end pr-1 rounded-l-2xl">
                                      <div className="bg-aura-gold/20 border border-aura-gold/50 text-aura-gold rounded-full p-1 shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
                                          <ChevronRight size={20} />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}

                      {brandGroups.length === 0 && pinnedProducts.length === 0 && (
                          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 shadow-sm mx-4">
                              <p className="font-serif text-2xl text-gray-400 mb-2">
                                  {activeMasterCategory === 'eid' ? "The Eid Vault is securely sealed." : "The Vault is empty."}
                              </p>
                              <p className="text-gray-400 text-sm">
                                  {activeMasterCategory === 'eid' ? "Releasing highly exclusive pieces shortly." : "We are currently restocking this collection."}
                              </p>
                          </div>
                      )}
                  </div>
              )}
          </div>

          {!isLoading && allReviews.length > 0 && (
              <div className="w-full py-16 md:py-24 relative z-10 bg-gradient-to-b from-[#1A1612] to-[#0A0908] text-white border-t border-aura-gold/20 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] mt-12">
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
                                                  <Image src={review.productImage} alt="product" fill className="object-cover" unoptimized={true} />
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