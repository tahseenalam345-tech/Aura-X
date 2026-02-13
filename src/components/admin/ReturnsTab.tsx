"use client";

import { supabase } from "@/lib/supabase";
import { Trash2, CheckCircle, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";

interface ReturnsTabProps {
  returnRequests: any[];
  refreshData: () => void;
}

export default function ReturnsTab({ returnRequests, refreshData }: ReturnsTabProps) {
  
  const deleteRequest = async (id: number) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      
      const { error } = await supabase.from('return_requests').delete().eq('id', id);
      
      if (error) {
          toast.error(`Delete Failed: ${error.message}`);
      } else {
          toast.success("Request deleted successfully");
          refreshData();
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
        <h1 className="text-3xl font-bold text-[#1E1B18] mb-6">Return Requests</h1>
        
        {returnRequests.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400">No return requests found.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {returnRequests.map((req) => (
                    <div key={req.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Order #{req.orderId}</h3>
                                <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()} • {req.reason}</p>
                            </div>
                            <button onClick={() => deleteRequest(req.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={18}/></button>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 border border-gray-100">
                            <p className="font-bold mb-1 text-xs text-gray-400 uppercase">Customer Note:</p>
                            "{req.details}"
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> {req.name}</div>
                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {req.phone}</div>
                            <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {req.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}