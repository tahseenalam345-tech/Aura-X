"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { ArrowRight, X, ChevronDown, Filter, User, Users, Heart, ShieldCheck } from "lucide-react"; 

// --- CONFIGURATION ---
const FILTER_TAGS = ["All", "Featured", "Sale", "Limited Edition", "Fire", "New Arrival", "Best Seller"];
const ITEMS_PER_PAGE = 9; 

// --- ANIMATIONS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- STATIC DATA ---
const watchImages = ["/pic1.webp", "/pic2.webp", "/pic3.webp", "/pic4.webp"]; 

const categories = [
  { id: "men", title: "Gents' Heritage", subtitle: "EXPLORE MEN'S", image: "/mens.webp", link: "/men" },
  { id: "women", title: "Ladies' Precision", subtitle: "EXPLORE WOMEN'S", image: "/ladies.webp", link: "/women" },
  { id: "couple", title: "Timeless Bond", subtitle: "FOR COUPLES", image: "/couples.webp", link: "/couple" }
];

const CategoryCard = ({ cat, className }: { cat: any, className?: string }) => (
    <Link href={cat.link} className={`relative group overflow-hidden rounded-3xl shadow-lg h-[280px] md:h-[450px] w-full block ${className}`}>
        <Image 
            src={cat.image} 
            alt={`${cat.title} Collection`} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            sizes="(max-width: 768px) 100vw, 50vw" 
            quality={75} 
            unoptimized={true} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1 text-aura-gold">{cat.subtitle}</p>
          <h3 className="text-2xl md:text-3xl font-serif">{cat.title}</h3>
        </div>
    </Link>
);

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEidLive, setIsEidLive] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // --- FILTER STATE ---
  const [activeTag, setActiveTag] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All"); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const checkTime = async () => {
      const { data } = await supabase.from('admin_settings').select('eid_reveal_date').single();
      if (data?.eid_reveal_date) {
        setIsEidLive(new Date().getTime() >= new Date(data.eid_reveal_date).getTime());
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idleTimer = setTimeout(() => {
      const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % watchImages.length), 4000);
      return () => clearInterval(timer);
    }, 500); 
    return () => clearTimeout(idleTimer);
  }, []);

  // --- FETCH PRODUCTS (Initial & Filter Change) ---
  useEffect(() => {
    fetchProducts(1, true);
  }, [activeTag, activeCategory]);

  const fetchProducts = async (pageNumber: number, reset: boolean = false) => {
      setLoadingMore(true); 

      if (activeCategory === "All" && activeTag === "All") {
          const from = (pageNumber - 1) * 3; 
          const to = from + 2;

          const [men, women, couple] = await Promise.all([
              supabase.from('products').select('*').eq('category', 'men').eq('is_eid_exclusive', false).order('priority', { ascending: false }).range(from, to),
              supabase.from('products').select('*').eq('category', 'women').eq('is_eid_exclusive', false).order('priority', { ascending: false }).range(from, to),
              supabase.from('products').select('*').eq('category', 'couple').eq('is_eid_exclusive', false).order('priority', { ascending: false }).range(from, to)
          ]);

          const mixed: any[] = [];
          for (let i = 0; i < 3; i++) {
              if (men.data?.[i]) mixed.push(men.data[i]);
              if (women.data?.[i]) mixed.push(women.data[i]);
              if (couple.data?.[i]) mixed.push(couple.data[i]);
          }

          if (reset) setProducts(mixed);
          else setProducts(prev => [...prev, ...mixed]);
          
          setHasMore(mixed.length > 0);
      } 
      else {
          const from = (pageNumber - 1) * ITEMS_PER_PAGE;
          const to = from + ITEMS_PER_PAGE - 1;

          let query = supabase.from('products').select('*').eq('is_eid_exclusive', false);

          if (activeCategory !== "All") query = query.eq('category', activeCategory);

          if (activeTag === "Under2000") query = query.lt('price', 2000);
          else if (activeTag !== "All") query = query.contains('tags', [activeTag]);

          query = query.order('priority', { ascending: false }).range(from, to);

          const { data } = await query;

          if (data) {
              if (reset) setProducts(data);
              else setProducts(prev => [...prev, ...data]);
              setHasMore(data.length === ITEMS_PER_PAGE);
          }
      }
      setLoadingMore(false);
  };

  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
  };

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + watchImages.length) % watchImages.length;
    if (diff === 0) return { x: 0, scale: 1.1, zIndex: 50, opacity: 1, blur: 0 };
    if (diff === 1) return { x: "50%", scale: 0.8, zIndex: 30, opacity: 0.6, blur: 2 }; 
    if (diff === watchImages.length - 1) return { x: "-50%", scale: 0.8, zIndex: 30, opacity: 0.6, blur: 2 };
    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0, blur: 10 };
  };

  return (
    <main className="min-h-screen text-aura-brown overflow-x-hidden bg-[#F2F0E9]">
      <Navbar />
      {/* TrustPopup Component Removed from here */}

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-radial from-aura-gold/20 to-transparent opacity-50 -z-10" />
        
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
                   initial={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity, filter: `blur(${pos.blur}px)` }}
                   animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity, filter: `blur(${pos.blur}px)` }}
                   transition={{ duration: 0.8 }}
                   className="absolute"
                 >
                    <div className="relative w-[200px] h-[300px] md:w-[320px] md:h-[480px]">
                      <Image 
                        src={src} 
                        alt="AURA-X Premium Luxury Watch Model" 
                        fill 
                        className="object-contain drop-shadow-2xl"
                        priority={index === currentIndex} 
                        fetchPriority={index === currentIndex ? "high" : "auto"} 
                        sizes="(max-width: 768px) 200px, 320px"
                        quality={85} 
                        unoptimized={true} 
                      />
                    </div>
                 </motion.div>
               );
             })}
             <div className="absolute -z-10 text-gray-200 font-bold text-9xl opacity-20 select-none pointer-events-none">AURA</div>
          </div>
        </div>
      </section>

      {/* --- TRUST STRIP --- */}
      <div className="bg-[#1E1B18] border-y border-aura-gold py-3 text-center relative z-20 shadow-lg">
        <p className="text-xs md:text-sm font-bold text-white flex items-center justify-center gap-2 tracking-wide">
          <ShieldCheck size={16} className="text-aura-gold"/> 
          THE EIDI READY: Free Premium Gift Packaging + Eidi Card with every order.
        </p>
      </div>

      {/* --- Masterpiece Series Section --- */}
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
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-3xl md:text-4xl font-serif">Curated Pieces</h2>
             <button onClick={() => setShowCategoryModal(true)} className="text-aura-gold text-xs font-bold uppercase tracking-widest border-b border-aura-gold pb-1 hover:text-aura-brown transition-colors">View All</button>
          </div>

          {/* 1. TAG FILTERS */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
             {FILTER_TAGS.map(tag => (
                 <button 
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTag === tag ? 'bg-aura-brown text-white border-aura-brown shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold'}`}
                 >
                    {tag === "Fire" ? "🔥 Trending" : tag}
                 </button>
             ))}
          </div>

          {/* 2. CATEGORY SELECTOR BUTTONS */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-2xl mx-auto mb-8">
              <button 
                onClick={() => setActiveCategory(activeCategory === 'men' ? 'All' : 'men')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${activeCategory === 'men' ? 'bg-[#1E1B18] text-aura-gold border-[#1E1B18]' : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold'}`}
              >
                  <User size={20} className="mb-1"/>
                  <span className="text-xs font-bold uppercase tracking-wider">For Him</span>
              </button>
              <button 
                onClick={() => setActiveCategory(activeCategory === 'women' ? 'All' : 'women')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${activeCategory === 'women' ? 'bg-[#1E1B18] text-aura-gold border-[#1E1B18]' : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold'}`}
              >
                  <Heart size={20} className="mb-1"/>
                  <span className="text-xs font-bold uppercase tracking-wider">For Her</span>
              </button>
              <button 
                onClick={() => setActiveCategory(activeCategory === 'couple' ? 'All' : 'couple')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${activeCategory === 'couple' ? 'bg-[#1E1B18] text-aura-gold border-[#1E1B18]' : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold'}`}
              >
                  <Users size={20} className="mb-1"/>
                  <span className="text-xs font-bold uppercase tracking-wider">Couples</span>
              </button>
          </div>

          {/* 3. UNDER 2000 FILTER */}
          <div className="flex justify-center mb-10">
             <button 
                onClick={() => setActiveTag("Under2000")}
                className={`relative px-8 py-3 rounded-full shadow-sm flex items-center gap-3 transition-all transform hover:scale-105 ${
                    activeTag === "Under2000" 
                    ? "bg-aura-brown text-white border border-aura-brown shadow-md" 
                    : "bg-white border border-aura-gold/30 text-aura-brown hover:border-aura-gold hover:shadow-md"
                }`}
             >
                 <div className={`w-2 h-2 rounded-full animate-pulse ${activeTag === "Under2000" ? "bg-aura-gold" : "bg-green-500"}`}></div>
                 <p className="text-sm font-bold tracking-wide">Picks Under <span className={`font-serif text-lg ${activeTag === "Under2000" ? "text-aura-gold" : "text-aura-gold"}`}>Rs 2,000</span></p>
                 {activeTag === "Under2000" && <X size={14} className="ml-1 text-white/50 hover:text-white" onClick={(e) => { e.stopPropagation(); setActiveTag("All"); }} />}
             </button>
          </div>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mb-12">
            {products.length > 0 ? products.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              loadingMore ? [1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>) : <p className="col-span-full text-center text-gray-400 py-10 italic">No items found in this collection.</p>
            )}
          </div>

          {/* LOAD MORE BUTTON */}
          {hasMore && products.length > 0 && (
              <div className="flex justify-center">
                  <button 
                    onClick={loadMore} 
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-aura-brown px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:border-aura-gold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                      {loadingMore ? "Loading..." : "LOAD MORE"} <ChevronDown size={14}/>
                  </button>
              </div>
          )}
        </div>
      </section>

      {/* --- COLLECTION SELECTION MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-300"> 
            <div className="bg-white p-6 md:p-8 rounded-[2rem] w-full max-w-5xl relative shadow-2xl">
                <button onClick={() => setShowCategoryModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors z-50">
                    <X size={20}/>
                </button>
                <div className="text-center mb-8">
                    <p className="text-aura-gold text-xs font-bold tracking-widest uppercase mb-2">Discover Our World</p>
                    <h2 className="text-3xl md:text-4xl font-serif text-aura-brown">Select Collection</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={cat.link} className="group relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                            <Image src={cat.image} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" quality={75} />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white">
                                <h3 className="text-2xl font-serif font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{cat.title}</h3>
                                <span className="text-xs tracking-widest uppercase border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Shop Now</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      )}

    </main>
  );
}