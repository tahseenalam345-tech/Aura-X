"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { 
  Clock, Check, Trash2, MessageCircle, 
  Phone, Mail, MapPin, X 
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersTab({ orders, fetchOrders }: { orders: any[], fetchOrders: () => void }) {
  // --- STATE ---
  const [orderStatusFilter, setOrderStatusFilter] = useState("Processing");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  // --- HANDLERS ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
      // Optimistic UI Update
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

  const saveAdminNote = async () => {
      if (!selectedOrder) return;
      
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: adminNote })
        .eq('id', selectedOrder.id);

      if (error) {
          toast.error("Failed to save note");
      } else {
          setSelectedOrder({ ...selectedOrder, admin_notes: adminNote });
          toast.success("Note Saved");
          fetchOrders();
      }
  };

  const openOrderDetails = (order: any) => {
      setSelectedOrder(order);
      setAdminNote(order.admin_notes || "");
  };

  const sendWhatsApp = () => {
      if (!selectedOrder) return;
      // FIX: Use order_code for WhatsApp message
      const displayId = selectedOrder.order_code || selectedOrder.id.slice(0,8).toUpperCase();
      const text = `Hi ${selectedOrder.customer_name}, regarding your order #${displayId}...`;
      
      const rawNumber = selectedOrder.phone || "";
      const fmtNumber = rawNumber.replace(/\D/g, '').replace(/^0/, '92');
      
      const url = `https://wa.me/${fmtNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Orders</h1>
        </div>

        {/* STATUS FILTER TABS */}
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

        {/* ORDERS LIST */}
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
                            {/* FIX: Display order_code instead of ID slice */}
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

        {/* === ORDER DETAIL MODAL === */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                <div className="bg-white w-full max-w-5xl h-[100dvh] md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 shadow-2xl relative">
                    <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 md:hidden p-2 bg-gray-100 rounded-full z-50"><X size={20}/></button>
                    
                    {/* LEFT SIDE: DETAILS */}
                    <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pt-8 md:pt-0">
                            {/* FIX: Display order_code in Modal Title */}
                            <h3 className="font-serif text-2xl font-bold text-aura-brown">
                                {selectedOrder.order_code || `Order #${selectedOrder.id.slice(0,8).toUpperCase()}`}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => deleteOrder(selectedOrder.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete Order"><Trash2 size={20}/></button>
                                <button onClick={() => setSelectedOrder(null)} className="hidden md:block p-2 hover:bg-gray-200 rounded-full"><X size={24}/></button>
                            </div>
                        </div>

                        {/* Status Switcher */}
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

                        {/* Customer Info */}
                        <div className="space-y-4 mb-8 bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                <h4 className="font-bold text-aura-brown text-sm">Customer Details</h4>
                                <button onClick={sendWhatsApp} className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100"><MessageCircle size={14}/> WhatsApp</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex gap-3"><Check size={16} className="text-gray-400"/> <span className="break-words">{selectedOrder.customer_name || "N/A"}</span></div>
                                <div className="flex gap-3"><Phone size={16} className="text-gray-400"/> <span>{selectedOrder.phone || "N/A"}</span></div>
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
                            <button onClick={saveAdminNote} className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold w-full md:w-auto">Save Note</button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: ITEMS */}
                    <div className="w-full md:w-[400px] bg-white border-l border-gray-100 p-6 md:p-8">
                        <h4 className="font-bold text-aura-brown mb-4">Items ({selectedOrder.items?.length})</h4>
                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                            {selectedOrder.items?.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                                    <div className="w-14 h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">
                                        {item.image ? (
                                            <Image src={item.image} alt="" fill className="object-contain p-1"/>
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-aura-brown line-clamp-1">{item.name || "Unknown Item"}</p>
                                        <p className="text-xs text-gray-500">{(item.color || "Standard")} • x{item.quantity || 1}</p>
                                        <div className="flex gap-2 flex-wrap mt-1">
                                            {item.isGift && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded">Gift Wrap</span>}
                                            {item.addBox && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 rounded">Box</span>}
                                        </div>
                                    </div>
                                    <p className="font-bold text-xs mt-1">Rs {(item.price || 0).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span> <span>Rs {(selectedOrder.total || 0).toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span> <span>Paid</span></div>
                            <div className="flex justify-between text-xl font-bold text-aura-brown mt-2 pt-2 border-t border-gray-100"><span>Total</span> <span>Rs {(Number(selectedOrder.total) || 0).toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}