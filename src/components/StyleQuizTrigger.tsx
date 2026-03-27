"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Bot } from "lucide-react";

export default function StyleQuizTrigger() {
  const [showMessage, setShowMessage] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const pathname = usePathname();

  // 🚀 CUSTOM MESSAGES BASED ON ITEM CATEGORY
  const messages = [
    { text: "Confused about your match?", sub: "Let me find your signature style. ✨" },
    { text: "Looking for the perfect scent?", sub: "I can help you pick a fragrance that lasts. 🌬️" },
    { text: "Building a custom combo?", sub: "Get Rs 200 OFF on your perfect pairing! 🎁" },
    { text: "Need a premium gift?", sub: "Let's find something unforgettable. 💎" }
  ];

  useEffect(() => {
    // Rotation logic for messages
    const msgInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);

    // Visibility Timing
    const t1 = setTimeout(() => setShowMessage(true), 8000);
    const t2 = setTimeout(() => setShowMessage(false), 16000);
    const t3 = setTimeout(() => setShowMessage(true), 45000);
    const t4 = setTimeout(() => setShowMessage(false), 55000);

    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); 
      clearInterval(msgInterval);
    };
  }, [messages.length]);

  // 🚀 Logic to adjust position for Mobile "View Combo" bar
  const isCustomCombo = pathname === "/custom-combo";

  return (
    <div 
      className={`fixed z-50 flex flex-col items-start transition-all duration-700 ease-in-out ${
        isCustomCombo 
          ? 'bottom-[110px] left-4 md:bottom-8 md:left-8' 
          : 'bottom-6 left-4 md:bottom-8 md:left-8'
      }`}
    >
      {/* Animated Dynamic Chat Bubble */}
      <div 
        className={`mb-3 ml-2 bg-white text-aura-brown px-5 py-4 rounded-2xl rounded-bl-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-aura-gold/20 font-bold transition-all duration-500 origin-bottom-left max-w-[180px] md:max-w-[240px] ${
          showMessage ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <p className="text-[11px] md:text-xs leading-relaxed uppercase tracking-wider mb-1">
          {messages[messageIndex].text}
        </p>
        <p className="text-[10px] md:text-[11px] text-gray-500 font-medium italic leading-snug">
          {messages[messageIndex].sub}
        </p>
      </div>

      {/* The Main AI Button */}
      <Link 
        href="/style-quiz"
        onMouseEnter={() => setShowMessage(true)}
        onMouseLeave={() => setShowMessage(false)}
        className="bg-[#1E1B18] text-aura-gold w-14 h-14 md:w-auto md:px-7 md:py-4 rounded-full shadow-2xl hover:scale-105 hover:bg-aura-brown transition-all flex items-center justify-center gap-3 border border-aura-gold/30 group"
      >
        <div className="relative flex-shrink-0">
          <Bot size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
          <Sparkles size={12} className="absolute -top-1 -right-2 animate-pulse text-white" />
        </div>
        <span className="font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase hidden md:block group-hover:text-white transition-colors whitespace-nowrap">
          AURA-X Assistant
        </span>
      </Link>
    </div>
  );
}