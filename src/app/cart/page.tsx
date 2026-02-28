"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Loader2, Flame, Moon } from "lucide-react";

export default function CartPage() {
  // 🚀 FIX: Reading the smart variables (shippingCost, finalTotal) straight from Context
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

      {/* --- TRUST STRIP --- */}
      <div className="pt-24 md:pt-32"> 
          <div className="bg-[#1E1B18] border-y border-aura-gold py-3 text-center shadow-lg">
            <p className="text-xs md:text-sm font-bold text-white flex items-center justify-center gap-2 tracking-wide">
              <ShieldCheck size={16} className="text-aura-gold"/> 
              OFFICIAL POLICY: Open Parcel Before Payment Allowed
            </p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-center mb-12">Your Shopping Bag</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
               <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-serif mb-2">Your bag is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't made your choice yet.</p>
            <Link href="/men" className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold transition-colors shadow-lg">
               START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* 🚀 NEW: DYNAMIC EID SHIPPING BANNER */}
              <div className={`border rounded-2xl p-4 md:p-5 mb-4 shadow-sm flex items-center gap-4 transition-colors ${shippingCost === 0 ? 'bg-[#FAF8F1] border-aura-gold' : 'bg-white border-gray-200'}`}>
                  <div className={`p-3 rounded-full flex-shrink-0 ${shippingCost === 0 ? 'bg-aura-gold text-white shadow-md animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                    {shippingCost === 0 ? <Moon size={24} /> : <Flame size={24} />}
                  </div>
                  <div>
                    {shippingCost === 0 ? (
                      <>
                        <p className="font-bold text-aura-brown md:text-lg">✨ Ramzan Offer Activated!</p>
                        <p className="text-xs md:text-sm text-gray-500">Your entire order qualifies for Free Premium Delivery.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-aura-brown md:text-lg">Unlock Free Delivery</p>
                        <p className="text-xs md:text-sm text-gray-500">Add any <span className="text-aura-gold font-bold">Eid Exclusive</span> item to your bag to instantly remove shipping fees.</p>
                      </>
                    )}
                  </div>
              </div>

              {cart.map((item) => {
                const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
                const itemTotalPrice = (item.price + extras) * item.quantity;

                return (
                  <div key={`${item.id}-${item.color}`} className="flex gap-4 md:gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-aura-gold/30 transition-all">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="150px"
                        className="object-contain p-2 mix-blend-multiply" 
                        priority={false}
                        unoptimized={true} 
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                           <h3 className="font-serif font-bold text-lg md:text-xl text-aura-brown line-clamp-1">{item.name}</h3>
                           <button 
                             onClick={() => removeFromCart(item.id, item.color)} 
                             className="text-gray-300 hover:text-red-500 transition-colors p-1"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                        {item.color && <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Color: {item.color}</p>}
                        
                        <div className="flex gap-2 mt-2 flex-wrap">
                           {item.isGift && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold border border-purple-100">Gift Wrap (+Rs 300)</span>}
                           {item.addBox && <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded font-bold border border-orange-100">Premium Box (+Rs 200)</span>}
                           {/* 🚀 EID PILL FOR THE CART ITEM */}
                           {item.isEidExclusive && <span className="text-[10px] bg-aura-gold/10 text-aura-gold px-2 py-1 rounded font-bold border border-aura-gold/20 flex items-center gap-1"><Moon size={10}/> Eid Exclusive</span>}
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-8 md:h-10">
                          <button onClick={() => updateQuantity(item.id, item.color, -1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-l-full transition-colors"><Minus size={14} /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.color, 1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-r-full transition-colors"><Plus size={14} /></button>
                        </div>
                        
                        <div className="text-right">
                           <p className="text-sm font-bold text-aura-brown">
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
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-aura-gold/20 shadow-lg sticky top-32">
                <h3 className="font-serif text-xl font-bold mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-aura-brown">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  {/* 🚀 ACCURATE CONTEXT SHIPPING DISPLAY */}
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse">
                            <Flame size={12}/> Ramzan Offer: FREE
                        </span>
                    ) : (
                        <span className="font-bold text-aura-brown">Rs {shippingCost}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mb-8">
                   <span className="font-bold text-lg">Total</span>
                   <span className="font-serif text-2xl font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block w-full bg-aura-brown text-white text-center py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold hover:shadow-xl transition-all flex items-center justify-center gap-2 group shadow-md">
                   PROCEED TO CHECKOUT <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                   <ShieldCheck size={14} />
                   <span>Secure Checkout Guaranteed</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}