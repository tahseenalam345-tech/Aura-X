"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Plus, Filter, Download, ArrowUpDown, CheckCircle2, XCircle, 
  Clock, RotateCcw, Truck, DollarSign, TrendingUp, Package, AlertCircle, PlusCircle, MapPin, Calendar, Megaphone
} from "lucide-react";
import toast from "react-hot-toast";

// Types
interface Order {
  id: string;
  order_id: string;
  date: string;
  status_date: string; // Auto updates when status changes
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

// Utility to get today's date in YYYY-MM-DD
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
  
  // New States for Advanced Logic
  const [globalAdsBudget, setGlobalAdsBudget] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "all" | "custom">("today");
  const [customDate, setCustomDate] = useState({ start: getToday(), end: getToday() });

  // Calculations for a single order
  const calculateOrderFinances = (order: Order) => {
    const taxAmount = order.sold_price * 0.04;
    const afterTax = order.sold_price - taxAmount;
    const profit = order.sold_price - order.actual_price - order.dc - order.extras - taxAmount;
    return { taxAmount, afterTax, profit };
  };

  // Handle Inline Edits & Auto Date Update
  const handleEdit = (id: string, field: string, value: any) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        let updatedOrder = { ...o, [field]: value };
        // Auto update status date if status changes
        if (field === 'status') {
            updatedOrder.status_date = getToday();
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  // Add New Order
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

  // Add Custom Column
  const handleAddColumn = () => {
    const colName = prompt("Enter new column name:");
    if (colName && !customColumns.includes(colName)) {
      setCustomColumns([...customColumns, colName]);
      toast.success(`Column '${colName}' added!`);
    }
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o => 
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.sku.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name.toLowerCase().includes(search.toLowerCase())
    );

    // Apply Date Filter based on Order Date
    if (dateFilter === "today") {
        filtered = filtered.filter(o => o.date === getToday());
    } else if (dateFilter === "yesterday") {
        filtered = filtered.filter(o => o.date === getYesterday());
    } else if (dateFilter === "custom") {
        filtered = filtered.filter(o => o.date >= customDate.start && o.date <= customDate.end);
    }

    // Apply Status Filter
    if (activeTab !== "All") {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "profit-desc") return calculateOrderFinances(b).profit - calculateOrderFinances(a).profit;
      return 0;
    });
  }, [orders, search, activeTab, sortBy, dateFilter, customDate]);

  // Dashboard Stats Calculations
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
        returnLoss += (o.dc + o.extras); // Loss calculation
      }
    });

    // Final Net Profit minus global ads and returns
    const finalNetProfit = grossProfit - returnLoss - globalAdsBudget;
    const successRate = filteredOrders.length > 0 ? Math.round((deliveredCount / filteredOrders.length) * 100) : 0;

    return { totalRevenue, grossProfit, returnLoss, finalNetProfit, successRate, deliveredCount, totalOrders: filteredOrders.length };
  }, [filteredOrders, globalAdsBudget]);

  // Courier Analytics Calculations
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

  // Status Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Return": return "bg-red-100 text-red-700 border-red-200";
      case "Cancel": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Dispatched": return "bg-blue-100 text-blue-700 border-blue-200";
      case "In Process": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Pending
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-serif text-aura-brown pb-24">
      
      {/* 🚀 GLOBAL ADS BUDGET WIDGET */}
      <div className="mb-6 bg-gradient-to-r from-[#1A1612] to-[#2A241D] rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Megaphone className="text-aura-gold"/> Global Ads Budget</h2>
              <p className="text-xs text-gray-400 mt-1">Total ad spend for the selected time period. Deducted from overall profit.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
              <span className="text-aura-gold font-bold pl-3">Rs</span>
              <input 
                  type="number" 
                  value={globalAdsBudget} 
                  onChange={(e) => setGlobalAdsBudget(Number(e.target.value))}
                  className="bg-transparent text-white font-black text-2xl outline-none w-32 md:w-48 placeholder-white/30"
                  placeholder="0"
              />
          </div>
      </div>

      {/* Header & Date Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Package className="text-aura-gold" size={28}/> Order Management
          </h1>
        </div>

        {/* 🚀 DATE FILTERS */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button onClick={() => setDateFilter("today")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter === 'today' ? 'bg-aura-brown text-white' : 'hover:bg-gray-100 text-gray-600'}`}>Today</button>
            <button onClick={() => setDateFilter("yesterday")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter === 'yesterday' ? 'bg-aura-brown text-white' : 'hover:bg-gray-100 text-gray-600'}`}>Yesterday</button>
            <button onClick={() => setDateFilter("all")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateFilter === 'all' ? 'bg-aura-brown text-white' : 'hover:bg-gray-100 text-gray-600'}`}>All Time</button>
            <div className="flex items-center gap-2 px-2 border-l border-gray-200">
                <input type="date" value={customDate.start} onChange={(e) => {setCustomDate({...customDate, start: e.target.value}); setDateFilter("custom");}} className="text-xs font-bold text-gray-600 outline-none" />
                <span className="text-gray-400 text-[10px]">to</span>
                <input type="date" value={customDate.end} onChange={(e) => {setCustomDate({...customDate, end: e.target.value}); setDateFilter("custom");}} className="text-xs font-bold text-gray-600 outline-none" />
            </div>
        </div>
      </div>

      {/* Top Controls: Search & Add */}
      <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 md:w-96 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input 
              type="text" placeholder="Search customer, SKU, Order ID..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-aura-gold shadow-sm"
            />
          </div>
          <button onClick={handleAddOrder} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all">
            <Plus size={18}/> Add Order
          </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <h3 className="text-2xl font-black">Rs {stats.totalRevenue.toLocaleString()}</h3>
        </div>
        
        <div className={`bg-white p-5 rounded-xl border ${stats.finalNetProfit >= 0 ? 'border-aura-gold/50 shadow-md' : 'border-red-300'} relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl ${stats.finalNetProfit >= 0 ? 'bg-aura-gold/10' : 'bg-red-500/10'}`}></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-2 bg-gray-50 text-gray-700 rounded-lg"><TrendingUp size={20}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Net Profit</span>
          </div>
          <h3 className={`text-2xl font-black drop-shadow-sm relative z-10 ${stats.finalNetProfit >= 0 ? 'text-aura-gold' : 'text-red-600'}`}>Rs {stats.finalNetProfit.toLocaleString()}</h3>
          <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold relative z-10">After Returns & Ads</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><RotateCcw size={20}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Loss</span>
          </div>
          <h3 className="text-2xl font-black text-red-500">Rs {stats.returnLoss.toLocaleString()}</h3>
          <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">DC + Extras wasted</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Package size={20}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders Handled</span>
          </div>
          <h3 className="text-2xl font-black">{stats.totalOrders}</h3>
          <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Filtered Period</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><CheckCircle2 size={20}/></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Success Rate</span>
          </div>
          <h3 className="text-2xl font-black">{stats.successRate}%</h3>
          <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{stats.deliveredCount} Delivered</p>
        </div>
      </div>

      {/* 🚀 COURIER ANALYTICS DASHBOARD */}
      {courierStats.length > 0 && (
          <div className="mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-aura-brown mb-4 flex items-center gap-2"><Truck size={16} className="text-aura-gold"/> Courier Analytics (Selected Date Range)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {courierStats.map((cs, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h4 className="font-bold text-lg text-blue-800 mb-3">{cs.name}</h4>
                          <div className="space-y-4">
                              <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                      <span>Avg Delivery Time</span>
                                      <span>{cs.avgDays} Days</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${Number(cs.avgDays) > 4 ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${Math.min(Number(cs.avgDays) * 10, 100)}%` }}></div>
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                      <span>Return Rate</span>
                                      <span className={cs.returnRate > 20 ? 'text-red-500' : 'text-green-500'}>{cs.returnRate}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${cs.returnRate > 20 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${cs.returnRate}%` }}></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Tabs & Table Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
          {["All", "Pending", "In Process", "Dispatched", "Delivered", "Return", "Cancel"].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gray-100 text-aura-brown shadow-sm' : 'text-gray-500 hover:text-aura-brown'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={handleAddColumn} className="flex items-center gap-2 text-xs font-bold bg-white border border-gray-200 px-3 py-2 rounded-lg hover:border-aura-gold transition-colors shadow-sm">
              <PlusCircle size={14} className="text-aura-gold"/> Add Column
           </button>
           <select className="bg-white border border-gray-200 text-xs font-bold px-3 py-2 rounded-lg outline-none shadow-sm cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Sort by Newest</option>
              <option value="profit-desc">Sort by Highest Profit</option>
           </select>
        </div>
      </div>

      {/* The Master Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[2200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-32">Order Date</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-32">Status Date</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-24">Order ID</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-48">Customer & City</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-48">Product & SKU</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-32">Courier</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-36">Status</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-32">Pymt Status</th>
                <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-red-50/50 border-r border-red-100 w-32">Actual Cost</th>
                <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-yellow-50/50 border-r border-yellow-100 w-40">DC + Extras</th>
                <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-green-50/50 border-r border-green-100 w-32">Sold Price</th>
                <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-100 border-r border-gray-200 w-32">4% Tax Calc</th>
                <th className="p-4 text-[10px] font-bold text-aura-gold uppercase tracking-widest bg-aura-gold/10 border-r border-aura-gold/20 w-36">Net Profit</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 w-40">Notes</th>
                {customColumns.map(col => (
                  <th key={col} className="p-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest border-r border-gray-100 w-32">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const { taxAmount, afterTax, profit } = calculateOrderFinances(order);
                const isDelivered = order.status === "Delivered";

                return (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                    {/* Order Date */}
                    <td className="p-4 border-r border-gray-50">
                      <input type="date" value={order.date} onChange={(e) => handleEdit(order.id, 'date', e.target.value)} className="bg-transparent text-xs font-bold text-gray-700 outline-none w-full border-b border-transparent hover:border-gray-300 focus:border-aura-gold" />
                    </td>

                    {/* Auto Status Update Date */}
                    <td className="p-4 border-r border-gray-50 bg-gray-50/50">
                      <input type="date" value={order.status_date} onChange={(e) => handleEdit(order.id, 'status_date', e.target.value)} className="bg-transparent text-xs font-bold text-blue-600 outline-none w-full border-b border-transparent hover:border-blue-300 focus:border-blue-500" />
                    </td>
                    
                    {/* Order ID */}
                    <td className="p-4 border-r border-gray-50">
                      <input type="text" value={order.order_id} onChange={(e) => handleEdit(order.id, 'order_id', e.target.value)} className="bg-transparent text-xs font-bold text-gray-800 outline-none w-full border-b border-transparent hover:border-gray-300 focus:border-aura-gold uppercase" />
                    </td>

                    {/* Customer & City */}
                    <td className="p-4 border-r border-gray-50">
                      <input type="text" placeholder="Name" value={order.customer_name} onChange={(e) => handleEdit(order.id, 'customer_name', e.target.value)} className="bg-transparent text-sm font-bold text-gray-800 outline-none w-full mb-1 border-b border-dashed border-gray-300 hover:border-solid hover:border-gray-400 focus:border-solid focus:border-aura-gold transition-colors" />
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin size={10} />
                        <input type="text" placeholder="City" value={order.city} onChange={(e) => handleEdit(order.id, 'city', e.target.value)} className="bg-transparent outline-none w-full border-b border-transparent hover:border-gray-300 focus:border-aura-gold" />
                      </div>
                    </td>

                    {/* Product & SKU */}
                    <td className="p-4 border-r border-gray-50">
                       <input type="text" placeholder="Product" value={order.product_name} onChange={(e) => handleEdit(order.id, 'product_name', e.target.value)} className="bg-transparent text-sm font-bold text-gray-800 outline-none w-full mb-1 border-b border-dashed border-gray-300 hover:border-solid hover:border-gray-400 focus:border-solid focus:border-aura-gold transition-colors" />
                       <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                          <input type="text" placeholder="SKU" value={order.sku} onChange={(e) => handleEdit(order.id, 'sku', e.target.value)} className="bg-transparent outline-none w-16 uppercase border-b border-transparent hover:border-gray-400 focus:border-aura-gold" />
                       </div>
                    </td>

                    {/* Courier Dropdown */}
                    <td className="p-4 border-r border-gray-50">
                      <select 
                        value={order.courier} onChange={(e) => handleEdit(order.id, 'courier', e.target.value)}
                        className={`text-xs font-bold px-2 py-1.5 w-full rounded border outline-none cursor-pointer ${order.courier !== 'None' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                      >
                        {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="p-4 border-r border-gray-50">
                      <select 
                        value={order.status} onChange={(e) => handleEdit(order.id, 'status', e.target.value)}
                        className={`text-xs font-bold px-3 w-full py-1.5 rounded-full border outline-none cursor-pointer appearance-none text-center shadow-sm ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Process">In Process</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Return">Return</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </td>

                    {/* Payment Status */}
                    <td className="p-4 border-r border-gray-50">
                      <select 
                        value={order.payment_status} onChange={(e) => handleEdit(order.id, 'payment_status', e.target.value)}
                        className={`text-[10px] font-bold px-2 w-full py-1 rounded border outline-none cursor-pointer uppercase tracking-wider text-center ${order.payment_status === 'Received' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-orange-50 border-orange-300 text-orange-700'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                      </select>
                    </td>

                    {/* Actual Cost */}
                    <td className="p-4 bg-red-50/30 border-r border-red-50 hover:bg-red-50/50 transition-colors">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                        <span className="text-[10px] text-gray-400">Rs</span>
                        <input type="number" value={order.actual_price || ""} onChange={(e) => handleEdit(order.id, 'actual_price', Number(e.target.value))} className="bg-transparent outline-none w-full border-b border-dashed border-gray-300 hover:border-solid hover:border-gray-500 focus:border-solid focus:border-red-500" />
                      </div>
                    </td>

                    {/* DC & Extras */}
                    <td className="p-4 bg-yellow-50/30 border-r border-yellow-50">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs border-b border-yellow-200/50 pb-1 hover:bg-yellow-100/50 p-1 rounded transition-colors">
                          <span className="text-gray-500 font-bold">DC:</span>
                          <input type="number" value={order.dc || ""} onChange={(e) => handleEdit(order.id, 'dc', Number(e.target.value))} className="bg-transparent outline-none w-16 text-right font-bold border-b border-transparent hover:border-gray-400 focus:border-yellow-600" />
                        </div>
                        <div className="flex flex-col gap-1 bg-white p-1.5 rounded border border-yellow-100 shadow-sm">
                           <div className="flex items-center justify-between text-xs">
                             <span className="text-gray-500 font-bold">Extras:</span>
                             <input type="number" value={order.extras || ""} onChange={(e) => handleEdit(order.id, 'extras', Number(e.target.value))} className="bg-transparent outline-none w-16 text-right font-bold border-b border-dashed border-gray-300 hover:border-solid hover:border-gray-500 focus:border-solid focus:border-yellow-600" />
                           </div>
                           <input type="text" placeholder="Note (Ads, Packing...)" value={order.extra_note} onChange={(e) => handleEdit(order.id, 'extra_note', e.target.value)} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[9px] w-full outline-none focus:border-aura-gold focus:bg-white text-gray-600" />
                        </div>
                      </div>
                    </td>

                    {/* Sold Price */}
                    <td className="p-4 bg-green-50/30 border-r border-green-50 hover:bg-green-50/60 transition-colors">
                      <div className="flex items-center gap-1 text-sm font-black text-green-700">
                        <span className="text-[10px] text-green-600 font-bold">Rs</span>
                        <input type="number" value={order.sold_price || ""} onChange={(e) => handleEdit(order.id, 'sold_price', Number(e.target.value))} className="bg-transparent outline-none w-full border-b border-dashed border-green-300 hover:border-solid hover:border-green-500 focus:border-solid focus:border-green-700" />
                      </div>
                    </td>

                    {/* 4% Tax Logic */}
                    <td className="p-4 bg-gray-50 border-r border-gray-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-red-500 font-bold">-4% Tax:</span>
                          <span className="font-mono bg-red-100 text-red-600 px-1 rounded">-Rs {Math.round(taxAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-200 mt-1">
                          <span className="text-gray-600 font-bold">Remaining:</span>
                          <span className="font-mono text-gray-800 font-bold">Rs {Math.round(afterTax).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Auto Profit */}
                    <td className="p-4 bg-aura-gold/10 border-r border-aura-gold/20 relative">
                      {order.status === "Return" && (
                        <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center backdrop-blur-[1px] z-10">
                          <span className="text-red-600 font-black text-[10px] uppercase tracking-widest px-2 py-1 bg-white rounded shadow-sm border border-red-200 flex items-center gap-1">
                             <AlertCircle size={12}/> Return Loss
                          </span>
                        </div>
                      )}
                      <div className={`text-base font-black flex items-center gap-1 ${profit > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        <span className="text-[10px]">Rs</span> {Math.round(profit).toLocaleString()}
                      </div>
                      {!isDelivered && order.status !== "Return" && <span className="text-[8px] text-orange-600 font-bold uppercase tracking-wider block mt-1 bg-orange-100 w-fit px-1 rounded">(Unrealized)</span>}
                    </td>

                    {/* Notes */}
                    <td className="p-4 border-r border-gray-50">
                      <textarea 
                        value={order.notes} onChange={(e) => handleEdit(order.id, 'notes', e.target.value)} 
                        placeholder="Add notes..."
                        className="bg-transparent border border-dashed border-gray-300 hover:border-solid hover:border-gray-400 focus:border-solid focus:border-aura-gold focus:bg-white rounded p-1.5 text-xs outline-none w-full h-12 resize-none transition-all"
                      />
                    </td>

                    {/* Dynamic Custom Columns */}
                    {customColumns.map(col => (
                      <td key={col} className="p-4 border-r border-gray-50">
                        <input type="text" placeholder="Value..." value={order[col] || ""} onChange={(e) => handleEdit(order.id, col, e.target.value)} className="bg-transparent border-b border-dashed border-gray-300 text-xs w-full outline-none focus:border-blue-500 focus:border-solid hover:border-gray-500 hover:border-solid p-1" />
                      </td>
                    ))}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="p-16 text-center text-gray-400 font-serif bg-gray-50">
            <Search size={48} className="mx-auto mb-4 opacity-30 text-aura-gold" />
            <p className="text-xl font-bold text-aura-brown mb-2">No orders found.</p>
            <p className="text-sm">Try changing the date filter or search keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}