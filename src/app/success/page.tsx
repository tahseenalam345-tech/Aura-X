"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Truck, ArrowRight, MessageCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "N/A"; // This will now be the Short ID (e.g. ORD-AB12CD)
  const total = searchParams.get("total");
  const name = searchParams.get("name");

  const handleWhatsApp = () => {
    const text = `Hi AURA-X, I just placed order ${orderId} for Rs ${Number(total).toLocaleString()}.`;
    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-32">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
        <CheckCircle size={48} />
      </div>
      <h1 className="text-4xl font-serif text-aura-brown mb-2">Thank You, {name}!</h1>
      <p className="text-gray-500 mb-8">Your order has been placed successfully.</p>

      <div className="bg-white p-8 rounded-2xl border border-aura-gold/30 shadow-lg w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-aura-gold"></div>
        
        <div className="flex justify-between border-b pb-4 mb-4">
            <span className="text-gray-400 text-sm font-bold uppercase">Order Number</span>
            {/* Display the Short ID exactly as received */}
            <span className="text-2xl font-serif font-bold text-aura-brown">{orderId}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold uppercase">Total Amount</span>
            <span className="text-xl font-bold text-green-600">Rs {Number(total).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link href="/track-order" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-aura-brown text-aura-brown font-bold hover:bg-aura-brown hover:text-white transition">
            <Truck size={18} /> TRACK ORDER
        </Link>
        <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-50 text-green-700 font-bold hover:bg-green-100 transition">
            <MessageCircle size={18} /> WHATSAPP
        </button>
      </div>
      
      <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-aura-gold transition">
         Continue Shopping <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}><SuccessContent /></Suspense>
    </main>
  );
}