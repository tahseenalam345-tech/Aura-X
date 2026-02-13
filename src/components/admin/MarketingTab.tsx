"use client";

import { Mail, Bell } from "lucide-react";

interface MarketingTabProps {
  data: {
      launch: any[];
      newsletter: any[];
  };
}

export default function MarketingTab({ data }: MarketingTabProps) {
  return (
    <div className="space-y-8 pb-20 animate-in fade-in">
        <h1 className="text-3xl font-bold text-[#1E1B18]">Marketing Data</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Newsletter Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                    <div className="bg-green-50 p-3 rounded-full text-green-600"><Mail size={24}/></div>
                    <div>
                        <h3 className="font-bold text-lg">Newsletter Subscribers</h3>
                        <p className="text-xs text-gray-400">Footer Signups</p>
                    </div>
                    <span className="ml-auto text-3xl font-bold text-gray-800">{data.newsletter.length}</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {data.newsletter.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No subscribers yet.</p> : 
                        data.newsletter.map((sub, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg text-sm border-b border-gray-50 last:border-0 transition-colors">
                                <span className="text-gray-700 font-medium">{sub.email}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{new Date(sub.created_at).toLocaleDateString()}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Eid Waitlist Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Bell size={24}/></div>
                    <div>
                        <h3 className="font-bold text-lg">Eid Collection Waitlist</h3>
                        <p className="text-xs text-gray-400">Locked Page Signups</p>
                    </div>
                    <span className="ml-auto text-3xl font-bold text-gray-800">{data.launch.length}</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {data.launch.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No waitlist signups yet.</p> : 
                        data.launch.map((sub, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg text-sm border-b border-gray-50 last:border-0 transition-colors">
                                <span className="text-gray-700 font-medium">{sub.email}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{new Date(sub.created_at).toLocaleDateString()}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    </div>
  );
}