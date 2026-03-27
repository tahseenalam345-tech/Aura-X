"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Calculator, DollarSign, TrendingUp, Package, Truck, Save, Loader2, User, Users } from "lucide-react";
import toast from "react-hot-toast";

const PARTNERS = ["", "Saad", "Tahseen", "Both"];
const STATUSES = ["Pending", "In Process", "Dispatched", "Delivered", "Cancelled", "Returned"];

export default function RecordsTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Global Calculators
  const [globalAdSpend, setGlobalAdSpend] = useState<number>(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load records");
    } else {
      // Ensure accounting object exists for every order
      const formattedData = data.map((o: any) => ({
        ...o,
        accounting: o.accounting || {},
      }));
      setOrders(formattedData);
    }
    setLoading(false);
  };

  // Handle Input Changes for a specific row
  const handleAccountingChange = (orderId: string, field: string, value: any) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, accounting: { ...order.accounting, [field]: value } }
          : order
      )
    );
  };

  const handleStatusChange = (orderId: string, value: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: value } : order))
    );
  };

  // Save specific row to database
  const saveRow = async (order: any) => {
    setSavingId(order.id);
    const { error } = await supabase
      .from("orders")
      .update({ status: order.status, accounting: order.accounting })
      .eq("id", order.id);

    if (error) toast.error("Failed to save record");
    else toast.success(`Order ${order.order_code || order.id.slice(0,4)} Saved!`);
    setSavingId(null);
  };

  // --- MATH & GLOBAL CALCULATIONS ---
  const validOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Returned");
  const adSpendPerOrder = validOrders.length > 0 ? globalAdSpend / validOrders.length : 0;

  const calculateRowProfit = (order: any) => {
    const isCancelled = order.status === "Cancelled" || order.status === "Returned";
    
    const totalAmount = Number(order.total) || 0;
    // -4% Courier deduction (Govt Tax/Handling)
    const courierDeduction = (totalAmount > 0 && !isCancelled) ? totalAmount * 0.04 : 0;
    const netRevenue = totalAmount - courierDeduction;

    const cost = Number(order.accounting?.costPrice) || 0;
    const dc = Number(order.accounting?.dc) || 0;
    const box = Number(order.accounting?.boxPrice) || 0;
    
    const rowAdSpend = order.accounting?.adSpend !== undefined && order.accounting?.adSpend !== "" 
        ? Number(order.accounting.adSpend) 
        : (isCancelled ? 0 : adSpendPerOrder);

    const profit = isCancelled ? 0 : (netRevenue - (cost + dc + box + rowAdSpend));
    return { netRevenue, courierDeduction, cost, dc, box, rowAdSpend, profit };
  };

  // Top Summary Totals
  const totals = useMemo(() => {
    let totalCost = 0, totalCodDeducted = 0, totalProfit = 0, totalRevenue = 0;

    orders.forEach((order) => {
      if (order.status === "Cancelled" || order.status === "Returned") return; 
      
      const calc = calculateRowProfit(order);
      totalRevenue += Number(order.total) || 0;
      totalCodDeducted += calc.courierDeduction;
      totalCost += calc.cost + calc.box + calc.dc;
      totalProfit += calc.profit;
    });

    return { totalCost, totalCodDeducted, totalProfit, totalRevenue };
  }, [orders, globalAdSpend]);

  if (loading) return <div className="p-20 text-center flex flex-col items-center"><Loader2 className="animate-spin mb-4 text-aura-gold" size={40} /><p className="text-gray-400 font-serif italic">Loading Financial Ledger...</p></div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[98vw] mx-auto overflow-hidden animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#1E1B18]">Partnership Ledger</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2"><Users size={14} className="text-aura-gold"/> Saad & Tahseen Financial Tracking</p>
        </div>
        
        {/* GLOBAL AD SPEND CALCULATOR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-aura-gold/30 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><TrendingUp size={24}/></div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Ad Spend</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-aura-brown">Rs</span>
                    <input 
                        type="number" 
                        value={globalAdSpend || ""}
                        onChange={(e) => setGlobalAdSpend(Number(e.target.value))}
                        placeholder="Total Spend"
                        className="w-28 border-b-2 border-gray-100 outline-none focus:border-aura-gold font-bold text-lg text-aura-brown bg-transparent"
                    />
                </div>
            </div>
            <div className="border-l border-dashed border-gray-200 pl-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto Avg/Order</p>
                <p className="text-lg font-bold text-blue-600">Rs {adSpendPerOrder.toFixed(0)}</p>
            </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Gross Revenue</p>
            <p className="text-2xl font-bold text-aura-brown">Rs {totals.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">Courier/Tax (4%)</p>
            <p className="text-2xl font-bold text-red-500">Rs {totals.totalCodDeducted.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Total Investment</p>
            <p className="text-2xl font-bold text-aura-brown">Rs {totals.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-[#1E1B18] p-5 rounded-2xl border border-aura-gold/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform"><Calculator size={60} className="text-white"/></div>
            <p className="text-[10px] font-black text-aura-gold uppercase tracking-[0.2em] mb-3 relative z-10">Net Partnership Profit</p>
            <p className="text-2xl font-bold text-white relative z-10">Rs {totals.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* MASSIVE ACCOUNTING TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left min-w-[2200px] text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-widest font-black">
              <tr>
                <th className="p-4 w-40">Order & Status</th>
                <th className="p-4 w-56">Customer</th>
                <th className="p-4 w-48">Inventory SKUs</th>
                <th className="p-4 w-32 bg-green-50/50">Revenue</th>
                <th className="p-4 w-80 bg-red-50/50 text-center border-x border-red-100" colSpan={4}>Expenses (Paid By Firm)</th>
                <th className="p-4 w-32 bg-aura-gold/10 text-aura-brown">Net Profit</th>
                <th className="p-4 w-[500px] bg-blue-50/50 text-center border-l border-blue-100" colSpan={5}>Partnership Tracking (Who Paid?)</th>
                <th className="p-4 w-24 text-center">Action</th>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50/50 text-[10px]">
                <th className="p-2" colSpan={4}></th>
                {/* Expense Sub-headers */}
                <th className="p-2 border-l border-gray-200 text-center">Buy Price</th>
                <th className="p-2 text-center">Delivery (DC)</th>
                <th className="p-2 text-center">Packaging</th>
                <th className="p-2 text-center">Ad Spend</th>
                <th className="p-2"></th>
                {/* Partnership Sub-headers */}
                <th className="p-2 border-l border-gray-200 text-center">Paid Item</th>
                <th className="p-2 text-center">Paid DC</th>
                <th className="p-2 text-center">Paid Extras</th>
                <th className="p-2 text-center">Paid Ads</th>
                <th className="p-2 text-center font-black text-aura-brown bg-aura-gold/5">Profit Holder</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const calc = calculateRowProfit(order);
                const items = order.items?.map((item: any) => item.name).join(", ");
                const isCancelled = order.status === "Cancelled" || order.status === "Returned";

                return (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${isCancelled ? 'opacity-50 bg-gray-50 italic' : ''}`}>
                    {/* ORDER & STATUS */}
                    <td className="p-4">
                      <div className="font-black text-aura-brown mb-1">{order.order_code || order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[10px] text-gray-400 mb-2">{new Date(order.created_at).toLocaleDateString()}</div>
                      <select 
                        value={order.status || "Pending"} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold border outline-none transition-colors ${isCancelled ? 'bg-red-100 text-red-600 border-red-200' : order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white border-gray-300'}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* CUSTOMER INFO */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{order.customer_name}</p>
                      <p className="text-gray-500 font-mono text-[10px]">{order.phone}</p>
                      <p className="text-[9px] text-gray-400 truncate max-w-[150px]" title={order.address}>{order.city}</p>
                    </td>

                    {/* ITEMS */}
                    <td className="p-4">
                        <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed" title={items}>
                            {items || "No items data"}
                        </div>
                    </td>

                    {/* REVENUE */}
                    <td className="p-4 bg-green-50/20">
                      <p className="font-black text-aura-brown text-sm">Rs {Number(order.total).toLocaleString()}</p>
                      {calc.courierDeduction > 0 && (
                        <p className="text-[9px] text-red-500 font-bold">-4% Handling</p>
                      )}
                    </td>

                    {/* EXPENSES INPUTS */}
                    <td className="p-3 border-l border-gray-100">
                      <input type="number" placeholder="Cost" value={order.accounting?.costPrice || ""} onChange={(e) => handleAccountingChange(order.id, "costPrice", e.target.value)} className="w-20 p-2 border rounded-lg text-center font-bold outline-none focus:border-aura-gold transition-all" />
                    </td>
                    <td className="p-3">
                      <input type="number" placeholder="DC" value={order.accounting?.dc || ""} onChange={(e) => handleAccountingChange(order.id, "dc", e.target.value)} className="w-16 p-2 border rounded-lg text-center font-bold outline-none focus:border-aura-gold transition-all" />
                    </td>
                    <td className="p-3">
                      <input type="number" placeholder="Box" value={order.accounting?.boxPrice || ""} onChange={(e) => handleAccountingChange(order.id, "boxPrice", e.target.value)} className="w-16 p-2 border rounded-lg text-center font-bold outline-none focus:border-aura-gold transition-all" />
                    </td>
                    <td className="p-3">
                      <input type="number" placeholder={calc.rowAdSpend.toFixed(0)} value={order.accounting?.adSpend !== undefined ? order.accounting.adSpend : ""} onChange={(e) => handleAccountingChange(order.id, "adSpend", e.target.value)} className="w-20 p-2 border rounded-lg text-center font-bold outline-none focus:border-aura-gold bg-blue-50/30 placeholder-blue-300" title="Leave blank to use Global Average" />
                    </td>

                    {/* PROFIT */}
                    <td className="p-4 bg-aura-gold/5 font-black text-sm">
                      <span className={calc.profit >= 0 ? "text-green-600" : "text-red-500"}>
                        {isCancelled ? '---' : `Rs ${Math.round(calc.profit).toLocaleString()}`}
                      </span>
                    </td>

                    {/* PARTNERSHIP DROPDOWNS */}
                    <td className="p-3 border-l border-gray-100">
                      <select value={order.accounting?.paidCostBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidCostBy", e.target.value)} className="w-full p-2 border rounded-lg outline-none text-[10px] font-bold bg-white">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <select value={order.accounting?.paidCodBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidCodBy", e.target.value)} className="w-full p-2 border rounded-lg outline-none text-[10px] font-bold bg-white">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <select value={order.accounting?.paidExtrasBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidExtrasBy", e.target.value)} className="w-full p-2 border rounded-lg outline-none text-[10px] font-bold bg-white">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <select value={order.accounting?.paidAdsBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidAdsBy", e.target.value)} className="w-full p-2 border rounded-lg outline-none text-[10px] font-bold bg-white">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-3 bg-aura-gold/5">
                      <select value={order.accounting?.profitHeldBy || ""} onChange={(e) => handleAccountingChange(order.id, "profitHeldBy", e.target.value)} className="w-full p-2 border-2 border-aura-gold/50 rounded-lg outline-none text-[10px] font-black text-aura-brown bg-white shadow-sm">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Holder"}</option>)}
                      </select>
                    </td>

                    {/* SAVE ACTION */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => saveRow(order)}
                        disabled={savingId === order.id}
                        className="w-10 h-10 bg-[#1E1B18] text-white rounded-xl hover:bg-aura-gold hover:text-black transition-all disabled:opacity-50 flex items-center justify-center shadow-md mx-auto"
                        title="Save Row"
                      >
                        {savingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}