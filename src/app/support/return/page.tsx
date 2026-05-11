"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, ChevronRight, Home, ShieldCheck, Clock, Package, Wrench } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function ReturnPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // New state to toggle between standard return and warranty claim
  const [requestType, setRequestType] = useState<"Return" | "Warranty">("Return");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", orderId: "", purchaseDate: "", 
    reason: "Defective / Damaged Item", 
    warrantyType: "None", // Automatically managed
    details: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Formatting the payload so Admin knows if it's a Warranty Claim or Return
    const payload = {
        ...formData,
        reason: requestType === "Warranty" 
                 ? `[WARRANTY CLAIM - ${formData.warrantyType}] ${formData.reason}` 
                 : `[7-DAY RETURN] ${formData.reason}`
    };

    const { error } = await supabase.from('return_requests').insert([payload]);
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
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 px-4">
                <Link href="/" className="hover:text-aura-gold transition-colors flex items-center gap-1"><Home size={14}/> Home</Link>
                <ChevronRight size={12}/>
                <Link href="/support" className="hover:text-aura-gold transition-colors">Support</Link>
                <ChevronRight size={12}/>
                <span className="text-aura-brown border-b border-aura-brown">Return & Warranty</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* --- LEFT: RETURN & WARRANTY FORM --- */}
                <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-aura-gold/10">
                    {success ? (
                        <div className="text-center py-16 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-50 border border-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} strokeWidth={1.5} /></div>
                            <h2 className="text-3xl font-serif font-bold mb-4">Request Received</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
                                We have securely received your {requestType === 'Warranty' ? 'Warranty Claim' : 'Return Request'} for Order <span className="font-bold text-aura-brown">#{formData.orderId}</span>. 
                                <br/><br/>Our Concierge Team will review the details and contact you via WhatsApp or Email within 24-48 hours.
                            </p>
                            <button onClick={() => setSuccess(false)} className="text-aura-gold font-bold text-xs uppercase tracking-widest hover:text-aura-brown transition-colors underline underline-offset-4">Submit another request</button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">File a Request</h1>
                            <p className="text-gray-500 mb-8 text-sm max-w-lg">Please fill out the form below to initiate your 7-Day Return/Exchange or Official Warranty Claim process.</p>
                            
                            {/* --- REQUEST TYPE TOGGLE --- */}
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 border border-gray-200 shadow-inner">
                                <button 
                                    type="button"
                                    onClick={() => { setRequestType("Return"); setFormData({...formData, reason: "Defective / Damaged Item", warrantyType: "None"}); }}
                                    className={`flex-1 py-3.5 text-xs md:text-sm font-bold rounded-xl transition-all ${requestType === 'Return' ? 'bg-white text-aura-brown shadow-md' : 'text-gray-500 hover:text-aura-brown'}`}
                                >
                                    7-Day Return & Exchange
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setRequestType("Warranty"); setFormData({...formData, reason: "Machine / Movement Stopped", warrantyType: "6 Months Official Warranty"}); }}
                                    className={`flex-1 py-3.5 text-xs md:text-sm font-bold rounded-xl transition-all ${requestType === 'Warranty' ? 'bg-aura-brown text-white shadow-md' : 'text-gray-500 hover:text-aura-brown'}`}
                                >
                                    File a Warranty Claim
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Full Name</label>
                                        <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm shadow-inner" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ali Khan" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Phone Number</label>
                                        <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm shadow-inner" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0300-1234567" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Email Address</label>
                                        <input required type="email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm shadow-inner" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Order ID</label>
                                        <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm shadow-inner uppercase" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} placeholder="ORD-XXXXX" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Purchase Date</label>
                                        <input required type="date" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm text-gray-600 shadow-inner" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                                    </div>
                                    
                                    {/* DYNAMIC DROPDOWN BASED ON SELECTED TAB */}
                                    <div>
                                        {requestType === "Return" ? (
                                            <>
                                                <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Reason for Return</label>
                                                <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm text-gray-600 shadow-inner" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                                                    <option>Defective / Damaged Item</option>
                                                    <option>Wrong Item Received</option>
                                                    <option>Size / Fit Issue (Accessories)</option>
                                                    <option>Quality Not as Expected</option>
                                                    <option>Other</option>
                                                </select>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-aura-brown ml-1">Select Warranty Limit</label>
                                                    <select className="w-full p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-xl focus:outline-none focus:border-aura-gold transition-all text-sm text-aura-brown shadow-inner font-bold" value={formData.warrantyType} onChange={e => setFormData({...formData, warrantyType: e.target.value})}>
                                                        <option>6 Months Official Warranty</option>
                                                        <option>1 Year Official Warranty</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Warranty Fault Reason</label>
                                                    <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm text-gray-600 shadow-inner" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}>
                                                        <option>Machine / Movement Stopped</option>
                                                        <option>Water Damage (Inside Dial)</option>
                                                        <option>Battery Issue / Drained</option>
                                                        <option>Hands Loose / Misaligned</option>
                                                        <option>Other Internal Fault</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase mb-2 tracking-widest text-gray-500 ml-1">Additional Details</label>
                                    <textarea required rows={5} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-sm resize-none shadow-inner" placeholder={requestType === "Warranty" ? "Please detail the internal fault. Note: Broken glass or torn straps are not covered." : "Please clearly describe the issue..."} value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}></textarea>
                                </div>

                                <button type="submit" disabled={loading} className={`w-full text-white font-bold py-4 rounded-full hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg ${requestType === 'Warranty' ? 'bg-gradient-to-r from-aura-gold to-[#B8860B] text-black' : 'bg-gradient-to-r from-aura-brown to-[#2A241D]'}`}>
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : `Submit ${requestType} Request`}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* --- RIGHT: POLICY INFO --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1E1B18] text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-aura-gold/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="font-serif text-2xl font-bold mb-6 text-aura-gold flex items-center gap-3">
                            <ShieldCheck size={24} /> General Policy
                        </h3>
                        
                        <div className="space-y-6 text-sm text-white/70">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shrink-0 text-aura-gold"><Clock size={18}/></div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">7-Day Return Window</h4>
                                    <p className="leading-relaxed text-xs">Standard returns must be filed within 7 days of the delivery date. Late requests will not be entertained.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shrink-0 text-aura-gold"><Package size={18}/></div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Original Condition</h4>
                                    <p className="leading-relaxed text-xs">For 7-Day returns, items must be unused, with all tags, protective films, and luxury boxes intact.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <div className="w-10 h-10 rounded-full bg-aura-gold/20 border border-aura-gold/30 flex items-center justify-center shrink-0 text-aura-gold"><Wrench size={18}/></div>
                                <div>
                                    <h4 className="font-bold text-aura-gold mb-1">Warranty Claims</h4>
                                    <p className="leading-relaxed text-xs">Our 6-Month or 1-Year Official Warranty covers only <strong>internal machine/movement faults</strong> and manufacturing defects.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <h3 className="font-serif text-xl font-bold mb-6 text-aura-brown border-b border-gray-100 pb-4">Category Specifics</h3>
                        
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <p className="font-bold text-gray-900 mb-1">Watches & Smart Tech</p>
                                <p className="text-xs">Physical damage like <strong className="text-red-500">broken glass, torn straps, or accidental drops</strong> are NOT covered under warranty.</p>
                            </div>
                            <div className="pt-3 border-t border-dashed border-gray-100">
                                <p className="font-bold text-red-600 mb-1">Fragrances</p>
                                <p className="text-xs">Due to hygiene standards, perfumes <strong className="text-gray-900">cannot be returned or exchanged</strong> once the outer plastic seal is opened.</p>
                            </div>
                            <div className="pt-3 border-t border-dashed border-gray-100">
                                <p className="font-bold text-gray-900 mb-1">Leather Accessories</p>
                                <p className="text-xs">Wallets and belts must not show any signs of wear, creases, or scratches to be eligible for a return.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rider Rules */}
            <div className="bg-[#FAF8F1] border border-aura-gold/20 p-8 md:p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden max-w-4xl mx-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aura-brown via-aura-gold to-aura-brown"></div>
              <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-aura-brown mb-3 flex items-center justify-center md:justify-start gap-2">
                    <Clock size={24} className="text-aura-gold"/> Open Parcel Policy
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                    As an AURA-X customer, you are allowed to check the parcel before payment. However, riders can wait a maximum of <strong className="text-aura-brown">5 to 10 minutes</strong>. Unjustified rejection at the doorstep (e.g., "Change of mind") may lead to blacklisting.
                  </p>
                </div>
              </div>
            </div>
            
        </div>
      </div>
      <Footer />
    </main>
  );
}