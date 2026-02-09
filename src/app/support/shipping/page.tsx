"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react"; // Import Icons

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        
        {/* --- BREADCRUMB --- */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1">
                <Home size={14}/> 
            </Link>
            <ChevronRight size={14}/>
            <Link href="/support" className="hover:text-aura-gold">Support</Link>
            <ChevronRight size={14}/>
            <span className="font-bold text-aura-brown">Shipping Policy</span>
        </div>

        <h1 className="text-4xl font-serif font-bold mb-8 text-center">Shipping Policy</h1>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm space-y-8">
            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-aura-gold rounded-full"></span> Delivery Timeline</h3>
                <p className="text-gray-600 leading-relaxed">
                    We aim to deliver your order within <strong>3-5 working days</strong> for major cities (Lahore, Karachi, Islamabad) and <strong>5-7 working days</strong> for other remote areas. Please note that during sale periods or public holidays, delivery may be slightly delayed.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-aura-gold rounded-full"></span> Shipping Charges</h3>
                <p className="text-gray-600 leading-relaxed">
                    We offer <strong>Free Shipping</strong> on all orders above Rs. 5,000. <br/>
                    For orders below this amount, a standard shipping fee of <strong>Rs. 250</strong> applies nationwide.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-aura-gold rounded-full"></span> Order Confirmation</h3>
                <p className="text-gray-600 leading-relaxed">
                    Once you place an order, you will receive an automated confirmation email/SMS. For Cash on Delivery orders, our customer support team may call you to verify the order details before dispatching.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-aura-gold rounded-full"></span> Courier Partners</h3>
                <p className="text-gray-600 leading-relaxed">
                    We trust <strong>TCS, Leopard Courier, and Call Courier</strong> to handle your shipments safely. You will be provided with a tracking number as soon as your order is dispatched.
                </p>
            </section>
        </div>
      </div>
    </main>
  );
}