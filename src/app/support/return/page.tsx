"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, ChevronRight, Home, ShieldCheck, Clock, Package, AlertCircle } from "lucide-react";
import Link from "next/link";

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
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown font-lato">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
            
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 pl-1">
                <Link href="/" className="hover:text-aura-gold"><Home size={14}/></Link>
                <ChevronRight size={14}/>
                <Link href="/support" className="hover:text-aura-gold">Support</Link>
                <ChevronRight size={14}/>
                <span className="font-bold text-aura-brown">Return & Exchange</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* --- LEFT: RETURN FORM --- */}
                <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100">
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

                {/* --- RIGHT: POLICIES SIDEBAR (NEW) --- */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Policy Card 1 */}
                    <div className="bg-[#1A1A1A] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="font-serif text-2xl font-bold mb-6 text-aura-gold">Return Policy</h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-aura-gold"><Clock size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">7-Day Window</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">You have 7 days from the date of delivery to request a return or exchange.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-aura-gold"><Package size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Original Condition</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Items must be unused, unworn, and in original packaging with all tags attached.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-aura-gold"><ShieldCheck size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Defective Items</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">If you receive a damaged watch, we offer a 100% free replacement instantly.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Card 2: Help Info */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                        <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-aura-gold" /> Need Help?
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                            Our team is available Mon-Sat (10am - 6pm) to assist you with your returns.
                        </p>
                        <div className="space-y-2 text-sm font-medium">
                            <p className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span>Email:</span> <span className="text-aura-brown">support@aura-x.pk</span></p>
                            <p className="flex justify-between pt-1"><span>WhatsApp:</span> <span className="text-aura-brown">+92 336 9871278</span></p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
      </div>
    </main>
  );
}