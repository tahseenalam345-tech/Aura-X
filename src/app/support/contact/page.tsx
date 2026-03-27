"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, Send, Home, ChevronRight, Mail, Phone, MapPin, MessageSquare } from "lucide-react";
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
        toast.error("Failed to send message. Please try again.");
    } else {
        toast.success("Message Sent Successfully! We will get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 md:pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 px-4">
                <Link href="/" className="hover:text-aura-gold transition-colors flex items-center gap-1"><Home size={14}/> Home</Link>
                <ChevronRight size={12}/>
                <Link href="/support" className="hover:text-aura-gold transition-colors">Support</Link>
                <ChevronRight size={12}/>
                <span className="text-aura-brown border-b border-aura-brown">Contact Us</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* LEFT: INFO */}
                <div className="bg-[#1E1B18] text-white p-10 md:p-14 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-aura-gold/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-aura-gold mb-6 border border-white/10 shadow-inner">
                            <MessageSquare size={20} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Get in touch</h1>
                        <p className="text-white/60 mb-12 text-sm leading-relaxed max-w-sm">
                            Whether you have a question about an exclusive timepiece, our signature fragrances, or just want to say hello, our concierge team is ready to assist you.
                        </p>
                        
                        <div className="space-y-8">
                            <div className="flex items-start gap-5 group">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-aura-gold group-hover:bg-aura-gold group-hover:text-black transition-colors shadow-sm">
                                    <Phone size={18}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Phone / WhatsApp</p>
                                    <p className="font-serif text-lg tracking-wide">+92 336 9178278</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-5 group">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-aura-gold group-hover:bg-aura-gold group-hover:text-black transition-colors shadow-sm">
                                    <Mail size={18}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Direct Email</p>
                                    <a href="mailto:auraxofficial1@gmail.com" className="font-serif text-lg hover:text-aura-gold transition-colors">auraxofficial1@gmail.com</a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-5 group">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-aura-gold group-hover:bg-aura-gold group-hover:text-black transition-colors shadow-sm">
                                    <MapPin size={18}/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Headquarters</p>
                                    <p className="font-serif text-lg">Lahore, Pakistan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-aura-gold/20 flex flex-col justify-center">
                    <h2 className="text-2xl font-serif font-bold text-aura-brown mb-8">Send a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Full Name</label>
                                <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-aura-gold focus:ring-1 focus:ring-aura-gold outline-none transition-all text-sm shadow-inner" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
                                <input required type="email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-aura-gold focus:ring-1 focus:ring-aura-gold outline-none transition-all text-sm shadow-inner" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Subject</label>
                            <input required type="text" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-aura-gold focus:ring-1 focus:ring-aura-gold outline-none transition-all text-sm shadow-inner" placeholder="How can we help you?" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Message</label>
                            <textarea required rows={5} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold outline-none transition-all text-sm shadow-inner" placeholder="Type your message here..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-aura-brown to-[#2A241D] text-white font-bold py-4 rounded-full hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 disabled:scale-100">
                            {loading ? <><Loader2 className="animate-spin" size={16} /> SENDING...</> : <><Send size={16}/> SEND MESSAGE</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
      </div>
    </main>
  );
}