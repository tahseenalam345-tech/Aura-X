"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube, ArrowRight, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export function Footer() {
  // --- NEWSLETTER LOGIC ---
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    setLoading(true);

    const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
    
    setLoading(false);
    if (error) {
        if (error.code === '23505') toast.error("You are already subscribed!");
        else toast.error("Something went wrong.");
    } else {
        toast.success("Subscribed successfully!");
        setEmail("");
    }
  };

  return (
    <footer className="bg-[#1E1B18] text-white pt-24 pb-10 border-t-4 border-aura-gold relative overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')]"></div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            
            {/* --- TOP SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
                
                {/* 1. BRAND COLUMN */}
                <div className="lg:col-span-1 space-y-8">
                    {/* LOGO */}
                    <Link href="/" className="block relative w-48 h-24 opacity-90 hover:opacity-100 transition-opacity">
                         <Image 
                            src="/logo.png" 
                            alt="AURA-X" 
                            fill 
                            className="object-contain object-left" 
                        /> 
                    </Link>
                    <p className="text-white/60 text-sm leading-relaxed font-light font-serif max-w-xs">
                        Defining the essence of luxury timepieces. Precision, elegance, and timeless heritage crafted for the modern era.
                    </p>
                    
                    {/* Social Icons */}
                    <div className="flex gap-4">
                        {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                            <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-aura-gold hover:text-aura-brown transition-all duration-300 transform hover:-translate-y-1">
                                <Icon size={18} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 2. LINKS COLUMNS */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-8 pt-4">
                    
                    {/* Col A: COLLECTIONS */}
                    <div>
                        <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Collections</h4>
                        <ul className="space-y-4 text-sm text-white/60 font-light">
                            <li><Link href="/men" className="hover:text-white transition-colors duration-300">Men's Watches</Link></li>
                            <li><Link href="/women" className="hover:text-white transition-colors duration-300">Women's Watches</Link></li>
                            <li><Link href="/couple" className="hover:text-white transition-colors duration-300">Couple Sets</Link></li>
                            <li>
                                <Link href="/eid-collection" className="text-aura-gold font-bold flex items-center gap-2 hover:text-white transition-colors duration-300">
                                    The Eid Edit <span className="animate-pulse">✨</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Col B: CONCIERGE */}
                    <div>
                        <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Concierge</h4>
                        <ul className="space-y-4 text-sm text-white/60 font-light">
                            {/* ADDED SUPPORT CENTER LINK BACK */}
                            <li><Link href="/support" className="hover:text-white transition-colors duration-300">Support Center</Link></li>
                            <li><Link href="/track-order" className="hover:text-white transition-colors duration-300">Track Order</Link></li>
                            <li><Link href="/support/shipping" className="hover:text-white transition-colors duration-300">Shipping Policy</Link></li>
                            <li><Link href="/support/return" className="hover:text-white transition-colors duration-300">Return & Exchange</Link></li>
                            <li><Link href="/support/contact" className="hover:text-white transition-colors duration-300">Contact Support</Link></li>
                        </ul>
                    </div>
                </div>

                {/* 3. NEWSLETTER COLUMN */}
                <div className="lg:col-span-1 pt-4">
                    <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Newsletter</h4>
                    <p className="text-white/60 text-sm mb-6 font-light">
                        Be the first to receive updates on the Eid Collection reveal and exclusive offers.
                    </p>
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-aura-gold transition-colors"
                        />
                        <button 
                            onClick={handleSubscribe} 
                            disabled={loading}
                            className="absolute right-2 top-2 w-10 h-10 bg-aura-gold rounded-full flex items-center justify-center text-aura-brown hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18} />}
                        </button>
                    </div>
                    
                    {/* CONTACT INFO */}
                    <div className="mt-8 space-y-3 text-white/50 text-xs">
                        <a 
                            href="https://wa.me/923369871278" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-3 hover:text-green-400 transition-colors"
                        >
                            <Phone size={14} className="text-aura-gold"/> 
                            <span className="font-mono tracking-wide">0336 9871278</span>
                        </a>

                        <a 
                            href="mailto:tahseenalam345@gmail.com" 
                            className="flex items-center gap-3 hover:text-aura-gold transition-colors"
                        >
                            <Mail size={14} className="text-aura-gold"/> 
                            <span>tahseenalam345@gmail.com</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* --- DIVIDER --- */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

            {/* --- BOTTOM SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Copyright */}
                <div className="text-white/40 text-xs tracking-wider flex gap-6">
                    <span>© 2026 AURA-X</span>
                    <Link href="/admin" className="hover:text-aura-gold transition">Admin Login</Link>
                    <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                </div>
                
                {/* DESIGNED BY AURA DEPT */}
                <Link 
                    href="https://auradept-ang.vercel.app/" 
                    target="_blank" 
                    className="flex items-center gap-4 group bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-aura-gold/30 hover:bg-white/10 transition-all duration-500"
                >
                    <div className="text-right">
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">Designed By</p>
                        <p className="text-xs font-bold text-aura-gold group-hover:text-white transition-colors">AURA DEPT OFFICIAL</p>
                    </div>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/90 shadow-lg">
                        <Image src="/auradept.png" alt="Aura Dept" fill className="object-contain p-1" />
                    </div>
                </Link>

            </div>
        </div>
    </footer>
  );
}