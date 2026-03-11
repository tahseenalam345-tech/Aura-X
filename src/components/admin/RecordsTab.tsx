"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Calculator, DollarSign, TrendingUp, Package, Truck, Save, Loader2 } from "lucide-react";
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
    else toast.success(`Order ${order.id.slice(0, 4)}... Saved!`);
    setSavingId(null);
  };

  // --- MATH & GLOBAL CALCULATIONS ---
  const validOrders = orders.filter((o) => o.status !== "Cancelled" && o.status !== "Returned");
  const adSpendPerOrder = validOrders.length > 0 ? globalAdSpend / validOrders.length : 0;

  const calculateRowProfit = (order: any) => {
    const isCancelled = order.status === "Cancelled" || order.status === "Returned";
    
    const totalAmount = Number(order.total_amount) || 0;
    // -4% Courier deduction if total > 0
    const courierDeduction = totalAmount > 0 ? totalAmount * 0.04 : 0;
    const netRevenue = totalAmount - courierDeduction;

    const cost = Number(order.accounting?.costPrice) || 0;
    const dc = Number(order.accounting?.dc) || 0;
    const box = Number(order.accounting?.boxPrice) || 0;
    
    // Use row-specific ad spend if entered, otherwise use the global divided average
    const rowAdSpend = order.accounting?.adSpend !== undefined && order.accounting?.adSpend !== "" 
        ? Number(order.accounting.adSpend) 
        : (isCancelled ? 0 : adSpendPerOrder);

    const profit = netRevenue - (cost + dc + box + rowAdSpend);
    return { netRevenue, courierDeduction, cost, dc, box, rowAdSpend, profit };
  };

  // Top Summary Totals
  const totals = useMemo(() => {
    let totalCost = 0, totalCodDeducted = 0, totalProfit = 0, totalRevenue = 0;

    orders.forEach((order) => {
      if (order.status === "Cancelled" || order.status === "Returned") return; // Skip cancelled in totals
      
      const calc = calculateRowProfit(order);
      totalRevenue += order.total_amount || 0;
      totalCodDeducted += calc.courierDeduction;
      totalCost += calc.cost + calc.box + calc.dc;
      totalProfit += calc.profit;
    });

    return { totalCost, totalCodDeducted, totalProfit, totalRevenue };
  }, [orders, globalAdSpend]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-aura-brown" /></div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[95vw] mx-auto overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Financial Records</h1>
            <p className="text-sm text-gray-500">Saad & Tahseen Partnership Ledger</p>
        </div>
        
        {/* GLOBAL AD SPEND CALCULATOR */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-aura-gold/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><TrendingUp size={20}/></div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Ad Spend Total</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-aura-brown">Rs</span>
                    <input 
                        type="number" 
                        value={globalAdSpend || ""}
                        onChange={(e) => setGlobalAdSpend(Number(e.target.value))}
                        placeholder="e.g. 50000"
                        className="w-24 border-b border-gray-300 outline-none focus:border-aura-gold font-bold text-aura-brown"
                    />
                </div>
            </div>
            <div className="border-l pl-3 ml-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Order Avg</p>
                <p className="text-sm font-bold text-blue-600">Rs {adSpendPerOrder.toFixed(0)}</p>
            </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2"><p className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</p><DollarSign size={16} className="text-green-500"/></div>
            <p className="text-2xl font-bold text-aura-brown">Rs {totals.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2"><p className="text-xs font-bold text-gray-400 uppercase">Total COD Deductions</p><Truck size={16} className="text-red-400"/></div>
            <p className="text-2xl font-bold text-red-500">- Rs {totals.totalCodDeducted.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2"><p className="text-xs font-bold text-gray-400 uppercase">Total Product Cost</p><Package size={16} className="text-orange-400"/></div>
            <p className="text-2xl font-bold text-aura-brown">Rs {totals.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-[#1E1B18] p-4 rounded-2xl border border-aura-gold/30 shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2"><p className="text-xs font-bold text-aura-gold uppercase">Total Net Profit</p><Calculator size={16} className="text-aura-gold"/></div>
            <p className="text-2xl font-bold text-white">Rs {totals.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* MASSIVE ACCOUNTING TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full pb-6">
          <table className="w-full text-left min-w-[2000px] text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 w-40">Order & Status</th>
                <th className="p-3 w-48">Customer Info</th>
                <th className="p-3 w-40">Product SKUs</th>
                <th className="p-3 w-28 bg-green-50">Revenue</th>
                <th className="p-3 w-64 bg-red-50 text-center border-x border-red-100" colSpan={4}>Expenses (Rs)</th>
                <th className="p-3 w-28 bg-aura-gold/10 text-aura-brown">Profit</th>
                <th className="p-3 w-[450px] bg-blue-50 text-center border-l border-blue-100" colSpan={5}>Partnership Tracking (Who Paid?)</th>
                <th className="p-3 w-20 text-center">Action</th>
              </tr>
              <tr className="border-t border-gray-200 bg-gray-50">
                <th className="p-2" colSpan={4}></th>
                {/* Expense Sub-headers */}
                <th className="p-2 border-l border-gray-200 text-center">Watch Cost</th>
                <th className="p-2 text-center">Delivery (DC)</th>
                <th className="p-2 text-center">Box Cost</th>
                <th className="p-2 text-center">Ad Spend</th>
                <th className="p-2"></th>
                {/* Partnership Sub-headers */}
                <th className="p-2 border-l border-gray-200 text-center">Paid Cost</th>
                <th className="p-2 text-center">Paid COD</th>
                <th className="p-2 text-center">Paid Extras</th>
                <th className="p-2 text-center">Paid Ads</th>
                <th className="p-2 text-center font-bold text-aura-brown">Holding Profit</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const calc = calculateRowProfit(order);
                const skus = order.cart_items?.map((item: any) => item.sku || "N/A").join(", ");
                const isCancelled = order.status === "Cancelled" || order.status === "Returned";

                return (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${isCancelled ? 'opacity-60 bg-gray-100' : ''}`}>
                    {/* ORDER & STATUS */}
                    <td className="p-3">
                      <div className="font-bold text-aura-brown">{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[10px] text-gray-400 mb-2">{new Date(order.created_at).toLocaleDateString()}</div>
                      <select 
                        value={order.status || "Pending"} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] p-1 rounded font-bold border outline-none ${isCancelled ? 'bg-red-100 text-red-600 border-red-200' : order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white border-gray-300'}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* CUSTOMER INFO */}
                    <td className="p-3 max-w-[200px] truncate">
                      <p className="font-bold">{order.customer_info?.firstName} {order.customer_info?.lastName}</p>
                      <p className="text-gray-500">{order.customer_info?.phone}</p>
                      <p className="text-[10px] text-gray-400 truncate" title={order.customer_info?.address}>{order.customer_info?.city}</p>
                    </td>

                    {/* SKUs */}
                    <td className="p-3 text-[10px] font-mono text-gray-600">{skus}</td>

                    {/* REVENUE */}
                    <td className="p-3 bg-green-50/30">
                      <p className="font-bold text-aura-brown">Rs {order.total_amount?.toLocaleString()}</p>
                      {calc.courierDeduction > 0 && (
                        <p className="text-[9px] text-red-500 font-bold">-4% COD: (Rs {calc.courierDeduction.toFixed(0)})</p>
                      )}
                    </td>

                    {/* EXPENSES INPUTS */}
                    <td className="p-2 border-l border-gray-100">
                      <input type="number" placeholder="Cost" value={order.accounting?.costPrice || ""} onChange={(e) => handleAccountingChange(order.id, "costPrice", e.target.value)} className="w-16 p-1.5 border rounded text-center outline-none focus:border-aura-gold" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="DC" value={order.accounting?.dc || ""} onChange={(e) => handleAccountingChange(order.id, "dc", e.target.value)} className="w-14 p-1.5 border rounded text-center outline-none focus:border-aura-gold" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder="Box" value={order.accounting?.boxPrice || ""} onChange={(e) => handleAccountingChange(order.id, "boxPrice", e.target.value)} className="w-14 p-1.5 border rounded text-center outline-none focus:border-aura-gold" />
                    </td>
                    <td className="p-2">
                      <input type="number" placeholder={calc.rowAdSpend.toFixed(0)} value={order.accounting?.adSpend !== undefined ? order.accounting.adSpend : ""} onChange={(e) => handleAccountingChange(order.id, "adSpend", e.target.value)} className="w-16 p-1.5 border rounded text-center outline-none focus:border-aura-gold bg-blue-50/50 placeholder-blue-300" title="Leave blank to use Global Average" />
                    </td>

                    {/* PROFIT */}
                    <td className="p-3 bg-aura-gold/5 font-bold text-sm">
                      <span className={calc.profit >= 0 ? "text-green-600" : "text-red-500"}>Rs {calc.profit.toFixed(0)}</span>
                    </td>

                    {/* PARTNERSHIP DROPDOWNS */}
                    <td className="p-2 border-l border-gray-100">
                      <select value={order.accounting?.paidCostBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidCostBy", e.target.value)} className="w-full p-1.5 border rounded outline-none text-[10px]">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select value={order.accounting?.paidCodBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidCodBy", e.target.value)} className="w-full p-1.5 border rounded outline-none text-[10px]">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select value={order.accounting?.paidExtrasBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidExtrasBy", e.target.value)} className="w-full p-1.5 border rounded outline-none text-[10px]">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select value={order.accounting?.paidAdsBy || ""} onChange={(e) => handleAccountingChange(order.id, "paidAdsBy", e.target.value)} className="w-full p-1.5 border rounded outline-none text-[10px]">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                      </select>
                    </td>
                    <td className="p-2 bg-aura-gold/10 rounded-r-lg">
                      <select value={order.accounting?.profitHeldBy || ""} onChange={(e) => handleAccountingChange(order.id, "profitHeldBy", e.target.value)} className="w-full p-1.5 border-2 border-aura-gold rounded outline-none text-[10px] font-bold text-aura-brown bg-white">
                        {PARTNERS.map(p => <option key={p} value={p}>{p || "Select Holder"}</option>)}
                      </select>
                    </td>

                    {/* SAVE ACTION */}
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => saveRow(order)}
                        disabled={savingId === order.id}
                        className="p-2 bg-aura-brown text-white rounded-lg hover:bg-aura-gold transition-colors disabled:opacity-50 flex items-center justify-center w-full"
                        title="Save Changes"
                      >
                        {savingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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