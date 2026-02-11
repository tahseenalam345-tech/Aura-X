"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const FREE_SHIPPING_THRESHOLD = 5000;
  const STANDARD_SHIPPING_COST = 250;

  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : STANDARD_SHIPPING_COST;
  const finalTotal = cartTotal + shippingCost;
  const amountNeededForFreeShip = FREE_SHIPPING_THRESHOLD - cartTotal;

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-40">
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
              
              {!isFreeShipping && (
                 <div className="bg-white p-4 rounded-xl border border-aura-gold/20 flex items-center gap-4 shadow-sm">
                    <div className="p-2 bg-aura-gold/10 rounded-full text-aura-gold"><Truck size={20}/></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-aura-brown">
                            Add <span className="text-aura-gold">Rs {amountNeededForFreeShip.toLocaleString()}</span> more for Free Shipping!
                        </p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                           <div 
                             className="h-full bg-aura-gold transition-all duration-500" 
                             style={{ width: `${(cartTotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                           ></div>
                        </div>
                    </div>
                 </div>
              )}

              {cart.map((item) => (
                <div key={`${item.id}-${item.color}`} className="flex gap-4 md:gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-aura-gold/30 transition-all">
                  
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2 mix-blend-multiply" decoding="async" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                         <h3 className="font-serif font-bold text-lg md:text-xl text-aura-brown line-clamp-1">{item.name}</h3>
                         <button 
                           onClick={() => removeFromCart(item.id, item.color)} 
                           className="text-gray-300 hover:text-red-500 transition-colors p-1"
                           aria-label={`Remove ${item.name} from cart`}
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                      {item.color && <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Color: {item.color}</p>}
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                         {item.isGift && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold border border-purple-100">Gift Wrap (+Rs 150)</span>}
                         {item.addBox && <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded font-bold border border-orange-100">Premium Box (+Rs 100)</span>}
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-8 md:h-10">
                        <button onClick={() => updateQuantity(item.id, item.color, -1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-l-full transition-colors" aria-label={`Decrease quantity of ${item.name}`}><Minus size={14} /></button>
                        <span className="text-xs font-bold w-4 text-center" aria-live="polite">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.color, 1)} className="w-8 md:w-10 flex items-center justify-center hover:text-aura-gold hover:bg-white rounded-r-full transition-colors" aria-label={`Increase quantity of ${item.name}`}><Plus size={14} /></button>
                      </div>
                      
                      <div className="text-right">
                         <p className="text-sm font-bold text-aura-brown">
                            Rs {((item.price + (item.isGift ? 150 : 0) + (item.addBox ? 100 : 0)) * item.quantity).toLocaleString()}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-aura-gold/20 shadow-lg sticky top-32">
                <h3 className="font-serif text-xl font-bold mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    {isFreeShipping ? (
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">Free</span>
                    ) : (
                        <span className="font-bold text-aura-brown">Rs {STANDARD_SHIPPING_COST}</span>
                    )}
                  </div>
                  {!isFreeShipping && <p className="text-[10px] text-gray-400 text-right">Free shipping over Rs 5,000</p>}
                </div>

                <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mb-8">
                   <span className="font-bold text-lg">Total</span>
                   <span className="font-serif text-2xl font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block w-full bg-aura-brown text-white text-center py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold hover:shadow-xl transition-all flex items-center justify-center gap-2 group shadow-md" aria-label="Proceed to checkout page">
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