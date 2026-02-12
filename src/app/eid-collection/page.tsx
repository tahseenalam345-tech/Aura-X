"use client";

import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; 
import { Lock, Bell, Check, ShoppingBag, Moon, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Image from "next/image";

// --- CUSTOM LANTERN SVG ---
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
  // NEW: State to hold the dynamic date from Admin Panel
  const [targetDate, setTargetDate] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false); 
  const [eidProducts, setEidProducts] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. FETCH TARGET DATE FROM DB ---
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

  // --- 2. COUNTDOWN LOGIC (DEPENDS ON DB DATE) ---
  useEffect(() => {
    // Wait until we have the date from the database
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
        // Stop timer and Unlock Page
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTime();

    // Update every second
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]); // Run this effect whenever targetDate updates

  // --- 3. FETCH PRODUCTS ---
  useEffect(() => {
    const fetchEidItems = async () => {
        const { data } = await supabase.from('products').select('*').eq('is_eid_exclusive', true);
        if (data && data.length > 0) {
            setEidProducts(data);
        }
    };
    fetchEidItems();
  }, []);

  // --- 4. NOTIFY BUTTON ---
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
    <main className={`min-h-screen transition-colors duration-1000 relative overflow-hidden ${isLive ? 'bg-[#EBE7DE] text-aura-brown' : 'bg-[#0F0F0F] text-white'} pb-32`}>
      <Navbar /> 
      
      {/* === RAMZAN THEME (Visible ONLY when Live) === */}
      {isLive && (
        <div className="absolute inset-0 pointer-events-none z-0">
            <Moon className="absolute top-10 -right-20 w-[500px] h-[500px] text-[#D4AF37] opacity-20 rotate-[15deg]" />
            <div className="absolute top-0 left-4 md:left-20 animate-in slide-in-from-top duration-[2000ms]">
               <div className="h-24 w-[1.5px] bg-[#8B7355] mx-auto opacity-60"></div>
               <Lantern className="w-20 h-20 -mt-2" />
            </div>
            <div className="absolute top-0 left-28 md:left-48 animate-in slide-in-from-top duration-[2500ms]">
               <div className="h-48 w-[1.5px] bg-[#8B7355] mx-auto opacity-60"></div>
               <Lantern className="w-14 h-14 -mt-2" />
            </div>
            <div className="absolute top-0 right-4 md:right-20 animate-in slide-in-from-top duration-[2200ms]">
               <div className="h-32 w-[1.5px] bg-[#8B7355] mx-auto opacity-60"></div>
               <Lantern className="w-16 h-16 -mt-2" />
            </div>
            <Star className="absolute top-40 left-1/4 w-6 h-6 text-[#D4AF37] fill-[#D4AF37] opacity-40 animate-pulse" />
            <Star className="absolute top-20 right-1/3 w-8 h-8 text-[#D4AF37] fill-[#D4AF37] opacity-30 animate-pulse delay-700" />
            <Star className="absolute bottom-1/3 left-10 w-4 h-4 text-[#D4AF37] fill-[#D4AF37] opacity-50 animate-pulse delay-1000" />
        </div>
      )}

      {/* HEADER CONTENT */}
      <div className="pt-40 pb-20 text-center px-6 relative z-10">
         
         {/* Locked Background Glow */}
         {!isLive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-aura-gold/10 blur-[150px] rounded-full -z-10"></div>}
         
         {/* Badge */}
         <div className="flex justify-center mb-6">
            <span className={`inline-block border px-6 py-2 rounded-full text-xs font-bold tracking-[0.3em] uppercase ${isLive ? 'border-aura-brown/40 text-aura-brown bg-white/60 backdrop-blur-sm shadow-sm' : 'border-aura-gold/30 text-aura-gold bg-black/50 backdrop-blur-md animate-pulse'}`}>
                {isLive ? "✨ Collection Unlocked ✨" : "Ramzan 10th"}
            </span>
         </div>
         
         {/* Title */}
         <h1 className={`text-5xl md:text-8xl font-serif mb-6 transition-all duration-1000 ${isLive ? 'text-[#3E3025] drop-shadow-sm scale-105' : 'text-white'}`}>
            The <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#8B7355] italic">Unseen</span>
         </h1>
         
         <p className={`${isLive ? 'text-[#5A4A3A] font-semibold' : 'text-gray-400'} max-w-lg mx-auto text-lg mb-12`}>
            {isLive 
              ? "The wait is over. The moon has risen, and the exclusive Eid Collection is now yours to explore." 
              : "Our most anticipated collection of the year. Strictly locked until the moon rises."}
         </p>

         {/* TIMER (Hidden when Live) */}
         {!isLive && (
             <div className="flex justify-center gap-4 md:gap-8 mb-12">
                {[ 
                  { label: "Days", val: timeLeft.days }, 
                  { label: "Hours", val: timeLeft.hours }, 
                  { label: "Mins", val: timeLeft.minutes }, 
                  { label: "Secs", val: timeLeft.seconds } 
                ].map((item, i) => (
                    <div key={i} className="text-center">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1a1a1a] border border-white/10 rounded-2xl flex items-center justify-center text-2xl md:text-4xl font-bold font-mono text-aura-gold shadow-2xl">
                            {String(item.val).padStart(2, '0')}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">{item.label}</p>
                    </div>
                ))}
             </div>
         )}

         {/* ACTIONS */}
         <div className="w-full flex justify-center">
             {!isLive ? (
                 <div className="max-w-md w-full">
                    {!isNotified ? (
                        <form onSubmit={handleNotify} className="flex flex-col md:flex-row gap-2">
                            <input type="email" placeholder="Enter your email address" className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-aura-gold transition-colors text-center md:text-left" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <button type="submit" disabled={isLoading} className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                                {isLoading ? "SAVING..." : <><Bell size={16} /> NOTIFY ME</>}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-8 py-4 rounded-xl flex items-center justify-center gap-3">
                            <Check size={20} /> <span className="font-bold tracking-wide">YOU'RE ON THE LIST!</span>
                        </div>
                    )}
                 </div>
             ) : (
                 <button 
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} 
                    className="bg-gradient-to-r from-[#5A4A3A] to-[#2a2622] text-white px-12 py-5 rounded-full font-bold text-lg tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(139,115,85,0.4)] animate-in zoom-in duration-500"
                 >
                    <ShoppingBag size={20} className="text-aura-gold" /> SHOP COLLECTION
                 </button>
             )}
         </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
         {/* SCENARIO A: UNLOCKED (Live) */}
         {isLive ? (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 animate-in fade-in duration-1000">
                {eidProducts.length > 0 ? eidProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                )) : (
                    <div className="col-span-full text-center py-20 text-gray-400 font-serif italic">The moon has risen, but the collection is loading...</div>
                )}
             </div>
         ) : (
         /* SCENARIO B: LOCKED (Original Dark Look) */
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(eidProducts.length > 0 ? eidProducts : Array.from({ length: 8 })).map((item: any, i) => (
                    <div key={i} className="relative aspect-[3/4] bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden group">
                        {item?.main_image ? (
                            <Image src={item.main_image} alt="" fill className="object-cover blur-xl opacity-30 scale-110" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/20 group-hover:backdrop-blur-lg transition-all">
                            <div className="bg-black/50 p-4 rounded-full border border-white/10 mb-3 shadow-2xl">
                                <Lock className="text-white/70 w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50">Revealing Soon</p>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>
    </main>
  );
}