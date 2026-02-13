"use client";

import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface MessagesTabProps {
  messages: any[];
  refreshData: () => void;
}

export default function MessagesTab({ messages, refreshData }: MessagesTabProps) {

  const deleteMessage = async (id: number) => {
      if(!confirm("Delete this message?")) return;
      
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      
      if (error) {
          toast.error(`Delete Failed: ${error.message}`);
      } else {
          toast.success("Message deleted");
          refreshData();
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#1E1B18]">Inbox</h1>
            <span className="bg-aura-brown text-white text-xs px-2 py-1 rounded-full">{messages.length}</span>
        </div>

        {messages.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400">No messages found.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-aura-gold/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-aura-brown">{msg.subject}</h3>
                            <button onClick={() => deleteMessage(msg.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><X size={18}/></button>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">From: <span className="font-bold text-gray-600">{msg.name}</span> ({msg.email}) • {new Date(msg.created_at).toLocaleString()}</p>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed border border-gray-100">{msg.message}</p>
                        <a href={`mailto:${msg.email}`} className="inline-block mt-4 text-xs font-bold text-aura-gold hover:underline">REPLY VIA EMAIL</a>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}