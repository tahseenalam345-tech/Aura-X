"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- IMPORT COMPONENTS ---
import Sidebar from "@/components/admin/Sidebar";
import InventoryTab from "@/components/admin/InventoryTab";
import OrdersTab from "@/components/admin/OrdersTab";
import FinanceTab from "@/components/admin/FinanceTab";
import NotebookTab from "@/components/admin/NotebookTab";
import ReturnsTab from "@/components/admin/ReturnsTab";
import MessagesTab from "@/components/admin/MessagesTab";
import MarketingTab from "@/components/admin/MarketingTab";

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- DATA STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<{launch: any[], newsletter: any[]}>({ launch: [], newsletter: [] });

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
      if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchSupportData = async () => {
      const { data: returns } = await supabase.from('return_requests').select('*').order('created_at', { ascending: false });
      if(returns) setReturnRequests(returns);
      
      const { data: messages } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if(messages) setContactMessages(messages);
      
      const { data: launch } = await supabase.from('launch_notifications').select('*').order('created_at', { ascending: false });
      const { data: news } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      setMarketingData({ launch: launch || [], newsletter: news || [] });
  };

  // --- INITIAL LOAD & REALTIME ---
  useEffect(() => {
    // 1. Initial Fetch
    fetchProducts();
    fetchOrders();
    fetchSupportData();

    // 2. Realtime Order Listener
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          toast.success("New Order Received!", { duration: 5000, icon: '🎉' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- AUTH CHECK ---
  if (isLoading) {
     return <div className="min-h-screen flex items-center justify-center bg-[#1E1B18] text-white">Loading Admin Panel...</div>;
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">
        
        {/* SIDEBAR COMPONENT */}
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            counts={{
                orders: orders.filter(o => o.status === 'Processing').length,
                returns: returnRequests.length,
                messages: contactMessages.length
            }}
        />
        
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1E1B18] text-white flex items-center justify-between px-4 z-40 shadow-md">
            <span className="font-serif font-bold text-aura-gold">AURA-X ADMIN</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[100dvh] pt-20 md:pt-8 bg-gray-50">
            {activeTab === 'inventory' && <InventoryTab products={products} fetchProducts={fetchProducts} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} fetchOrders={fetchOrders} />}
            {activeTab === 'finance' && <FinanceTab orders={orders} products={products} />}
            {activeTab === 'notes' && <NotebookTab />}
            {activeTab === 'returns' && <ReturnsTab returnRequests={returnRequests} refreshData={fetchSupportData} />}
            {activeTab === 'messages' && <MessagesTab messages={contactMessages} refreshData={fetchSupportData} />}
            {activeTab === 'marketing' && <MarketingTab data={marketingData} />}
        </div>
    </div>
  );
}