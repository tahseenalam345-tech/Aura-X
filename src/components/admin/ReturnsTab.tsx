"use client";

import { supabase } from "@/lib/supabase";
import { Trash2, CheckCircle, Phone, Mail, MessageCircle, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface ReturnsTabProps {
  returnRequests: any[];
  refreshData: () => void;
}

export default function ReturnsTab({ returnRequests, refreshData }: ReturnsTabProps) {
  
  const deleteRequest = async (id: number) => {
      if(!confirm("Are you sure? This will permanently remove this return request log.")) return;
      
      const { error } = await supabase.from('return_requests').delete().eq('id', id);
      
      if (error) {
          toast.error(`Delete Failed: ${error.message}`);
      } else {
          toast.success("Log deleted successfully");
          refreshData();
      }
  };

  const handleWhatsApp = (phone: string, orderId: string, name: string) => {
    const rawNumber = phone || "";
    const fmtNumber = rawNumber.replace(/\D/g, '').replace(/^0/, '92');
    const text = `Hello ${name}, this is AURA-X Support regarding your return request for Order #${orderId}. How can we assist you further?`;
    window.open(`https://wa.me/${fmtNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold text-[#1E1B18]">Return Requests</h1>
                <p className="text-sm text-gray-500">Manage customer returns and exchange claims</p>
            </div>
            <div className="bg-aura-gold/10 px-4 py-2 rounded-full border border-aura-gold/20">
                <span className="text-xs font-bold text-aura-brown uppercase tracking-widest">{returnRequests.length} Pending Requests</span>
            </div>
        </div>
        
        {returnRequests.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <CheckCircle size={32} />
                </div>
                <p className="text-gray-400 font-medium">Clear sky! No pending return requests.</p>
            </div>
        ) : (
            <div className="grid gap-6">
                {returnRequests.map((req) => (
                    <div key={req.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        {/* Decorative side bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-aura-gold/40"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-serif font-bold text-xl text-aura-brown">Order #{req.orderId}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-widest">{req.reason}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(req.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Tag size={12}/> {req.purchaseDate ? `Purchased: ${req.purchaseDate}` : 'Date N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleWhatsApp(req.phone, req.orderId, req.name)}
                                    className="p-2.5 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                    title="Contact on WhatsApp"
                                >
                                    <MessageCircle size={18}/>
                                </button>
                                <button 
                                    onClick={() => deleteRequest(req.id)} 
                                    className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Delete Log"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-[#FAF9F6] p-5 rounded-2xl text-sm text-gray-700 mb-6 border border-gray-100 italic relative">
                            <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 rounded">Reason & Details</span>
                            "{req.details || "No additional details provided."}"
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-aura-gold shadow-sm border border-gray-100"><CheckCircle size={14}/></div>
                                <span className="text-sm font-bold text-gray-700 truncate">{req.name}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><Phone size={14}/></div>
                                <span className="text-sm font-medium text-gray-600">{req.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><Mail size={14}/></div>
                                <span className="text-sm font-medium text-gray-600 truncate">{req.email}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}