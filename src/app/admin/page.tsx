"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase"; 
import Image from "next/image";
import Link from "next/link"; 
import { 
  Plus, Trash2, X, Save, Upload, LogOut, LayoutGrid, 
  ShoppingCart, Eye, Edit2, Flame, CheckCircle, 
  Clock, Truck, Check, Phone, Mail, MapPin, 
  Menu, MessageCircle, Tag, Settings, Package, 
  DollarSign, TrendingUp, TrendingDown, Home,
  RotateCcw, MessageSquare, Bell, Users, Video, Star, User, 
  FileText, Calendar, RefreshCcw, Calculator, 
  Bold, Italic, Underline, Type, Table as TableIcon, Download, List
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- CONSTANTS ---
const POPULAR_COLORS = [
  "Silver", "Gold", "Rose Gold", "Black", "Two-Tone (Silver/Gold)", 
  "Two-Tone (Silver/Rose)", "Blue", "Green", "White", "Brown", 
  "Grey", "Gunmetal", "Red", "Tiffany Blue", "Champagne", 
  "Mother of Pearl", "Navy", "Yellow", "Orange", "Purple"
];

// --- HELPER: Is Video? ---
const isVideoFile = (url: string) => url?.toLowerCase().includes('.mp4') || url?.toLowerCase().includes('.webm');

// --- HELPER: Image Compression (HD) ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600; 
        
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => { 
            if (blob) resolve(blob); 
            else reject(new Error("Compression failed")); 
        }, "image/jpeg", 0.95); 
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const uploadFileToSupabase = async (file: File | Blob, fileNameRaw: string, isVideo = false) => {
  const ext = isVideo ? 'mp4' : 'jpg';
  const fileName = `${Date.now()}-${fileNameRaw.replace(/\s/g, '-').slice(0, 10)}.${ext}`;
   
  const { error } = await supabase.storage.from('product-images').upload(fileName, file); 
  if (error) { console.error("Upload Error", error); return null; }
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return publicUrl;
};

export default function AdminDashboard() {
  const { isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'finance' | 'returns' | 'messages' | 'marketing' | 'notes'>('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
   
  // DATA STATE
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("Processing");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [marketingData, setMarketingData] = useState<{launch: any[], newsletter: any[]}>({ launch: [], newsletter: [] });

  // FINANCE & SETTINGS STATE (DATABASE BACKED)
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
  // NEW: Event Timer State
  const [eidRevealDate, setEidRevealDate] = useState("");

  // NOTES STATE (DATABASE BACKED)
  const [managerNotes, setManagerNotes] = useState(""); 

  // FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // MANUAL REVIEW STATE
  const [newReview, setNewReview] = useState({ user: "", date: "", rating: 5, comment: "", image: "" });

  // FORM DATA
  const initialFormState = {
    name: "", brand: "AURA-X", sku: "", stock: 10, category: "men", 
    price: 0, originalPrice: 0, discount: 0, costPrice: 0,
    tags: [] as string[], priority: 50, viewCount: 0, 
    isEidExclusive: false, 
    movement: "Quartz", waterResistance: "3ATM", glass: "Mineral", 
    caseMaterial: "Stainless Steel", caseColor: "Silver", caseShape: "Round", caseDiameter: "40mm", caseThickness: "10mm",
    strapMaterial: "Leather", strapColor: "Brown", strapWidth: "20mm", adjustable: true,
    dialColor: "White", luminous: false, dateDisplay: false, weight: "150g",
    description: "", warranty: "1 Year Official Warranty", shippingText: "2-4 Working Days", returnPolicy: "7 Days Return Policy", boxIncluded: true,
    mainImage: "", gallery: [] as string[], colors: [] as { name: string; hex: string; image: string }[],
    video: "", 
    manualReviews: [] as any[] 
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- DATA FETCHING FUNCTIONS ---
  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
      if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchSupportData = async () => {
      const { data: returns } = await supabase.from('return_requests').select('*').order('created_at', { ascending: false });
      if(returns) setReturnRequests(returns);
      const { data: messages } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if(messages) setContactMessages(messages);
      const { data: launch } = await supabase.from('launch_notifications').select('*').order('created_at', { ascending: false });
      const { data: news } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      setMarketingData({ launch: launch || [], newsletter: news || [] });
  };

  const fetchSettings = async () => {
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (data) {
          if (data.delivery_rates) setDeliveryRates(data.delivery_rates);
          if (data.manager_notes) {
              setManagerNotes(data.manager_notes);
              if(editorRef.current) editorRef.current.innerHTML = data.manager_notes;
          }
          if (data.custom_expenses) setCustomExpenses(data.custom_expenses);
          // NEW: Fetch the date from DB
          if (data.eid_reveal_date) setEidRevealDate(data.eid_reveal_date);
      }
  };

  const calculateFinance = () => {
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
  };

  const saveSettingsToDB = async () => {
      const { error } = await supabase.from('admin_settings').upsert({
          id: 1,
          delivery_rates: deliveryRates,
          manager_notes: managerNotes,
          custom_expenses: customExpenses,
          eid_reveal_date: eidRevealDate // NEW: Save the date
      });
      if (error) toast.error("Failed to save to DB");
      else toast.success("Saved to Database Successfully!");
  };

  // --- HANDLERS ---
  const handleStatusChange = async (orderId: string, newStatus: string) => {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      toast.success(`Marked as ${newStatus}`);
  };

  const deleteOrder = async (orderId: string) => {
      if(!confirm("Are you sure? This will delete the order permanently.")) return;
      await supabase.from('orders').delete().eq('id', orderId);
      setOrders(orders.filter(o => o.id !== orderId));
      if(selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.success("Order Deleted");
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

  // --- EDITOR HANDLERS ---
  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if(editorRef.current) setManagerNotes(editorRef.current.innerHTML);
  };

  const saveFile = () => {
      const element = document.createElement("a");
      const file = new Blob([managerNotes], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = "AuraX_Notes.html";
      document.body.appendChild(element);
      element.click();
  };

  const insertTable = () => {
      const html = '<table border="1" style="width:100%; border-collapse: collapse; margin: 10px 0;"><tr><td style="padding: 5px;">Head 1</td><td style="padding: 5px;">Head 2</td></tr><tr><td style="padding: 5px;">Data 1</td><td style="padding: 5px;">Data 2</td></tr></table><br/>';
      execCmd('insertHTML', html);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery' | 'color' | 'video' | 'review', index?: number) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const isVideo = type === 'video' || file.type.startsWith('video/');
      
    let fileToUpload: File | Blob = file;
    if (!isVideo) fileToUpload = await compressImage(file);

    const url = await uploadFileToSupabase(fileToUpload, file.name, isVideo);
    if (!url) return;

    if (type === 'main') setFormData({ ...formData, mainImage: url });
    else if (type === 'gallery') setFormData({ ...formData, gallery: [...formData.gallery, url] });
    else if (type === 'video') setFormData({ ...formData, video: url });
    else if (type === 'review') setNewReview({ ...newReview, image: url });
    else if (type === 'color' && index !== undefined) {
        const newColors = [...formData.colors];
        newColors[index].image = url;
        setFormData({ ...formData, colors: newColors });
    }
  };

  const removeImage = (type: 'main' | 'gallery' | 'video', index?: number) => {
    if(type === 'main') setFormData({...formData, mainImage: ""});
    else if(type === 'video') setFormData({...formData, video: ""});
    else if(type === 'gallery' && index !== undefined) {
        setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== index)});
    }
  };

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    else setFormData({ ...formData, tags: [...formData.tags, tag] });
  };

  const addReview = () => {
    setFormData({...formData, manualReviews: [newReview, ...formData.manualReviews]});
    setNewReview({ user: "", date: "", rating: 5, comment: "", image: "" });
  };

  const deleteReview = (index: number) => {
    setFormData({...formData, manualReviews: formData.manualReviews.filter((_, i) => i !== index)});
  };

  // --- EDIT / NEW HANDLERS ---
  const handleAddNewClick = () => {
    const randomSku = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
        ...initialFormState,
        sku: randomSku,
        viewCount: 0, 
        luminous: false, dateDisplay: false, boxIncluded: false
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (item: any) => {
    setFormData({
        ...initialFormState,
        ...item,
        mainImage: item.main_image || "",
        originalPrice: item.original_price || 0,
        isEidExclusive: item.is_eid_exclusive || false,
        ...item.specs,
        costPrice: item.specs?.cost_price || 0, 
        gallery: item.specs?.gallery || [],
        video: item.specs?.video || "",
        colors: item.colors || [],
        tags: item.tags || [],
        manualReviews: item.manual_reviews || []
    });
    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      const productPayload = {
          name: formData.name, brand: formData.brand, category: formData.category, 
          price: formData.price, original_price: formData.originalPrice, discount: formData.discount, 
          description: formData.description, main_image: formData.mainImage, tags: formData.tags, 
          rating: formData.priority, is_sale: formData.discount > 0, 
          priority: formData.priority, 
          is_eid_exclusive: formData.isEidExclusive, 
          colors: formData.colors,
          manual_reviews: formData.manualReviews, 
          specs: { 
              sku: formData.sku, stock: formData.stock, cost_price: formData.costPrice, view_count: formData.viewCount,
              movement: formData.movement, water_resistance: formData.waterResistance, glass: formData.glass,
              case_material: formData.caseMaterial, case_color: formData.caseColor, case_shape: formData.caseShape, case_size: formData.caseDiameter, case_thickness: formData.caseThickness,
              strap: formData.strapMaterial, strap_color: formData.strapColor, strap_width: formData.strapWidth, adjustable: formData.adjustable,
              dial_color: formData.dialColor, luminous: formData.luminous, date_display: formData.dateDisplay, weight: formData.weight,
              warranty: formData.warranty, shipping_text: formData.shippingText, return_policy: formData.returnPolicy, box_included: formData.boxIncluded,
              gallery: formData.gallery,
              video: formData.video
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

  const deleteItem = async (table: string, id: number, refresh: () => void) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      
      // 1. Send the Delete Request
      const { error } = await supabase.from(table).delete().eq('id', id);
      
      // 2. Check if the database said "NO"
      if (error) {
          console.error("Delete Error:", error);
          toast.error(`Delete Failed: ${error.message}`);
      } else {
          // 3. Only show success if it actually worked
          toast.success("Item successfully deleted from database");
          refresh();
      }
  };

  // --- TRIGGER EFFECTS (MOVED TO BOTTOM TO FIX HOISTING) ---
  useEffect(() => {
    if (!isLoading && !isAdmin) router.push("/login");
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSupportData();
    fetchSettings();

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
    if(orders.length > 0) calculateFinance();
  }, [orders, products, dateFilter, deliveryRates, customExpenses]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1B18] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
            <div className="p-8 border-b border-white/10 hidden md:block">
                <h2 className="text-2xl font-serif font-bold text-aura-gold">AURA-X</h2>
                <p className="text-xs text-white/50 tracking-widest uppercase">Admin Portal</p>
            </div>
            <nav className="flex-1 p-4 space-y-1 mt-16 md:mt-0">
                <button onClick={() => { setActiveTab('inventory'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <LayoutGrid size={20} /> Inventory
                </button>
                <button onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <ShoppingCart size={20} /> Orders 
                    {orders.filter(o => o.status === 'Processing').length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Processing').length}</span>}
                </button>
                <button onClick={() => { setActiveTab('finance'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <DollarSign size={20} /> Finance
                </button>
                <button onClick={() => { setActiveTab('notes'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <FileText size={20} /> Notebook & Data
                </button>
                <div className="h-[1px] bg-white/10 my-4"></div>
                <button onClick={() => { setActiveTab('returns'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'returns' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <RotateCcw size={20} /> Returns
                    {returnRequests.length > 0 && <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">{returnRequests.length}</span>}
                </button>
                <button onClick={() => { setActiveTab('messages'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <MessageSquare size={20} /> Messages
                    {contactMessages.length > 0 && <span className="ml-auto bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">{contactMessages.length}</span>}
                </button>
                <button onClick={() => { setActiveTab('marketing'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'marketing' ? 'bg-aura-gold text-aura-brown font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <Users size={20} /> Marketing
                </button>
            </nav>
            <div className="p-4 border-t border-white/10 absolute bottom-0 w-full space-y-2 bg-[#1E1B18]">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition w-full px-4 py-2 rounded-lg">
                    <Home size={16}/> View Live Website
                </Link>
                <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-white hover:bg-white/5 transition w-full px-4 py-2 rounded-lg">
                    <LogOut size={16}/> Logout
                </button>
            </div>
        </aside>
        
        {/* MOBILE TOGGLE */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1E1B18] text-white flex items-center justify-between px-4 z-40 shadow-md">
            <span className="font-serif font-bold text-aura-gold">AURA-X ADMIN</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8">
            
            {/* === NOTES TAB (RICH EDITOR) === */}
            {activeTab === 'notes' && (
                <div className="space-y-6 animate-in fade-in h-full flex flex-col pb-20">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-[#1E1B18]">Manager's Notebook</h1>
                        <div className="flex gap-2">
                            <button onClick={saveFile} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-2"><Download size={16}/> Save as File</button>
                            <button onClick={saveSettingsToDB} className="bg-aura-brown text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-aura-gold transition-colors flex items-center gap-2"><Save size={16}/> Save to Database</button>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                        {/* Toolbar */}
                        <div className="border-b p-3 flex gap-2 bg-gray-50 overflow-x-auto">
                            <button onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold"><Bold size={18}/></button>
                            <button onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic"><Italic size={18}/></button>
                            <button onClick={() => execCmd('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline"><Underline size={18}/></button>
                            <div className="w-[1px] bg-gray-300 h-6 my-auto mx-2"></div>
                            <button onClick={() => execCmd('formatBlock', 'H2')} className="p-2 hover:bg-gray-200 rounded font-bold" title="Heading">H1</button>
                            <button onClick={() => execCmd('formatBlock', 'H3')} className="p-2 hover:bg-gray-200 rounded font-bold text-sm" title="Subheading">H2</button>
                            <div className="w-[1px] bg-gray-300 h-6 my-auto mx-2"></div>
                            <button onClick={insertTable} className="p-2 hover:bg-gray-200 rounded" title="Insert Table"><TableIcon size={18}/></button>
                            <button onClick={() => execCmd('fontSize', '3')} className="p-2 hover:bg-gray-200 rounded" title="Normal Text"><Type size={18}/></button>
                            <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="List"><List size={18}/></button>
                        </div>
                        {/* Editor Area */}
                        <div 
                            ref={editorRef}
                            contentEditable 
                            className="flex-1 p-8 outline-none overflow-y-auto prose max-w-none bg-white"
                            onInput={(e) => setManagerNotes(e.currentTarget.innerHTML)}
                            style={{ minHeight: '500px' }}
                        ></div>
                    </div>
                </div>
            )}

            {/* === FINANCE TAB === */}
            {activeTab === 'finance' && (
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

                        {/* Event Settings (NEW ADDITION) */}
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
            )}

            {/* === INVENTORY TAB === */}
            {activeTab === 'inventory' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Inventory</h1>
                        <button onClick={handleAddNewClick} className="bg-aura-brown text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-aura-gold transition-colors shadow-lg text-sm md:text-base"><Plus size={18} /> Add New</button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto pb-20">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4 text-xs font-bold text-gray-400 uppercase">Product</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Stock</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Price</th><th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                                {item.main_image && (
                                                    isVideoFile(item.main_image) 
                                                    ? <video src={item.main_image} className="w-full h-full object-cover" muted /> 
                                                    : <Image src={item.main_image} alt="" fill className="object-cover" unoptimized />
                                                )}
                                            </div>
                                            <div className="truncate max-w-[150px]">
                                                <p className="font-bold text-aura-brown text-sm">{item.name}</p>
                                                {item.is_eid_exclusive && <span className="text-[9px] bg-black text-aura-gold px-2 py-0.5 rounded-full border border-aura-gold">EID EXCLUSIVE</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">{item.specs?.stock}</td>
                                        <td className="p-4 font-bold text-aura-brown text-sm">Rs {item.price.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 size={14}/></button>
                                                <button onClick={() => deleteItem('products', item.id, fetchProducts)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14}/></button>
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

            {/* === RETURNS TAB === */}
            {activeTab === 'returns' && (
                <div className="space-y-6 pb-20 animate-in fade-in">
                    <h1 className="text-3xl font-bold text-[#1E1B18] mb-6">Return Requests</h1>
                    {returnRequests.length === 0 ? <p className="text-gray-400">No return requests found.</p> : (
                        <div className="grid gap-4">
                            {returnRequests.map((req) => (
                                <div key={req.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">Order #{req.orderId}</h3>
                                            <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()} • {req.reason}</p>
                                        </div>
                                        <button onClick={() => deleteItem('return_requests', req.id, fetchSupportData)} className="text-red-400 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4">
                                        <p className="font-bold mb-1">Details:</p>
                                        "{req.details}"
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> {req.name}</div>
                                        <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {req.phone}</div>
                                        <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {req.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* === MESSAGES TAB === */}
            {activeTab === 'messages' && (
                <div className="space-y-6 pb-20 animate-in fade-in">
                    <h1 className="text-3xl font-bold text-[#1E1B18] mb-6">Inbox</h1>
                    {contactMessages.length === 0 ? <p className="text-gray-400">No messages found.</p> : (
                        <div className="grid gap-4">
                            {contactMessages.map((msg) => (
                                <div key={msg.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-aura-gold/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-aura-brown">{msg.subject}</h3>
                                        <button onClick={() => deleteItem('contact_messages', msg.id, fetchSupportData)} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4">From: {msg.name} ({msg.email}) • {new Date(msg.created_at).toLocaleString()}</p>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">{msg.message}</p>
                                    <a href={`mailto:${msg.email}`} className="inline-block mt-4 text-xs font-bold text-aura-gold hover:underline">REPLY VIA EMAIL</a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* === MARKETING TAB === */}
            {activeTab === 'marketing' && (
                <div className="space-y-8 pb-20 animate-in fade-in">
                    <h1 className="text-3xl font-bold text-[#1E1B18]">Marketing Data</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-50 p-3 rounded-full text-green-600"><Mail size={24}/></div>
                                <div><h3 className="font-bold text-lg">Newsletter Subscribers</h3></div>
                                <span className="ml-auto text-2xl font-bold">{marketingData.newsletter.length}</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {marketingData.newsletter.map((sub, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg text-sm border-b border-gray-50 last:border-0">
                                        <span className="text-gray-700">{sub.email}</span>
                                        <span className="text-xs text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Bell size={24}/></div>
                                <div><h3 className="font-bold text-lg">Eid Collection Waitlist</h3></div>
                                <span className="ml-auto text-2xl font-bold">{marketingData.launch.length}</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {marketingData.launch.map((sub, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg text-sm border-b border-gray-50 last:border-0">
                                        <span className="text-gray-700">{sub.email}</span>
                                        <span className="text-xs text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === ORDER DETAIL MODAL === */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 shadow-2xl relative">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 md:hidden p-2 bg-gray-100 rounded-full z-50"><X size={20}/></button>
                        <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-2xl font-bold text-aura-brown">Order #{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => deleteOrder(selectedOrder.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete Order"><Trash2 size={20}/></button>
                                    <button onClick={() => setSelectedOrder(null)} className="hidden md:block p-2 hover:bg-gray-200 rounded-full"><X size={24}/></button>
                                </div>
                            </div>
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
                                    <div className="flex gap-3"><Check size={16} className="text-gray-400"/> <span>{selectedOrder.customer_name || ""}</span></div>
                                    <div className="flex gap-3"><Phone size={16} className="text-gray-400"/> <span>{selectedOrder.phone || ""}</span></div>
                                    <div className="flex gap-3"><Mail size={16} className="text-gray-400"/> <span>{selectedOrder.email || ""}</span></div>
                                    <div className="flex gap-3"><MapPin size={16} className="text-gray-400"/> <span>{(selectedOrder.address || "")}, {(selectedOrder.city || "")}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-aura-brown mb-2 text-sm">Admin Notes</h4>
                                <textarea className="w-full p-3 text-sm border border-gray-300 rounded-xl bg-white h-20" placeholder="Internal notes (visible only to you)..." value={adminNote || ""} onChange={(e) => setAdminNote(e.target.value)} />
                                <button onClick={saveAdminNote} className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold w-full md:w-auto">Save Note</button>
                            </div>
                        </div>
                        <div className="w-full md:w-[400px] bg-white border-l border-gray-100 p-6 md:p-8">
                            <h4 className="font-bold text-aura-brown mb-4">Items ({selectedOrder.items?.length})</h4>
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                                {selectedOrder.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                                        <div className="w-14 h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">{item.image && <Image src={item.image} alt="" fill className="object-contain p-1"/>}</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-aura-brown line-clamp-1">{item.name || ""}</p>
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

            {/* === ADD/EDIT PRODUCT FORM === */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                    <div className="bg-white rounded-none md:rounded-[2rem] w-full max-w-6xl h-full md:h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-50"><X /></button>
                        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-40">
                             <h2 className="text-2xl font-bold font-serif text-aura-brown">{isEditing ? "Edit Timepiece" : "Add New Timepiece"}</h2>
                        </div>
                        
                        <form onSubmit={handlePublish} className="p-4 md:p-8 space-y-12 pb-32">
                            {/* 1. IDENTITY */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Product Name</label><input required className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Oak Rose Gold" /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Brand</label><input className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.brand || ""} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">SKU (Auto)</label><input className="w-full p-4 bg-gray-100 border rounded-xl" value={formData.sku || ""} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Category</label><select className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.category || "men"} onChange={e => setFormData({...formData, category: e.target.value})}><option value="men">Men's</option><option value="women">Women's</option><option value="couple">Couple</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Stock Qty</label><input type="number" className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            {/* 2. DESCRIPTION */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Description</h3>
                                <textarea className="w-full p-4 bg-gray-50 border rounded-xl h-32 resize-none" placeholder="Write a catchy description..." value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </section>

                            {/* 3. MARKETING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Flame size={16}/> Marketing & Sorting</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tags (Select Multiple)</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["Featured", "Sale", "Limited Edition", "Fire", "New Arrival", "Best Seller"].map(tag => (
                                                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${formData.tags.includes(tag) ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white text-gray-400 border-gray-200'}`}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">Priority (1-100)</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.priority || 0} onChange={e => setFormData({...formData, priority: Number(e.target.value)})} /></div>
                                        <div><label className="text-xs font-bold text-gray-500">Fake Views (Manual)</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.viewCount || 0} onChange={e => setFormData({...formData, viewCount: Number(e.target.value)})} /></div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.isEidExclusive ? 'bg-black border-aura-gold' : 'bg-gray-50 border-gray-200'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.isEidExclusive} onChange={e => setFormData({...formData, isEidExclusive: e.target.checked})} />
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isEidExclusive ? 'bg-aura-gold border-aura-gold text-black' : 'bg-white border-gray-300'}`}>
                                                {formData.isEidExclusive && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${formData.isEidExclusive ? 'text-aura-gold' : 'text-gray-600'}`}>Mark as Eid Exclusive (Locked Content)</p>
                                                <p className="text-xs text-gray-400">If checked, this item will be HIDDEN from normal shop and only visible on the Locked Eid Page.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* 4. PRICING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Pricing</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <div><label className="text-xs font-bold text-gray-500">Original Price</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.originalPrice || 0} onChange={e => handlePriceChange('originalPrice', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Discount %</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.discount || 0} onChange={e => handlePriceChange('discount', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-aura-brown">Sale Price</label><div className="w-full p-3 bg-aura-gold/20 rounded-xl font-bold text-aura-brown">Rs {(formData.price || 0).toLocaleString()}</div></div>
                                    <div><label className="text-xs font-bold text-gray-400">Cost Price (For Finance Tab)</label><input type="number" className="w-full p-3 border rounded-xl bg-white" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            {/* 5. VISUALS */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Visuals</h3>
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    <div className="w-full md:w-40">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Main Image</label>
                                        <label className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold ${formData.mainImage ? 'border-aura-gold' : 'border-gray-300'}`}>
                                            {formData.mainImage ? (
                                                <>
                                                    {isVideoFile(formData.mainImage) ? <video src={formData.mainImage} className="object-cover w-full h-full" /> : <Image src={formData.mainImage} alt="" fill className="object-cover" />}
                                                    <button type="button" onClick={(e) => {e.preventDefault(); removeImage('main');}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><X size={14}/></button>
                                                </>
                                            ) : (
                                                <div className="text-center"><Upload size={24} className="mx-auto text-gray-300"/><span className="text-xs text-gray-400">Upload</span></div>
                                            )}
                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'main')}/>
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Gallery</label>
                                        <div className="flex flex-wrap gap-4">
                                            {formData.gallery.map((img, i) => (
                                                <div key={i} className="w-24 h-24 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200 group">
                                                    {isVideoFile(img) ? <video src={img} className="object-cover w-full h-full" /> : <Image src={img} alt="" fill className="object-cover"/>}
                                                    <button type="button" onClick={() => removeImage('gallery', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                                </div>
                                            ))}
                                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold flex-shrink-0"><Plus size={20} className="text-gray-400"/><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery')}/></label>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-40">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Short Video</label>
                                        <label className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold ${formData.video ? 'border-aura-gold' : 'border-gray-300'}`}>
                                            {formData.video ? (
                                                <>
                                                    <video src={formData.video} className="object-cover w-full h-full" autoPlay muted loop />
                                                    <button type="button" onClick={(e) => {e.preventDefault(); removeImage('video');}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><X size={14}/></button>
                                                </>
                                            ) : (
                                                <div className="text-center"><Video size={24} className="mx-auto text-gray-300"/><span className="text-xs text-gray-400">Add Video</span></div>
                                            )}
                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleImageUpload(e, 'video')}/>
                                        </label>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-4 uppercase">Color Variants</label>
                                    <div className="space-y-4">
                                        {formData.colors.map((color, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
                                                <input type="color" className="w-10 h-10 rounded border-none cursor-pointer" value={color.hex || "#ffffff"} onChange={(e) => { const c = [...formData.colors]; c[index].hex = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <select className="flex-1 p-2 border rounded-lg text-sm bg-white" value={color.name || ""} onChange={(e) => { const c = [...formData.colors]; c[index].name = e.target.value; setFormData({...formData, colors: c}); }}>
                                                    <option value="">Select Popular Color</option>
                                                    {POPULAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-200 w-full md:w-auto justify-center">
                                                    {color.image ? "Image Uploaded" : "Upload Image"} <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'color', index)}/>
                                                </label>
                                                <button type="button" onClick={() => setFormData({...formData, colors: formData.colors.filter((_, i) => i !== index)})} className="text-red-400"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setFormData({...formData, colors: [...formData.colors, { name: "Silver", hex: "#C0C0C0", image: "" }]})} className="text-sm font-bold text-aura-brown flex items-center gap-2"><Plus size={16} /> Add Color Variant</button>
                                    </div>
                                </div>
                            </section>

                            {/* 6. SPECS */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Specifications</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Case & Dial</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Material</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseMaterial || "Stainless Steel"} onChange={e => setFormData({...formData, caseMaterial: e.target.value})}><option>Stainless Steel</option><option>Alloy</option><option>Titanium</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Diameter</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseDiameter || ""} onChange={e => setFormData({...formData, caseDiameter: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Thickness</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseThickness || ""} onChange={e => setFormData({...formData, caseThickness: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Glass Type</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.glass || "Mineral"} onChange={e => setFormData({...formData, glass: e.target.value})}><option>Mineral</option><option>Sapphire</option><option>Hardlex</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Dial Color</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.dialColor || ""} onChange={e => setFormData({...formData, dialColor: e.target.value})} /></div>

                                    <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Strap & Movement</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Material</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.strapMaterial || "Leather"} onChange={e => setFormData({...formData, strapMaterial: e.target.value})}><option>Leather</option><option>Metal</option><option>Chain</option><option>Silicon</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Color</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.strapColor || ""} onChange={e => setFormData({...formData, strapColor: e.target.value})}>{POPULAR_COLORS.map(c=><option key={c}>{c}</option>)}</select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Movement</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.movement || "Quartz (Battery)"} onChange={e => setFormData({...formData, movement: e.target.value})}><option>Quartz (Battery)</option><option>Automatic (Mechanical)</option><option>Digital</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Water Resistance</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.waterResistance || "3ATM (Splash)"} onChange={e => setFormData({...formData, waterResistance: e.target.value})}><option>3ATM (Splash)</option><option>5ATM (Swim)</option><option>10ATM (Dive)</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Weight</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.weight || ""} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                                     
                                    <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Features</h4></div>
                                    <div className="flex gap-4 col-span-2 md:col-span-4">
                                        <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg cursor-pointer"><input type="checkbox" checked={formData.luminous || false} onChange={e => setFormData({...formData, luminous: e.target.checked})} /> Luminous Hands</label>
                                        <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg cursor-pointer"><input type="checkbox" checked={formData.dateDisplay || false} onChange={e => setFormData({...formData, dateDisplay: e.target.checked})} /> Date Display</label>
                                        <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg cursor-pointer"><input type="checkbox" checked={formData.boxIncluded || false} onChange={e => setFormData({...formData, boxIncluded: e.target.checked})} /> Box Included</label>
                                    </div>
                                </div>
                            </section>

                            {/* 7. MANUAL REVIEWS */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Star size={16}/> Manual Reviews</h3>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <input placeholder="Reviewer Name" className="p-3 border rounded-xl text-sm" value={newReview.user || ""} onChange={e => setNewReview({...newReview, user: e.target.value})} />
                                        <input type="date" className="p-3 border rounded-xl text-sm" value={newReview.date || ""} onChange={e => setNewReview({...newReview, date: e.target.value})} />
                                        <select className="p-3 border rounded-xl text-sm" value={newReview.rating || 5} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}>
                                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                            <option value="4">⭐⭐⭐⭐ (4)</option>
                                            <option value="3">⭐⭐⭐ (3)</option>
                                        </select>
                                        <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-xl text-xs font-bold cursor-pointer w-full md:w-auto justify-center">
                                            {newReview.image ? "Pic Added" : "Add Pic"} <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'review')}/>
                                        </label>
                                    </div>
                                    <textarea placeholder="Review message..." className="w-full p-3 border rounded-xl text-sm mb-3" value={newReview.comment || ""} onChange={e => setNewReview({...newReview, comment: e.target.value})}></textarea>
                                    <button type="button" onClick={addReview} className="bg-aura-brown text-white px-4 py-2 rounded-lg text-sm font-bold">Add Fake Review</button>

                                    <div className="mt-6 space-y-2">
                                        {(formData.manualReviews || []).map((rev, i) => (
                                            <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    {rev.image && <Image src={rev.image} width={30} height={30} alt="" className="rounded-full" />}
                                                    <div>
                                                        <p className="text-xs font-bold">{rev.user || ""} <span className="text-aura-gold">{'★'.repeat(rev.rating || 5)}</span></p>
                                                        <p className="text-[10px] text-gray-500">{rev.comment || ""}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => deleteReview(i)} className="text-red-400"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* 8. SHIPPING */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Package size={16}/> Shipping & Warranty</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-xs font-bold text-gray-500">Warranty Text</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.warranty || ""} onChange={e => setFormData({...formData, warranty: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Shipping Info</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.shippingText || ""} onChange={e => setFormData({...formData, shippingText: e.target.value})} /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Return Policy</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.returnPolicy || ""} onChange={e => setFormData({...formData, returnPolicy: e.target.value})} /></div>
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