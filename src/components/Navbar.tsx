"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Search, Menu, X, ChevronRight, User, LogIn, LayoutDashboard, Truck, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; 
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth(); 
  const { totalItems } = useCart(); 

  const navLinks = [
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Couple', href: '/couple' }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#F2F0E9]/80 backdrop-blur-md border-b border-aura-brown/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-28 md:h-32 flex items-center justify-between relative">
          
          {/* LEFT */}
          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 hover:bg-aura-gold/10 rounded-full transition transform active:scale-95">
                <Menu className="w-7 h-7 text-aura-brown" />
             </button>
             <div className="h-6 w-[1px] bg-aura-brown/20"></div>
             {navLinks.map((item) => (
               <Link key={item.name} href={item.href} className="text-sm font-bold tracking-[0.2em] uppercase text-aura-brown hover:text-aura-gold transition-colors relative group">
                  {item.name}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-aura-gold transition-all duration-300 group-hover:w-full"></span>
               </Link>
             ))}
          </div>

          {/* LOGO */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Link href="/" className="relative block h-28 w-72 md:h-40 md:w-96 hover:scale-105 transition-transform duration-500">
              <Image src="/logo.png" alt="AURA-X Brand" fill className="object-contain invert" priority unoptimized />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 md:gap-6 ml-auto md:ml-0 z-10">
              <button className="hidden md:block p-2 rounded-full hover:bg-aura-gold/10 transition-colors">
                <Search className="w-6 h-6 text-aura-brown" />
              </button>
              
              {/* DESKTOP ACCOUNT BUTTON */}
              {user ? (
                 <button onClick={logout} className="hidden md:block p-2 rounded-full hover:bg-aura-gold/10 transition-colors text-aura-brown relative group">
                    <LogOut className="w-6 h-6" />
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-aura-brown text-white text-[10px] uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
                 </button>
              ) : (
                 <Link href="/login" className="hidden md:block p-2 rounded-full hover:bg-aura-gold/10 transition-colors text-aura-brown relative group">
                    <User className="w-6 h-6" />
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-aura-brown text-white text-[10px] uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity">Login</span>
                 </Link>
              )}

              {/* CART ICON */}
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-aura-gold/10 transition-colors block">
                <ShoppingBag className="w-6 h-6 text-aura-brown" />
                {totalItems > 0 && (
                   <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                     {totalItems}
                   </span>
                )}
              </Link>

              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-aura-gold/10">
                <Menu className="w-6 h-6 text-aura-brown" />
              </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 left-0 h-full w-[85%] md:w-[450px] bg-aura-cream z-[70] shadow-2xl flex flex-col border-r border-aura-gold/20">
              
              <div className="p-8 flex justify-between items-center border-b border-aura-gold/10">
                <span className="text-xl font-serif font-bold text-aura-brown tracking-widest">MENU</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-aura-gold/10 rounded-full transition"><X className="w-6 h-6 text-aura-brown" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 py-4">
                
                {/* 1. STANDARD LINKS */}
                <div className="space-y-6 mb-12">
                   {navLinks.map((item) => (
                     <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)} className="group flex items-center justify-between text-3xl font-serif text-aura-brown hover:text-aura-gold transition-colors">
                        {item.name}
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-aura-gold" />
                     </Link>
                   ))}
                </div>

                <div className="h-[1px] w-full bg-aura-gold/20 mb-8"></div>

                {/* 2. DYNAMIC LINKS */}
                <div className="space-y-4">
                  
                  {/* TRACK ORDER (ALWAYS VISIBLE FOR GUESTS TOO) */}
                  <Link href="/track-order" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 text-lg font-bold text-aura-brown hover:pl-2 transition-all">
                      <Truck size={18} /> Track Order
                  </Link>

                  <div className="h-[1px] w-full bg-gray-100 my-2 opacity-50"></div>
                  
                  {/* NOT LOGGED IN */}
                  {!user && (
                      <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 text-lg font-medium text-aura-brown/70 hover:text-aura-brown hover:pl-2 transition-all">
                          <LogIn size={18} /> Login / Sign Up
                      </Link>
                  )}

                  {/* ADMIN */}
                  {user && isAdmin && (
                      <>
                        <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 text-lg font-bold text-aura-gold bg-aura-brown/5 p-3 rounded-lg hover:bg-aura-brown/10 transition-all">
                            <LayoutDashboard size={18} /> Admin Dashboard
                        </Link>
                         <p className="text-xs text-gray-400 pl-3">Logged in as Admin</p>
                      </>
                  )}

                  {/* LOGGED IN USER INFO */}
                  {user && !isAdmin && (
                      <p className="text-xs text-gray-400 pl-3">Logged in as {user}</p>
                  )}

                  {/* LOGOUT */}
                  {user && (
                    <button onClick={() => { logout(); setIsSidebarOpen(false); }} className="flex items-center gap-4 text-lg font-medium text-red-400 hover:text-red-500 hover:pl-2 transition-all mt-4">
                        <LogOut size={18} /> Logout
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}