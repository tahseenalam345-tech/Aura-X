"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  DollarSign, TrendingUp, TrendingDown, Truck, 
  Settings, Calculator, RefreshCcw, Calendar, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

export default function FinanceTab({ orders, products }: { orders: any[], products: any[] }) {
  // --- STATE ---
  const [dateFilter, setDateFilter] = useState("30"); 
  const [deliveryRates, setDeliveryRates] = useState({
    standard: 250, // 🚀 UPDATED: Flat rate
    actual_avg: 250 
  });
  const [customExpenses, setCustomExpenses] = useState(0); 
  const [financeStats, setFinanceStats] = useState({ 
    revenue: 0, cost: 0, expenses: 0, tax: 0, deliveryCost: 0, profit: 0, comboDiscounts: 0 
  });

  // --- FETCH SETTINGS ---
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (data) {
          if (data.delivery_rates) setDeliveryRates(data.delivery_rates);
          if (data.custom_expenses) setCustomExpenses(data.custom_expenses);
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
    let totalComboDiscounts = 0;

    const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= cutoff && o.status !== 'Cancelled' && o.status !== 'Returned';
    });

    filteredOrders.forEach(order => {
        const actualTotalPaid = Number(order.total);
        revenue += actualTotalPaid;
        totalTax += (actualTotalPaid * 0.04); // 4% Govt/Courier Tax

        // Standard Delivery Cost
        totalDelivery += deliveryRates.actual_avg;

        let itemsSubtotal = 0;
        if (order.items) {
            order.items.forEach((item: any) => {
                // Find product cost from live products list
                const product = products.find(p => p.name === item.name || p.id === item.id);
                const cost = product?.specs?.cost_price || 0; 
                const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
                
                costOfGoods += (Number(cost) * Number(item.quantity));
                itemsSubtotal += (Number(item.price) + extras) * Number(item.quantity);
            });
        }

        // 🚀 Detect Combo Discount: If paid amount < (items + shipping), a discount was applied
        const expectedTotal = itemsSubtotal + 250; // 250 is current standard shipping
        if (actualTotalPaid < expectedTotal) {
            totalComboDiscounts += (expectedTotal - actualTotalPaid);
        }
    });

    const totalExpenses = costOfGoods + totalDelivery + totalTax + customExpenses;
    const netProfit = revenue - totalExpenses;

    setFinanceStats({ 
        revenue, 
        cost: costOfGoods, 
        expenses: customExpenses, 
        tax: totalTax, 
        deliveryCost: totalDelivery, 
        profit: netProfit,
        comboDiscounts: totalComboDiscounts
    });
  }, [orders, products, dateFilter, deliveryRates, customExpenses]);

  // --- SAVE HANDLER ---
  const saveSettingsToDB = async () => {
      const { error } = await supabase.from('admin_settings').update({
          delivery_rates: deliveryRates,
          custom_expenses: customExpenses
      }).eq('id', 1);

      if (error) toast.error("Failed to save to DB");
      else toast.success("Finance Settings Updated!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-[#1E1B18]">Financial Overview</h1>
                <p className="text-sm text-gray-500">Real-time profit and loss tracking</p>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
                {[7, 30, 90, 365].map(d => (
                    <button key={d} onClick={() => setDateFilter(d.toString())} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${dateFilter === d.toString() ? 'bg-aura-brown text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Last {d} Days</button>
                ))}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Sales</p><div className="bg-green-50 p-2 rounded-full text-green-600"><TrendingUp size={16}/></div></div>
                <p className="text-2xl font-bold text-aura-brown mt-2">Rs {financeStats.revenue.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Net Cash Inflow</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment</p><div className="bg-red-50 p-2 rounded-full text-red-500"><TrendingDown size={16}/></div></div>
                <p className="text-2xl font-bold text-red-400 mt-2">Rs {financeStats.cost.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">Cost of Inventory Sold</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operations</p><div className="bg-orange-50 p-2 rounded-full text-orange-500"><Truck size={16}/></div></div>
                <div className="mt-3 space-y-2">
                    <p className="text-[10px] flex justify-between text-gray-500"><span>Delivery Avg:</span> <span className="font-bold text-aura-brown">Rs {financeStats.deliveryCost.toLocaleString()}</span></p>
                    <p className="text-[10px] flex justify-between text-gray-500"><span>Tax (4%):</span> <span className="font-bold text-aura-brown">Rs {financeStats.tax.toLocaleString()}</span></p>
                    {financeStats.comboDiscounts > 0 && (
                        <p className="text-[10px] flex justify-between text-green-600 font-bold"><span>Combo Disc:</span> <span>-Rs {financeStats.comboDiscounts.toLocaleString()}</span></p>
                    )}
                </div>
            </div>

            <div className="bg-[#1E1B18] p-6 rounded-[2rem] border border-aura-gold/30 shadow-xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-aura-gold uppercase tracking-widest">Clean Net Profit</p>
                    <p className="text-3xl font-bold mt-2">Rs {financeStats.profit.toLocaleString()}</p>
                    <p className="text-[10px] text-white/50 mt-1 italic">After all deductions</p>
                </div>
                <DollarSign className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32 group-hover:scale-110 transition-transform" />
            </div>
        </div>

        {/* SETTINGS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Settings */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-bold text-aura-brown flex items-center gap-2"><Settings size={20} className="text-aura-gold"/> Cost Settings</h3>
                    <button onClick={saveSettingsToDB} className="text-[10px] bg-aura-gold text-black px-4 py-2 rounded-full font-black uppercase tracking-widest hover:bg-yellow-600 transition-colors">Save Changes</button>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer DC (Standard)</label>
                            <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-aura-brown focus:border-aura-gold outline-none" value={deliveryRates.standard} onChange={e => setDeliveryRates({...deliveryRates, standard: Number(e.target.value)})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Actual Cost (Avg)</label>
                            <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-aura-brown focus:border-aura-gold outline-none" value={deliveryRates.actual_avg} onChange={e => setDeliveryRates({...deliveryRates, actual_avg: Number(e.target.value)})}/>
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full"></div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Manual Expense Adjustment (Marketing/Ads)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold">Rs</span>
                            <input type="number" className="w-full pl-12 pr-4 py-4 bg-red-50/30 border border-red-100 rounded-xl text-xl font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-100" value={customExpenses || 0} onChange={e => setCustomExpenses(Number(e.target.value))} placeholder="0"/>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 italic">Enter total monthly ad spend or other fixed costs here to see final net profit.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-aura-gold/20 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-aura-gold/10 rounded-full flex items-center justify-center text-aura-gold mb-4 border border-aura-gold/20 shadow-inner">
                    <Sparkles size={32} />
                </div>
                <h4 className="font-serif text-2xl font-bold text-aura-brown mb-2">Smart Insights</h4>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    Your current profit margin is approximately <span className="font-bold text-aura-brown">{(financeStats.profit / (financeStats.revenue || 1) * 100).toFixed(1)}%</span>. 
                    {financeStats.comboDiscounts > 0 && ` You've given Rs ${financeStats.comboDiscounts.toLocaleString()} in combo discounts this period.`}
                </p>
            </div>
        </div>
    </div>
  );
}