"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight } from "lucide-react"; 

// --- CONFIGURATION: SAME DATE AS EID PAGE ---
const TARGET_DATE = "2026-02-27T18:00:00"; 

// --- ANIMATIONS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- DATA ---
const watchImages = ["/pic1.png", "/pic2.png", "/pic3.png", "/pic4.png"]; 

// LOCAL IMAGES FOR CATEGORIES
const categories = [
  { 
    id: "men", 
    title: "Gents' Heritage", 
    subtitle: "EXPLORE MEN'S", 
    image: "/mens.jpg", 
    link: "/men" 
  },
  { 
    id: "women", 
    title: "Ladies' Precision", 
    subtitle: "EXPLORE WOMEN'S", 
    image: "/ladies.png", 
    link: "/women" 
  },
  { 
    id: "couple", 
    title: "Timeless Bond", 
    subtitle: "FOR COUPLES", 
    image: "/couples.png", 
    link: "/couple" 
  }
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEidLive, setIsEidLive] = useState(false);

  // --- 1. REAL TIME CHECK LOGIC ---
  // This removes the "30 second test" and checks the REAL date
  useEffect(() => {
    const checkTime = () => {
        const now = new Date().getTime();
        const target = new Date(TARGET_DATE).getTime();
        
        if (now >= target) {
            setIsEidLive(true); // Unlock only if date has passed
        } else {
            setIsEidLive(false); // Keep locked otherwise
        }
    };
    
    checkTime(); // Check immediately on load
    const interval = setInterval(checkTime, 1000); // Re-check every second
    return () => clearInterval(interval);
  }, []);

  // Auto-Slide Banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % watchImages.length);
    }, 3000); 
    return () => clearInterval(timer);
  }, []);

  // Fetch Real Products
  useEffect(() => {
    const fetchProducts = async () => {
        // HIDE EID EXCLUSIVE ITEMS HERE
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_eid_exclusive', false) // <--- THIS LINE PROTECTS THE HOMEPAGE
            .limit(8)
            .order('rating', { ascending: false });
        
        if(data) setProducts(data);
    };
    fetchProducts();
  }, []);

  // Banner Animation Math
  const getPosition = (index: number) => {
    const diff = (index - currentIndex + watchImages.length) % watchImages.length;
    if (diff === 0) return { x: 0, scale: 1.1, zIndex: 50, opacity: 1, blur: 0 };
    if (diff === 1) return { x: "50%", scale: 0.8, zIndex: 30, opacity: 0.6, blur: 2 }; 
    if (diff === watchImages.length - 1) return { x: "-50%", scale: 0.8, zIndex: 30, opacity: 0.6, blur: 2 };
    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0, blur: 10 };
  };

  const CategoryCard = ({ cat, className }: { cat: any, className?: string }) => (
    <Link href={cat.link} className={`relative group overflow-hidden rounded-3xl shadow-lg h-[280px] md:h-[450px] w-full block ${className}`}>
        <Image src={cat.image} alt={cat.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1 text-aura-gold">{cat.subtitle}</p>
          <h3 className="text-2xl md:text-3xl font-serif">{cat.title}</h3>
        </div>
    </Link>
  );

  return (
    <main className="min-h-screen text-aura-brown overflow-x-hidden bg-[#F2F0E9]">
      <Navbar />

      {/* --- HERO SECTION (TOP BANNER) --- */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-aura-gold/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left z-20">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
               <p className="text-xs font-bold text-aura-gold tracking-[0.3em] uppercase mb-4">The Art of Timing</p>
               <h1 className="text-5xl sm:text-7xl font-serif font-bold leading-tight mb-6">
                 Legacy in <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-yellow-600 italic">Every Tick</span>
               </h1>
               <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                 Experience the pinnacle of Swiss precision. Designed for those who command their own time.
               </p>
               <Link href="/men" className="bg-aura-brown text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold transition-all shadow-xl">
                 SHOP NOW
               </Link>
            </motion.div>
          </div>
          <div className="relative h-[350px] md:h-[550px] w-full flex justify-center items-center">
             {watchImages.map((src, index) => {
               const pos = getPosition(index);
               if (pos.opacity === 0) return null; 
               return (
                 <motion.div
                   key={index}
                   animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity, filter: `blur(${pos.blur}px)` }}
                   transition={{ duration: 0.8 }}
                   className="absolute"
                 >
                   <div className="relative w-[200px] h-[300px] md:w-[320px] md:h-[480px]">
                      <Image 
                        src={src} 
                        alt="Watch" 
                        fill 
                        className="object-contain drop-shadow-2xl"
                        priority={index === currentIndex}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />
                   </div>
                 </motion.div>
               );
             })}
             <div className="absolute -z-10 text-gray-200 font-bold text-9xl opacity-20">AURA</div>
          </div>
        </div>
      </section>

      {/* --- DYNAMIC EID STRIP (Real Logic Now) --- */}
      <Link href="/eid-collection" className="block bg-[#1E1B18] border-y border-aura-gold/20 py-4 overflow-hidden group relative cursor-pointer z-20">
        <div className="absolute inset-0 bg-aura-gold/5 group-hover:bg-aura-gold/10 transition-colors"></div>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
                <span className="text-2xl animate-pulse">🌙</span>
                <div className="text-left">
                    {/* DYNAMIC TEXT HERE */}
                    <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isEidLive ? 'text-green-400 animate-pulse' : 'text-aura-gold'}`}>
                        {isEidLive ? "● NOW LIVE" : "Coming Soon"}
                    </p>
                    <p className="text-white font-serif text-lg md:text-xl">
                        {isEidLive ? "The Eid Collection is Unlocked & Ready" : "The Eid Collection — Unlocking Ramzan 10th"}
                    </p>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                {isEidLive ? "Enter The Shop" : "View Locked Content"} <ArrowRight size={16} />
            </div>
        </div>
      </Link>

      {/* --- CATEGORIES --- */}
      <section className="py-20 px-4 bg-white rounded-t-[3rem] shadow-inner relative z-10 -mt-2">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-center mb-12">Masterpiece Series</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <CategoryCard cat={categories[0]} />
                <CategoryCard cat={categories[1]} />
            </div>
            <div className="flex justify-center">
                <CategoryCard cat={categories[2]} className="md:max-w-4xl" />
            </div>
        </div>
      </section>

      {/* --- PRODUCTS SECTION --- */}
      <section className="py-20 px-4 bg-[#F9F8F6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
             <h2 className="text-3xl md:text-4xl font-serif">Curated Pieces</h2>
             <Link href="/men" className="text-aura-gold text-xs font-bold uppercase tracking-widest border-b border-aura-gold pb-1">View All</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {products.length > 0 ? products.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              [1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}