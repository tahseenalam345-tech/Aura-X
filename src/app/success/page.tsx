"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Truck, ArrowRight, MessageCircle, XCircle, AlertCircle } from "lucide-react"; // Added Icons
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase"; // Import Supabase
import toast from "react-hot-toast";      // Import Toast

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "PENDING"; // This is the ORD-XXXX code
  const total = searchParams.get("total") || "0";
  const name = searchParams.get("name") || "Customer";
  
  // New States for Cancellation
  const [cancelling, setCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleWhatsApp = () => {
    const text = `Hi AURA-X, I just placed order ${orderId} for Rs ${Number(total).toLocaleString()}. Can you confirm?`;
    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(text)}`, "_blank");
  };

  // --- CANCEL ORDER FUNCTION ---
  const handleCancel = async () => {
      if(!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;

      setCancelling(true);

      try {
          // Update status in Supabase using the Order Code
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('order_code', orderId); // Matches the ORD-XXXX code

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-32">
      
      {/* Dynamic Icon: Green Check normally, Red X if cancelled */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
        {isCancelled ? <XCircle size={48} /> : <CheckCircle size={48} />}
      </div>

      <h1 className="text-4xl font-serif text-aura-brown mb-2 capitalize">
          {isCancelled ? "Order Cancelled" : `Thank You, ${name}!`}
      </h1>
      
      <p className="text-gray-500 mb-8">
          {isCancelled ? "Your order has been cancelled as requested." : "Your order has been placed successfully."}
      </p>

      <div className="bg-white p-8 rounded-2xl border border-aura-gold/30 shadow-lg w-full max-w-md relative overflow-hidden mb-8">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isCancelled ? 'bg-red-500' : 'bg-aura-gold'}`}></div>
        
        <div className="flex justify-between border-b border-dashed border-gray-200 pb-4 mb-4">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order Number</span>
            <span className="text-2xl font-serif font-bold text-aura-brown">{orderId}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</span>
            <span className={`text-xl font-bold ${isCancelled ? 'text-gray-400 line-through' : 'text-green-600'}`}>
                Rs {Number(total).toLocaleString()}
            </span>
        </div>
      </div>

      {/* Main Actions */}
      {!isCancelled && (
        <>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link href="/track-order" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-aura-brown text-aura-brown font-bold text-sm tracking-widest hover:bg-aura-brown hover:text-white transition-all">
                    <Truck size={18} /> TRACK ORDER
                </Link>
                <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#25D366] text-white font-bold text-sm tracking-widest hover:bg-[#128C7E] transition-all shadow-lg hover:shadow-xl">
                    <MessageCircle size={18} /> WHATSAPP
                </button>
            </div>

            {/* Cancel Button - Only visible if NOT cancelled yet */}
            <div className="mt-6 w-full max-w-md">
                 <button 
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-red-500 text-xs font-bold hover:text-red-700 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
                 >
                    {cancelling ? "Processing..." : "Made a mistake? Cancel Order"}
                 </button>
            </div>
        </>
      )}

      {/* If Cancelled, show support option */}
      {isCancelled && (
         <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm flex items-center gap-3">
                <AlertCircle size={20} />
                <span>This order was cancelled and will not be shipped.</span>
            </div>
            <Link href="/" className="bg-aura-brown text-white py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold transition-colors">
                PLACE NEW ORDER
            </Link>
         </div>
      )}
      
      {!isCancelled && (
        <Link href="/" className="mt-12 flex items-center justify-center gap-2 text-gray-400 hover:text-aura-gold transition-colors text-sm font-bold tracking-widest">
            CONTINUE SHOPPING <ArrowRight size={14} />
        </Link>
      )}
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