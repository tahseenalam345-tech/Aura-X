"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase"; 
import { Search, Package, CheckCircle, Truck, MapPin, XCircle, AlertCircle } from "lucide-react"; 
import toast from "react-hot-toast"; 

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false); 
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', input.trim().toUpperCase()) 
        .maybeSingle();

    if (error || !data) {
        setError("Order not found. Please check your Order ID (e.g., ORD-A1B2C3).");
    } else {
        setOrder(data);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
      if(!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
      
      setCancelling(true);
      
      try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('id', order.id); 

          if (error) throw error;

          setOrder({ ...order, status: 'Cancelled' });
          toast.success("Order has been cancelled successfully.");
          
      } catch (error) {
          console.error(error);
          toast.error("Failed to cancel order. Please contact support.");
      } finally {
          setCancelling(false);
      }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-40">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-serif font-medium">Track Your Order</h1>
           <p className="text-gray-500 mt-2">Enter the Order ID from your confirmation screen</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto mb-12">
           <input 
             type="text" 
             placeholder="ORD-XXXXXX" 
             className="flex-1 p-4 rounded-full border focus:border-aura-gold outline-none uppercase text-center font-bold tracking-widest"
             value={input}
             onChange={(e) => setInput(e.target.value)}
           />
           <button disabled={loading} className="bg-aura-brown text-white px-8 rounded-full font-bold hover:bg-aura-gold transition">
             {loading ? "..." : "TRACK"}
           </button>
        </form>

        {error && <div className="text-red-500 text-center bg-red-50 p-4 rounded-xl mb-8">{error}</div>}

        {order && (
           <div className="bg-white rounded-3xl border border-aura-gold/20 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
              {/* Header */}
              <div className="bg-[#FAF8F1] p-6 flex justify-between items-center border-b border-gray-100">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Order</p>
                    <p className="text-2xl font-serif font-bold text-aura-brown">{order.order_code}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Total</p>
                    <p className="text-xl font-bold text-green-600">Rs {Number(order.total).toLocaleString()}</p>
                 </div>
              </div>

              <div className="p-8">
                 {/* TIMELINE */}
                 <div className="flex justify-between items-center relative mb-12">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                    <div 
                        className={`absolute top-1/2 left-0 h-1 -z-0 transition-all duration-1000 ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-aura-gold'}`} 
                        style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '66%' : order.status === 'Cancelled' ? '100%' : '33%' }}
                    ></div>
                    
                    {order.status === 'Cancelled' ? (
                        <div className="relative z-10 w-full flex justify-center">
                            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                                <XCircle size={18} /> ORDER CANCELLED
                            </div>
                        </div>
                    ) : (
                        ['Processing', 'Shipped', 'Delivered'].map((step, i) => {
                            const active = (order.status === 'Delivered') || (order.status === 'Shipped' && i <= 1) || (order.status === 'Processing' && i === 0);
                            return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${active ? 'bg-aura-gold border-aura-gold text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                        {step === 'Processing' ? <Package size={18}/> : step === 'Shipped' ? <Truck size={18}/> : <CheckCircle size={18}/>}
                                    </div>
                                    <p className={`text-xs font-bold ${active ? 'text-aura-brown' : 'text-gray-300'}`}>{step}</p>
                                </div>
                            )
                        })
                    )}
                 </div>

                 {/* --- FULL ITEM DETAILS SECTION --- */}
                 <h3 className="font-bold border-b pb-2 mb-4 text-aura-brown">Order Details</h3>
                 <div className="space-y-6 mb-8">
                    {order.items?.map((item:any, i:number) => (
                       <div key={i} className="flex gap-4 items-start border-b border-dashed border-gray-100 pb-4 last:border-0">
                          {/* Image */}
                          <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden flex-shrink-0">
                             {item.image ? (
                                <Image src={item.image} fill className="object-contain p-1 mix-blend-multiply" alt={item.name}/>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                             )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                 <div>
                                    <p className="font-bold text-sm text-aura-brown">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Color: <span className="text-aura-brown font-medium">{item.color || "Standard"}</span></p>
                                    <p className="text-xs text-gray-500">Qty: <span className="text-aura-brown font-medium">x{item.quantity}</span></p>
                                 </div>
                                 <p className="font-bold text-sm text-aura-brown">Rs {((item.price + (item.isGift?150:0) + (item.addBox?100:0)) * item.quantity).toLocaleString()}</p>
                             </div>

                             {/* Extras Badges */}
                             <div className="flex gap-2 mt-2">
                                {item.isGift && (
                                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                        + Gift Wrap
                                    </span>
                                )}
                                {item.addBox && (
                                    <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">
                                        + Premium Box
                                    </span>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Address Summary */}
                 <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                    <p className="font-bold text-aura-brown mb-1 flex items-center gap-2"><MapPin size={14}/> Shipping Address</p>
                    <p>{order.address}</p>
                    <p>{order.city}</p>
                 </div>

                 {/* Cancel Button */}
                 {order.status === 'Processing' && (
                     <div className="border-t border-dashed border-gray-200 pt-6 mt-6">
                         <div className="bg-red-50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                             <div className="flex items-center gap-3 text-red-700">
                                 <AlertCircle size={20} />
                                 <div className="text-sm">
                                     <p className="font-bold">Changed your mind?</p>
                                     <p className="text-xs opacity-80">You can cancel items before they are shipped.</p>
                                 </div>
                             </div>
                             <button 
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full md:w-auto px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm whitespace-nowrap"
                             >
                                {cancelling ? "Processing..." : "Cancel Order"}
                             </button>
                         </div>
                     </div>
                 )}

              </div>
           </div>
        )}
      </div>
    </main>
  );
}