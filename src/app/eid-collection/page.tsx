"use client";

import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; 
import { Lock, Bell, Check, Moon, Filter, Flame } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Image from "next/image";

const Lantern = ({ className, delay = "0s" }: { className?: string, delay?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} drop-shadow-xl`} style={{ animationDelay: delay }}>
    <line x1="50" y1="0" x2="50" y2="20" stroke="#8B7355" strokeWidth="2" />
    <circle cx="50" cy="20" r="3" fill="none" stroke="#8B7355" strokeWidth="2" />
    <path d="M35 30 L65 30 L70 60 L50 80 L30 60 Z" fill="#D4AF37" opacity="0.3" stroke="#8B7355" strokeWidth="2" />
    <circle cx="50" cy="50" r="6" fill="#FFF" className="animate-pulse" />
    <path d="M35 30 Q50 90 65 30" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.8" />
  </svg>
);

export default function EidCollectionPage() {
  const [targetDate, setTargetDate] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false); 
  const [eidProducts, setEidProducts] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState("All");

  useEffect(() => {
    const fetchDate = async () => {
      const { data } = await supabase
        .from('admin_settings')
        .select('eid_reveal_date')
        .single();
      
      if (data?.eid_reveal_date) {
        setTargetDate(data.eid_reveal_date);
      }
    };
    fetchDate();
  }, []);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsLive(false);
      } else {
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]); 

  useEffect(() => {
    const fetchEidItems = async () => {
        const { data } = await supabase.from('products').select('*').eq('is_eid_exclusive', true).order('priority', { ascending: false });
        if (data && data.length > 0) {
            setEidProducts(data);
        }
    };
    fetchEidItems();
  }, []);

  const brands = useMemo(() => {
      const brandCounts: Record<string, number> = {};
      const originalNames: Record<string, string> = {}; 

      eidProducts.forEach(p => {
          const rawBrand = (p.brand || "AURA-X").trim();
          const upperBrand = rawBrand.toUpperCase();

          if (!brandCounts[upperBrand]) {
              brandCounts[upperBrand] = 0;
              originalNames[upperBrand] = rawBrand; 
          }
          brandCounts[upperBrand]++;
      });

      const sortedBrands = Object.keys(brandCounts)
          .sort((a, b) => brandCounts[b] - brandCounts[a])
          .map(upper => originalNames[upper]);

      return ["All", ...sortedBrands];
  }, [eidProducts]);

  const displayProducts = useMemo(() => {
      let filtered = eidProducts;
      
      if (selectedBrand !== "All") {
          filtered = filtered.filter(p => (p.brand || "AURA-X").trim().toUpperCase() === selectedBrand.toUpperCase());
      }
      
      return filtered.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return (b.priority || 0) - (a.priority || 0);
      });
  }, [eidProducts, selectedBrand]);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    setIsLoading(true);
    const { error } = await supabase.from('launch_notifications').insert([{ email }]);
    setIsLoading(false);
    if (error) toast.error("Something went wrong. Try again.");
    else { setIsNotified(true); toast.success("You are on the list! We will notify you."); }
  };

  return (
    <main className={`min-h-screen transition-colors duration-1000 relative overflow-hidden ${isLive ? 'bg-[#FDFBF7] text-aura-brown' : 'bg-[#0F0F0F] text-white'} pb-32`}>
      <Navbar /> 
      
      {/* 🚀 FIXED: MASSIVE PADDING TO CLEAR THE NAVBAR AND SHOW BANNER */}
      {isLive && (
        <div className="pt-[100px] md:pt-[125px] w-full relative z-40">
            <div className="bg-[#750000] text-white py-2 md:py-2.5 px-2 text-center text-[10px] md:text-sm font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-1.5">
                <Flame size={14} className="animate-pulse text-yellow-400" /> 
                EIDI READY: 30% OFF + FREE DELIVERY NATIONWIDE 🇵🇰
            </div>
        </div>
      )}

      {isLive && (
        <div className="absolute inset-0 pointer-events-none z-0 mt-[110px]">
            <Moon className="absolute top-0 -right-20 w-[400px] h-[400px] text-[#D4AF37] opacity-10 rotate-[15deg]" />
            <div className="absolute top-5 left-4 md:left-20 animate-in slide-in-from-top duration-[2000ms]">
               <div className="h-8 md:h-24 w-[1.5px] bg-[#D4AF37] mx-auto opacity-30"></div>
               <Lantern className="w-10 h-10 md:w-20 md:h-20 -mt-2" />
            </div>
            <div className="absolute top-5 right-4 md:right-20 animate-in slide-in-from-top duration-[2200ms]">
               <div className="h-12 md:h-32 w-[1.5px] bg-[#D4AF37] mx-auto opacity-30"></div>
               <Lantern className="w-8 h-8 md:w-16 md:h-16 -mt-2" />
            </div>
        </div>
      )}

      {/* 🚀 COMPACTED TEXT SECTION - REMOVED FLUFF TO PULL WATCHES UP */}
      <div className={`${isLive ? 'pt-4 pb-2' : 'pt-40 pb-20'} text-center px-2 relative z-10`}>
         
         {!isLive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-aura-gold/10 blur-[150px] rounded-full -z-10"></div>}
         
         <div className="flex justify-center mb-1">
            <span className={`inline-block border px-4 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase ${isLive ? 'border-aura-brown/20 text-aura-brown bg-white/60 backdrop-blur-sm shadow-sm' : 'border-aura-gold/30 text-aura-gold bg-black/50 backdrop-blur-md animate-pulse'}`}>
                {isLive ? "✨ Collection Unlocked ✨" : "Ramzan 10th"}
            </span>
         </div>
         
         <h1 className={`text-4xl md:text-6xl font-serif leading-none transition-all duration-1000 ${isLive ? 'text-[#3E3025] drop-shadow-sm' : 'text-white mb-6'}`}>
            The <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#8B7355] italic">Unseen</span>
         </h1>

         {!isLive && (
             <>
               <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-lg mb-10 mt-4 px-4">
                  Our most anticipated collection of the year. Strictly locked until the moon rises.
               </p>
               <div className="flex justify-center gap-3 md:gap-8 mb-10">
                  {[ 
                    { label: "Days", val: timeLeft.days }, 
                    { label: "Hours", val: timeLeft.hours }, 
                    { label: "Mins", val: timeLeft.minutes }, 
                    { label: "Secs", val: timeLeft.seconds } 
                  ].map((item, i) => (
                      <div key={i} className="text-center">
                          <div className="w-14 h-14 md:w-24 md:h-24 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center text-xl md:text-4xl font-bold font-mono text-aura-gold shadow-2xl">
                              {String(item.val).padStart(2, '0')}
                          </div>
                          <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 mt-2">{item.label}</p>
                      </div>
                  ))}
               </div>
               <div className="w-full flex justify-center">
                   <div className="max-w-md w-full px-4">
                      {!isNotified ? (
                          <form onSubmit={handleNotify} className="flex flex-col gap-3">
                              <input type="email" placeholder="Enter your email address" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-aura-gold transition-colors text-center" value={email} onChange={(e) => setEmail(e.target.value)} required />
                              <button type="submit" disabled={isLoading} className="w-full bg-white text-black px-8 py-3.5 rounded-full font-bold text-xs tracking-widest hover:bg-aura-gold hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                                  {isLoading ? "SAVING..." : <><Bell size={16} /> NOTIFY ME WHEN LIVE</>}
                              </button>
                          </form>
                      ) : (
                          <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-8 py-4 rounded-xl flex items-center justify-center gap-3">
                              <Check size={20} /> <span className="font-bold tracking-wide text-xs">YOU'RE ON THE LIST!</span>
                          </div>
                      )}
                   </div>
               </div>
             </>
         )}
      </div>

      {/* 🚀 COMPACTED GRID SPACING */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 relative z-10 pt-2">
         {isLive ? (
             <div className="animate-in fade-in duration-1000">
                 
                 <div className="flex flex-row justify-between items-center gap-2 mb-3 border-b border-aura-brown/10 pb-2 px-2">
                    <div className="flex gap-1.5 overflow-x-auto w-full pb-1 scrollbar-hide items-center">
                        <Filter size={14} className="text-gray-400 flex-shrink-0" />
                        {brands.map(b => (
                            <button 
                                key={b} 
                                onClick={() => setSelectedBrand(b)} 
                                className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${selectedBrand === b ? 'bg-aura-brown text-white' : 'bg-white text-aura-brown border border-gray-200'}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* 🚀 SMALLER GAP ON MOBILE TO FIT MORE WATCHES ON SCREEN */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-1">
                    {displayProducts.length > 0 ? displayProducts.map((product) => (
                        <div key={product.id} className="bg-white/50 rounded-2xl p-1 border border-black/5 shadow-sm">
                            <ProductCard product={product} />
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300 mt-4">
                            <p className="text-gray-400 font-serif text-xl mb-2">No watches found.</p>
                            <p className="text-gray-400 text-xs">Try selecting a different brand.</p>
                        </div>
                    )}
                 </div>
             </div>
         ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2">
                {(eidProducts.length > 0 ? eidProducts : Array.from({ length: 8 })).map((item: any, i) => (
                    <div key={i} className="relative aspect-[3/4] bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden group">
                        {item?.main_image ? (
                            <Image src={item.main_image} alt="" fill className="object-cover blur-xl opacity-30 scale-110" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/20 group-hover:backdrop-blur-lg transition-all">
                            <div className="bg-black/50 p-3 md:p-4 rounded-full border border-white/10 mb-2 md:mb-3 shadow-2xl">
                                <Lock className="text-white/70 w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-white/50">Revealing Soon</p>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>
    </main>
  );
}