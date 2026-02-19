"use client";

import { useState, useEffect, useRef } from "react";
import { Calculator, DollarSign, TrendingUp, Package, Truck, Tag, RefreshCcw, Save, History, Layers, Database, ChevronDown, Sparkles, Send, Bot, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";

interface PricingCalculatorProps {
  products?: any[];
  fetchProducts?: () => void;
}

export default function PricingCalculator({ products = [], fetchProducts }: PricingCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'profit' | 'target' | 'single' | 'bulk' | 'history' | 'assistant'>('profit');

  // ==========================================
  // 1. ORIGINAL SANDBOX STATE
  // ==========================================
  const [buyPrice, setBuyPrice] = useState(1500);
  const [actualDc, setActualDc] = useState(300); 
  const [defaultBoxCost, setDefaultBoxCost] = useState(90);
  const [premiumBoxCost, setPremiumBoxCost] = useState(240);
  const [giftWrapCost, setGiftWrapCost] = useState(300);
  const [adCostPerItem, setAdCostPerItem] = useState(50);
  const [extraCost, setExtraCost] = useState(50);
  const [codTaxPercent, setCodTaxPercent] = useState(4);

  const [sellPrice, setSellPrice] = useState(2000); 
  const [targetProfit, setTargetProfit] = useState(500); 
  
  const [customerDc, setCustomerDc] = useState(250);
  const [premiumBoxCharge, setPremiumBoxCharge] = useState(250); 
  const [giftWrapCharge, setGiftWrapCharge] = useState(300);

  const [qty, setQty] = useState(1); 
  const [hasPremiumBox, setHasPremiumBox] = useState(false);
  const [hasGiftWrap, setHasGiftWrap] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [isFreeBox, setIsFreeBox] = useState(false);

  // ==========================================
  // 2. DB SYNC STATE & CUSTOM DROPDOWN
  // ==========================================
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [bulkTargetProfit, setBulkTargetProfit] = useState(500);

  // ==========================================
  // 3. AI ASSISTANT STATE
  // ==========================================
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string, items?: any[]}[]>([
      { role: 'bot', text: "Hello Boss! I am your Pricing Assistant. Ask me things like:\n• 'Show me watches in loss'\n• 'Show me ladies watches'\n• 'Watches under 2000'\n• 'Which items cost over 1500?'" }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'assistant' && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, activeTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // GLOBAL HISTORY FETCH (FROM SUPABASE)
  // ==========================================
  useEffect(() => {
    const fetchHistoryFromDb = async () => {
        const { data, error } = await supabase
            .from('pricing_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (data && !error) setHistory(data);
    };
    fetchHistoryFromDb();
  }, []);

  // SAVE TO SUPABASE DB
  const saveHistoryToDb = async (record: any) => {
    const { data, error } = await supabase.from('pricing_history').insert([{
        date_string: new Date().toLocaleString(),
        product_id: record.productId,
        product_name: record.productName,
        old_price: record.oldPrice,
        new_price: record.newPrice,
        type: record.type
    }]).select().single();

    if (data && !error) {
        setHistory(prev => [data, ...prev].slice(0, 50));
    }
  };


  // AUTO-FETCH: Fill Cost, Discount, and Calculate Current Profit!
  useEffect(() => {
    if (selectedProductId) {
        const prod = products.find(p => p.id === selectedProductId);
        if (prod) {
            const cost = Number(prod.specs?.cost_price) || 0;
            const disc = Number(prod.discount) || 0;
            const currentLivePrice = Number(prod.price) || 0;

            setBuyPrice(cost);
            setDiscountPercent(disc);

            const taxDecimal = codTaxPercent / 100;
            const discDecimal = disc / 100;
            const fixed = cost + defaultBoxCost + actualDc + adCostPerItem + extraCost;
            
            const currentNetSales = currentLivePrice * (1 - discDecimal);
            const currentTotalCollected = currentNetSales + customerDc;
            const currentTax = currentTotalCollected * taxDecimal;
            const currentProfit = currentTotalCollected - fixed - currentTax;

            setTargetProfit(Math.round(currentProfit));
        }
    }
  }, [selectedProductId, products]);


  // ==========================================
  // SANDBOX CALCULATIONS (Tabs 1 & 2)
  // ==========================================
  const totalWatchCost = buyPrice * qty;
  const totalAdCost = adCostPerItem * qty;
  const boxCostToYou = hasPremiumBox ? (premiumBoxCost * qty) : (defaultBoxCost * qty);
  const boxChargeToCustomer = (hasPremiumBox && !isFreeBox) ? (premiumBoxCharge * qty) : 0;
  const giftCostToYou = hasGiftWrap ? (giftWrapCost * qty) : 0;
  const giftChargeToCustomer = hasGiftWrap ? (giftWrapCharge * qty) : 0;
  const shippingChargeToCustomer = isFreeShipping ? 0 : customerDc;

  const grossWatchSales = sellPrice * qty;
  const discountAmount = grossWatchSales * (discountPercent / 100);
  const netWatchSales = grossWatchSales - discountAmount;
  const totalCollectedFromCustomer = netWatchSales + boxChargeToCustomer + giftChargeToCustomer + shippingChargeToCustomer;
  const codTaxAmount = totalCollectedFromCustomer * (codTaxPercent / 100);
  const totalExpenses = totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost + codTaxAmount;
  const netProfit = totalCollectedFromCustomer - totalExpenses;
  const profitMargin = totalCollectedFromCustomer > 0 ? (netProfit / totalCollectedFromCustomer) * 100 : 0;

  let requiredSellPrice = 0;
  let recommendedTotalCollected = 0;
  let recommendedCodTax = 0;

  const fixedCosts = totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost;
  const extrasRevenue = boxChargeToCustomer + giftChargeToCustomer + shippingChargeToCustomer;
  const taxDecimal = codTaxPercent / 100;
  
  recommendedTotalCollected = (targetProfit + fixedCosts) / (1 - taxDecimal);
  recommendedCodTax = recommendedTotalCollected * taxDecimal;
  
  const requiredNetWatchSales = recommendedTotalCollected - extrasRevenue;
  const discountDecimal = discountPercent / 100;
  requiredSellPrice = discountDecimal === 1 ? 0 : (requiredNetWatchSales / (qty * (1 - discountDecimal)));


  // ==========================================
  // STRICT SINGLE UPDATE CALCULATION (Tab 3)
  // ==========================================
  const singleFixedCosts = buyPrice + defaultBoxCost + actualDc + adCostPerItem + extraCost;
  const singleTargetCollected = (targetProfit + singleFixedCosts) / (1 - taxDecimal);
  const singleRequiredNetSales = singleTargetCollected - customerDc;
  const singleRequiredSellPrice = discountDecimal === 1 ? 0 : (singleRequiredNetSales / (1 - discountDecimal));
  
  const singleMargin = singleTargetCollected > 0 ? (targetProfit / singleTargetCollected) * 100 : 0;

  let profitScore = 0;
  let profitColor = "bg-red-500";
  let profitLabel = "BAD (LOSS)";
  let profitTextClass = "text-red-500";

  if (targetProfit <= 0) {
      profitScore = 5; profitColor = "bg-red-500"; profitLabel = "BAD (LOSS)"; profitTextClass = "text-red-500";
  } else if (singleMargin <= 10) {
      profitScore = 33; profitColor = "bg-orange-400"; profitLabel = "POOR MARGIN"; profitTextClass = "text-orange-500";
  } else if (singleMargin <= 20) {
      profitScore = 66; profitColor = "bg-yellow-400"; profitLabel = "GOOD"; profitTextClass = "text-yellow-600";
  } else if (singleMargin <= 30) {
      profitScore = 85; profitColor = "bg-green-400"; profitLabel = "BETTER"; profitTextClass = "text-green-500";
  } else {
      profitScore = 100; profitColor = "bg-emerald-500"; profitLabel = "EXCELLENT!"; profitTextClass = "text-emerald-500";
  }


  // ==========================================
  // DATABASE FUNCTIONS
  // ==========================================
  const handleSaveSingle = async () => {
    if (!selectedProductId) return toast.error("Please select a watch to update.");
    
    const finalPrice = Math.ceil(singleRequiredSellPrice);
    const prod = products.find(p => p.id === selectedProductId);
    const originalPrice = Math.ceil(finalPrice / (1 - discountDecimal));

    setIsUpdating(true);
    const { error } = await supabase.from('products').update({
        price: finalPrice,
        original_price: originalPrice,
        discount: discountPercent,
        specs: { ...prod.specs, cost_price: buyPrice }
    }).eq('id', selectedProductId);
    
    setIsUpdating(false);

    if (error) {
        toast.error("Failed to update database");
    } else {
        toast.success(`Updated ${prod.name} to Rs ${finalPrice}`);
        await saveHistoryToDb({
            productId: selectedProductId, productName: prod.name,
            oldPrice: prod.price, newPrice: finalPrice, type: 'Single Update'
        });
        if (fetchProducts) fetchProducts();
        setSelectedProductId("");
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkSelected.length === 0) return toast.error("Select at least one product");
    if (!confirm(`Update prices for ${bulkSelected.length} items to achieve Rs ${bulkTargetProfit} profit each?`)) return;

    setIsUpdating(true);
    let successCount = 0;

    for (const id of bulkSelected) {
        const prod = products.find(p => p.id === id);
        if (!prod) continue;

        const prodCost = Number(prod.specs?.cost_price) || 1500;
        const prodDiscount = Number(prod.discount) || 0;
        
        const pFixedCosts = prodCost + defaultBoxCost + actualDc + adCostPerItem + extraCost;
        const pTargetCollected = (bulkTargetProfit + pFixedCosts) / (1 - taxDecimal);
        const pRequiredNetSales = pTargetCollected - customerDc; 
        
        const pDiscDecimal = prodDiscount / 100;
        let pFinalPrice = pDiscDecimal === 1 ? 0 : Math.ceil(pRequiredNetSales / (1 - pDiscDecimal));
        const pOriginalPrice = pDiscDecimal === 1 ? 0 : Math.ceil(pFinalPrice / (1 - pDiscDecimal));

        const { error } = await supabase.from('products').update({
            price: pFinalPrice, original_price: pOriginalPrice
        }).eq('id', id);

        if (!error) {
            successCount++;
            await saveHistoryToDb({
                productId: id, productName: prod.name,
                oldPrice: prod.price, newPrice: pFinalPrice, type: 'Bulk Update'
            });
        }
    }

    setIsUpdating(false);
    toast.success(`Updated ${successCount} items!`);
    if (fetchProducts) fetchProducts();
    setBulkSelected([]);
  };

  const handleUndo = async (record: any) => {
    const prod = products.find(p => p.id === record.product_id);
    if (!prod) return toast.error("Product no longer exists");

    const pDiscDecimal = (Number(prod.discount) || 0) / 100;
    const originalP = pDiscDecimal === 1 ? 0 : Math.ceil(record.old_price / (1 - pDiscDecimal));

    const { error } = await supabase.from('products').update({
        price: record.old_price, original_price: originalP
    }).eq('id', record.product_id);

    if (error) {
        toast.error("Undo failed");
    } else {
        toast.success(`Reverted to Rs ${record.old_price}`);
        if (fetchProducts) fetchProducts();
        
        // Remove from Supabase DB History
        await supabase.from('pricing_history').delete().eq('id', record.id);
        
        // Update UI state
        setHistory(prev => prev.filter(h => h.id !== record.id));
    }
  };

  // ==========================================
  // SMART ASSISTANT LOGIC 
  // ==========================================
  const handleAskAssistant = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userText = chatInput;
      const lowerQ = userText.toLowerCase();
      setChatInput("");
      
      setChatHistory(prev => [...prev, { role: 'user', text: userText }]);

      setTimeout(() => {
          let matchedProducts: any[] = [];
          let botResponse = "";

          // 1. INTENT: LOSS & MARGINS
          if (lowerQ.includes("loss") || lowerQ.includes("losing") || lowerQ.includes("bad margin")) {
              matchedProducts = products.filter(p => {
                  const cost = Number(p.specs?.cost_price) || 0; 
                  if (cost === 0) return false; 
                  
                  const price = Number(p.price) || 0;
                  const disc = Number(p.discount) || 0;
                  
                  const pFixed = cost + defaultBoxCost + actualDc + adCostPerItem + extraCost;
                  const pCollected = price * (1 - (disc/100)) + customerDc;
                  const pTax = pCollected * (codTaxPercent / 100);
                  
                  const pProfit = pCollected - pFixed - pTax;
                  return pProfit < 0;
              });

              if (matchedProducts.length > 0) {
                  botResponse = `Boss, I analyzed the inventory. I found ${matchedProducts.length} watches that are currently resulting in a loss based on your fixed costs. You should review these immediately:`;
              } else {
                  botResponse = "Great news, Boss! I ran the numbers and none of your watches are currently selling at a loss.";
              }
          }
          
          // 2. INTENT: CATEGORIES (LADIES, MEN, COUPLE)
          else if (lowerQ.includes("ladies") || lowerQ.includes("women") || lowerQ.includes("woman") || lowerQ.includes("girls")) {
              matchedProducts = products.filter(p => p.category?.toLowerCase() === 'women' || p.category?.toLowerCase() === 'ladies');
              botResponse = `Here are all the Ladies/Women's watches in your inventory (${matchedProducts.length} found):`;
          }
          else if (lowerQ.includes("men") || lowerQ.includes("gents") || lowerQ.includes("boys")) {
              matchedProducts = products.filter(p => p.category?.toLowerCase() === 'men');
              botResponse = `Here are all the Men's watches in your inventory (${matchedProducts.length} found):`;
          }
          else if (lowerQ.includes("couple") || lowerQ.includes("matching") || lowerQ.includes("pairs")) {
              matchedProducts = products.filter(p => p.category?.toLowerCase() === 'couple');
              botResponse = `Here are all the Couple Sets in your inventory (${matchedProducts.length} found):`;
          }

          // 3. INTENT: TOTAL COUNT
          else if (lowerQ.includes("all watches") || lowerQ.includes("how many") || lowerQ.includes("total")) {
              botResponse = `You currently have a total of ${products.length} watches in your live inventory.`;
          }

          // 4. INTENT: COST UNDER/OVER
          else if ((lowerQ.includes("cost") || lowerQ.includes("buy") || lowerQ.includes("bought")) && /\d+/.test(lowerQ)) {
              const num = parseInt(lowerQ.match(/\d+/)![0], 10);
              if (lowerQ.includes("under") || lowerQ.includes("below") || lowerQ.includes("less")) {
                  matchedProducts = products.filter(p => (Number(p.specs?.cost_price) || 1500) < num);
                  botResponse = `Here are the watches that cost you less than Rs ${num} to buy:`;
              } else {
                  matchedProducts = products.filter(p => (Number(p.specs?.cost_price) || 1500) > num);
                  botResponse = `Here are the watches that cost you more than Rs ${num} to buy:`;
              }
          }

          // 5. INTENT: SELL PRICE UNDER/OVER
          else if (/\d+/.test(lowerQ)) {
              const num = parseInt(lowerQ.match(/\d+/)![0], 10);
              if (lowerQ.includes("under") || lowerQ.includes("below") || lowerQ.includes("less") || lowerQ.includes("cheap")) {
                  matchedProducts = products.filter(p => Number(p.price) < num);
                  botResponse = `Here are the watches currently selling for under Rs ${num}:`;
              } else {
                  matchedProducts = products.filter(p => Number(p.price) > num);
                  botResponse = `Here are the watches selling for more than Rs ${num}:`;
              }
          }
          
          // DEFAULT FALLBACK
          else {
              botResponse = "I didn't quite catch that. Since I am a local assistant to save you API costs, try asking specific questions like:\n- 'Show me ladies watches'\n- 'Which watches are in loss?'\n- 'Show me watches under 2500'\n- 'Watches with cost over 1000'";
          }

          setChatHistory(prev => [...prev, { role: 'bot', text: botResponse, items: matchedProducts }]);
      }, 500); 
  };

  const selectedProductData = products.find(p => p.id === selectedProductId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        
        {/* ================= HEADER & 6 TABS ================= */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
            <div>
                <h2 className="text-2xl font-serif font-bold text-aura-brown flex items-center gap-2">
                    <Calculator className="text-aura-gold" /> Pricing Engine
                </h2>
            </div>
            
            <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl gap-1">
                <button onClick={() => setActiveTab('profit')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profit' ? 'bg-white text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}>Profit Calculator</button>
                <button onClick={() => setActiveTab('target')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'target' ? 'bg-white text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}>Find Target Price</button>
                <div className="w-[1px] bg-gray-300 mx-1 hidden md:block"></div>
                <button onClick={() => setActiveTab('single')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'single' ? 'bg-aura-gold/20 text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}><Database size={16}/> Single Update</button>
                <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'bulk' ? 'bg-aura-gold/20 text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}><Layers size={16}/> Bulk Update</button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-aura-gold/20 text-aura-brown shadow' : 'text-gray-500 hover:text-aura-brown'}`}><History size={16}/> History</button>
                
                {/* AI ASSISTANT TAB */}
                <button onClick={() => setActiveTab('assistant')} className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'assistant' ? 'bg-purple-600 text-white shadow' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
                    <Sparkles size={16}/> AI Assistant
                </button>
            </div>
        </div>

        {/* ================= PAGE 1 & 2: ORIGINAL CALCULATOR ================= */}
        {(activeTab === 'profit' || activeTab === 'target') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                {/* LEFT COLUMN: INPUTS */}
                <div className="lg:col-span-7 space-y-8">
                    
                    <div className="bg-aura-gold/5 border border-aura-gold/20 p-5 rounded-xl">
                        {activeTab === 'profit' ? (
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

                    {/* Order Scenario */}
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

                    {/* Promotions & Deals */}
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

                    {/* Base Costs */}
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

                {/* RIGHT COLUMN: RECEIPT */}
                <div className="lg:col-span-5">
                    <div className="bg-[#1E1B18] text-white rounded-2xl p-6 shadow-2xl sticky top-24">
                        {activeTab === 'target' && (
                            <div className="mb-6 bg-aura-gold/20 border border-aura-gold p-4 rounded-xl text-center">
                                <p className="text-aura-gold text-xs font-bold uppercase tracking-widest mb-1">You must sell at</p>
                                <p className="text-4xl font-serif font-bold text-white">Rs {Math.ceil(requiredSellPrice).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-300 mt-2">To hit exactly Rs {targetProfit} profit after all {discountPercent}% discounts and taxes.</p>
                            </div>
                        )}

                        {activeTab === 'profit' && (
                            <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Profit</p>
                                <p className={`text-4xl font-serif font-bold ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>Rs {Math.round(netProfit).toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-2">Margin: {profitMargin.toFixed(1)}%</p>
                            </div>
                        )}

                        <div className="space-y-6 text-sm">
                            <div>
                                <h4 className="font-bold text-aura-gold mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><DollarSign size={16}/> Customer Pays (Revenue)</h4>
                                <div className="space-y-2 text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Watch(es) x{qty} {discountPercent > 0 && <span className="text-red-400 text-[10px]">(-{discountPercent}%)</span>}</span>
                                        <span>Rs {activeTab === 'target' ? Math.round(recommendedTotalCollected - boxChargeToCustomer - giftChargeToCustomer - shippingChargeToCustomer).toLocaleString() : Math.round(netWatchSales).toLocaleString()}</span>
                                    </div>
                                    {hasPremiumBox && (
                                        <div className="flex justify-between"><span>Premium Box {isFreeBox && <span className="text-green-400 text-[10px]">(FREE)</span>}</span><span>Rs {boxChargeToCustomer}</span></div>
                                    )}
                                    {hasGiftWrap && (
                                        <div className="flex justify-between"><span>Gift Wrap</span><span>Rs {giftChargeToCustomer}</span></div>
                                    )}
                                    <div className="flex justify-between"><span>Shipping {isFreeShipping && <span className="text-green-400 text-[10px]">(FREE)</span>}</span><span>Rs {shippingChargeToCustomer}</span></div>
                                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10"><span>Total Collected (COD)</span><span>Rs {activeTab === 'target' ? Math.round(recommendedTotalCollected).toLocaleString() : Math.round(totalCollectedFromCustomer).toLocaleString()}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><TrendingUp size={16} className="rotate-180"/> You Pay (Expenses)</h4>
                                <div className="space-y-2 text-gray-300">
                                    <div className="flex justify-between"><span>Watch Cost</span><span className="text-red-300">- Rs {totalWatchCost.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Box Cost</span><span className="text-red-300">- Rs {boxCostToYou.toLocaleString()}</span></div>
                                    {hasGiftWrap && <div className="flex justify-between"><span>Gift Wrap Cost</span><span className="text-red-300">- Rs {giftCostToYou.toLocaleString()}</span></div>}
                                    <div className="flex justify-between"><span>Actual DC</span><span className="text-red-300">- Rs {actualDc}</span></div>
                                    <div className="flex justify-between"><span>Ads Cost</span><span className="text-red-300">- Rs {totalAdCost}</span></div>
                                    <div className="flex justify-between"><span>Govt Tax ({codTaxPercent}%)</span><span className="text-red-300">- Rs {activeTab === 'target' ? Math.round(recommendedCodTax).toLocaleString() : Math.round(codTaxAmount).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span>Misc</span><span className="text-red-300">- Rs {extraCost}</span></div>
                                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10"><span>Total Expenses</span><span className="text-red-400">- Rs {activeTab === 'target' ? Math.round(totalWatchCost + boxCostToYou + giftCostToYou + actualDc + totalAdCost + extraCost + recommendedCodTax).toLocaleString() : Math.round(totalExpenses).toLocaleString()}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ================= PAGE 3: SMART SINGLE ITEM UPDATE ================= */}
        {activeTab === 'single' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* CUSTOM DROPDOWN FOR IMAGES */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200" ref={dropdownRef}>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">1. Select Watch to Analyze</h3>
                        
                        <div className="relative">
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full p-3 bg-white border border-gray-300 rounded-xl cursor-pointer flex items-center justify-between hover:border-aura-gold transition-colors"
                            >
                                {selectedProductData ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 relative rounded bg-gray-100 border overflow-hidden">
                                            {selectedProductData.main_image && <Image src={selectedProductData.main_image} alt="" fill className="object-cover" unoptimized/>}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-aura-brown leading-tight">{selectedProductData.name}</p>
                                            <p className="text-[10px] text-gray-500">Live Price: Rs {selectedProductData.price} | Discount: {selectedProductData.discount || 0}%</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 font-medium">Click to choose a watch...</span>
                                )}
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>

                            {/* Dropdown Options */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto z-50">
                                    {products.map(p => (
                                        <div 
                                            key={p.id}
                                            onClick={() => { setSelectedProductId(p.id); setIsDropdownOpen(false); }}
                                            className="flex items-center gap-3 p-3 hover:bg-aura-gold/10 border-b border-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="w-12 h-12 relative rounded bg-gray-100 flex-shrink-0 border overflow-hidden">
                                                {p.main_image && <Image src={p.main_image} alt="" fill className="object-cover" unoptimized/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                                <div className="flex gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Cost: {p.specs?.cost_price || '---'}</span>
                                                    <span className="text-[10px] font-bold text-aura-gold bg-aura-gold/10 px-2 py-0.5 rounded">Sell: {p.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cost Price (Buying)</label>
                            <input type="number" value={buyPrice} onChange={e=>setBuyPrice(Number(e.target.value))} className="w-full p-2 mt-2 border rounded-lg font-bold" />
                        </div>
                        <div className="bg-white p-4 rounded-xl border">
                            <label className="text-xs font-bold text-gray-500 uppercase">Active Discount %</label>
                            <input type="number" value={discountPercent} onChange={e=>setDiscountPercent(Number(e.target.value))} className="w-full p-2 mt-2 border rounded-lg font-bold text-red-500" />
                        </div>
                    </div>

                    <div className="bg-aura-gold/10 p-5 rounded-2xl border border-aura-gold/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-aura-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">EDITABLE</div>
                        <label className="text-sm font-bold text-aura-brown uppercase tracking-widest flex items-center gap-2">
                            Desired Profit (Rs) 
                            {selectedProductId && <span className="text-xs normal-case text-gray-500 font-medium ml-2">(Auto-filled with current profit)</span>}
                        </label>
                        <input type="number" value={targetProfit} onChange={e=>setTargetProfit(Number(e.target.value))} className="w-full p-4 mt-3 border-2 border-white rounded-xl font-bold text-3xl outline-none shadow-inner text-aura-brown focus:ring-2 focus:ring-aura-gold" />
                    </div>
                </div>

                <div className="lg:col-span-5 bg-[#1E1B18] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="text-center mb-6">
                            <p className="text-aura-gold text-xs font-bold uppercase tracking-widest">Required Sell Price</p>
                            <p className="text-6xl font-serif font-bold my-4">Rs {Math.ceil(singleRequiredSellPrice).toLocaleString()}</p>
                            {selectedProductData && (
                                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
                                    Current Live Price: <span className="line-through">Rs {selectedProductData.price}</span>
                                </div>
                            )}
                        </div>

                        {/* PROFITABILITY BAR UI */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Health Score</span>
                                <span className={`text-sm font-black ${profitTextClass}`}>{profitLabel}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${profitColor}`} style={{ width: `${profitScore}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[9px] mt-2 text-gray-500 font-bold uppercase">
                                <span>Loss</span><span>Good</span><span>Better</span><span>Excellent</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex justify-between"><span>Delivery Cost (Paid by you)</span> <span>Rs {actualDc}</span></div>
                            <div className="flex justify-between"><span>Standard Box Cost</span> <span>Rs {defaultBoxCost}</span></div>
                            <div className="flex justify-between"><span>Ads & Extra Buffer</span> <span>Rs {adCostPerItem + extraCost}</span></div>
                            <div className="flex justify-between text-red-300 font-medium"><span>Govt COD Tax (4%)</span> <span>Auto-Calculated</span></div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveSingle}
                        disabled={!selectedProductId || isUpdating}
                        className="w-full py-4 bg-aura-gold text-black rounded-xl font-bold tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                    >
                        {isUpdating ? <RefreshCcw className="animate-spin" size={18}/> : <Save size={18}/>} 
                        {selectedProductId ? "UPDATE PRICE IN DATABASE" : "SELECT A WATCH FIRST"}
                    </button>
                </div>
            </div>
        )}

        {/* ================= PAGE 4: BULK UPDATE ================= */}
        {activeTab === 'bulk' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-aura-gold/10 border border-aura-gold/30 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h3 className="font-bold text-aura-brown text-lg">Mass Profit Target</h3>
                        <p className="text-sm text-gray-600">Enter a single profit amount. The engine will calculate the exact required selling price for every selected watch based on its unique cost price and discount.</p>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="text-xs font-bold text-gray-500 uppercase">Target Profit (Rs)</label>
                        <input type="number" value={bulkTargetProfit} onChange={e=>setBulkTargetProfit(Number(e.target.value))} className="w-full p-4 mt-1 border rounded-xl font-bold text-xl outline-none bg-white focus:border-aura-gold" />
                    </div>
                    <button onClick={handleBulkUpdate} disabled={bulkSelected.length === 0 || isUpdating} className="w-full md:w-auto px-8 py-4 bg-[#1E1B18] text-white rounded-xl font-bold hover:bg-aura-brown transition-colors disabled:opacity-50 shadow-lg">
                        {isUpdating ? "Updating Database..." : `Update ${bulkSelected.length} Items Live`}
                    </button>
                </div>

                <div className="border rounded-xl overflow-hidden bg-white">
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <div className="flex gap-4">
                            <button onClick={() => setBulkSelected(products.map(p => p.id))} className="text-xs font-bold text-blue-600 hover:underline">Select All Inventory</button>
                            <button onClick={() => setBulkSelected([])} className="text-xs font-bold text-gray-500 hover:underline">Clear Selection</button>
                        </div>
                        <span className="text-xs font-bold bg-aura-gold/20 text-aura-brown px-3 py-1 rounded-full">{bulkSelected.length} Selected</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {products.map(p => (
                            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${bulkSelected.includes(p.id) ? 'bg-blue-50 border-blue-300 shadow-sm' : 'hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={bulkSelected.includes(p.id)} onChange={(e) => e.target.checked ? setBulkSelected([...bulkSelected, p.id]) : setBulkSelected(bulkSelected.filter(id => id !== p.id))} className="w-5 h-5 accent-blue-600"/>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 relative rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border">
                                        {p.main_image && <Image src={p.main_image} alt="" fill className="object-cover" unoptimized/>}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold truncate text-gray-800">{p.name}</p>
                                        <p className="text-[10px] text-gray-500">Cost: Rs {p.specs?.cost_price || 1500} <span className="mx-1">|</span> Sell: Rs {p.price}</p>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ================= PAGE 5: HISTORY (FROM SUPABASE) ================= */}
        {activeTab === 'history' && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm animate-in fade-in">
                {history.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                        <History size={48} className="mb-4 opacity-20"/>
                        <p className="font-bold">No update history found in Database.</p>
                        <p className="text-sm">Price changes made here will sync to the server and appear in this log.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product Changed</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Update Type</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price Change</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Emergency Revert</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-xs text-gray-500">{record.date_string}</td>
                                        <td className="p-4 text-sm font-bold text-aura-brown">{record.product_name}</td>
                                        <td className="p-4 text-xs">
                                            <span className={`px-2 py-1 rounded-md font-bold ${record.type === 'Bulk Update' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="text-gray-400 line-through mr-2">Rs {record.old_price}</span>
                                            <span className="text-green-600 font-bold">Rs {record.new_price}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleUndo(record)} 
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
                                            >
                                                UNDO CHANGE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {/* ================= PAGE 6: AI ASSISTANT ================= */}
        {activeTab === 'assistant' && (
            <div className="flex flex-col h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 animate-in fade-in">
                {/* Chat Header */}
                <div className="bg-purple-600 text-white p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">AURA-X Pricing Intelligence</h3>
                        <p className="text-xs text-purple-200">Ask me to analyze your inventory data</p>
                    </div>
                </div>

                {/* Chat Body */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-500' : 'bg-purple-100 text-purple-600'}`}>
                                    {msg.role === 'user' ? <UserIcon size={16}/> : <Bot size={16}/>}
                                </div>
                                
                                <div>
                                    <div className={`p-4 rounded-2xl whitespace-pre-wrap text-sm ${msg.role === 'user' ? 'bg-aura-brown text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                    
                                    {/* Render Products if Assistant found any */}
                                    {msg.items && msg.items.length > 0 && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {msg.items.map(p => (
                                                <div key={p.id} className="bg-white border border-gray-200 p-2 rounded-lg flex items-center gap-3 shadow-sm">
                                                    <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
                                                        {p.main_image && <Image src={p.main_image} alt="" fill className="object-cover" unoptimized/>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                                                        <p className="text-[10px] text-gray-500">Sell: Rs {p.price} | Cost: Rs {p.specs?.cost_price || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleAskAssistant} className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="e.g. Show me watches in loss..."
                            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={!chatInput.trim()}
                            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
}