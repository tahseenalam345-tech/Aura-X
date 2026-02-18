"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; 
import { Menu, Loader2, Lock, ShieldAlert, ChevronRight } from "lucide-react";
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
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // --- SECURITY STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState("");
  const ADMIN_PIN = "7860"; // <--- YOUR SECRET PIN

  // --- DASHBOARD STATE ---
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // --- DATA STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<{launch: any[], newsletter: any[]}>({ launch: [], newsletter: [] });

  // Prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // --- 1. DATA FETCHING FUNCTIONS ---
  const fetchProducts = useCallback(async () => {
      const { data } = await supabase.from('products').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
      if (data) setProducts(data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }, []);

  const fetchSupportData = useCallback(async () => {
      const [returnsRes, messagesRes, launchRes, newsRes] = await Promise.all([
          supabase.from('return_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
          supabase.from('launch_notifications').select('*').order('created_at', { ascending: false }),
          supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
      ]);

      if (returnsRes.data) setReturnRequests(returnsRes.data);
      if (messagesRes.data) setContactMessages(messagesRes.data);
      setMarketingData({ 
          launch: launchRes.data || [], 
          newsletter: newsRes.data || [] 
      });
  }, []);

  // --- 2. MASTER FETCH FUNCTION ---
  const loadDashboardData = useCallback(async () => {
      setDataLoading(true);
      await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchSupportData()
      ]);
      setDataLoading(false);
  }, [fetchProducts, fetchOrders, fetchSupportData]);

  // --- 3. INITIAL LOAD & REALTIME ---
  useEffect(() => {
    if (isAuthenticated) {
        loadDashboardData();

        const channel = supabase
          .channel('realtime-orders')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
              setOrders((prev) => [payload.new, ...prev]);
              toast.success("New Order Received!", { duration: 5000, icon: '🎉' });
          })
          .subscribe();

        return () => { supabase.removeChannel(channel); };
    }
  }, [isAuthenticated, loadDashboardData]);

  if (!isMounted) return null;

  // --- SECURITY LOCK SCREEN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === ADMIN_PIN) {
      setIsAuthenticated(true);
    } else {
      setError("Access Denied: Invalid Credentials");
      setInputPin("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1E1B18] flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-900"></div>
          
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
            <Lock size={32} />
          </div>

          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Restricted Access</h1>
          <p className="text-gray-500 text-sm mb-8">This area is authorized for administrators only.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                placeholder="Enter Security PIN" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-center font-bold text-lg tracking-[0.5em] focus:outline-none focus:border-red-500 transition-colors"
                value={inputPin}
                onChange={(e) => { setInputPin(e.target.value); setError(""); }}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                <ShieldAlert size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#1E1B18] text-white py-4 rounded-xl font-bold tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              AUTHENTICATE <ChevronRight size={16} />
            </button>
          </form>
          
          <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest">System Secured • IP Logged</p>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  if (authLoading) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1B18] text-white gap-4">
            <Loader2 className="animate-spin text-aura-gold" size={40} />
            <p className="font-serif italic tracking-widest">Verifying Authority...</p>
        </div>
     );
  }

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
            <span className="font-serif font-bold text-aura-gold tracking-tighter">AURA-X ADMIN</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg"><Menu /></button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[100dvh] pt-20 md:pt-8 bg-gray-50">
            {dataLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">
                    <Loader2 className="animate-spin mr-2" /> Synchronizing Dashboard...
                </div>
            ) : (
                <>
                    {activeTab === 'inventory' && <InventoryTab products={products} fetchProducts={fetchProducts} />}
                    {activeTab === 'orders' && <OrdersTab orders={orders} fetchOrders={fetchOrders} />}
                    {activeTab === 'finance' && <FinanceTab orders={orders} products={products} />}
                    {activeTab === 'notes' && <NotebookTab />}
                    {activeTab === 'returns' && <ReturnsTab returnRequests={returnRequests} refreshData={fetchSupportData} />}
                    {activeTab === 'messages' && <MessagesTab messages={contactMessages} refreshData={fetchSupportData} />}
                    {activeTab === 'marketing' && <MarketingTab data={marketingData} />}
                </>
            )}
        </div>
    </div>
  );
}