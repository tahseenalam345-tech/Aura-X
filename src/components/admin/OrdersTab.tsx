"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { 
  Clock, Check, Trash2, MessageCircle, 
  Phone, Mail, MapPin, X, Sparkles, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersTab({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  // --- STATE ---
  const [orderStatusFilter, setOrderStatusFilter] = useState("Processing");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  
  // 🚀 NEW STATE FOR INCOMPLETE ORDERS
  const [incompleteOrders, setIncompleteOrders] = useState<any[]>([]);
  const [loadingIncomplete, setLoadingIncomplete] = useState(false);
  const [isIncompleteView, setIsIncompleteView] = useState(false); // Toggle to show incomplete orders

  // --- FETCH INCOMPLETE ORDERS ---
  const fetchIncompleteOrders = async () => {
      setLoadingIncomplete(true);
      const { data, error } = await supabase
          .from('incomplete_orders')
          .select('*')
          .eq('status', 'incomplete') // Only fetch those that are still incomplete
          .order('created_at', { ascending: false });
          
      if (!error && data) {
          setIncompleteOrders(data);
      }
      setLoadingIncomplete(false);
  };

  useEffect(() => {
      if (isIncompleteView) {
          fetchIncompleteOrders();
      }
  }, [isIncompleteView]);

  // --- HANDLERS ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      
      if (error) {
          toast.error("Failed to update status");
          console.error(error);
      } else {
          toast.success(`Marked as ${newStatus}`);
          fetchOrders(); 
      }
  };

  const deleteOrder = async (orderId: string) => {
      if(!confirm("Are you sure? This will delete the order PERMANENTLY.")) return;
      
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) {
          toast.error("Failed to delete order");
      } else {
          if(selectedOrder?.id === orderId) setSelectedOrder(null);
          toast.success("Order Deleted");
          fetchOrders(); 
      }
  };

  const deleteIncompleteOrder = async (orderId: string) => {
      if(!confirm("Are you sure you want to delete this abandoned cart?")) return;
      
      const { error } = await supabase.from('incomplete_orders').delete().eq('id', orderId);
      
      if (error) {
          toast.error("Failed to delete record");
      } else {
          if(selectedOrder?.id === orderId) setSelectedOrder(null);
          toast.success("Record Deleted");
          fetchIncompleteOrders(); 
      }
  };

  const saveAdminNote = async () => {
      if (!selectedOrder) return;
      
      // If it's an incomplete order, save to that table instead
      const table = isIncompleteView ? 'incomplete_orders' : 'orders';
      
      const { error } = await supabase
        .from(table)
        .update({ admin_notes: adminNote })
        .eq('id', selectedOrder.id);

      if (error) {
          toast.error("Failed to save note");
      } else {
          setSelectedOrder({ ...selectedOrder, admin_notes: adminNote });
          toast.success("Note Saved");
          if(isIncompleteView) fetchIncompleteOrders(); else fetchOrders();
      }
  };

  const openOrderDetails = (order: any, parseCart = false) => {
      // If incomplete order, cart details might be a stringified JSON
      let processedOrder = { ...order };
      if (parseCart && typeof order.cart_details === 'string') {
          try {
              processedOrder.items = JSON.parse(order.cart_details);
          } catch(e) {
              processedOrder.items = [];
          }
      }
      
      setSelectedOrder(processedOrder);
      setAdminNote(order.admin_notes || "");
  };

  const sendWhatsApp = () => {
      if (!selectedOrder) return;
      
      let text = "";
      if (isIncompleteView) {
          text = `Hi ${selectedOrder.customer_name}, I noticed you left some beautiful items in your cart at AURA-X. Did you need any help completing your order?`;
      } else {
          const displayId = selectedOrder.order_code || selectedOrder.id.slice(0,8).toUpperCase();
          text = `Hello ${selectedOrder.customer_name}, this is regarding your order #${displayId} from AURA-X...`;
      }
      
      const rawNumber = selectedOrder.phone || "";
      const fmtNumber = rawNumber.replace(/\D/g, '').replace(/^0/, '92');
      
      const url = `https://wa.me/${fmtNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  // --- CALCULATION HELPER ---
  const getOrderTotals = (order: any) => {
      if (!order || !order.items) return { subtotal: 0, shipping: 0, comboDiscount: 0 };
      
      let itemTotal = 0;
      
      order.items.forEach((item: any) => {
          const giftCost = item.isGift ? 300 : 0;
          const qty = item.quantity || 1;
          itemTotal += ((item.price + giftCost) * qty);
      });

      const shipping = 0; // Updated to match free shipping policy
      
      const expectedTotalWithoutShipping = itemTotal;
      const actualDatabaseTotal = Number(order.total_amount || order.total); 
      
      let comboDiscount = 0;
      if (actualDatabaseTotal < (expectedTotalWithoutShipping + shipping) && actualDatabaseTotal > 0) {
         comboDiscount = (expectedTotalWithoutShipping + shipping) - actualDatabaseTotal;
      }

      return { subtotal: itemTotal, shipping, comboDiscount };
  };

  const { subtotal, shipping, comboDiscount } = selectedOrder ? getOrderTotals(selectedOrder) : { subtotal: 0, shipping: 0, comboDiscount: 0 };

  return (
    <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Orders Management</h1>
            
            {/* 🚀 TOGGLE VIEW BUTTON */}
            <button 
                onClick={() => { setIsIncompleteView(!isIncompleteView); setSelectedOrder(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${isIncompleteView ? 'bg-[#1E1B18] text-white border-[#1E1B18]' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
            >
                {isIncompleteView ? <Check size={16}/> : <AlertCircle size={16}/>}
                {isIncompleteView ? "Back to Live Orders" : "View Abandoned Carts"}
            </button>
        </div>

        {/* STATUS FILTER TABS (Only show for live orders) */}
        {!isIncompleteView && (
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide">
                {["Processing", "Shipped", "Delivered", "Cancelled"].map(status => (
                    <button 
                        key={status} 
                        onClick={() => setOrderStatusFilter(status)} 
                        className={`px-4 md:px-6 py-3 whitespace-nowrap rounded-t-xl font-bold text-sm transition-all relative ${orderStatusFilter === status ? 'bg-white text-aura-brown border-t border-x border-gray-200 -mb-[1px] z-10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                        {status}
                        {status === 'Processing' && orders.filter(o => o.status === 'Processing').length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                {orders.filter(o => o.status === 'Processing').length}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        )}

        {/* 🚀 INCOMPLETE ORDERS VIEW */}
        {isIncompleteView ? (
            <div className="space-y-4 pb-20">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-4">
                    <strong>Abandoned Carts:</strong> These customers started filling out the checkout form but left without completing the order. Call or WhatsApp them to recover the sale!
                </div>
                
                {loadingIncomplete ? (
                    <div className="text-center py-10 text-gray-400">Loading abandoned carts...</div>
                ) : incompleteOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">No abandoned carts found.</div>
                ) : (
                    incompleteOrders.map((order) => (
                        <div 
                            key={order.id} 
                            onClick={() => openOrderDetails(order, true)} 
                            className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-red-300 transition-colors"
                        >
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500">
                                    <AlertCircle size={18}/>
                                </div>
                                <div>
                                    <p className="font-bold text-aura-brown text-sm md:text-base">
                                        {order.customer_name || "Unknown Customer"}
                                    </p>
                                    <p className="text-xs text-gray-500">{order.phone} • {new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex justify-between w-full md:w-auto items-center gap-4">
                                <p className="text-lg font-bold text-red-500">Rs {Number(order.total_amount).toLocaleString()}</p>
                                <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold uppercase tracking-widest">Incomplete</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        ) : (
            /* 🚀 LIVE ORDERS VIEW */
            <div className="space-y-4 pb-20">
                {orders.filter(o => o.status === orderStatusFilter).map((order) => (
                    <div 
                        key={order.id} 
                        onClick={() => openOrderDetails(order)} 
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-aura-gold transition-colors"
                    >
                        <div className="flex items-center gap-4 w-full">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${order.status === 'Processing' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                {order.status === 'Processing' ? <Clock size={18}/> : <Check size={18}/>}
                            </div>
                            <div>
                                <p className="font-bold text-aura-brown text-sm md:text-base">
                                    {order.order_code || `#${order.id.slice(0, 8).toUpperCase()}`}
                                </p>
                                <p className="text-xs text-gray-500">{order.customer_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex justify-between w-full md:w-auto items-center gap-4">
                            <p className="text-lg font-bold text-aura-brown">Rs {Number(order.total).toLocaleString()}</p>
                            <span className="md:hidden px-2 py-1 bg-gray-100 rounded text-xs">{order.status}</span>
                        </div>
                    </div>
                ))}
                {orders.filter(o => o.status === orderStatusFilter).length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">No orders in this category.</div>
                )}
            </div>
        )}

        {/* === ORDER DETAIL MODAL === */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                <div className="bg-white w-full max-w-5xl h-[100dvh] md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 shadow-2xl relative">
                    <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 md:hidden p-2 bg-gray-100 rounded-full z-50"><X size={20}/></button>
                    
                    {/* LEFT SIDE: DETAILS */}
                    <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pt-8 md:pt-0">
                            <h3 className="font-serif text-2xl font-bold text-aura-brown flex items-center gap-2">
                                {isIncompleteView ? <span className="text-red-500">Abandoned Cart</span> : (selectedOrder.order_code || `Order #${selectedOrder.id.slice(0,8).toUpperCase()}`)}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => isIncompleteView ? deleteIncompleteOrder(selectedOrder.id) : deleteOrder(selectedOrder.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete Order"><Trash2 size={20}/></button>
                                <button onClick={() => setSelectedOrder(null)} className="hidden md:block p-2 hover:bg-gray-200 rounded-full"><X size={24}/></button>
                            </div>
                        </div>

                        {/* Status Switcher (Only for Live Orders) */}
                        {!isIncompleteView && (
                            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    {["Processing", "Shipped", "Delivered", "Cancelled"].map(st => (
                                        <button 
                                            key={st} 
                                            onClick={() => handleStatusChange(selectedOrder.id, st)} 
                                            className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border whitespace-nowrap ${selectedOrder.status === st ? 'bg-aura-brown text-white border-aura-brown' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className={`space-y-4 mb-8 bg-white p-4 rounded-xl border ${isIncompleteView ? 'border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                <h4 className="font-bold text-aura-brown text-sm">Customer Details</h4>
                                <button onClick={sendWhatsApp} className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 shadow-sm border border-green-200"><MessageCircle size={14}/> Recover via WhatsApp</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex gap-3"><Check size={16} className="text-gray-400"/> <span className="break-words">{selectedOrder.customer_name || "N/A"}</span></div>
                                <div className="flex gap-3"><Phone size={16} className="text-gray-400"/> <span className="font-bold">{selectedOrder.phone || "N/A"}</span></div>
                                <div className="flex gap-3"><Mail size={16} className="text-gray-400"/> <span className="break-all">{selectedOrder.email || "N/A"}</span></div>
                                <div className="flex gap-3"><MapPin size={16} className="text-gray-400"/> <span>{(selectedOrder.address || "")}, {(selectedOrder.city || "")}</span></div>
                            </div>
                        </div>

                        {/* Admin Notes */}
                        <div>
                            <h4 className="font-bold text-aura-brown mb-2 text-sm">Admin Notes</h4>
                            <textarea 
                                className="w-full p-3 text-sm border border-gray-300 rounded-xl bg-white h-24" 
                                placeholder="Internal notes (visible only to you)..." 
                                value={adminNote || ""} 
                                onChange={(e) => setAdminNote(e.target.value)} 
                            />
                            <button onClick={saveAdminNote} className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold w-full md:w-auto hover:bg-black transition-colors">Save Note</button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: ITEMS */}
                    <div className="w-full md:w-[400px] bg-white border-l border-gray-100 p-6 md:p-8 flex flex-col max-h-[100dvh]">
                        <h4 className="font-bold text-aura-brown mb-4 flex justify-between items-center">
                            Items ({selectedOrder.items?.length || 0})
                            {isIncompleteView && <span className="text-[10px] text-red-500 font-normal tracking-widest uppercase">Left in cart</span>}
                        </h4>
                        
                        <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {selectedOrder.items?.map((item: any, i: number) => {
                                const giftCost = item.isGift ? 300 : 0;
                                const unitPrice = item.price + giftCost;
                                const lineTotal = unitPrice * (item.quantity || 1);

                                return (
                                    <div key={i} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                                        <div className="w-14 h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">
                                            {item.image ? (
                                                <Image 
                                                    src={item.image} 
                                                    alt="" 
                                                    fill 
                                                    sizes="60px"
                                                    className="object-contain p-1" 
                                                    unoptimized={true}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-aura-brown line-clamp-1">{item.name || "Unknown Item"}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Variant: <span className="text-aura-gold">{(item.color || "Standard")}</span></p>
                                            
                                            <div className="flex flex-col mt-1 text-[10px] text-gray-400 font-medium">
                                                <span>Price: Rs {item.price.toLocaleString()}</span>
                                                {item.isGift && <span className="text-purple-600">+ Gift Wrap (Rs 300)</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xs">Rs {lineTotal.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400">Qty: {item.quantity || 1}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* TOTALS SUMMARY */}
                        <div className="pt-4 border-t border-gray-100 space-y-2 mt-auto">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span> 
                                <span>Rs {subtotal.toLocaleString()}</span>
                            </div>
                            
                            {comboDiscount > 0 && (
                              <div className="flex justify-between text-sm text-green-600 font-bold">
                                  <span className="flex items-center gap-1"><Sparkles size={14}/> Combo Discount</span> 
                                  <span>- Rs {comboDiscount.toLocaleString()}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span> 
                                <span className={shipping === 0 ? "text-green-500 font-bold text-[10px] uppercase tracking-widest" : ""}>{shipping === 0 ? "FREE" : `Rs ${shipping}`}</span>
                            </div>
                            
                            <div className={`flex justify-between text-xl font-bold mt-2 pt-2 border-t border-gray-100 ${isIncompleteView ? 'text-red-500' : 'text-aura-brown'}`}>
                                <span>{isIncompleteView ? "Potential Value" : "Final Paid"}</span> 
                                <span>Rs {Number(selectedOrder.total_amount || selectedOrder.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}