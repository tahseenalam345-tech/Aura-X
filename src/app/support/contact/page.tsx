"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, Send, Home, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('contact_messages').insert([formData]);

    setLoading(false);
    if (error) {
        toast.error("Failed to send message.");
    } else {
        toast.success("Message Sent Successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
            
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 px-4">
                <Link href="/" className="hover:text-aura-gold"><Home size={14}/></Link>
                <ChevronRight size={14}/>
                <Link href="/support" className="hover:text-aura-gold">Support</Link>
                <ChevronRight size={14}/>
                <span className="font-bold text-aura-brown">Contact Us</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* LEFT: INFO */}
                <div className="bg-aura-brown text-white p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-aura-gold/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-6">Get in touch</h1>
                        <p className="text-white/70 mb-10">Have a question or just want to say hi? We'd love to hear from you.</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-aura-gold"><Phone size={20}/></div>
                                <div><p className="text-xs text-white/50 uppercase tracking-widest">Phone</p><p className="font-bold">+92 326 1688628</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-aura-gold"><Mail size={20}/></div>
                                <div><p className="text-xs text-white/50 uppercase tracking-widest">Email</p><p className="font-bold">support@aura-x.com</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-aura-gold"><MapPin size={20}/></div>
                                <div><p className="text-xs text-white/50 uppercase tracking-widest">Location</p><p className="font-bold">Lahore, Pakistan</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                            <input required type="text" className="w-full p-4 bg-gray-50 border rounded-xl focus:border-aura-gold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                            <input required type="email" className="w-full p-4 bg-gray-50 border rounded-xl focus:border-aura-gold outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Subject</label>
                            <input required type="text" className="w-full p-4 bg-gray-50 border rounded-xl focus:border-aura-gold outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Message</label>
                            <textarea required rows={5} className="w-full p-4 bg-gray-50 border rounded-xl resize-none focus:border-aura-gold outline-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-aura-brown text-white font-bold py-4 rounded-xl hover:bg-aura-gold transition-colors flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Send Message</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
      </div>
    </main>
  );
}