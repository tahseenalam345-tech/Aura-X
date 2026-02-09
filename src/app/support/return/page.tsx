"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, ChevronRight, Home } from "lucide-react";
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
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
            
            {/* BREADCRUMB NAVIGATION */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link href="/" className="hover:text-aura-gold"><Home size={14}/></Link>
                <ChevronRight size={14}/>
                <Link href="/support" className="hover:text-aura-gold">Support</Link>
                <ChevronRight size={14}/>
                <span className="font-bold text-aura-brown">Return</span>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                {success ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
                        <h2 className="text-3xl font-serif font-bold mb-4">Request Received</h2>
                        <p className="text-gray-500 mb-8">We have received your request for Order #{formData.orderId}. <br/>Our team will contact you shortly.</p>
                        <button onClick={() => setSuccess(false)} className="text-aura-brown font-bold underline">Submit another</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-serif font-bold mb-2">Return & Exchange</h1>
                        <p className="text-gray-500 mb-8 text-sm">Please fill out the form below. Ensure the item is unused.</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold uppercase mb-2">Name</label><input required className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold uppercase mb-2">Phone</label><input required className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold uppercase mb-2">Email</label><input required type="email" className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold uppercase mb-2">Order ID</label><input required className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold uppercase mb-2">Date</label><input required type="date" className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold uppercase mb-2">Reason</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}><option>Defective</option><option>Wrong Item</option><option>Changed Mind</option></select></div>
                            </div>
                            <div><label className="block text-xs font-bold uppercase mb-2">Details</label><textarea required rows={4} className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}></textarea></div>
                            <button type="submit" disabled={loading} className="w-full bg-aura-brown text-white font-bold py-4 rounded-xl hover:bg-aura-gold transition-colors flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : "Submit Request"}</button>
                        </form>
                    </>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}