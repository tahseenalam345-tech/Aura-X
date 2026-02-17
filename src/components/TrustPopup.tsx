"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageOpen, X, ShieldCheck, CheckCircle, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TrustPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. PERFORMANCE CHECK: Only run this logic after the window has fully loaded
    const showPopup = () => {
      const hasSeen = sessionStorage.getItem("hasSeenTrustPopup");
      if (!hasSeen) {
        // Wait 2 seconds AFTER full load to ensure user is settled
        setTimeout(() => setIsVisible(true), 2000);
      }
    };

    if (document.readyState === "complete") {
      showPopup();
    } else {
      window.addEventListener("load", showPopup);
      return () => window.removeEventListener("load", showPopup);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenTrustPopup", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
            // ADDED: Click backdrop to close
            onClick={handleClose} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md cursor-pointer"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            // UPDATED: Faster duration (0.25s) so it feels snappy, not lazy
            transition={{ duration: 0.25, ease: "easeOut" }}
            // ADDED: Stop propagation so clicking the card itself doesn't close it
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FDFBF7] w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-aura-gold/40 cursor-default"
          >
            {/* Top Decoration */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1E1B18] via-aura-gold to-[#1E1B18]"></div>

            {/* Close Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleClose(); }} 
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500 z-10 shadow-sm"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="p-7 text-center">
              {/* Icon Animation */}
              <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 relative shadow-md border border-aura-gold/10">
                <div className="absolute inset-0 border border-dashed border-aura-gold rounded-full animate-spin-slow opacity-30"></div>
                <PackageOpen size={38} className="text-aura-brown" strokeWidth={1.5} />
                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1.5 rounded-full border-2 border-[#FDFBF7] shadow-sm">
                    <ShieldCheck size={14} strokeWidth={3} />
                </div>
              </div>

              {/* Text Content */}
              <h2 className="text-2xl font-serif font-black text-aura-brown mb-2 tracking-tight">
                Shop with Confidence
              </h2>
              <p className="text-gray-600 text-sm font-medium mb-6">
                We offer an exclusive <br/>
                <span className="font-extrabold text-aura-gold uppercase tracking-wider bg-[#1E1B18] px-2 py-0.5 rounded text-xs mt-1 inline-block">Open Parcel Policy</span>
              </p>

              {/* Key Points Box */}
              <div className="bg-white rounded-2xl p-5 mb-6 text-left space-y-4 border border-gray-200 shadow-inner">
                
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle className="text-green-700" size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Check First</p>
                        <p className="text-xs font-semibold text-gray-500">Inspect parcel before payment.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Video className="text-blue-700" size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Video Proof</p>
                        <p className="text-xs font-semibold text-gray-500">We send a packing video.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="text-orange-700" size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Pay Later</p>
                        <p className="text-xs font-semibold text-gray-500">Only pay if fully satisfied.</p>
                    </div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handleClose} 
                className="w-full py-4 bg-[#1E1B18] text-white rounded-xl font-bold text-xs tracking-[0.2em] hover:bg-aura-gold hover:text-white transition-all shadow-xl active:scale-95 uppercase flex items-center justify-center gap-2 group mb-4"
              >
                Start Exploring <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>

              {/* Policy Link */}
              <Link 
                href="/support/return" 
                onClick={handleClose}
                className="text-[10px] text-gray-400 border-b border-gray-300 hover:text-aura-brown hover:border-aura-brown transition-all pb-0.5"
              >
                Read our policies
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}