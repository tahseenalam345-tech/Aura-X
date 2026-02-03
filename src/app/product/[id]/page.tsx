"use client";

import { products } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowLeft, ShoppingBag, Star, Truck, ShieldCheck, 
  Minus, Plus, ChevronDown, Share2, Heart
} from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const product = products.find((p) => p.id === Number(params.id));
  
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  
  if (!product) return <div className="text-center py-20 text-white">Product not found</div>;

  const currentImage = selectedImage || product.image;

  return (
    <main className="min-h-screen transition-colors duration-500 bg-gradient-light dark:bg-gradient-dark text-gray-800 dark:text-white relative overflow-hidden">
      
      {/* 1. BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-aura-gold/20 dark:bg-aura-cyan/20 rounded-full blur-[120px] -z-0"></div>

      {/* 2. PROFESSIONAL FIXED HEADER */}
      <Navbar />

      {/* Main Content Container */}
      {/* Added 'pt-24' to ensure content starts below the fixed navbar */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4 pt-24">
        
        {/* Back Button */}
        <Link href="/">
          <button className="flex items-center gap-2 text-aura-slate dark:text-aura-cyan hover:underline mb-8 font-medium transition-transform hover:-translate-x-1">
            <ArrowLeft size={20} /> Back to Collection
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* ================= LEFT: GALLERY ================= */}
          <div className="space-y-6">
            {/* Main Image with Animation */}
            <motion.div 
              layoutId={`image-container-${product.id}`}
              className="relative h-[450px] md:h-[600px] w-full bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-full w-full"
                >
                  <Image 
                    src={currentImage} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                    unoptimized={true}
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Floating Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 {product.discount && (
                  <span className="bg-red-500 text-white px-4 py-1 text-sm font-bold rounded-full shadow-lg backdrop-blur-md">
                    {product.discount}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-4 justify-center">
              {product.thumbnails?.map((thumb, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(thumb)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:-translate-y-1
                    ${currentImage === thumb 
                      ? "border-aura-gold dark:border-aura-cyan shadow-lg scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <Image src={thumb} alt="thumbnail" fill className="object-cover" unoptimized={true} />
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT: DETAILS CARD ================= */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-white/20 shadow-xl"
          >
            {/* Header Section inside Card */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-bold text-aura-gold dark:text-aura-cyan uppercase tracking-widest mb-2">
                  {product.category} Collection
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-aura-slate dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>
              
              {/* Wishlist / Share Icons */}
              <div className="flex gap-2">
                <button className="p-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-aura-gold hover:text-white dark:hover:bg-aura-cyan dark:hover:text-black transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-3 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-aura-gold hover:text-white dark:hover:bg-aura-cyan dark:hover:text-black transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Price & Rating */}
            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm line-through">Rs {product.originalPrice?.toLocaleString()}</span>
                <span className="text-4xl font-bold text-aura-slate dark:text-white">
                  Rs {product.price.toLocaleString()}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2 bg-yellow-400/10 px-3 py-1 rounded-lg">
                <Star fill="#EAB308" className="text-yellow-500" size={18} />
                <span className="font-bold">{product.rating}</span>
                <span className="text-sm opacity-60">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              <div>
                <span className="block text-sm font-bold mb-3 opacity-80">Select Strap Color</span>
                <div className="flex gap-3">
                  {['bg-gray-900', 'bg-yellow-700', 'bg-gray-400'].map((color, i) => (
                    <button key={i} className={`w-10 h-10 rounded-full ${color} border-2 border-white/20 hover:scale-110 shadow-md transition-transform`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="flex gap-4 mb-10">
              <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full px-2 border border-gray-200 dark:border-white/10">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-aura-cyan transition"><Minus size={18}/></button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-aura-cyan transition"><Plus size={18}/></button>
              </div>
              
              <button className="flex-1 bg-aura-slate hover:bg-aura-gold dark:bg-aura-cyan dark:hover:bg-white dark:text-aura-navy text-white font-bold py-4 rounded-full shadow-lg shadow-aura-slate/20 dark:shadow-aura-cyan/20 hover:shadow-xl transition-all flex justify-center items-center gap-2 transform hover:-translate-y-1">
                <ShoppingBag size={20} />
                Add to Cart
              </button>
            </div>

            {/* Info Tabs */}
            <div className="space-y-2">
              {/* Description */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setActiveTab(activeTab === "desc" ? "" : "desc")} className="flex justify-between items-center w-full p-4 bg-gray-50 dark:bg-white/5 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  Description
                  <ChevronDown className={`transition-transform duration-300 ${activeTab === "desc" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeTab === "desc" && (
                    <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                      <p className="p-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {product.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Specs */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setActiveTab(activeTab === "specs" ? "" : "specs")} className="flex justify-between items-center w-full p-4 bg-gray-50 dark:bg-white/5 font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  Technical Specifications
                  <ChevronDown className={`transition-transform duration-300 ${activeTab === "specs" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeTab === "specs" && (
                    <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                      <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                         {product.specs ? Object.entries(product.specs).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-gray-400 text-xs uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-medium text-aura-slate dark:text-white">{val}</span>
                            </div>
                         )) : <p>No specs.</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 flex justify-center gap-6 text-xs text-gray-500 uppercase tracking-wider font-bold">
               <span className="flex items-center gap-2"><Truck size={16}/> Free Delivery</span>
               <span className="flex items-center gap-2"><ShieldCheck size={16}/> 1 Year Warranty</span>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}