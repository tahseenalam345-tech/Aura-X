"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, ChevronRight, Home, ShieldCheck, Clock, Package, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function ReturnPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", orderId: "", purchaseDate: "", reason: "Defective Item", details: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('return_requests').insert([formData]);
    setLoading(false);
    if (error) toast.error("Failed to submit. Try again.");
    else { setSuccess(true); toast.success("Request Submitted!"); }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown font-sans">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
            
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 pl-1">
                <Link href="/" className="hover:text-aura-gold"><Home size={14}/></Link>
                <ChevronRight size={14}/>
                <span className="font-bold text-aura-brown">Return & Exchange</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-24">
                
                {/* --- LEFT: RETURN FORM --- */}
                <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
                    {success ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle size={40} /></div>
                            <h2 className="text-3xl font-serif font-bold mb-4">Request Received</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                We have received your return request for Order <span className="font-bold text-aura-brown">#{formData.orderId}</span>. 
                                <br/>Our support team will review it and contact you via WhatsApp or Email within 24 hours.
                            </p>
                            <button onClick={() => setSuccess(false)} className="text-aura-brown font-bold underline hover:text-aura-gold">Submit another request</button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-serif font-bold mb-2">File a Return</h1>
                            <p className="text-gray-500 mb-8 text-sm">Please fill out the form below to start your return or exchange process.</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Full Name</label>
                                        <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ali Khan" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Phone Number</label>
                                        <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0300-1234567" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Email Address</label>
                                        <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Order ID</label>
                                        <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} placeholder="#AX-...." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Purchase Date</label>
                                        <input required type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-gray-600" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Reason for Return</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-gray-600" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                                            <option>Defective / Damaged Item</option>
                                            <option>Wrong Item Received</option>
                                            <option>Size / Fit Issue</option>
                                            <option>Change of Mind</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-2 tracking-wider text-gray-400">Additional Details</label>
                                    <textarea required rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all" placeholder="Please describe the issue..." value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}></textarea>
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-aura-brown text-white font-bold py-4 rounded-xl hover:bg-aura-gold transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg">
                                    {loading ? <Loader2 className="animate-spin" /> : "Submit Return Request"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* --- RIGHT: CONTACT INFO --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="font-serif text-2xl font-bold mb-6 text-aura-gold">Contact Support</h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-aura-gold"><Clock size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Availability</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Mon - Sat (10:00 AM - 6:00 PM)</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-aura-gold"><Package size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Return Window</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">7 Days from delivery date.</p>
                                </div>
                            </div>
                        </div>
                         
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-1">WhatsApp Us</p>
                            <p className="text-lg font-bold text-white">+92 336 9871278</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW SECTION: DETAILED POLICIES --- */}
            <div className="mb-20">
                <div className="text-center mb-12">
                   <h2 className="text-3xl md:text-4xl font-serif font-bold text-aura-brown mb-4">Acceptance Policy</h2>
                   <p className="text-gray-500">Please read our rejection criteria carefully.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   {/* Valid Reasons */}
                   <div className="bg-white p-8 rounded-[2rem] border border-green-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={100} className="text-green-600" /></div>
                       <h3 className="text-xl font-serif font-bold text-green-800 mb-6 flex items-center gap-2"><CheckCircle size={20}/> Acceptable Rejection</h3>
                       <ul className="space-y-4">
                           <li className="flex gap-3 items-start text-sm text-gray-600">
                               <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                               <span><strong className="text-gray-900 block mb-1">Damaged Item</strong>If the watch is broken, scratched, or defective.</span>
                           </li>
                           <li className="flex gap-3 items-start text-sm text-gray-600">
                               <span className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                               <span><strong className="text-gray-900 block mb-1">Wrong Item</strong>If the model or color does not match order.</span>
                           </li>
                       </ul>
                   </div>

                   {/* Invalid Reasons */}
                   <div className="bg-white p-8 rounded-[2rem] border border-red-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><XCircle size={100} className="text-red-600" /></div>
                       <h3 className="text-xl font-serif font-bold text-red-800 mb-6 flex items-center gap-2"><XCircle size={20}/> Non-Acceptable Reasons</h3>
                       <ul className="space-y-4">
                           <li className="flex gap-3 items-start text-sm text-gray-600">
                               <span className="mt-1 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                               <span><strong className="text-gray-900 block mb-1">Change of Mind</strong>Rejection because you "don't like it anymore" is not allowed.</span>
                           </li>
                           <li className="flex gap-3 items-start text-sm text-gray-600">
                               <span className="mt-1 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                               <span><strong className="text-gray-900 block mb-1">Minor Box Dent</strong>Outer packaging damage by courier is not a valid reason.</span>
                           </li>
                       </ul>
                   </div>
                </div>

                {/* Rider Rules */}
                <div className="bg-[#1E1B18] text-white p-8 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aura-brown via-aura-gold to-aura-brown"></div>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-aura-gold mb-4 flex items-center gap-2">
                        <Clock size={24}/> Delivery & Inspection Protocol
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        Riders can wait a maximum of <span className="text-white font-bold">5 to 10 minutes</span>. You cannot reject a parcel without a valid reason. Unjustified rejections may lead to blacklisting.
                      </p>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-full border border-white/20">
                       <p className="text-xs font-bold text-aura-gold uppercase tracking-widest">Support Line</p>
                       <p className="text-lg font-bold">+92-336-9871278</p>
                    </div>
                  </div>
                </div>
            </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}