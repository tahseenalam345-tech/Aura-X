"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase"; 
import { Search, Package, CheckCircle, Truck, MapPin, XCircle, AlertCircle, Sparkles } from "lucide-react"; 
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

    // 🚀 FIXED: Changed 'err' to 'error: fetchError' to properly destructure Supabase response
    const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', input.trim().toUpperCase()) 
        .maybeSingle();

    if (fetchError || !data) {
        setError("Order not found. Please check your Order ID (e.g., ORD-12345).");
    } else {
        setOrder(data);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
      if(!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
      
      setCancelling(true);
      
      try {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('id', order.id); 

          if (updateError) throw updateError;

          setOrder({ ...order, status: 'Cancelled' });
          toast.success("Order has been cancelled successfully.");
          
      } catch (err) {
          console.error(err);
          toast.error("Failed to cancel order. Please contact support.");
      } finally {
          setCancelling(false);
      }
  };

  // Helper to dynamically calculate subtotal vs final to detect combos
  const getOrderCalculation = () => {
      if (!order || !order.items) return { itemTotal: 0, comboDiscount: 0, shipping: 250 };
      
      let itemTotal = 0;
      order.items.forEach((item: any) => {
          const giftCost = item.isGift ? 300 : 0;
          const boxCost = item.addBox ? 200 : 0;
          itemTotal += (item.price + giftCost + boxCost) * (item.quantity || 1);
      });

      const shipping = 250;
      const expectedTotalWithoutShipping = itemTotal;
      const actualDatabaseTotal = Number(order.total); 

      let comboDiscount = 0;
      if (actualDatabaseTotal < (expectedTotalWithoutShipping + shipping)) {
         comboDiscount = (expectedTotalWithoutShipping + shipping) - actualDatabaseTotal;
      }

      return { itemTotal, comboDiscount, shipping };
  };

  const { itemTotal, comboDiscount, shipping } = getOrderCalculation();

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-40">
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-serif font-bold">Track Your Order</h1>
           <p className="text-gray-500 mt-3 text-sm md:text-base">Enter the Order ID from your confirmation screen or email.</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto mb-12 shadow-sm rounded-full bg-white p-1 border border-gray-200 focus-within:border-aura-gold focus-within:ring-2 focus-within:ring-aura-gold/20 transition-all">
           <Search className="w-5 h-5 text-gray-400 ml-4 self-center hidden sm:block" />
           <input 
             type="text" 
             placeholder="ORD-XXXXX" 
             className="flex-1 p-3 md:p-4 rounded-full outline-none uppercase text-center sm:text-left font-bold tracking-widest bg-transparent"
             value={input}
             onChange={(e) => setInput(e.target.value)}
           />
           <button disabled={loading} className="bg-aura-brown text-white px-6 md:px-10 rounded-full font-bold text-xs md:text-sm tracking-widest hover:bg-aura-gold transition-colors disabled:opacity-50 shadow-md">
             {loading ? "SEARCHING..." : "TRACK"}
           </button>
        </form>

        {error && <div className="text-red-600 text-center bg-red-50 p-4 rounded-xl mb-8 border border-red-100 flex items-center justify-center gap-2 text-sm font-bold animate-in shake"><AlertCircle size={18}/> {error}</div>}

        {order && (
           <div className="bg-white rounded-[2rem] border border-aura-gold/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              
              {/* Header */}
              <div className="bg-[#FAF8F1] p-6 md:p-8 flex justify-between items-center border-b border-aura-gold/10">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Summary</p>
                    <p className="text-2xl md:text-3xl font-serif font-bold text-aura-brown">{order.order_code}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">Rs {Number(order.total).toLocaleString()}</p>
                 </div>
              </div>

              <div className="p-6 md:p-10">
                 
                 {/* TIMELINE */}
                 <div className="flex justify-between items-center relative mb-12 max-w-lg mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 -translate-y-1/2 rounded-full"></div>
                    <div 
                        className={`absolute top-1/2 left-0 h-1 -z-0 -translate-y-1/2 transition-all duration-1000 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-aura-gold'}`} 
                        style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '50%' : order.status === 'Cancelled' ? '100%' : '0%' }}
                    ></div>
                    
                    {order.status === 'Cancelled' ? (
                        <div className="relative z-10 w-full flex justify-center mt-2">
                            <div className="bg-red-500 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 text-xs tracking-widest uppercase">
                                <XCircle size={18} /> ORDER VOIDED
                            </div>
                        </div>
                    ) : (
                        ['Processing', 'Shipped', 'Delivered'].map((step, i) => {
                            const active = (order.status === 'Delivered') || (order.status === 'Shipped' && i <= 1) || (order.status === 'Processing' && i === 0);
                            return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-3">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-500 ${active ? 'bg-aura-gold border-aura-gold text-white scale-110' : 'bg-white border-gray-200 text-gray-300'}`}>
                                        {step === 'Processing' ? <Package size={20}/> : step === 'Shipped' ? <Truck size={20}/> : <CheckCircle size={20}/>}
                                    </div>
                                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 ${active ? 'text-aura-brown' : 'text-gray-300'}`}>{step}</p>
                                </div>
                            )
                        })
                    )}
                 </div>

                 {/* --- FULL ITEM DETAILS SECTION --- */}
                 <h3 className="font-bold border-b border-gray-100 pb-3 mb-6 text-aura-brown flex items-center gap-2"><Package size={18} className="text-aura-gold"/> What's in the Box</h3>
                 <div className="space-y-4 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    {order.items?.map((item:any, i:number) => (
                       <div key={i} className="flex gap-4 items-center border-b border-dashed border-gray-200 pb-4 last:border-0 last:pb-0">
                          {/* Image */}
                          <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 relative overflow-hidden flex-shrink-0 shadow-sm">
                             {item.image ? (
                                <Image src={item.image} fill className="object-contain p-1 mix-blend-multiply" alt={item.name} unoptimized={true}/>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                             )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-sm text-aura-brown truncate">{item.name}</p>
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Variant: <span className="text-aura-gold">{item.color || "Standard"}</span></p>
                             
                             {/* Extras Badges */}
                             <div className="flex gap-2 mt-1.5 flex-wrap">
                                {item.isGift && <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-sm font-bold border border-purple-100">+ Gift Wrap</span>}
                                {item.addBox && <span className="text-[9px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-sm font-bold border border-orange-100">+ Box</span>}
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <p className="font-bold text-sm text-aura-brown">Rs {((item.price + (item.isGift?300:0) + (item.addBox?200:0)) * item.quantity).toLocaleString()}</p>
                             <p className="text-[10px] text-gray-400 mt-1 font-bold">Qty: {item.quantity}</p>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Calculations Summary */}
                 <div className="bg-[#FAF8F1] p-5 rounded-2xl border border-aura-gold/20 mb-6 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold text-aura-brown">Rs {itemTotal.toLocaleString()}</span>
                    </div>
                    {comboDiscount > 0 && (
                        <div className="flex justify-between text-green-600 font-bold">
                            <span className="flex items-center gap-1"><Sparkles size={14}/> Combo Discount</span>
                            <span>- Rs {comboDiscount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Shipping Delivery</span>
                        <span className="font-bold text-aura-brown">Rs {shipping}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-aura-gold/20 pt-3 mt-3">
                        <span className="font-bold text-aura-brown uppercase tracking-widest text-xs">Total Amount</span>
                        <span className="font-serif text-xl font-bold text-aura-brown">Rs {Number(order.total).toLocaleString()}</span>
                    </div>
                 </div>

                 {/* Address Summary */}
                 <div className="bg-white border border-gray-200 p-5 rounded-2xl mb-8 text-sm text-gray-600 shadow-sm">
                    <p className="font-bold text-aura-brown mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]"><MapPin size={14} className="text-aura-gold"/> Shipping Address</p>
                    <p className="text-gray-500 font-medium">{order.address}</p>
                    <p className="text-gray-500 font-medium">{order.city}</p>
                 </div>

                 {/* Cancel Button */}
                 {order.status === 'Processing' && (
                     <div className="border-t border-dashed border-gray-200 pt-6">
                         <div className="bg-red-50/50 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-red-100">
                             <div className="flex items-center gap-3 text-red-700">
                                 <AlertCircle size={24} className="flex-shrink-0" />
                                 <div className="text-sm">
                                     <p className="font-bold">Changed your mind?</p>
                                     <p className="text-xs opacity-80 mt-0.5">You can cancel your items before they are dispatched.</p>
                                 </div>
                             </div>
                             <button 
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full md:w-auto px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-full hover:bg-red-600 hover:text-white transition-all text-xs tracking-widest uppercase shadow-sm disabled:opacity-50"
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