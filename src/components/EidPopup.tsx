"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import Link from "next/link";

export default function EidPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // FIX: Check if the user has already seen the popup in this session
    const hasSeen = sessionStorage.getItem("seen_eid_popup"); 

    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // FIX: Save to sessionStorage when closed so it doesn't show again
    sessionStorage.setItem("seen_eid_popup", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* POPUP CARD */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative w-full max-w-lg bg-[#0F0F0F] border border-aura-gold/40 rounded-3xl overflow-hidden shadow-2xl text-center"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-20"><X size={24} /></button>

            <div className="p-10 relative z-10">
              
              {/* Badge */}
              <span className="inline-block bg-aura-gold/20 text-aura-gold text-[10px] font-bold px-3 py-1 rounded-full border border-aura-gold/20 mb-6 tracking-widest uppercase animate-pulse">
                Ramzan 10th Reveal
              </span>

              {/* SLOGAN */}
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
                <span className="text-aura-gold block text-sm md:text-base mb-3 font-sans tracking-[0.3em] uppercase">
                  Unveiling Soon
                </span>
                A New Era of <br /> Luxury
              </h2>
              
              {/* Divider */}
              <div className="flex justify-center items-center gap-4 my-6 opacity-80">
                 <div className="h-[1px] w-12 bg-white/30"></div>
                 <span className="text-2xl">✨</span>
                 <div className="h-[1px] w-12 bg-white/30"></div>
              </div>

              <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                A collection so rare, it's currently locked. 
                <br/>Witness the future of AURA-X before the world does.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link href="/eid-collection" onClick={handleClose} className="w-full bg-gradient-to-r from-aura-gold to-[#B8860B] text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  <Lock size={18} /> SNEAK PEEK (LOCKED)
                </Link>
                <button onClick={handleClose} className="text-xs text-gray-600 hover:text-gray-400 underline decoration-gray-800 underline-offset-4">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}