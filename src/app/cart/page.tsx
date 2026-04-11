"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Loader2 } from "lucide-react";

// 🚀 CLOUDFLARE SHIELD ACTIVATED HERE
const optimizeCloudinaryUrl = (url: string) => {
    if (!url) return url;

    // 1. Cloudinary fallback
    if (url.includes('cloudinary.com')) {
        if (url.includes('f_auto') || url.includes('q_auto')) return url; 
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // 2. 🛡️ CLOUDFLARE SHIELD (Updated with NEW Project ID)
    // Ab ye 'kxsthielcdurxinctkxi' ko detect karke replace karega
    if (url.includes('kxsthielcdurxinctkxi.supabase.co')) {
        return url.replace(
            'https://kxsthielcdurxinctkxi.supabase.co', 
            'https://image-proxy-aurax.tahseenalam345.workers.dev'
        );
    }

    return url;
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, shippingCost, finalTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-aura-gold" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-40">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-center mb-12">Your Shopping Bag</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400 shadow-inner">
               <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-serif mb-2 font-bold">Your bag is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't made your choice yet.</p>
            <Link href="/" className="bg-aura-brown text-white px-8 py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-aura-gold hover:shadow-xl transition-all shadow-lg flex items-center gap-2">
               START SHOPPING <ArrowRight size={16}/>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {cart.map((item) => {
                const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
                const itemTotalPrice = (item.price + extras) * item.quantity;

                // 🚀 SMART CHECK: Hide variant line if it's explicitly 'Silver', 'Standard', etc.
                const colorValue = item.color?.trim().toLowerCase() || '';
                const hideVariant = !colorValue || colorValue === 'standard' || colorValue === 'standard variant' || colorValue === 'selected' || colorValue === 'silver';

                return (
                  <div key={`${item.id}-${item.color}`} className="flex gap-4 md:gap-6 bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-aura-gold/30 hover:shadow-md transition-all">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image 
                        src={optimizeCloudinaryUrl(item.image)} // 🚀 SHIELD APPLIED HERE
                        alt={item.name} 
                        fill 
                        sizes="150px"
                        className="object-contain p-2 mix-blend-multiply" 
                        priority={false}
                        unoptimized={true} 
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                           <h3 className="font-serif font-bold text-base md:text-xl text-aura-brown line-clamp-2 leading-tight">{item.name}</h3>
                           <button 
                             onClick={() => removeFromCart(item.id, item.color)} 
                             className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                        
                        {!hideVariant && (
                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1.5 md:mt-2 truncate">
                                Variant: <span className="text-aura-gold">{item.color}</span>
                            </p>
                        )}
                        
                        <div className="flex gap-2 mt-2 flex-wrap">
                           {item.isGift && <span className="text-[9px] md:text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold border border-purple-100">Gift Wrap (+Rs 300)</span>}
                           {item.addBox && <span className="text-[9px] md:text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-bold border border-orange-100">Premium Box (+Rs 200)</span>}
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-8 md:h-10">
                          <button onClick={() => updateQuantity(item.id, item.color, -1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-l-full transition-colors"><Minus size={14} /></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, 1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-r-full transition-colors"><Plus size={14} /></button>
                        </div>
                        
                        <div className="text-right">
                           <p className="text-sm md:text-base font-bold text-aura-brown">
                             Rs {itemTotalPrice.toLocaleString()}
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-aura-gold/20 shadow-xl sticky top-32">
                <h3 className="font-serif text-xl md:text-2xl font-bold mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                    <ShoppingBag className="text-aura-gold" size={24}/> Order Summary
                </h3>
                
                <div className="space-y-4 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal ({cart.length} items)</span>
                    <span className="font-bold text-aura-brown text-base">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Delivery</span>
                    {shippingCost === 0 ? (
                        <span className="text-green-500 font-bold text-xs uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                            FREE
                        </span>
                    ) : (
                        <span className="font-bold text-aura-brown">Rs {shippingCost}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mb-8">
                   <span className="font-bold text-lg text-gray-500 uppercase tracking-widest">Total</span>
                   <span className="font-serif text-3xl font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block w-full bg-gradient-to-r from-aura-brown to-[#2A241D] text-white text-center py-4 rounded-full font-bold text-xs tracking-widest hover:shadow-2xl transition-all flex items-center justify-center gap-2 group shadow-lg uppercase hover:scale-[1.02]">
                   PROCEED TO SECURE CHECKOUT <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold">
                   <ShieldCheck size={14} className="text-aura-gold" />
                   <span>100% Secure Checkout Guaranteed</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}