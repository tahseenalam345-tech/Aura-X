"use client";

import { products } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard"; // IMPORTED
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// ... (Keep existing Animation Settings, Carousel Data, and Category Data EXACTLY as they are) ...
// (I will shorten them here for brevity, but you keep your existing code for those parts)

// --- ANIMATION SETTINGS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.2 } }
};

const watchImages = [ "/pic1.png", "/pic2.png", "/pic3.png", "/pic4.png", "/pic5.png", "/pic6.png", "/pic7.png" ];

const menCat = { id: "men", title: "Gents' Heritage", subtitle: "EXPLORE MEN'S", image: "https://images.unsplash.com/photo-1617317376997-8748e6862c01?q=80&w=1200&auto=format&fit=crop", link: "/men" };
const womenCat = { id: "women", title: "Ladies' Precision", subtitle: "EXPLORE WOMEN'S", image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1200&auto=format&fit=crop", link: "/women" };
const coupleCat = { id: "couple", title: "Timeless Bond", subtitle: "FOR COUPLES", image: "https://images.unsplash.com/photo-1623998021450-85c29c644e0d?q=80&w=1200&auto=format&fit=crop", link: "/couple" };

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % watchImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getPosition = (index: number) => {
    const diff = (index - currentIndex + watchImages.length) % watchImages.length;
    if (diff === 0) return { x: 0, scale: 1.4, zIndex: 10, opacity: 1, blur: 0 };
    if (diff === 1) return { x: 200, scale: 0.85, zIndex: 5, opacity: 0.7, blur: 2 };
    if (diff === watchImages.length - 1) return { x: -200, scale: 0.85, zIndex: 5, opacity: 0.7, blur: 2 };
    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0, blur: 10 };
  };

  const CategoryCard = ({ cat, className }: { cat: typeof menCat, className?: string }) => (
    <Link href={cat.link} className={`relative group overflow-hidden rounded-[2rem] shadow-xl cursor-pointer ${className}`}>
        <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
          <Image src={cat.image} alt={cat.title} fill className="object-cover" unoptimized />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="absolute bottom-10 left-10 z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
          <p className="text-aura-gold text-xs font-bold tracking-[0.3em] uppercase mb-2 opacity-90">{cat.subtitle}</p>
          <h3 className="text-3xl font-serif text-white font-medium tracking-wide">{cat.title}</h3>
          <div className="w-12 h-[2px] bg-aura-gold mt-4 transition-all duration-500 group-hover:w-24"></div>
        </div>
    </Link>
  );

  return (
    <main className="min-h-screen text-aura-brown selection:bg-aura-gold selection:text-white overflow-hidden">
      <Navbar />

      {/* HERO SECTION (Keep exactly as your code) */}
      <section className="relative min-h-screen flex items-start pt-44 pb-12 px-6">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(120deg,#fdfbf7_0%,#e6dccf_50%,#fdfbf7_100%)] bg-[length:200%_200%] animate-luxury-flow"></div>
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[600px] h-[600px] bg-aura-gold/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10 text-center lg:text-left order-2 lg:order-1 lg:mt-12">
            <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-4 mb-4">
               <span className="h-[2px] w-12 bg-aura-gold"></span>
               <span className="text-sm font-bold text-aura-gold tracking-[0.3em] uppercase">Horologerie Excellence</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-bold mb-6 text-aura-brown leading-[1.1]">
              DEFINE YOUR <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold via-[#D4AF37] to-aura-gold">LEGACY</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-aura-brown/80 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
              Discover a collection defined by precision, crafted for those who value every second. Elevate your style with AURA-X.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <button className="px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl bg-aura-brown text-white hover:bg-aura-gold hover:text-white">Shop Now</button>
            </motion.div>
          </motion.div>

          <div className="relative h-[600px] w-full order-1 lg:order-2 flex justify-center perspective-1000 -mt-10 lg:-mt-10">
             {watchImages.map((src, index) => {
               const pos = getPosition(index);
               return (
                 <motion.div
                   key={index}
                   animate={{ x: pos.x, scale: pos.scale, zIndex: pos.zIndex, opacity: pos.opacity, filter: `blur(${pos.blur}px)` }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                   className="absolute top-[20%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                 >
                   <div className="relative w-[240px] h-[340px] md:w-[320px] md:h-[480px]">
                     <Image src={src} alt={`Watch ${index + 1}`} fill className="object-contain drop-shadow-2xl" priority={index === 0} unoptimized />
                   </div>
                   <div className="w-[180px] h-[20px] bg-black/20 rounded-[100%] blur-md mt-[-20px]"></div>
                 </motion.div>
               );
             })}
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION (Keep exactly as your code) */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white via-[#fffdf5] to-[#f4f1ea]">
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <span className="text-aura-gold text-xs font-bold tracking-[0.3em] uppercase block mb-3">Discover</span>
              <h2 className="text-4xl md:text-5xl font-serif text-aura-brown">Our Collections</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CategoryCard cat={menCat} className="h-[450px]" />
                <CategoryCard cat={womenCat} className="h-[450px]" />
            </div>
            <div className="flex justify-center">
                <CategoryCard cat={coupleCat} className="h-[450px] w-full md:w-2/3" />
            </div>
        </div>
      </section>

      {/* ================= PRODUCT SECTION (UPDATED) ================= */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-white/50 backdrop-blur-sm border-t border-aura-gold/10">
        <div className="max-w-[1920px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-16 border-l-8 border-aura-gold pl-6 italic text-aura-brown"
          >
            Curated Excellence
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {/* USING THE REUSABLE COMPONENT HERE */}
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}