"use client";

import Link from "next/link";
import { 
  LayoutGrid, ShoppingCart, DollarSign, FileText, 
  RotateCcw, MessageSquare, Calculator, Users, Home, LogOut 
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

  // ADDED 'calculator' TO THE ARRAY INSTEAD OF A HARDCODED BUTTON
  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: counts.orders, color: 'bg-red-500' },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'calculator', label: 'Pricing Calculator', icon: Calculator }, // <--- ADDED HERE
    { id: 'notes', label: 'Notebook & Data', icon: FileText },
    // Divider logic applies before Returns (Index 5 now)
    { id: 'returns', label: 'Returns', icon: RotateCcw, count: counts.returns, color: 'bg-blue-500' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: counts.messages, color: 'bg-purple-500' },
    { id: 'marketing', label: 'Marketing', icon: Users },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1B18] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col`}>
        
        {/* LOGO AREA */}
        <div className="p-8 border-b border-white/10 hidden md:block">
            <h2 className="text-2xl font-serif font-bold text-aura-gold">AURA-X</h2>
            <p className="text-xs text-white/50 tracking-widest uppercase">Admin Portal</p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1 mt-16 md:mt-0 overflow-y-auto">
            {menuItems.map((item, index) => (
                <div key={item.id}>
                    {/* Updated index to 5 because we added Calculator before it */}
                    {index === 5 && <div className="h-[1px] bg-white/10 my-4"></div>}
                    
                    <button 
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <item.icon size={20} /> 
                        <span>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                            <span className={`ml-auto ${item.color} text-white text-[10px] px-2 py-0.5 rounded-full`}>
                                {item.count}
                            </span>
                        )}
                    </button>
                </div>
            ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/10 bg-[#1E1B18]">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition w-full px-4 py-2 rounded-lg mb-2">
                <Home size={16}/> View Live Website
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-white/5 transition w-full px-4 py-2 rounded-lg">
                <LogOut size={16}/> Logout
            </button>
        </div>
      </aside>
    </>
  );
}