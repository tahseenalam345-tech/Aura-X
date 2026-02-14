"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Truck, ArrowRight, MessageCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "PENDING";
  const total = searchParams.get("total") || "0";
  const name = searchParams.get("name") || "Customer";

  const handleWhatsApp = () => {
    const text = `Hi AURA-X, I just placed order ${orderId} for Rs ${Number(total).toLocaleString()}. Can you confirm?`;
    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-32">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle size={48} />
      </div>
      <h1 className="text-4xl font-serif text-aura-brown mb-2 capitalize">Thank You, {name}!</h1>
      <p className="text-gray-500 mb-8">Your order has been placed successfully.</p>

      <div className="bg-white p-8 rounded-2xl border border-aura-gold/30 shadow-lg w-full max-w-md relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-aura-gold"></div>
        
        <div className="flex justify-between border-b border-dashed border-gray-200 pb-4 mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order Number</span>
            <span className="text-2xl font-serif font-bold text-aura-brown">{orderId}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</span>
            <span className="text-xl font-bold text-green-600">Rs {Number(total).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link href="/track-order" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-aura-brown text-aura-brown font-bold text-sm tracking-widest hover:bg-aura-brown hover:text-white transition-all">
            <Truck size={18} /> TRACK ORDER
        </Link>
        <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#25D366] text-white font-bold text-sm tracking-widest hover:bg-[#128C7E] transition-all shadow-lg hover:shadow-xl">
            <MessageCircle size={18} /> WHATSAPP
        </button>
      </div>
      
      <Link href="/" className="mt-12 flex items-center justify-center gap-2 text-gray-400 hover:text-aura-gold transition-colors text-sm font-bold tracking-widest">
          CONTINUE SHOPPING <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}