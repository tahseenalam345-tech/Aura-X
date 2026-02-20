"use client";

import { useState, useEffect } from "react";
import { Sparkles, Bot } from "lucide-react";
import StyleQuiz from "./StyleQuiz";

export default function StyleQuizTrigger() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // 1. Show after 2 seconds
    const t1 = setTimeout(() => setShowMessage(true), 2000);
    // 2. Hide after 6 seconds (Stays for 4 seconds)
    const t2 = setTimeout(() => setShowMessage(false), 6000);
    // 3. Show ONE last time after 13 seconds (7 sec gap)
    const t3 = setTimeout(() => setShowMessage(true), 13000);
    // 4. Hide forever after 18 seconds (Stays for 5 seconds)
    const t4 = setTimeout(() => setShowMessage(false), 18000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
        {/* Animated Chat Bubble */}
        <div 
          className={`mb-3 ml-2 bg-white text-aura-brown px-4 py-3 rounded-2xl rounded-bl-none shadow-2xl border border-gray-100 font-bold text-xs tracking-wide transition-all duration-500 origin-bottom-left max-w-[200px] ${showMessage ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-4 pointer-events-none'}`}
        >
          Don't know what to wear? <br/>
          <span className="text-gray-500 font-medium">Don't worry, I am here to help you find your perfect match. ✨</span>
        </div>

        {/* The Main Button - Small circle on mobile, pill on desktop */}
        <button 
          onClick={() => setIsQuizOpen(true)}
          onMouseEnter={() => setShowMessage(true)}
          onMouseLeave={() => setShowMessage(false)}
          className="bg-[#1E1B18] text-aura-gold w-14 h-14 md:w-auto md:px-6 rounded-full shadow-2xl hover:scale-105 hover:bg-aura-brown transition-all flex items-center justify-center gap-3 border border-aura-gold/30 group"
        >
          <div className="relative flex-shrink-0">
            <Bot size={24} className="relative z-10" />
            <Sparkles size={10} className="absolute -top-1 -right-2 animate-pulse text-white" />
          </div>
          {/* Text is completely hidden on mobile so it doesn't take up space */}
          <span className="font-bold text-sm tracking-widest uppercase hidden md:block group-hover:text-white transition-colors whitespace-nowrap">
            Find Your Style
          </span>
        </button>
      </div>

      <StyleQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </>
  );
}