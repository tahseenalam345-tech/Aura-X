"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, Plus, CheckCircle2, RotateCcw, Truck, DollarSign, 
  TrendingUp, Package, AlertCircle, PlusCircle, MapPin, 
  Calendar, Megaphone, Trash2, X 
} from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  order_id: string;
  date: string;
  status_date: string; 
  customer_name: string;
  city: string;
  product_name: string;
  sku: string;
  courier: string;
  status: "Pending" | "In Process" | "Dispatched" | "Delivered" | "Return" | "Cancel";
  payment_status: "Pending" | "Received";
  actual_price: number;
  sold_price: number;
  dc: number;
  extras: number;
  extra_note: string;
  notes: string;
  [key: string]: any; 
}

const COURIERS = ["None", "Leopard", "TCS", "BlueEx", "Trax", "M&P", "Postex"];

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-desc");
  
  const [globalAdsBudget, setGlobalAdsBudget] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "all" | "custom">("today");
  const [customDate, setCustomDate] = useState({ start: getToday(), end: getToday() });

  const calculateOrderFinances = (order: Order) => {
    const taxAmount = order.sold_price * 0.04;
    const afterTax = order.sold_price - taxAmount;
    const profit = order.sold_price - order.actual_price - order.dc - order.extras - taxAmount;
    return { taxAmount, afterTax, profit };
  };

  const handleEdit = (id: string, field: string, value: any) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        let updatedOrder = { ...o, [field]: value };
        if (field === 'status') {
            updatedOrder.status_date = getToday();
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to permanently delete this order?")) {
        setOrders(prev => prev.filter(o => o.id !== id));
        toast.success("Order deleted successfully.");
    }
  };

  const handleAddOrder = () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      order_id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: getToday(),
      status_date: getToday(),
      customer_name: "", city: "", product_name: "", sku: "", courier: "None",
      status: "Pending", payment_status: "Pending",
      actual_price: 0, sold_price: 0, dc: 300, extras: 0, extra_note: "", notes: ""
    };
    setOrders([newOrder, ...orders]);
    toast.success("New empty row added!");
  };

  const handleAddColumn = () => {
    const colName = prompt("Enter new column name:");
    if (colName && !customColumns.includes(colName)) {
      setCustomColumns([...customColumns, colName]);
      toast.success(`Column '${colName}' added!`);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o => 
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.sku.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name.toLowerCase().includes(search.toLowerCase())
    );

    if (dateFilter === "today") {
        filtered = filtered.filter(o => o.date === getToday());
    } else if (dateFilter === "yesterday") {
        filtered = filtered.filter(o => o.date === getYesterday());
    } else if (dateFilter === "custom") {
        filtered = filtered.filter(o => o.date >= customDate.start && o.date <= customDate.end);
    }

    if (activeTab !== "All") {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "profit-desc") return calculateOrderFinances(b).profit - calculateOrderFinances(a).profit;
      return 0;
    });
  }, [orders, search, activeTab, sortBy, dateFilter, customDate]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let grossProfit = 0;
    let returnLoss = 0;
    let deliveredCount = 0;

    filteredOrders.forEach(o => {
      const { profit } = calculateOrderFinances(o);
      if (o.status === "Delivered") {
        totalRevenue += o.sold_price;
        grossProfit += profit;
        deliveredCount++;
      }
      if (o.status === "Return") {
        returnLoss += (o.dc + o.extras); 
      }
    });

    const finalNetProfit = grossProfit - returnLoss - globalAdsBudget;
    const successRate = filteredOrders.length > 0 ? Math.round((deliveredCount / filteredOrders.length) * 100) : 0;

    return { totalRevenue, grossProfit, returnLoss, finalNetProfit, successRate, deliveredCount, totalOrders: filteredOrders.length };
  }, [filteredOrders, globalAdsBudget]);

  const courierStats = useMemo(() => {
      const stats: Record<string, { total: number, delivered: number, returned: number, totalDays: number }> = {};
      
      filteredOrders.forEach(o => {
          if (o.courier === "None") return;
          if (!stats[o.courier]) stats[o.courier] = { total: 0, delivered: 0, returned: 0, totalDays: 0 };
          
          stats[o.courier].total++;
          if (o.status === "Delivered") {
              stats[o.courier].delivered++;
              const d1 = new Date(o.date);
              const d2 = new Date(o.status_date);
              const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
              stats[o.courier].totalDays += diffDays;
          }
          if (o.status === "Return") stats[o.courier].returned++;
      });

      return Object.keys(stats).map(c => {
          const s = stats[c];
          return {
              name: c,
              avgDays: s.delivered > 0 ? (s.totalDays / s.delivered).toFixed(1) : 0,
              returnRate: s.total > 0 ? Math.round((s.returned / s.total) * 100) : 0
          };
      });
  }, [filteredOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-900 text-green-400 border-green-800";
      case "Return": return "bg-red-900 text-red-400 border-red-800";
      case "Cancel": return "bg-gray-800 text-gray-400 border-gray-700";
      case "Dispatched": return "bg-blue-900 text-blue-400 border-blue-800";
      case "In Process": return "bg-purple-900 text-purple-400 border-purple-800";
      default: return "bg-yellow-900 text-yellow-500 border-yellow-800"; 
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-2 md:p-6 font-sans text-gray-200 pb-24 w-full">
      
      {/* 🚀 GLOBAL ADS BUDGET WIDGET */}
      <div className="mb-6 bg-gradient-to-r from-[#1A1612] to-[#2A241D] rounded-xl p-4 md:p-6 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-aura-gold/20">
          <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-aura-gold"><Megaphone size={20}/> Global Ads Budget</h2>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">Total ad spend for the selected time period. Deducted from overall profit.</p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm border border-white/10 w-full md:w-auto">
              <span className="text-aura-gold font-bold pl-3 text-sm md:text-base">Rs</span>
              <input 
                  type="number" 
                  value={globalAdsBudget} 
                  onChange={(e) => setGlobalAdsBudget(Number(e.target.value))}
                  className="bg-transparent text-white font-black text-xl md:text-2xl outline-none w-full md:w-32 placeholder-white/30"
                  placeholder="0"
              />
          </div>
      </div>

      {/* Header & Date Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            <Package className="text-aura-gold" size={24}/> Order Management
          </h1>
        </div>

        {/* 🚀 DATE FILTERS */}
        <div className="flex items-center gap-1.5 px-2 border-l border-gray-700 w-full md:w-auto mt-2 md:mt-0 justify-center">
            <input type="date" value={customDate.start} onChange={(e) => {setCustomDate({...customDate, start: e.target.value}); setDateFilter("custom");}} className="text-[10px] font-bold bg-transparent text-gray-300 outline-none" />
            <span className="text-gray-500 text-[10px]">to</span>
            <input type="date" value={customDate.end} onChange={(e) => {setCustomDate({...customDate, end: e.target.value}); setDateFilter("custom");}} className="text-[10px] font-bold bg-transparent text-gray-300 outline-none" />
            {dateFilter === "custom" && (
                <button onClick={() => { setDateFilter("today"); setCustomDate({ start: getToday(), end: getToday() }); }} className="ml-1 text-red-500 hover:text-red-400" title="Clear Date Filter">
                    <X size={14}/>
                </button>
            )}
        </div>
      </div>

      {/* Top Controls: Search & Add */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-3">
          <div className="relative w-full md:flex-1 md:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input 
              type="text" placeholder="Search customer, SKU, Order ID..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#1E1E1E] border border-gray-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-aura-gold"
            />
          </div>
          <button onClick={handleAddOrder} className="bg-aura-gold hover:bg-yellow-600 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all w-full md:w-auto">
            <Plus size={18}/> Add Order
          </button>
      </div>

      {/* Stats Cards - Now completely Dark Mode */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-green-900/50 text-green-500 rounded-lg"><DollarSign size={16}/></div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Revenue</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Rs {stats.totalRevenue.toLocaleString()}</h3>
        </div>
        
        <div className={`bg-[#1E1E1E] p-4 rounded-xl border ${stats.finalNetProfit >= 0 ? 'border-aura-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-red-900/50'} relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-xl ${stats.finalNetProfit >= 0 ? 'bg-aura-gold/10' : 'bg-red-500/10'}`}></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-1.5 bg-gray-800 text-gray-300 rounded-lg"><TrendingUp size={16}/></div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Net Profit</span>
          </div>
          <h3 className={`text-xl md:text-2xl font-black relative z-10 ${stats.finalNetProfit >= 0 ? 'text-aura-gold drop-shadow-sm' : 'text-red-500'}`}>Rs {stats.finalNetProfit.toLocaleString()}</h3>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-red-900/50 text-red-500 rounded-lg"><RotateCcw size={16}/></div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Return Loss</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-red-500">Rs {stats.returnLoss.toLocaleString()}</h3>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-blue-900/50 text-blue-500 rounded-lg"><Package size={16}/></div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Handled</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">{stats.totalOrders}</h3>
        </div>

        <div className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-purple-900/50 text-purple-500 rounded-lg"><CheckCircle2 size={16}/></div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Success</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">{stats.successRate}%</h3>
        </div>
      </div>

      {/* Tabs & Table Tools */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
        <div className="flex bg-[#1E1E1E] border border-gray-800 rounded-lg p-1 overflow-x-auto w-full md:w-auto">
          {["All", "Pending", "In Process", "Dispatched", "Delivered", "Return", "Cancel"].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-md whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gray-800 text-aura-gold' : 'text-gray-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <button onClick={handleAddColumn} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs font-bold bg-[#1E1E1E] border border-gray-800 px-3 py-2 rounded-lg text-white hover:border-aura-gold transition-colors">
              <PlusCircle size={14} className="text-aura-gold"/> Add Column
           </button>
           <select className="flex-1 md:flex-none bg-[#1E1E1E] border border-gray-800 text-white text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Sort by Newest</option>
              <option value="profit-desc">Sort by Highest Profit</option>
           </select>
        </div>
      </div>

      {/* THE MASTER TABLE - MOBILE RESPONSIVE SCROLL */}
      <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-lg">
        <div className="overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="bg-[#252525] border-b border-gray-800">
              <tr>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-32">Order Date</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-32">Status Date</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-24">Order ID</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-48">Customer & City</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-48">Product & SKU</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-32">Courier</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-36">Status</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-32">Pymt Status</th>
                <th className="p-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-red-900/20 border-r border-red-900/30 w-32">Actual Cost</th>
                <th className="p-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-yellow-900/20 border-r border-yellow-900/30 w-40">DC + Extras</th>
                <th className="p-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-green-900/20 border-r border-green-900/30 w-32">Sold Price</th>
                <th className="p-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-800 border-r border-gray-700 w-32">4% Tax Calc</th>
                <th className="p-3 text-[10px] font-bold text-aura-gold uppercase tracking-widest bg-aura-gold/5 border-r border-aura-gold/10 w-36">Net Profit</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-40">Notes</th>
                <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-800 w-16 text-center">DEL</th>
                {customColumns.map(col => (
                  <th key={col} className="p-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-r border-gray-800 w-32">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.map(order => {
                const { taxAmount, afterTax, profit } = calculateOrderFinances(order);
                const isDelivered = order.status === "Delivered";

                return (
                  <tr key={order.id} className="hover:bg-gray-800/50 transition-colors group">
                    
                    {/* Order Date */}
                    <td className="p-3 border-r border-gray-800">
                      <input type="date" value={order.date} onChange={(e) => handleEdit(order.id, 'date', e.target.value)} className="bg-transparent text-[11px] font-bold text-gray-300 outline-none w-full border-b border-transparent focus:border-aura-gold color-scheme-dark" />
                    </td>

                    {/* Status Date */}
                    <td className="p-3 border-r border-gray-800 bg-gray-800/30">
                      <input type="date" value={order.status_date} onChange={(e) => handleEdit(order.id, 'status_date', e.target.value)} className="bg-transparent text-[11px] font-bold text-blue-400 outline-none w-full border-b border-transparent focus:border-blue-500 color-scheme-dark" />
                    </td>
                    
                    {/* Order ID */}
                    <td className="p-3 border-r border-gray-800">
                      <input type="text" value={order.order_id} onChange={(e) => handleEdit(order.id, 'order_id', e.target.value)} className="bg-transparent text-xs font-bold text-gray-200 outline-none w-full border-b border-transparent focus:border-aura-gold uppercase" />
                    </td>

                    {/* Customer & City */}
                    <td className="p-3 border-r border-gray-800">
                      <input type="text" placeholder="Name" value={order.customer_name} onChange={(e) => handleEdit(order.id, 'customer_name', e.target.value)} className="bg-transparent text-sm font-bold text-white outline-none w-full mb-1 border-b border-dashed border-gray-700 focus:border-solid focus:border-aura-gold transition-colors" />
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin size={10} />
                        <input type="text" placeholder="City" value={order.city} onChange={(e) => handleEdit(order.id, 'city', e.target.value)} className="bg-transparent outline-none w-full border-b border-transparent focus:border-aura-gold" />
                      </div>
                    </td>

                    {/* Product & SKU */}
                    <td className="p-3 border-r border-gray-800">
                       <input type="text" placeholder="Product" value={order.product_name} onChange={(e) => handleEdit(order.id, 'product_name', e.target.value)} className="bg-transparent text-xs font-bold text-gray-200 outline-none w-full mb-1 border-b border-dashed border-gray-700 focus:border-solid focus:border-aura-gold transition-colors" />
                       <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono bg-gray-800 px-1.5 py-0.5 rounded w-fit">
                          <input type="text" placeholder="SKU" value={order.sku} onChange={(e) => handleEdit(order.id, 'sku', e.target.value)} className="bg-transparent outline-none w-16 uppercase border-b border-transparent focus:border-aura-gold" />
                       </div>
                    </td>

                    {/* Courier Dropdown */}
                    <td className="p-3 border-r border-gray-800">
                      <select 
                        value={order.courier} onChange={(e) => handleEdit(order.id, 'courier', e.target.value)}
                        className={`text-[10px] font-bold px-1.5 py-1.5 w-full rounded border outline-none cursor-pointer ${order.courier !== 'None' ? 'bg-blue-900/50 border-blue-800 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                      >
                        {COURIERS.map(c => <option key={c} value={c} className="bg-[#1E1E1E]">{c}</option>)}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="p-3 border-r border-gray-800">
                      <select 
                        value={order.status} onChange={(e) => handleEdit(order.id, 'status', e.target.value)}
                        className={`text-[10px] font-bold px-2 w-full py-1.5 rounded-lg border outline-none cursor-pointer text-center shadow-sm ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending" className="bg-[#1E1E1E]">Pending</option>
                        <option value="In Process" className="bg-[#1E1E1E]">In Process</option>
                        <option value="Dispatched" className="bg-[#1E1E1E]">Dispatched</option>
                        <option value="Delivered" className="bg-[#1E1E1E]">Delivered</option>
                        <option value="Return" className="bg-[#1E1E1E]">Return</option>
                        <option value="Cancel" className="bg-[#1E1E1E]">Cancel</option>
                      </select>
                    </td>

                    {/* Payment Status */}
                    <td className="p-3 border-r border-gray-800">
                      <select 
                        value={order.payment_status} onChange={(e) => handleEdit(order.id, 'payment_status', e.target.value)}
                        className={`text-[9px] font-bold px-1.5 w-full py-1.5 rounded border outline-none cursor-pointer uppercase tracking-wider text-center ${order.payment_status === 'Received' ? 'bg-green-900/50 border-green-800 text-green-400' : 'bg-orange-900/50 border-orange-800 text-orange-400'}`}
                      >
                        <option value="Pending" className="bg-[#1E1E1E]">Pending</option>
                        <option value="Received" className="bg-[#1E1E1E]">Received</option>
                      </select>
                    </td>

                    {/* Actual Cost */}
                    <td className="p-3 bg-red-900/10 border-r border-red-900/20">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-300">
                        <span className="text-[9px] text-gray-500">Rs</span>
                        <input type="number" value={order.actual_price || ""} onChange={(e) => handleEdit(order.id, 'actual_price', Number(e.target.value))} className="bg-transparent outline-none w-full border-b border-dashed border-gray-700 focus:border-solid focus:border-red-500" />
                      </div>
                    </td>

                    {/* DC & Extras */}
                    <td className="p-3 bg-yellow-900/10 border-r border-yellow-900/20">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px] border-b border-gray-800 pb-1">
                          <span className="text-gray-500 font-bold">DC:</span>
                          <input type="number" value={order.dc || ""} onChange={(e) => handleEdit(order.id, 'dc', Number(e.target.value))} className="bg-transparent outline-none w-12 text-right font-bold text-gray-300 border-b border-transparent focus:border-yellow-600" />
                        </div>
                        <div className="flex flex-col gap-1 bg-gray-800/50 p-1.5 rounded border border-gray-700">
                           <div className="flex items-center justify-between text-[10px]">
                             <span className="text-gray-400 font-bold">Ext:</span>
                             <input type="number" value={order.extras || ""} onChange={(e) => handleEdit(order.id, 'extras', Number(e.target.value))} className="bg-transparent outline-none w-12 text-right font-bold text-gray-300 border-b border-dashed border-gray-600 focus:border-solid focus:border-yellow-500" />
                           </div>
                           <input type="text" placeholder="Note (Ads...)" value={order.extra_note} onChange={(e) => handleEdit(order.id, 'extra_note', e.target.value)} className="bg-[#1E1E1E] border border-gray-700 rounded px-1.5 py-1 text-[8px] w-full outline-none focus:border-aura-gold text-gray-400" />
                        </div>
                      </div>
                    </td>

                    {/* Sold Price */}
                    <td className="p-3 bg-green-900/10 border-r border-green-900/20">
                      <div className="flex items-center gap-1 text-sm font-black text-green-400">
                        <span className="text-[9px] text-green-600 font-bold">Rs</span>
                        <input type="number" value={order.sold_price || ""} onChange={(e) => handleEdit(order.id, 'sold_price', Number(e.target.value))} className="bg-transparent outline-none w-full border-b border-dashed border-green-800 focus:border-solid focus:border-green-500" />
                      </div>
                    </td>

                    {/* 4% Tax Logic */}
                    <td className="p-3 bg-gray-800/50 border-r border-gray-700">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-red-400 font-bold">-4% Tax:</span>
                          <span className="font-mono bg-red-900/50 text-red-300 px-1 rounded">-Rs {Math.round(taxAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-gray-700 mt-1">
                          <span className="text-gray-400 font-bold">Rem:</span>
                          <span className="font-mono text-gray-200 font-bold">Rs {Math.round(afterTax).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Auto Profit */}
                    <td className="p-3 bg-aura-gold/5 border-r border-aura-gold/10 relative">
                      {order.status === "Return" && (
                        <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center backdrop-blur-[1px] z-10">
                          <span className="text-red-200 font-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-red-950 rounded shadow-sm border border-red-800 flex items-center gap-1">
                             Loss
                          </span>
                        </div>
                      )}
                      <div className={`text-sm font-black flex items-center gap-1 ${profit > 0 ? 'text-aura-gold' : 'text-red-400'}`}>
                        <span className="text-[9px]">Rs</span> {Math.round(profit).toLocaleString()}
                      </div>
                      {!isDelivered && order.status !== "Return" && <span className="text-[7px] text-orange-400 font-bold uppercase tracking-wider block mt-1 bg-orange-900/30 w-fit px-1 rounded">(Unrealized)</span>}
                    </td>

                    {/* Notes */}
                    <td className="p-3 border-r border-gray-800">
                      <textarea 
                        value={order.notes} onChange={(e) => handleEdit(order.id, 'notes', e.target.value)} 
                        placeholder="Notes..."
                        className="bg-transparent border border-dashed border-gray-700 focus:border-solid focus:border-aura-gold focus:bg-[#252525] rounded p-1.5 text-[10px] outline-none w-full h-12 resize-none transition-all text-gray-300"
                      />
                    </td>
                    
                    {/* Delete Row Button */}
                    <td className="p-3 border-r border-gray-800 text-center">
                        <button onClick={() => handleDelete(order.id)} className="p-1.5 text-gray-500 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 size={14}/>
                        </button>
                    </td>

                    {/* Dynamic Custom Columns */}
                    {customColumns.map(col => (
                      <td key={col} className="p-3 border-r border-gray-800">
                        <input type="text" placeholder="..." value={order[col] || ""} onChange={(e) => handleEdit(order.id, col, e.target.value)} className="bg-transparent border-b border-dashed border-gray-700 text-[10px] w-full outline-none focus:border-blue-500 focus:border-solid text-gray-300 p-1" />
                      </td>
                    ))}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500 font-serif bg-[#1E1E1E]">
            <Search size={36} className="mx-auto mb-3 opacity-30 text-aura-gold" />
            <p className="text-lg font-bold text-white mb-1">No orders found.</p>
            <p className="text-xs">Try changing the date filter or search keyword.</p>
          </div>
        )}
      </div>

      {/* 🚀 COURIER ANALYTICS DASHBOARD - MOVED TO BOTTOM */}
      {courierStats.length > 0 && (
          <div className="bg-[#1E1E1E] border border-gray-800 shadow-sm rounded-xl p-4 md:p-6 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2"><Truck size={16} className="text-aura-gold"/> Courier Analytics (Current Filter)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {courierStats.map((cs, i) => (
                      <div key={i} className="bg-[#252525] border border-gray-800 rounded-xl p-4">
                          <h4 className="font-bold text-base text-blue-400 mb-3">{cs.name}</h4>
                          <div className="space-y-4">
                              <div>
                                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                                      <span>Avg Delivery</span>
                                      <span className="text-gray-200">{cs.avgDays} Days</span>
                                  </div>
                                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${Number(cs.avgDays) > 4 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(Number(cs.avgDays) * 10, 100)}%` }}></div>
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                                      <span>Return Rate</span>
                                      <span className={cs.returnRate > 20 ? 'text-red-400' : 'text-green-400'}>{cs.returnRate}%</span>
                                  </div>
                                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${cs.returnRate > 20 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${cs.returnRate}%` }}></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Global Style overrides for dark mode scrollbar inside the table only */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1E1E1E; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
      `}} />
    </div>
  );
}