"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, ArrowRight, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1E1B18] text-white pt-24 pb-10 border-t-4 border-aura-gold relative overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')]"></div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            
            {/* --- TOP SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
                
                {/* 1. BRAND COLUMN */}
                <div className="lg:col-span-1 space-y-8">
                    {/* LOGO: Large Size & Original Colors (Filters removed) */}
                    <Link href="/" className="block relative w-96 h-40 opacity-90 hover:opacity-100 transition-opacity -ml-4">
                         <Image 
                            src="/logo.png" 
                            alt="AURA-X" 
                            fill 
                            // CHANGED: Removed 'invert brightness-0' so it shows original Gold/Brand colors
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
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8 pt-4">
                    {/* Col A */}
                    <div>
                        <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Collections</h4>
                        <ul className="space-y-4 text-sm text-white/60 font-light">
                            <li><Link href="/men" className="hover:text-white transition-colors duration-300">Men's Watches</Link></li>
                            <li><Link href="/women" className="hover:text-white transition-colors duration-300">Women's Watches</Link></li>
                            <li><Link href="/couple" className="hover:text-white transition-colors duration-300">Couple Sets</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">New Arrivals</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Limited Edition</Link></li>
                        </ul>
                    </div>
                    
                    {/* Col B */}
                    <div>
                        <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Maison</h4>
                        <ul className="space-y-4 text-sm text-white/60 font-light">
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Our Heritage</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Craftsmanship</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Sustainability</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Press Room</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Col C */}
                    <div>
                        <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Concierge</h4>
                        <ul className="space-y-4 text-sm text-white/60 font-light">
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Contact Us</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Track Order</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Shipping & Returns</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Warranty Info</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors duration-300">Book Appointment</Link></li>
                        </ul>
                    </div>
                </div>

                {/* 3. NEWSLETTER COLUMN */}
                <div className="lg:col-span-1 pt-4">
                    <h4 className="text-aura-gold font-bold tracking-[0.2em] uppercase text-xs mb-6">Newsletter</h4>
                    <p className="text-white/60 text-sm mb-6 font-light">
                        Be the first to receive updates on new arrivals, special offers, and exclusive events.
                    </p>
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-aura-gold transition-colors"
                        />
                        <button className="absolute right-2 top-2 w-10 h-10 bg-aura-gold rounded-full flex items-center justify-center text-aura-brown hover:scale-110 transition-transform">
                            <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="mt-8 flex items-center gap-3 text-white/50 text-xs">
                        <Phone size={14} /> <span>+92 326 1688628</span>
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
                    <Link href="/" className="hover:text-white transition">Privacy Policy</Link>
                    <Link href="/" className="hover:text-white transition">Terms of Service</Link>
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