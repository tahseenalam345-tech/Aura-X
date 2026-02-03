"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { CheckCircle, Truck, Package } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
    const { user, logout } = useAuth();
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState<"idle" | "found">("idle");

    return (
        <main className="min-h-screen bg-[#F2F0E9] text-aura-brown font-sans">
             <Navbar />
             
             <div className="max-w-3xl mx-auto pt-44 px-6 pb-20">
                 <div className="text-center mb-12">
                    <span className="text-aura-gold text-xs font-bold tracking-[0.3em] uppercase block mb-3">Concierge Service</span>
                    <h1 className="text-4xl font-serif font-bold">Track Your Delivery</h1>
                    {user && <p className="text-sm text-gray-400 mt-4">Logged in as {user}</p>}
                 </div>

                 {/* TRACKING FORM */}
                 <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-6 py-4 outline-none focus:border-aura-gold transition-colors"
                            placeholder="Enter Order ID (e.g. #8821)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setStatus("found")} className="bg-aura-brown text-white px-8 py-4 rounded-xl font-bold hover:bg-aura-gold transition shadow-lg">
                        Track Package
                    </button>
                 </div>

                 {/* RESULT CARD */}
                 {status === 'found' && (
                    <div className="mt-10 bg-white p-8 rounded-[2rem] border border-gray-100 animate-in slide-in-from-bottom-4 duration-500 shadow-sm">
                        <div className="flex items-center gap-4 mb-10 bg-green-50 p-4 rounded-xl text-green-800 border border-green-100">
                             <CheckCircle className="text-green-600" /> 
                             <div>
                                 <p className="font-bold">Order Found: #{orderId || "8821"}</p>
                                 <p className="text-xs opacity-80">Estimated Delivery: 3 Days</p>
                             </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative flex justify-between text-center z-10">
                            {/* Line Background */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10"></div>
                            {/* Active Line */}
                            <div className="absolute top-5 left-0 w-1/2 h-1 bg-aura-gold -z-10"></div>
                            
                            {['Ordered', 'Processing', 'In Transit', 'Delivered'].map((step, i) => (
                                <div key={step} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors duration-500 ${i < 2 ? 'bg-aura-gold text-white' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                                        <Truck size={16} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${i < 2 ? 'text-aura-brown' : 'text-gray-300'}`}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
                 
                 <div className="mt-12 text-center">
                    <button onClick={logout} className="text-red-400 text-sm font-bold hover:text-red-600 transition underline">
                        Sign Out
                    </button>
                 </div>
             </div>
        </main>
    )
}