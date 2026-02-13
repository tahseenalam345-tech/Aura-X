"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  DollarSign, TrendingUp, TrendingDown, Truck, 
  Settings, Calculator, RefreshCcw, Calendar 
} from "lucide-react";
import toast from "react-hot-toast";

export default function FinanceTab({ orders, products }: { orders: any[], products: any[] }) {
  // --- STATE ---
  const [dateFilter, setDateFilter] = useState("30"); 
  const [deliveryRates, setDeliveryRates] = useState({
    lahore: 230, islamabad: 230,
    multan: 250, faisalabad: 250, sialkot: 250,
    karachi: 400, other: 280
  });
  const [customExpenses, setCustomExpenses] = useState(0); 
  const [financeStats, setFinanceStats] = useState({ 
    revenue: 0, cost: 0, expenses: 0, tax: 0, deliveryCost: 0, profit: 0 
  });
  const [eidRevealDate, setEidRevealDate] = useState("");

  // --- FETCH SETTINGS (On Mount) ---
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (data) {
          if (data.delivery_rates) setDeliveryRates(data.delivery_rates);
          if (data.custom_expenses) setCustomExpenses(data.custom_expenses);
          if (data.eid_reveal_date) setEidRevealDate(data.eid_reveal_date);
      }
    };
    fetchSettings();
  }, []);

  // --- CALCULATE FINANCE ---
  useEffect(() => {
    if(orders.length === 0) return;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - Number(dateFilter));

    let revenue = 0;
    let costOfGoods = 0;
    let totalTax = 0;
    let totalDelivery = 0;

    const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= cutoff && o.status !== 'Cancelled';
    });

    filteredOrders.forEach(order => {
        const total = Number(order.total);
        revenue += total;
        totalTax += (total * 0.04); 

        const city = order.city?.toLowerCase().trim() || "";
        let dc = deliveryRates.other;
        if(city.includes('lahore') || city.includes('islamabad')) dc = deliveryRates.lahore;
        else if(city.includes('multan') || city.includes('faisalabad') || city.includes('sialkot')) dc = deliveryRates.multan;
        else if(city.includes('karachi')) dc = deliveryRates.karachi;
        
        totalDelivery += dc;

        if (order.items) {
            order.items.forEach((item: any) => {
                const product = products.find(p => p.name === item.name);
                const cost = product?.specs?.cost_price || 0; 
                costOfGoods += (Number(cost) * Number(item.quantity));
            });
        }
    });

    const totalExpenses = costOfGoods + totalDelivery + totalTax + customExpenses;
    const netProfit = revenue - totalExpenses;

    setFinanceStats({ revenue, cost: costOfGoods, expenses: customExpenses, tax: totalTax, deliveryCost: totalDelivery, profit: netProfit });
  }, [orders, products, dateFilter, deliveryRates, customExpenses]);

  // --- SAVE HANDLER ---
  const saveSettingsToDB = async () => {
      // Note: We only update specific fields to avoid overwriting "manager_notes" which lives in another tab
      const { error } = await supabase.from('admin_settings').update({
          delivery_rates: deliveryRates,
          custom_expenses: customExpenses,
          eid_reveal_date: eidRevealDate 
      }).eq('id', 1);

      if (error) toast.error("Failed to save to DB");
      else toast.success("Finance Settings Saved!");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-[#1E1B18]">Financial Overview</h1>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
                {[7, 30, 90, 365].map(d => (
                    <button key={d} onClick={() => setDateFilter(d.toString())} className={`px-3 py-1 text-xs font-bold rounded ${dateFilter === d.toString() ? 'bg-aura-brown text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Last {d} Days</button>
                ))}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Total Sales</p><div className="bg-green-50 p-2 rounded-full text-green-600"><TrendingUp size={16}/></div></div>
                <p className="text-2xl font-bold text-aura-brown mt-2">Rs {financeStats.revenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Gross Revenue</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Cost of Goods</p><div className="bg-red-50 p-2 rounded-full text-red-500"><TrendingDown size={16}/></div></div>
                <p className="text-2xl font-bold text-red-400 mt-2">- Rs {financeStats.cost.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Stock Cost</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Deductions</p><div className="bg-orange-50 p-2 rounded-full text-orange-500"><Truck size={16}/></div></div>
                <div className="mt-2 space-y-1">
                    <p className="text-xs flex justify-between"><span>Delivery:</span> <span className="font-bold">- Rs {financeStats.deliveryCost.toLocaleString()}</span></p>
                    <p className="text-xs flex justify-between"><span>Tax (4%):</span> <span className="font-bold">- Rs {financeStats.tax.toLocaleString()}</span></p>
                    <p className="text-xs flex justify-between"><span>Extra:</span> <span className="font-bold">- Rs {financeStats.expenses.toLocaleString()}</span></p>
                </div>
            </div>
            <div className="bg-[#1E1B18] p-6 rounded-2xl border border-gray-100 shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-aura-gold uppercase">Net Profit</p>
                    <p className="text-3xl font-bold mt-2">Rs {financeStats.profit.toLocaleString()}</p>
                    <p className="text-[10px] text-white/50 mt-1">Clean Profit</p>
                </div>
                <DollarSign className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
            </div>
        </div>

        {/* SETTINGS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Delivery Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-aura-brown flex items-center gap-2"><Settings size={16}/> Delivery Charges (PKR)</h3>
                    <button onClick={saveSettingsToDB} className="text-xs bg-aura-gold/20 text-aura-brown px-3 py-1 rounded-full font-bold hover:bg-aura-gold/40">Save to DB</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><label className="block text-xs text-gray-400 mb-1">Lahore/Isb</label><input type="number" className="w-full p-2 border rounded" value={deliveryRates.lahore || 0} onChange={e => setDeliveryRates({...deliveryRates, lahore: Number(e.target.value)})}/></div>
                    <div><label className="block text-xs text-gray-400 mb-1">Mul/Fsd/Skt</label><input type="number" className="w-full p-2 border rounded" value={deliveryRates.multan || 0} onChange={e => setDeliveryRates({...deliveryRates, multan: Number(e.target.value)})}/></div>
                    <div><label className="block text-xs text-gray-400 mb-1">Karachi</label><input type="number" className="w-full p-2 border rounded" value={deliveryRates.karachi || 0} onChange={e => setDeliveryRates({...deliveryRates, karachi: Number(e.target.value)})}/></div>
                    <div><label className="block text-xs text-gray-400 mb-1">Other Cities</label><input type="number" className="w-full p-2 border rounded" value={deliveryRates.other || 0} onChange={e => setDeliveryRates({...deliveryRates, other: Number(e.target.value)})}/></div>
                </div>
            </div>

            {/* Extra Expenses */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-aura-brown flex items-center gap-2"><Calculator size={16}/> Manual Adjustments</h3>
                    <button onClick={() => setCustomExpenses(0)} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full font-bold hover:bg-red-100 flex items-center gap-1"><RefreshCcw size={10}/> Reset</button>
                </div>
                <label className="block text-xs text-gray-400 mb-1">Add Extra Expenses (Marketing, loss, etc)</label>
                <input type="number" className="w-full p-3 border rounded-xl text-lg font-bold text-red-500" value={customExpenses || 0} onChange={e => setCustomExpenses(Number(e.target.value))} placeholder="0"/>
                <p className="text-xs text-gray-400 mt-2">This amount will be deducted from Net Profit immediately. Click "Save to DB" to store.</p>
            </div>

            {/* Event Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-aura-brown flex items-center gap-2"><Calendar size={16}/> Ramzan Reveal Timer</h3>
                </div>
                <label className="block text-xs text-gray-400 mb-1">Unlock Date & Time</label>
                <input 
                    type="datetime-local" 
                    className="w-full p-3 border rounded-xl"
                    value={eidRevealDate}
                    onChange={e => setEidRevealDate(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-2">The Eid Collection will automatically unlock on this date. Click "Save to DB" to apply.</p>
            </div>
        </div>
    </div>
  );
}