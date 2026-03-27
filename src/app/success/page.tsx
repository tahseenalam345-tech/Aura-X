"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Truck, ArrowRight, MessageCircle, XCircle, AlertCircle, ShoppingBag } from "lucide-react";
import { Suspense, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase"; 
import toast from "react-hot-toast"; 
import * as fbq from "@/lib/fpixel"; // 🚀 IMPORT META PIXEL UTILITY

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "PENDING"; 
  const total = searchParams.get("total") || "0";
  const name = searchParams.get("name") || "Customer";
  
  const [cancelling, setCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // 🚀 FIRE PURCHASE EVENT SAFELY (Only fires ONCE per visit)
  const hasFiredPixel = useRef(false);

  useEffect(() => {
    if (total && total !== "0" && !hasFiredPixel.current) {
      fbq.event('Purchase', {
        value: Number(total),
        currency: 'PKR',
        order_id: orderId, // Tells Facebook exactly which order this is to prevent duplicates
        content_type: 'product',
      });
      hasFiredPixel.current = true;
    }
  }, [total, orderId]);

  const handleWhatsApp = () => {
    // 🚀 Professional WhatsApp Message Template
    const text = `Hello AURA-X Support, \n\nI just placed an order on your website. \n\n*Order ID:* ${orderId} \n*Total Amount:* Rs ${Number(total).toLocaleString()} \n\nPlease confirm my order. Thank you!`;
    window.open(`https://wa.me/923369871278?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCancel = async () => {
      if(!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;

      setCancelling(true);

      try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('order_code', orderId); 

          if (error) throw error;

          setIsCancelled(true);
          toast.success("Order cancelled successfully.");
      } catch (error) {
          console.error(error);
          toast.error("Failed to cancel. Please contact support.");
      } finally {
          setCancelling(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-32 pb-20">
      
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 shadow-inner ${isCancelled ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
        <div className="absolute inset-0 rounded-full bg-current opacity-10 animate-ping"></div>
        {isCancelled ? <XCircle size={48} strokeWidth={1.5} /> : <CheckCircle size={48} strokeWidth={1.5} />}
      </div>

      <h1 className="text-3xl md:text-5xl font-serif font-bold text-aura-brown mb-3 capitalize tracking-tight">
          {isCancelled ? "Order Cancelled" : `Thank You, ${name}!`}
      </h1>
      
      <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed">
          {isCancelled 
            ? "Your order has been successfully cancelled as per your request." 
            : "Your masterpiece order has been received. We are preparing it for dispatch."}
      </p>

      <div className="bg-white p-8 rounded-[2rem] border border-aura-gold/20 shadow-xl w-full max-w-md relative overflow-hidden mb-10">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isCancelled ? 'bg-red-500' : 'bg-gradient-to-r from-aura-gold to-yellow-600'}`}></div>
        
        <div className="flex items-center gap-3 justify-center mb-6 pb-6 border-b border-dashed border-gray-200">
           <ShoppingBag className="text-aura-gold" size={24}/>
           <span className="font-serif font-bold text-xl text-aura-brown">Order Summary</span>
        </div>

        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order ID</span>
            <span className="text-lg font-serif font-bold text-aura-brown bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{orderId}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</span>
            <span className={`text-2xl font-bold font-serif ${isCancelled ? 'text-gray-400 line-through' : 'text-green-600'}`}>
                Rs {Number(total).toLocaleString()}
            </span>
        </div>
      </div>

      {!isCancelled && (
        <>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link href="/track-order" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-aura-brown text-aura-brown font-bold text-xs tracking-widest uppercase hover:bg-aura-brown hover:text-white transition-all shadow-sm">
                    <Truck size={16} /> TRACK ORDER
                </Link>
                <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-xs tracking-widest uppercase hover:shadow-xl transition-all shadow-lg hover:scale-[1.02]">
                    <MessageCircle size={16} /> WHATSAPP US
                </button>
            </div>

            <div className="mt-8 w-full max-w-md">
                 <button 
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-red-400 text-xs font-bold hover:text-red-600 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors uppercase tracking-widest"
                 >
                    {cancelling ? "Processing Cancellation..." : "Made a mistake? Cancel Order"}
                 </button>
            </div>
        </>
      )}

      {isCancelled && (
         <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="bg-red-50 text-red-800 p-4 rounded-2xl text-sm flex items-start gap-3 border border-red-100 text-left">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>This order has been voided and will not be processed or shipped.</span>
            </div>
            <Link href="/" className="bg-aura-brown text-white py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-aura-gold hover:shadow-lg transition-all shadow-md mt-2">
                PLACE NEW ORDER
            </Link>
         </div>
      )}
      
      {!isCancelled && (
        <Link href="/" className="mt-12 flex items-center justify-center gap-2 text-gray-400 hover:text-aura-gold transition-colors text-xs font-bold tracking-widest uppercase group">
            CONTINUE SHOPPING <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-aura-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}