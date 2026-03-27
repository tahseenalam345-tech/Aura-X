"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Home, ChevronRight, Truck, Package, Clock, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 md:pt-40 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in duration-700">
        
        {/* --- BREADCRUMB --- */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 justify-center">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1 transition-colors">
                <Home size={14}/> Home
            </Link>
            <ChevronRight size={12}/>
            <Link href="/support" className="hover:text-aura-gold transition-colors">Support</Link>
            <ChevronRight size={12}/>
            <span className="text-aura-brown border-b border-aura-brown">Shipping Policy</span>
        </div>

        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shipping & Delivery</h1>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">Everything you need to know about how your masterpiece reaches your doorstep securely.</p>
        </div>
        
        <div className="bg-white p-8 md:p-14 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-12">
            
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-serif mb-3">Delivery Timeline</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        We aim to deliver your order within <strong>3-5 working days</strong> for major cities (Lahore, Karachi, Islamabad) and <strong>5-7 working days</strong> for remote areas across Pakistan. Please note that during mega sale events or public holidays, delivery may experience slight delays.
                    </p>
                </div>
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Truck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-serif mb-3">Shipping Charges</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        We charge a standard flat rate of <strong>Rs. 250</strong> for nationwide shipping on all general items (Watches, Fragrances, Accessories). 
                        <br/><br/>
                        <span className="bg-[#FAF8F1] px-3 py-2 rounded-lg border border-aura-gold/30 text-xs text-aura-brown font-bold inline-block">
                            💡 Tip: Keep an eye out for Special Events (like Eid) or Limited Drops where we offer 100% Free VIP Delivery.
                        </span>
                    </p>
                </div>
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-serif mb-3">Order Confirmation & Dispatch</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        Once you place an order, you will instantly receive an automated confirmation email. For Cash on Delivery (COD) orders, our Concierge Team may call you on the provided number to verify details before dispatching the items.
                        <br/><br/>
                        Once dispatched, we will provide you with a Tracking Number which you can use on our <Link href="/track-order" className="text-aura-gold font-bold hover:underline">Track Order</Link> page.
                    </p>
                </div>
            </section>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Package size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-serif mb-3">Premium Packaging & Couriers</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                        Every masterpiece is packed with extreme care. If you have opted for a <strong>Premium Box</strong> or <strong>Gift Wrap</strong> during checkout, the item will be prepared accordingly to ensure a perfect unboxing experience.
                        <br/><br/>
                        We partner with Pakistan's most trusted courier networks including <strong>TCS, Leopard Courier, and Call Courier</strong> to handle your luxury shipments safely.
                    </p>
                </div>
            </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}