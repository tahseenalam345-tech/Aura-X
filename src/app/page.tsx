"use client";

import { products } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";

// --- ANIMATIONS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  visible: { transition: { staggerChildren: 0.15 } }
};

const watchImages = ["/pic1.png", "/pic2.png", "/pic3.png", "/pic4.png", "/pic5.png", "/pic6.png", "/pic7.png"];

const categories = [
  { id: "men", title: "Gents' Heritage", subtitle: "EXPLORE MEN'S", image: "https://images.unsplash.com/photo-1617317376997-8748e6862c01?q=80&w=800&auto=format&fit=crop", link: "/men" },
  { id: "women", title: "Ladies' Precision", subtitle: "EXPLORE WOMEN'S", image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop", link: "/women" },
  { id: "couple", title: "Timeless Bond", subtitle: "FOR COUPLES", image: "https://images.unsplash.com/photo-1623998021450-85c29c644e0d?q=80&w=800&auto=format&fit=crop", link: "/couple" }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- SLOW AUTO-SLIDE TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % watchImages.length);
    }, 2500); 
    return () => clearInterval(timer);
  }, []);

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + watchImages.length) % watchImages.length;
    if (diff === 0) return { x: 0, scale: 1.15, zIndex: 50, opacity: 1, blur: 0 };
    if (diff === 1) return { x: "65%", scale: 0.8, zIndex: 30, opacity: 0.5, blur: 4 }; 
    if (diff === watchImages.length - 1) return { x: "-65%", scale: 0.8, zIndex: 30, opacity: 0.5, blur: 4 };
    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0, blur: 10 };
  };

  const CategoryCard = ({ cat, className }: { cat: any, className?: string }) => (
    <Link href={cat.link} className={`relative group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-xl h-[300px] md:h-[480px] w-full block transition-all ${className}`}>
        <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
          <Image src={cat.image} alt={cat.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 z-10">
          <p className="text-aura-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-2">{cat.subtitle}</p>
          <h3 className="text-2xl md:text-4xl font-serif text-white">{cat.title}</h3>
          <div className="w-10 h-[2px] bg-aura-gold mt-4 transition-all duration-700 group-hover:w-20"></div>
        </div>
    </Link>
  );

  return (
    <main className="min-h-screen text-aura-brown overflow-x-hidden bg-[#F2F0E9]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[95vh] md:min-h-screen flex items-center pt-24 pb-12 md:py-0 px-6 md:px-12">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-aura-gold/5 blur-[150px] -z-10" />
        
        <div className="max-w-[1500px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* TEXT CONTENT */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left order-2 lg:order-1">
            <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-3 mb-6">
               <span className="h-[1px] w-12 bg-aura-gold"></span>
               <span className="text-xs font-bold text-aura-gold tracking-[0.3em] uppercase">The Art of Timing</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-[1.05] tracking-tight">
              A  LEGACY IN <br /> 
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-[#D4AF37]">EVERY TICK</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-base md:text-xl text-aura-brown/60 mb-10 max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
              Experience the pinnacle of Swiss precision. Designed for those who command their own time.
            </motion.p>
            
            <motion.div variants={fadeInUp}>
              <Link href="/men" className="inline-block px-12 py-5 rounded-full font-bold text-sm tracking-widest bg-aura-brown text-white hover:bg-aura-gold transition-all shadow-2xl active:scale-95">
                DISCOVER MORE
              </Link>
            </motion.div>
          </motion.div>

          {/* --- SLOW TRANSITION CAROUSEL --- */}
          <div className="relative h-[400px] md:h-[600px] w-full flex justify-center items-center order-1 lg:order-2">
             {watchImages.map((src, index) => {
               const pos = getPosition(index);
               if (pos.opacity === 0) return null; 

               return (
                 <motion.div
                   key={index}
                   initial={false}
                   animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity, filter: `blur(${pos.blur}px)` }}
                   transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                   className="absolute flex flex-col items-center"
                 >
                   <div className="relative w-[220px] h-[320px] md:w-[350px] md:h-[500px]">
                     <Image 
                        src={src} alt="AURA-X Luxury" fill 
                        className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]" 
                        priority={index === currentIndex}
                        sizes="(max-width: 768px) 220px, 400px"
                     />
                   </div>
                   <div className="w-[60%] h-[15px] bg-black/5 rounded-[100%] blur-xl mt-6"></div>
                 </motion.div>
               );
             })}
          </div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className="py-24 px-6 md:px-12 bg-white rounded-t-[3rem] md:rounded-t-[5rem] -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
              <span className="text-aura-gold text-xs font-bold tracking-[0.4em] uppercase block mb-4">The Selection</span>
              <h2 className="text-4xl md:text-6xl font-serif text-aura-brown">Masterpiece Series</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <CategoryCard cat={categories[0]} />
                <CategoryCard cat={categories[1]} />
            </div>
            <div className="flex justify-center">
                <CategoryCard cat={categories[2]} className="md:max-w-4xl" />
            </div>
        </div>
      </section>

      {/* --- PRODUCTS SECTION (FIXED FOR MOBILE 2 COLS) --- */}
      <section className="py-16 md:py-32 px-3 md:px-12 bg-[#F9F8F6]"> {/* Reduced padding on mobile */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 gap-8">
             <div className="text-center md:text-left">
               <h2 className="text-4xl md:text-5xl font-serif text-aura-brown mb-2">Curated Pieces</h2>
               <div className="h-1 w-20 bg-aura-gold mx-auto md:mx-0"></div>
             </div>
             <Link href="/men" className="text-aura-gold font-bold text-xs uppercase tracking-[0.2em] border-b-2 border-aura-gold/30 pb-2 hover:border-aura-gold transition-all">
                View All Timepieces &rarr;
             </Link>
          </div>
          
          {/* FIX: grid-cols-2 on mobile, gap-3 (small gap) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
            {products.map((product) => (
              <motion.div 
                key={product.id} variants={fadeInUp} initial="hidden"
                whileInView="visible" viewport={{ once: true, margin: "-50px" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}