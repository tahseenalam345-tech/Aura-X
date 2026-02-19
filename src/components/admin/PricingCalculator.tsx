"use client";

import { useState, useEffect } from "react";
import { Calculator, DollarSign, TrendingUp, Package, Truck, Tag, Info, AlertTriangle, ArrowRight } from "lucide-react";

export default function PricingCalculator() {
  const [mode, setMode] = useState<'profit' | 'target'>('profit');

  // --- CORE INPUTS (Your Buying Costs) ---
  const [buyPrice, setBuyPrice] = useState(1500);
  const [actualDc, setActualDc] = useState(300); // Average 300
  const [defaultBoxCost, setDefaultBoxCost] = useState(90);
  const [premiumBoxCost, setPremiumBoxCost] = useState(240);
  const [giftWrapCost, setGiftWrapCost] = useState(300);
  const [adCostPerItem, setAdCostPerItem] = useState(50);
  const [extraCost, setExtraCost] = useState(50);
  const [codTaxPercent, setCodTaxPercent] = useState(4);

  // --- SELLING INPUTS (What Customer Sees) ---
  const [sellPrice, setSellPrice] = useState(2000); // For Profit Mode
  const [targetProfit, setTargetProfit] = useState(500); // For Target Mode
  
  const [customerDc, setCustomerDc] = useState(250);
  const [premiumBoxCharge, setPremiumBoxCharge] = useState(200);
  const [giftWrapCharge, setGiftWrapCharge] = useState(300);

  // --- SCENARIO SETTINGS (Deals & Customer Choices) ---
  const [qty, setQty] = useState(1); // 1 = Single, 2 = Couple
  const [hasPremiumBox, setHasPremiumBox] = useState(false);
  const [hasGiftWrap, setHasGiftWrap] = useState(false);
  
  // Promos
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [isFreeBox, setIsFreeBox] = useState(false);

  // --- DERIVED CALCULATIONS ---
  // 1. Costs
  const totalWatchCost = buyPrice * qty;
  const totalAdCost = adCostPerItem * qty;
  
  const boxCostToYou = hasPremiumBox ? (premiumBoxCost * qty) : (defaultBoxCost * qty);
  const boxChargeToCustomer = (hasPremiumBox && !isFreeBox) ? (premiumBoxCharge * qty) : 0;
  
  const giftCostToYou = hasGiftWrap ? (giftWrapCost * qty) : 0;
  const giftChargeToCustomer = hasGiftWrap ? (giftWrapCharge * qty) : 0;

  const shippingChargeToCustomer = isFreeShipping ? 0 : customerDc;

  // PROFIT MODE CALCULATION
  const grossWatchSales = sellPrice * qty;
  const discountAmount = grossWatchSales * (discountPercent / 100);
  const netWatchSales = grossWatchSales - discountAmount;
  
  const totalCollectedFromCustomer = netWatchSales + boxChargeToCustomer + giftChargeToCustomer + shippingChargeToCustomer;
  const codTaxAmount = totalCollectedFromCustomer * (codTaxPercent / 100);
  
  const totalExpenses = totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost + codTaxAmount;
  const netProfit = totalCollectedFromCustomer - totalExpenses;
  const profitMargin = totalCollectedFromCustomer > 0 ? (netProfit / totalCollectedFromCustomer) * 100 : 0;

  // TARGET PRICE MODE CALCULATION (Reverse Math)
  // Equation: Target Profit = Total Collected - Total Expenses
  // Total Collected = (ReqPrice * Qty * (1 - D)) + Extras
  // Total Expenses = FixedCosts + (0.04 * Total Collected)
  let requiredSellPrice = 0;
  let recommendedTotalCollected = 0;
  let recommendedCodTax = 0;

  if (mode === 'target') {
      const fixedCosts = totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost;
      const extrasRevenue = boxChargeToCustomer + giftChargeToCustomer + shippingChargeToCustomer;
      
      // TargetProfit = TotalCollected - FixedCosts - (0.04 * TotalCollected)
      // TargetProfit = (0.96 * TotalCollected) - FixedCosts
      // TotalCollected = (TargetProfit + FixedCosts) / (1 - TaxRate)
      const taxDecimal = codTaxPercent / 100;
      recommendedTotalCollected = (targetProfit + fixedCosts) / (1 - taxDecimal);
      recommendedCodTax = recommendedTotalCollected * taxDecimal;

      // RecommendedTotalCollected = NetWatchSales + ExtrasRevenue
      // NetWatchSales = RecommendedTotalCollected - ExtrasRevenue
      const requiredNetWatchSales = recommendedTotalCollected - extrasRevenue;
      
      // NetWatchSales = RequiredSellPrice * Qty * (1 - DiscountDecimal)
      const discountDecimal = discountPercent / 100;
      requiredSellPrice = requiredNetWatchSales / (qty * (1 - discountDecimal));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-serif font-bold text-aura-brown flex items-center gap-2">
                    <Calculator className="text-aura-gold" /> Pricing Strategy Calculator
                </h2>
                <p className="text-sm text-gray-500 mt-1">Calculate exact margins including hidden costs and 4% COD tax.</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => setMode('profit')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'profit' ? 'bg-white text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}
                >
                    Profit Calculator
                </button>
                <button 
                    onClick={() => setMode('target')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'target' ? 'bg-white text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}
                >
                    Find Target Price
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Main Driver Input (Sell Price OR Target Profit) */}
                <div className="bg-aura-gold/5 border border-aura-gold/20 p-5 rounded-xl">
                    {mode === 'profit' ? (
                        <div>
                            <label className="text-sm font-bold text-aura-brown flex items-center gap-2 mb-2"><Tag size={16}/> Customer Selling Price (Per Watch)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs</span>
                                <input type="number" value={sellPrice} onChange={e => setSellPrice(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 bg-white border border-aura-gold/30 rounded-lg font-bold text-lg focus:ring-2 focus:ring-aura-gold outline-none" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-bold text-aura-brown flex items-center gap-2 mb-2"><TrendingUp size={16}/> Desired Profit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs</span>
                                <input type="number" value={targetProfit} onChange={e => setTargetProfit(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 bg-white border border-aura-gold/30 rounded-lg font-bold text-lg focus:ring-2 focus:ring-aura-gold outline-none" />
                            </div>
                            <p className="text-xs text-aura-brown/70 mt-2">Enter how much profit you want to make on this order.</p>
                        </div>
                    )}
                </div>

                {/* 2. Order Scenario (Qty & Toggles) */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b pb-2">Customer Order Scenario</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2 md:col-span-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between border">
                            <span className="text-sm font-bold">Quantity (1 = Single, 2 = Couple)</span>
                            <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} className="w-20 p-2 text-center border rounded font-bold" />
                        </div>
                        
                        <label className={`col-span-2 p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${hasPremiumBox ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={hasPremiumBox} onChange={e => setHasPremiumBox(e.target.checked)} className="w-4 h-4 accent-aura-gold" />
                            <span className="text-sm font-bold">Premium Box</span>
                        </label>
                        <label className={`col-span-2 p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${hasGiftWrap ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={hasGiftWrap} onChange={e => setHasGiftWrap(e.target.checked)} className="w-4 h-4 accent-aura-gold" />
                            <span className="text-sm font-bold">Gift Wrapping</span>
                        </label>
                    </div>
                </div>

                {/* 3. Promotions & Deals */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b pb-2">Active Promotions (Discounts)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Discount %</label>
                            <select value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-white border rounded-lg">
                                <option value="0">No Discount (0%)</option>
                                <option value="15">15% Off</option>
                                <option value="20">20% Off</option>
                                <option value="30">30% Off</option>
                                <option value="40">40% Off</option>
                                <option value="50">50% Off</option>
                            </select>
                        </div>
                        <label className={`p-3 mt-5 rounded-lg border cursor-pointer flex items-center gap-2 justify-center transition-colors ${isFreeShipping ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={isFreeShipping} onChange={e => setIsFreeShipping(e.target.checked)} className="hidden" />
                            <Truck size={16}/> <span className="text-xs font-bold">Free Shipping</span>
                        </label>
                        <label className={`p-3 mt-5 rounded-lg border cursor-pointer flex items-center gap-2 justify-center transition-colors ${(isFreeBox && hasPremiumBox) ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white hover:bg-gray-50'} ${!hasPremiumBox && 'opacity-50 cursor-not-allowed'}`}>
                            <input type="checkbox" checked={isFreeBox} onChange={e => setIsFreeBox(e.target.checked)} disabled={!hasPremiumBox} className="hidden" />
                            <Package size={16}/> <span className="text-xs font-bold">Free Prem. Box</span>
                        </label>
                    </div>
                </div>

                {/* 4. Base Costs (Hidden logic mostly, but editable) */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b pb-2">Your Base Costs & Fees</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Watch Buy Price</label><input type="number" value={buyPrice} onChange={e=>setBuyPrice(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Courier DC Cost</label><input type="number" value={actualDc} onChange={e=>setActualDc(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Customer Pays DC</label><input type="number" value={customerDc} onChange={e=>setCustomerDc(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Ads Cost/Item</label><input type="number" value={adCostPerItem} onChange={e=>setAdCostPerItem(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Def. Box Cost</label><input type="number" value={defaultBoxCost} onChange={e=>setDefaultBoxCost(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Prem. Box Cost</label><input type="number" value={premiumBoxCost} onChange={e=>setPremiumBoxCost(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Gift Wrap Cost</label><input type="number" value={giftWrapCost} onChange={e=>setGiftWrapCost(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                        <div><label className="text-[10px] font-bold text-gray-500 uppercase">Misc/Extra</label><input type="number" value={extraCost} onChange={e=>setExtraCost(Number(e.target.value))} className="w-full p-2 border rounded bg-gray-50" /></div>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: RECEIPT & OUTPUT */}
            <div className="lg:col-span-5">
                <div className="bg-[#1E1B18] text-white rounded-2xl p-6 shadow-2xl sticky top-24">
                    
                    {/* TARGET MODE OUTPUT HEADER */}
                    {mode === 'target' && (
                        <div className="mb-6 bg-aura-gold/20 border border-aura-gold p-4 rounded-xl text-center">
                            <p className="text-aura-gold text-xs font-bold uppercase tracking-widest mb-1">You must sell at</p>
                            <p className="text-4xl font-serif font-bold text-white">Rs {Math.ceil(requiredSellPrice).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-300 mt-2">To hit exactly Rs {targetProfit} profit after all {discountPercent}% discounts and taxes.</p>
                        </div>
                    )}

                    {/* PROFIT MODE OUTPUT HEADER */}
                    {mode === 'profit' && (
                        <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Profit</p>
                            <p className={`text-4xl font-serif font-bold ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Rs {Math.round(netProfit).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">Margin: {profitMargin.toFixed(1)}%</p>
                        </div>
                    )}

                    <div className="space-y-6 text-sm">
                        {/* CUSTOMER PAYS */}
                        <div>
                            <h4 className="font-bold text-aura-gold mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><DollarSign size={16}/> Customer Pays (Revenue)</h4>
                            <div className="space-y-2 text-gray-300">
                                <div className="flex justify-between">
                                    <span>Watch(es) x{qty} {discountPercent > 0 && <span className="text-red-400 text-[10px]">(-{discountPercent}%)</span>}</span>
                                    <span>Rs {mode === 'target' ? Math.round(recommendedTotalCollected - boxChargeToCustomer - giftChargeToCustomer - shippingChargeToCustomer).toLocaleString() : Math.round(netWatchSales).toLocaleString()}</span>
                                </div>
                                {hasPremiumBox && (
                                    <div className="flex justify-between">
                                        <span>Premium Box {isFreeBox && <span className="text-green-400 text-[10px]">(FREE)</span>}</span>
                                        <span>Rs {boxChargeToCustomer}</span>
                                    </div>
                                )}
                                {hasGiftWrap && (
                                    <div className="flex justify-between">
                                        <span>Gift Wrap</span>
                                        <span>Rs {giftChargeToCustomer}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping {isFreeShipping && <span className="text-green-400 text-[10px]">(FREE)</span>}</span>
                                    <span>Rs {shippingChargeToCustomer}</span>
                                </div>
                                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                                    <span>Total Collected (COD)</span>
                                    <span>Rs {mode === 'target' ? Math.round(recommendedTotalCollected).toLocaleString() : Math.round(totalCollectedFromCustomer).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* YOU PAY (EXPENSES) */}
                        <div>
                            <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><TrendingUp size={16} className="rotate-180"/> You Pay (Expenses)</h4>
                            <div className="space-y-2 text-gray-300">
                                <div className="flex justify-between">
                                    <span>Watch Buy Cost (x{qty})</span>
                                    <span className="text-red-300">- Rs {totalWatchCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{hasPremiumBox ? 'Premium' : 'Default'} Box Cost (x{qty})</span>
                                    <span className="text-red-300">- Rs {boxCostToYou.toLocaleString()}</span>
                                </div>
                                {hasGiftWrap && (
                                    <div className="flex justify-between">
                                        <span>Gift Wrap Cost</span>
                                        <span className="text-red-300">- Rs {giftCostToYou.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Actual Courier Cost</span>
                                    <span className="text-red-300">- Rs {actualDc}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ads Cost (Rs {adCostPerItem} x {qty})</span>
                                    <span className="text-red-300">- Rs {totalAdCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Govt COD Tax ({codTaxPercent}%)</span>
                                    <span className="text-red-300">- Rs {mode === 'target' ? Math.round(recommendedCodTax).toLocaleString() : Math.round(codTaxAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Misc/Extra Buffer</span>
                                    <span className="text-red-300">- Rs {extraCost}</span>
                                </div>
                                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                                    <span>Total Expenses</span>
                                    <span className="text-red-400">- Rs {mode === 'target' ? Math.round(totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost + recommendedCodTax).toLocaleString() : Math.round(totalExpenses).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}