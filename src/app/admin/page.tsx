"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import Image from "next/image";
import { 
  Plus, Trash2, X, Save, Upload, LogOut, LayoutGrid, 
  ShoppingCart, Eye, Edit2, Flame, CheckCircle, 
  Clock, Truck, XCircle, Check, Phone, Mail, MapPin, 
  FileText, Menu, MessageCircle, Tag, Settings, Package, 
  DollarSign, TrendingUp, TrendingDown, AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- CONFIGURATION ---
const PACKING_AND_SHIPPING_COST = 250; // Edit this value to change expense per order

// --- HELPER: Image Compression ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => { if (blob) resolve(blob); }, "image/jpeg", 0.7);
      };
    };
  });
};

const uploadImageToSupabase = async (file: File | Blob, fileNameRaw: string) => {
  const fileName = `${Date.now()}-${fileNameRaw.replace(/\s/g, '-')}.jpg`;
  const { error } = await supabase.storage.from('product-images').upload(fileName, file);
  if (error) { console.error("Upload Error", error); return null; }
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return publicUrl;
};

export default function AdminDashboard() {
  const { isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'finance'>('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // DATA STATE
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("Processing");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  // FINANCE STATE
  const [financeStats, setFinanceStats] = useState({ revenue: 0, cost: 0, expenses: 0, profit: 0, cancelledLoss: 0 });

  // FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // FORM DATA
  const initialFormState = {
    name: "", brand: "AURA-X", sku: "", stock: 10, category: "men", 
    price: 0, originalPrice: 0, discount: 0, costPrice: 0,
    tags: [] as string[], priority: 50, viewCount: 840,
    movement: "Quartz", waterResistance: "3ATM", glass: "Mineral", 
    caseMaterial: "Stainless Steel", caseColor: "Silver", caseShape: "Round", caseDiameter: "40mm", caseThickness: "10mm",
    strapMaterial: "Leather", strapColor: "Brown", strapWidth: "20mm", adjustable: true,
    dialColor: "White", luminous: false, dateDisplay: false, weight: "150g",
    description: "", warranty: "1 Year Official Warranty", shippingText: "2-4 Working Days", returnPolicy: "7 Days Return Policy", boxIncluded: true,
    mainImage: "", gallery: [] as string[], colors: [] as { name: string; hex: string; image: string }[]
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- AUTH CHECK ---
  useEffect(() => {
    if (!isLoading && !isAdmin) router.push("/login");
  }, [isAdmin, isLoading, router]);

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchProducts();
    fetchOrders();

    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          setOrders((prev) => [payload.new, ...prev]);
          toast.success("New Order Received!", { duration: 5000, icon: '🎉' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if(orders.length > 0) calculateFinance(orders, products);
  }, [orders, products]);

  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('rating', { ascending: false });
      if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  // --- FINANCE LOGIC ---
  const calculateFinance = (currentOrders: any[], currentProducts: any[]) => {
      let revenue = 0;
      let costOfGoods = 0;
      let expenses = 0; 
      let cancelledLoss = 0;

      currentOrders.forEach(order => {
          if (order.status === 'Cancelled') {
              cancelledLoss += 0; // Future: Add ad spend here
              return; 
          }

          revenue += Number(order.total);
          expenses += PACKING_AND_SHIPPING_COST;

          // Calculate Cost of Goods based on matched Product ID or Name
          if (order.items) {
              order.items.forEach((item: any) => {
                  // Find original product to get Cost Price (Saved in inventory)
                  const product = currentProducts.find(p => p.name === item.name);
                  const cost = product?.specs?.cost_price || 0;
                  costOfGoods += (Number(cost) * Number(item.quantity));
              });
          }
      });

      setFinanceStats({
          revenue,
          cost: costOfGoods,
          expenses,
          cancelledLoss,
          profit: revenue - costOfGoods - expenses - cancelledLoss
      });
  };

  // --- HANDLERS ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      toast.success(`Marked as ${newStatus}`);
  };

  const saveAdminNote = async () => {
      if (!selectedOrder) return;
      const updatedOrder = { ...selectedOrder, admin_notes: adminNote };
      setSelectedOrder(updatedOrder);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      await supabase.from('orders').update({ admin_notes: adminNote }).eq('id', selectedOrder.id);
      toast.success("Note Saved");
  };

  const openOrderDetails = (order: any) => {
      setSelectedOrder(order);
      setAdminNote(order.admin_notes || "");
  };

  const sendWhatsApp = () => {
      if (!selectedOrder) return;
      const text = `Hi ${selectedOrder.customer_name}, regarding your order #ORD-${selectedOrder.id.slice(0,8).toUpperCase()}...`;
      const url = `https://wa.me/${selectedOrder.phone?.replace(/^0/, '92').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  // --- FORM HANDLERS ---
  const handlePriceChange = (field: string, value: number) => {
    let newForm = { ...formData, [field]: value };
    if (field === 'originalPrice' || field === 'discount') {
        const discountAmount = (newForm.originalPrice * newForm.discount) / 100;
        newForm.price = Math.round(newForm.originalPrice - discountAmount);
    }
    setFormData(newForm);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'color', index?: number) => {
    if (!e.target.files?.[0]) return;
    const compressedBlob = await compressImage(e.target.files[0]);
    const url = await uploadImageToSupabase(compressedBlob, e.target.files[0].name);
    if (!url) return;
    if (type === 'main') setFormData({ ...formData, mainImage: url });
    else if (type === 'gallery') setFormData({ ...formData, gallery: [...formData.gallery, url] });
    else if (type === 'color' && index !== undefined) {
        const newColors = [...formData.colors];
        newColors[index].image = url;
        setFormData({ ...formData, colors: newColors });
    }
  };

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    else setFormData({ ...formData, tags: [...formData.tags, tag] });
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      const productPayload = {
          name: formData.name, brand: formData.brand, category: formData.category, 
          price: formData.price, original_price: formData.originalPrice, discount: formData.discount, 
          description: formData.description, main_image: formData.mainImage, tags: formData.tags, 
          rating: formData.priority, is_sale: formData.discount > 0, colors: formData.colors, 
          specs: { 
             sku: formData.sku, stock: formData.stock, cost_price: formData.costPrice, view_count: formData.viewCount,
             movement: formData.movement, water_resistance: formData.waterResistance, glass: formData.glass,
             case_material: formData.caseMaterial, case_color: formData.caseColor, case_shape: formData.caseShape, case_size: formData.caseDiameter, case_thickness: formData.caseThickness,
             strap: formData.strapMaterial, strap_color: formData.strapColor, strap_width: formData.strapWidth, adjustable: formData.adjustable,
             dial_color: formData.dialColor, luminous: formData.luminous, date_display: formData.dateDisplay, weight: formData.weight,
             warranty: formData.warranty, shipping_text: formData.shippingText, return_policy: formData.returnPolicy, box_included: formData.boxIncluded,
             gallery: formData.gallery
          }
      };

      if (isEditing && editId) {
          await supabase.from('products').update(productPayload).eq('id', editId);
          toast.success("Product Updated");
      } else {
          await supabase.from('products').insert([productPayload]);
          toast.success("Product Published");
      }
      setShowForm(false); fetchProducts();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1E1B18] text-white flex items-center justify-between px-4 z-40 shadow-md">
            <span className="font-serif font-bold text-aura-gold">AURA-X ADMIN</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
        </div>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1B18] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
            <div className="p-8 border-b border-white/10 hidden md:block">
                <h2 className="text-2xl font-serif font-bold text-aura-gold">AURA-X</h2>
                <p className="text-xs text-white/50 tracking-widest uppercase">Admin Portal</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0">
                <button onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><LayoutGrid size={20} /> Inventory</button>
                <button onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <ShoppingCart size={20} /> Orders 
                    {orders.filter(o => o.status === 'Processing').length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">{orders.filter(o => o.status === 'Processing').length}</span>}
                </button>
                <button onClick={() => { setActiveTab('finance'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <DollarSign size={20} /> Finance
                </button>
            </nav>
            <div className="p-4 border-t border-white/10 absolute bottom-0 w-full">
                <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-white transition w-full px-4 py-2"><LogOut size={16}/> Logout</button>
            </div>
        </aside>

        {/* OVERLAY for Mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8">
            
            {/* === FINANCE TAB === */}
            {activeTab === 'finance' && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-20">
                    <h1 className="text-3xl font-bold text-[#1E1B18]">Financial Overview</h1>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p><div className="bg-green-50 p-2 rounded-full text-green-600"><TrendingUp size={16}/></div></div>
                            <p className="text-2xl font-bold text-aura-brown mt-2">Rs {financeStats.revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Cost of Goods</p><div className="bg-red-50 p-2 rounded-full text-red-500"><TrendingDown size={16}/></div></div>
                            <p className="text-2xl font-bold text-red-400 mt-2">- Rs {financeStats.cost.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Based on 'Cost Price' in inventory</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start"><p className="text-xs font-bold text-gray-400 uppercase">Expenses</p><div className="bg-orange-50 p-2 rounded-full text-orange-500"><Truck size={16}/></div></div>
                            <p className="text-2xl font-bold text-orange-400 mt-2">- Rs {financeStats.expenses.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Calculated as Rs {PACKING_AND_SHIPPING_COST} / order</p>
                        </div>
                        <div className="bg-[#1E1B18] p-6 rounded-2xl border border-gray-100 shadow-lg text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-aura-gold uppercase">Net Profit</p>
                                <p className="text-3xl font-bold mt-2">Rs {financeStats.profit.toLocaleString()}</p>
                            </div>
                            <DollarSign className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
                        </div>
                    </div>
                </div>
            )}

            {/* === INVENTORY TAB === */}
            {activeTab === 'inventory' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Inventory</h1>
                        <button onClick={() => { setFormData(initialFormState); setIsEditing(false); setShowForm(true); }} className="bg-aura-brown text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-aura-gold transition-colors shadow-lg text-sm md:text-base"><Plus size={18} /> Add New</button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto pb-20">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4 text-xs font-bold text-gray-400 uppercase">Product</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Stock</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Price</th><th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">{item.main_image && <Image src={item.main_image} alt="" fill className="object-cover" unoptimized />}</div>
                                            <div className="truncate max-w-[150px]"><p className="font-bold text-aura-brown text-sm">{item.name}</p></div>
                                        </td>
                                        <td className="p-4 text-sm">{item.specs?.stock}</td>
                                        <td className="p-4 font-bold text-aura-brown text-sm">Rs {item.price.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setFormData({...initialFormState, ...item, ...item.specs}); setEditId(item.id); setIsEditing(true); setShowForm(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 size={14}/></button>
                                                <button onClick={() => { if(confirm("Delete?")) { supabase.from('products').delete().eq('id', item.id).then(fetchProducts); } }} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* === ORDERS TAB === */}
            {activeTab === 'orders' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Orders</h1>
                    </div>
                    {/* Status Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide">
                        {["Processing", "Shipped", "Delivered", "Cancelled"].map(status => (
                            <button key={status} onClick={() => setOrderStatusFilter(status)} className={`px-4 md:px-6 py-3 whitespace-nowrap rounded-t-xl font-bold text-sm transition-all relative ${orderStatusFilter === status ? 'bg-white text-aura-brown border-t border-x border-gray-200 -mb-[1px] z-10' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                {status}
                                {status === 'Processing' && orders.filter(o => o.status === 'Processing').length > 0 && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{orders.filter(o => o.status === 'Processing').length}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pb-20">
                        {orders.filter(o => o.status === orderStatusFilter).map((order) => (
                            <div key={order.id} onClick={() => openOrderDetails(order)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-aura-gold transition-colors">
                                <div className="flex items-center gap-4 w-full">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${order.status === 'Processing' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                        {order.status === 'Processing' ? <Clock size={18}/> : <Check size={18}/>}
                                    </div>
                                    <div>
                                        {/* Consistent ID Display */}
                                        <p className="font-bold text-aura-brown text-sm md:text-base">#{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-gray-500">{order.customer_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between w-full md:w-auto items-center gap-4">
                                    <p className="text-lg font-bold text-aura-brown">Rs {Number(order.total).toLocaleString()}</p>
                                    <span className="md:hidden px-2 py-1 bg-gray-100 rounded text-xs">{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* === ORDER DETAIL MODAL (MOBILE RESPONSIVE FIX) === */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    {/* Changed flex-row to flex-col on mobile, added max-h-[90vh] */}
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 shadow-2xl relative">
                        
                        {/* Close Button Mobile */}
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 md:hidden p-2 bg-gray-100 rounded-full z-50"><X size={20}/></button>

                        {/* LEFT: DETAILS */}
                        <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-2xl font-bold text-aura-brown">Order #{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="hidden md:block p-2 hover:bg-gray-200 rounded-full"><X size={24}/></button>
                            </div>
                            
                            {/* Actions */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    {["Processing", "Shipped", "Delivered", "Cancelled"].map(st => (
                                        <button key={st} onClick={() => handleStatusChange(selectedOrder.id, st)} className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border whitespace-nowrap ${selectedOrder.status === st ? 'bg-aura-brown text-white border-aura-brown' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{st}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center border-b pb-2 mb-2">
                                    <h4 className="font-bold text-aura-brown text-sm">Customer Details</h4>
                                    <button onClick={sendWhatsApp} className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100"><MessageCircle size={14}/> WhatsApp</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex gap-3"><Check size={16} className="text-gray-400"/> <span>{selectedOrder.customer_name}</span></div>
                                    <div className="flex gap-3"><Phone size={16} className="text-gray-400"/> <span>{selectedOrder.phone}</span></div>
                                    <div className="flex gap-3"><Mail size={16} className="text-gray-400"/> <span>{selectedOrder.email}</span></div>
                                    <div className="flex gap-3"><MapPin size={16} className="text-gray-400"/> <span>{selectedOrder.address}, {selectedOrder.city}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-aura-brown mb-2 text-sm">Admin Notes</h4>
                                <textarea className="w-full p-3 text-sm border border-gray-300 rounded-xl bg-white h-20" placeholder="Internal notes (visible only to you)..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                                <button onClick={saveAdminNote} className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold w-full md:w-auto">Save Note</button>
                            </div>
                        </div>

                        {/* RIGHT: ITEMS LIST */}
                        <div className="w-full md:w-[400px] bg-white border-l border-gray-100 p-6 md:p-8">
                            <h4 className="font-bold text-aura-brown mb-4">Items ({selectedOrder.items?.length})</h4>
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                                {selectedOrder.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                                        <div className="w-14 h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">{item.image && <Image src={item.image} alt="" fill className="object-contain p-1"/>}</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-aura-brown line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.color} • x{item.quantity}</p>
                                            <div className="flex gap-2 flex-wrap mt-1">
                                                {item.isGift && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded">Gift Wrap</span>}
                                                {item.addBox && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 rounded">Box</span>}
                                            </div>
                                        </div>
                                        <p className="font-bold text-xs mt-1">Rs {item.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span> <span>Rs {selectedOrder.total.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span> <span>Paid</span></div>
                                <div className="flex justify-between text-xl font-bold text-aura-brown mt-2 pt-2 border-t border-gray-100"><span>Total</span> <span>Rs {Number(selectedOrder.total).toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === ADD PRODUCT FORM (Mobile Responsive) === */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-50"><X /></button>
                        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-40">
                             <h2 className="text-2xl font-bold font-serif text-aura-brown">{isEditing ? "Edit Timepiece" : "Add New Timepiece"}</h2>
                        </div>
                        
                        <form onSubmit={handlePublish} className="p-8 space-y-12">
                            {/* 1. IDENTITY */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Product Name</label><input required className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Oak Rose Gold" /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Brand</label><input className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">SKU</label><input className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="AX-001" /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Category</label><select className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option value="men">Men's</option><option value="women">Women's</option><option value="couple">Couple</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Stock Qty</label><input type="number" className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            {/* 2. DESCRIPTION */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Description</h3>
                                <textarea className="w-full p-4 bg-gray-50 border rounded-xl h-32 resize-none" placeholder="Write a catchy description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </section>

                            {/* 3. MARKETING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Flame size={16}/> Marketing & Sorting</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tags</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["Featured", "Sale", "Limited Edition", "Fire", "New Arrival"].map(tag => (
                                                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${formData.tags.includes(tag) ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white text-gray-400 border-gray-200'}`}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">Priority (1-100)</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.priority} onChange={e => setFormData({...formData, priority: Number(e.target.value)})} /></div>
                                        <div><label className="text-xs font-bold text-gray-500">Fake Views</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.viewCount} onChange={e => setFormData({...formData, viewCount: Number(e.target.value)})} /></div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. PRICING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Pricing</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <div><label className="text-xs font-bold text-gray-500">Original Price</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.originalPrice} onChange={e => handlePriceChange('originalPrice', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Discount %</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.discount} onChange={e => handlePriceChange('discount', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-aura-brown">Sale Price</label><div className="w-full p-3 bg-aura-gold/20 rounded-xl font-bold text-aura-brown">Rs {formData.price.toLocaleString()}</div></div>
                                    <div><label className="text-xs font-bold text-gray-400">Cost Price (For Finance Tab)</label><input type="number" className="w-full p-3 border rounded-xl bg-white" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            {/* 5. VISUALS */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Visuals</h3>
                                <div className="flex gap-6 mb-6">
                                    <div className="w-40">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Main Image</label>
                                        <label className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold ${formData.mainImage ? 'border-aura-gold' : 'border-gray-300'}`}>
                                            {formData.mainImage ? <Image src={formData.mainImage} alt="" fill className="object-cover" /> : <div className="text-center"><Upload size={24} className="mx-auto text-gray-300"/><span className="text-xs text-gray-400">Upload</span></div>}
                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'main')}/>
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Gallery</label>
                                        <div className="flex gap-4 overflow-x-auto pb-2">
                                            {formData.gallery.map((img, i) => (<div key={i} className="w-24 h-24 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200"><Image src={img} alt="" fill className="object-cover"/></div>))}
                                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold flex-shrink-0"><Plus size={20} className="text-gray-400"/><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery')}/></label>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-4 uppercase">Color Variants</label>
                                    <div className="space-y-4">
                                        {formData.colors.map((color, index) => (
                                            <div key={index} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
                                                <input type="color" className="w-10 h-10 rounded border-none cursor-pointer" value={color.hex} onChange={(e) => { const c = [...formData.colors]; c[index].hex = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <input placeholder="Color Name" className="flex-1 p-2 border rounded-lg text-sm" value={color.name} onChange={(e) => { const c = [...formData.colors]; c[index].name = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-200">
                                                    {color.image ? "Image Uploaded" : "Upload Image"} <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'color', index)}/>
                                                </label>
                                                <button type="button" onClick={() => setFormData({...formData, colors: formData.colors.filter((_, i) => i !== index)})} className="text-red-400"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setFormData({...formData, colors: [...formData.colors, { name: "", hex: "#000000", image: "" }]})} className="text-sm font-bold text-aura-brown flex items-center gap-2"><Plus size={16} /> Add Color Variant</button>
                                    </div>
                                </div>
                            </section>

                            {/* 6. SPECS */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Specifications</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Case & Dial</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Material</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseMaterial} onChange={e => setFormData({...formData, caseMaterial: e.target.value})}><option>Stainless Steel</option><option>Alloy</option><option>Titanium</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Diameter</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseDiameter} onChange={e => setFormData({...formData, caseDiameter: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Thickness</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseThickness} onChange={e => setFormData({...formData, caseThickness: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Glass Type</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.glass} onChange={e => setFormData({...formData, glass: e.target.value})}><option>Mineral</option><option>Sapphire</option><option>Hardlex</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Dial Color</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.dialColor} onChange={e => setFormData({...formData, dialColor: e.target.value})} /></div>

                                    <div className="col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Strap & Movement</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Material</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.strapMaterial} onChange={e => setFormData({...formData, strapMaterial: e.target.value})}><option>Leather</option><option>Metal</option><option>Chain</option><option>Silicon</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Color</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.strapColor} onChange={e => setFormData({...formData, strapColor: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Movement</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.movement} onChange={e => setFormData({...formData, movement: e.target.value})}><option>Quartz (Battery)</option><option>Automatic (Mechanical)</option><option>Digital</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Water Resistance</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.waterResistance} onChange={e => setFormData({...formData, waterResistance: e.target.value})}><option>3ATM (Splash)</option><option>5ATM (Swim)</option><option>10ATM (Dive)</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Weight</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                                    
                                    <div className="col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Features</h4></div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.luminous} onChange={e => setFormData({...formData, luminous: e.target.checked})} /> Luminous Hands</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.dateDisplay} onChange={e => setFormData({...formData, dateDisplay: e.target.checked})} /> Date Display</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.boxIncluded} onChange={e => setFormData({...formData, boxIncluded: e.target.checked})} /> Box Included</label>
                                    </div>
                                </div>
                            </section>

                            {/* 7. SHIPPING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Package size={16}/> Shipping & Warranty</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-xs font-bold text-gray-500">Warranty Text</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Shipping Info</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.shippingText} onChange={e => setFormData({...formData, shippingText: e.target.value})} /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Return Policy</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.returnPolicy} onChange={e => setFormData({...formData, returnPolicy: e.target.value})} /></div>
                                </div>
                            </section>

                            <div className="pt-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white p-4 z-50">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-8 py-3 rounded-xl bg-aura-brown text-white font-bold hover:bg-aura-gold transition-colors flex items-center gap-2 shadow-xl"><Save size={18} /> {isEditing ? "Update Timepiece" : "Publish Timepiece"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}