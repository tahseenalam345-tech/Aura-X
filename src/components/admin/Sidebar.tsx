"use client";

import Link from "next/link";
import { 
  LayoutGrid, ShoppingCart, DollarSign, FileText, 
  RotateCcw, MessageSquare, Calculator, Users, Home, LogOut, BookOpen, ShieldCheck 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  counts: {
    orders: number;
    returns: number;
    messages: number;
  };
}

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, counts }: SidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: counts.orders, color: 'bg-red-500 shadow-lg shadow-red-500/20' },
    { id: 'finance', label: 'Finance Hub', icon: DollarSign },
    { id: 'records', label: 'Financial Records', icon: BookOpen }, 
    { id: 'calculator', label: 'Pricing Engine', icon: Calculator }, 
    { id: 'notes', label: 'Managerial Notes', icon: FileText },
    // Divider will be drawn after index 5 (notes)
    { id: 'returns', label: 'Returns Lab', icon: RotateCcw, count: counts.returns, color: 'bg-blue-500 shadow-lg shadow-blue-500/20' },
    { id: 'messages', label: 'Customer Inbox', icon: MessageSquare, count: counts.messages, color: 'bg-purple-500 shadow-lg shadow-purple-500/20' },
    { id: 'marketing', label: 'Marketing Vault', icon: Users },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F0D0C] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col border-r border-white/5`}>
        
        {/* LOGO AREA */}
        <div className="p-8 flex flex-col items-center justify-center border-b border-white/5 hidden md:flex">
            <h2 className="text-2xl font-serif font-bold text-aura-gold tracking-[0.2em]">AURA-X</h2>
            <div className="flex items-center gap-1.5 mt-1 opacity-50">
                <ShieldCheck size={10} className="text-aura-gold"/>
                <p className="text-[10px] font-bold tracking-widest uppercase">Command Center</p>
            </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1.5 mt-20 md:mt-4 overflow-y-auto custom-scrollbar">
            {menuItems.map((item, index) => (
                <div key={item.id}>
                    {/* Draw dividing line after index 5 (Notes) */}
                    {index === 6 && (
                        <div className="relative h-10 flex items-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <span className="relative bg-[#0F0D0C] pr-2 text-[9px] font-black text-white/20 uppercase tracking-widest">Support & Growth</span>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                            activeTab === item.id 
                            ? 'bg-aura-gold text-[#0F0D0C] font-black shadow-xl shadow-aura-gold/10' 
                            : 'text-white/40 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} className={activeTab === item.id ? 'text-[#0F0D0C]' : 'group-hover:scale-110 transition-transform'} /> 
                        <span className="text-xs uppercase tracking-widest">{item.label}</span>
                        
                        {item.count !== undefined && item.count > 0 && (
                            <span className={`ml-auto ${item.color} text-white text-[9px] font-black px-2 py-0.5 rounded-md`}>
                                {item.count}
                            </span>
                        )}
                    </button>
                </div>
            ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/5 bg-[#0F0D0C]/50">
            <Link href="/" target="_blank" className="flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/5 transition-all w-full px-4 py-3 rounded-xl mb-2 text-xs font-bold tracking-widest">
                <Home size={14}/> LIVE STOREFRONT
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all w-full px-4 py-3 rounded-xl text-xs font-bold tracking-widest">
                <LogOut size={14}/> SYSTEM EXIT
            </button>
        </div>
      </aside>
    </>
  );
}