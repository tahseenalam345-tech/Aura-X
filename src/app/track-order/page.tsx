"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase"; 
import { Search, Package, CheckCircle, Truck, MapPin } from "lucide-react";

export default function TrackOrderPage() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    // This search works because order_code is a standard Text column now
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', input.trim().toUpperCase()) // Exact match on Short ID
        .maybeSingle();

    if (error || !data) {
        setError("Order not found. Please check your Order ID (e.g., ORD-A1B2C3).");
    } else {
        setOrder(data);
    }
    setLoading(false);
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
                    <div className={`absolute top-1/2 left-0 h-1 bg-aura-gold -z-0 transition-all duration-1000`} style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'Shipped' ? '66%' : '33%' }}></div>
                    
                    {['Processing', 'Shipped', 'Delivered'].map((step, i) => {
                        const active = (order.status === 'Delivered') || (order.status === 'Shipped' && i <= 1) || (order.status === 'Processing' && i === 0);
                        return (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${active ? 'bg-aura-gold border-aura-gold text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                    {step === 'Processing' ? <Package size={18}/> : step === 'Shipped' ? <Truck size={18}/> : <CheckCircle size={18}/>}
                                </div>
                                <p className={`text-xs font-bold ${active ? 'text-aura-brown' : 'text-gray-300'}`}>{step}</p>
                            </div>
                        )
                    })}
                 </div>

                 <h3 className="font-bold border-b pb-2 mb-4">Items</h3>
                 <div className="space-y-4">
                    {order.items?.map((item:any, i:number) => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded border relative overflow-hidden"><Image src={item.image} fill className="object-contain" alt=""/></div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.color} x{item.quantity}</p>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </div>
    </main>
  );
}