"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  
  // Dummy Order Data for Demo
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate API Call
    setTimeout(() => {
      if (orderId.length > 3) {
        setStatus("found");
        setOrderData({
            id: orderId,
            date: "2024-02-01",
            items: [
                { name: "Royal Oak Perpetual", price: 8500, image: "/pic8.png" },
                { name: "Nordic Minimalist", price: 2500, image: "/pic13.png" }
            ],
            total: 11000,
            estimatedDays: 5
        });
      } else {
        setStatus("error");
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-40 pb-20 px-6 max-w-4xl mx-auto min-h-[80vh]">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <span className="text-aura-gold text-xs font-bold tracking-[0.3em] uppercase block mb-3">Concierge Service</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-aura-brown">Track Your Order</h1>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative z-10">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Enter Order ID (e.g. AURA-8821)" 
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold transition-colors"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-aura-brown text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-aura-gold transition-colors flex items-center justify-center gap-2">
                    {status === 'loading' ? 'Locating...' : 'Track'} <Search size={18} />
                </button>
            </form>

            {/* ERROR MESSAGE */}
            {status === "error" && (
                <p className="text-red-500 text-sm mt-4 text-center">Order not found. Please check your ID and try again.</p>
            )}
        </div>

        {/* ORDER DETAILS (Only show if found) */}
        {status === "found" && orderData && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 space-y-8"
            >
                {/* PROGRESS BAR */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="font-serif font-bold text-xl mb-6">Delivery Status</h3>
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-aura-gold -translate-y-1/2 rounded-full"></div>
                        
                        <div className="relative flex justify-between">
                            <Step icon={CheckCircle} label="Ordered" active />
                            <Step icon={Package} label="Processing" active />
                            <Step icon={Truck} label="In Transit" active />
                            <Step icon={CheckCircle} label="Delivered" />
                        </div>
                    </div>
                    
                    {/* ESTIMATED DELIVERY */}
                    <div className="mt-8 bg-aura-gold/10 p-4 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-aura-gold rounded-full flex items-center justify-center text-aura-brown">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-aura-brown/60">Estimated Delivery</p>
                            <p className="text-xl font-bold text-aura-brown">{orderData.estimatedDays} Days Remaining</p>
                        </div>
                    </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="font-serif font-bold text-xl mb-6">Order Summary</h3>
                    <div className="space-y-6">
                        {orderData.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden relative">
                                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-aura-brown">{item.name}</h4>
                                    <p className="text-sm text-gray-500">Rs {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-500">Total Amount</span>
                        <span className="font-serif font-bold text-2xl text-aura-brown">Rs {orderData.total.toLocaleString()}</span>
                    </div>
                </div>

            </motion.div>
        )}

      </div>
    </main>
  );
}

// Helper for Progress Bar
function Step({ icon: Icon, label, active }: any) {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${active ? 'bg-aura-gold border-white text-white shadow-lg' : 'bg-gray-100 border-white text-gray-400'}`}>
                <Icon size={16} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-aura-brown' : 'text-gray-300'}`}>{label}</span>
        </div>
    )
}