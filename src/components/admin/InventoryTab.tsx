"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Save, Upload, Tag, Settings, Flame, Star, Package, Check, Palette, LayoutGrid, List, Table as TableIcon, Search } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

// --- CONSTANTS ---
const COLOR_MAP: Record<string, string> = {
  "Silver": "#C0C0C0", "Gold": "#FFD700", "Rose Gold": "#B76E79", "Black": "#000000",
  "Two-Tone (Silver/Gold)": "#F5F5DC", "Two-Tone (Silver/Rose)": "#FFE4E1",
  "Blue": "#0000FF", "Green": "#008000", "White": "#FFFFFF", "Brown": "#A52A2A",
  "Grey": "#808080", "Gunmetal": "#2a3439", "Red": "#FF0000", "Tiffany Blue": "#0ABAB5",
  "Champagne": "#F7E7CE", "Mother of Pearl": "#F0EAD6", "Navy": "#000080",
  "Yellow": "#FFFF00", "Orange": "#FFA500", "Purple": "#800080"
};
const POPULAR_COLORS = Object.keys(COLOR_MAP);

// --- HELPER FUNCTIONS ---
const isVideoFile = (url: string) => url?.toLowerCase().includes('.mp4') || url?.toLowerCase().includes('.webm');

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
        if (width > MAX_WIDTH) { height = height * (MAX_WIDTH / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("Compression failed")); }, "image/jpeg", 0.95); 
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const processFileUpload = async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    let fileToUpload: File | Blob = file;

    if (!isVideo) { 
        try { fileToUpload = await compressImage(file); } 
        catch (e) { console.error("Compression failed:", e); return null; } 
    }

    const ext = isVideo ? 'mp4' : 'jpg';
    const cleanName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10);
    const fileName = `v2-${Date.now()}-${cleanName}.${ext}`;

    const { error } = await supabase.storage.from('product-images').upload(fileName, fileToUpload); 
    if (error) { console.error("Upload Error:", error.message); return null; }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return publicUrl;
};

export default function InventoryTab({ products, fetchProducts }: { products: any[], fetchProducts: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState(""); // SEARCH STATE
  // UPDATED REVIEW STATE FOR MULTIPLE IMAGES
  const [newReview, setNewReview] = useState({ user: "", date: "", rating: 5, comment: "", images: [] as string[] });

  const initialFormState = {
    name: "", brand: "AURA-X", sku: "", stock: 1, category: "", 
    price: 0, originalPrice: 0, discount: 0, costPrice: 0,
    tags: "" as string, priority: 100, viewCount: 0, isEidExclusive: false, 
    movement: "Quartz (Battery)", waterResistance: "0ATM (No Resistance)", 
    glass: "", caseMaterial: "", caseColor: "Silver", caseShape: "Round", 
    caseDiameter: "40mm", caseThickness: "10mm", 
    strapMaterial: "", strapColor: "", strapWidth: "20mm", adjustable: true,
    dialColor: "", luminous: false, dateDisplay: false, weight: "135g", 
    description: "", warranty: "No Official Warranty", 
    shippingText: "2-4 Working Days", returnPolicy: "7 Days Return Policy", boxIncluded: false, 
    mainImage: "", baseColorName: "Silver",
    gallery: [] as string[], colors: [] as { name: string; hex: string; image: string }[],
    video: "", manualReviews: [] as any[] 
  };
  const [formData, setFormData] = useState(initialFormState);

  // SEARCH FILTER LOGIC
  const filteredProducts = products.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.specs?.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewClick = () => {
    const randomSku = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({ ...initialFormState, sku: randomSku });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (item: any) => {
    const specs = item.specs || {};
    let singleTag = "";
    if (Array.isArray(item.tags) && item.tags.length > 0) singleTag = item.tags[0];
    else if (typeof item.tags === 'string') singleTag = item.tags;

    setFormData({
        ...initialFormState,
        name: item.name || "",
        brand: item.brand || "AURA-X",
        category: item.category || "",
        price: item.price || 0,
        originalPrice: item.original_price || 0,
        discount: item.discount || 0,
        description: item.description || "",
        mainImage: item.main_image || "",
        baseColorName: item.colors?.[0]?.name || "Silver",
        tags: singleTag,
        priority: item.priority || 100,
        isEidExclusive: item.is_eid_exclusive || false,
        colors: item.colors?.slice(1) || [], 
        manualReviews: item.manual_reviews || [],
        sku: specs.sku || item.sku || "",
        stock: specs.stock || 1,
        costPrice: specs.cost_price || 0,
        viewCount: specs.view_count || 0,
        movement: specs.movement || "Quartz (Battery)",
        waterResistance: specs.water_resistance || "0ATM (No Resistance)",
        glass: specs.glass || "",
        caseMaterial: specs.case_material || "",
        caseColor: specs.case_color || "Silver",
        caseShape: specs.case_shape || "Round",
        caseDiameter: specs.case_size || "40mm",
        caseThickness: specs.case_thickness || "10mm",
        strapMaterial: specs.strap || "",
        strapColor: specs.strap_color || "",
        strapWidth: specs.strap_width || "20mm",
        adjustable: specs.adjustable ?? true,
        dialColor: specs.dial_color || "",
        luminous: specs.luminous ?? false,
        dateDisplay: specs.date_display ?? false,
        weight: specs.weight || "135g",
        warranty: specs.warranty || "No Official Warranty",
        shippingText: specs.shipping_text || "2-4 Working Days",
        returnPolicy: specs.return_policy || "7 Days Return Policy",
        boxIncluded: specs.box_included ?? false,
        gallery: specs.gallery || [],
        video: specs.video || ""
    });

    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const applyImageToState = (url: string, type: string, index?: number) => {
    if (type === 'main') setFormData(prev => ({ ...prev, mainImage: url }));
    else if (type === 'gallery') setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
    else if (type === 'video') setFormData(prev => ({ ...prev, video: url }));
    else if (type === 'review') setNewReview(prev => ({ ...prev, images: [...prev.images, url] })); // APPEND TO REVIEW IMAGES
    else if (type === 'color' && index !== undefined) {
        setFormData(prev => {
            const newColors = [...prev.colors];
            newColors[index].image = url;
            return { ...prev, colors: newColors };
        });
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'main' | 'gallery' | 'video' | 'review') => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const url = await processFileUpload(e.dataTransfer.files[0]);
      if (url) applyImageToState(url, type);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent, type: 'main' | 'gallery' | 'video' | 'review') => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const url = await processFileUpload(file);
                if (url) applyImageToState(url, type);
            }
        }
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      const mainColorVariant = {
          name: formData.baseColorName,
          hex: COLOR_MAP[formData.baseColorName] || "#C0C0C0",
          image: formData.mainImage
      };
      const allColors = [mainColorVariant, ...formData.colors];
      const tagsArray = formData.tags ? [formData.tags] : [];

      const productPayload = {
          name: formData.name, brand: formData.brand, category: formData.category, 
          price: formData.price, original_price: formData.originalPrice, discount: formData.discount, 
          description: formData.description, main_image: formData.mainImage, tags: tagsArray, 
          rating: formData.priority, is_sale: formData.discount > 0, 
          priority: formData.priority, is_eid_exclusive: formData.isEidExclusive, 
          colors: allColors, manual_reviews: formData.manualReviews, 
          specs: { 
              sku: formData.sku, stock: formData.stock, cost_price: formData.costPrice, view_count: formData.viewCount,
              movement: formData.movement, water_resistance: formData.waterResistance, glass: formData.glass,
              case_material: formData.caseMaterial, case_color: formData.caseColor, case_shape: formData.caseShape, 
              case_size: formData.caseDiameter, case_thickness: formData.caseThickness,
              strap: formData.strapMaterial, strap_color: formData.strapColor, strap_width: formData.strapWidth, adjustable: formData.adjustable,
              dial_color: formData.dialColor, luminous: formData.luminous, date_display: formData.dateDisplay, weight: formData.weight,
              warranty: formData.warranty, shipping_text: formData.shippingText, return_policy: formData.returnPolicy, box_included: formData.boxIncluded,
              gallery: formData.gallery, video: formData.video
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

  const deleteItem = async (id: number) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { toast.error(`Delete Failed: ${error.message}`); return; }
      toast.success("Item deleted!");
      fetchProducts();
  };

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
    const url = await processFileUpload(e.target.files[0]);
    if (!url) return;
    applyImageToState(url, type, index);
  };

  const removeImage = (type: 'main' | 'gallery' | 'video' | 'review', index?: number) => {
    if(type === 'main') setFormData({...formData, mainImage: ""});
    else if(type === 'video') setFormData({...formData, video: ""});
    else if(type === 'gallery' && index !== undefined) {
        setFormData({...formData, gallery: formData.gallery.filter((_, i) => i !== index)});
    }
    else if(type === 'review' && index !== undefined) {
        setNewReview(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
    }
  };

  const selectTag = (tag: string) => {
    if (formData.tags === tag) setFormData({ ...formData, tags: "" });
    else setFormData({ ...formData, tags: tag });
  };

  const addReview = () => {
    setFormData({...formData, manualReviews: [newReview, ...formData.manualReviews]});
    setNewReview({ user: "", date: "", rating: 5, comment: "", images: [] });
  };

  const deleteReview = (index: number) => {
    setFormData({ ...formData, manualReviews: formData.manualReviews.filter((_, i) => i !== index) });
  };

  return (
    <>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Inventory</h1>
                
                {/* SEARCH BAR */}
                <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by Name or SKU..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold"
                    />
                </div>

                {/* VIEW SWITCHER BUTTONS */}
                <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                    <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="Table View"><TableIcon size={18}/></button>
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="Grid View (Large)"><LayoutGrid size={18}/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="Detail List View"><List size={18}/></button>
                </div>
            </div>
            <button onClick={handleAddNewClick} className="bg-aura-brown text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 hover:bg-aura-gold transition-colors shadow-lg text-sm md:text-base w-full md:w-auto justify-center flex-shrink-0"><Plus size={18} /> Add New</button>
        </div>

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto pb-20">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4 text-xs font-bold text-gray-400 uppercase">Product</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Stock</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Price</th><th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="40px" className="object-cover" unoptimized />)}
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
                                        <button onClick={() => deleteItem(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* GRID VIEW (Large Icons - 2 items per row) */}
        {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                {filteredProducts.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                        <div className="relative aspect-square w-full bg-gray-50">
                            {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="(max-width: 768px) 100vw, 500px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />)}
                            <div className="absolute bottom-2 left-2 flex gap-2">
                                {item.is_eid_exclusive && <span className="text-[10px] bg-black text-aura-gold px-3 py-1 rounded-full border border-aura-gold font-bold">EID EXCLUSIVE</span>}
                                <span className="text-[10px] bg-white/90 text-aura-brown px-3 py-1 rounded-full font-bold shadow-sm">{item.specs?.stock} in stock</span>
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-aura-brown truncate max-w-[180px]">{item.name}</h3>
                                <p className="text-aura-gold font-bold">Rs {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(item)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={18}/></button>
                                <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* LIST VIEW (Detailed) */}
        {viewMode === 'list' && (
            <div className="space-y-4 pb-20">
                {filteredProducts.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border">
                             {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="100px" className="object-cover" unoptimized />)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-aura-brown truncate text-lg">{item.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                <span>SKU: {item.specs?.sku}</span>
                                <span className="font-bold text-green-600">Stock: {item.specs?.stock}</span>
                                <span className="font-bold text-aura-gold">Rs {item.price.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEditClick(item)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors"><Edit2 size={14}/> Edit</button>
                            <button onClick={() => deleteItem(item.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/> Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
                <div className="bg-white rounded-none md:rounded-[2rem] w-full max-w-6xl h-[100dvh] md:h-[90vh] flex flex-col shadow-2xl relative">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-[2rem]">
                         <h2 className="text-2xl font-bold font-serif text-aura-brown">{isEditing ? "Edit Timepiece" : "Add New Timepiece"}</h2>
                         <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                        <form id="productForm" onSubmit={handlePublish} className="space-y-12">
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Product Name</label><input required className="w-full p-4 bg-white border rounded-xl" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Oak Rose Gold" /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Brand</label><input className="w-full p-4 bg-white border rounded-xl" value={formData.brand || ""} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">SKU (Auto)</label><input className="w-full p-4 bg-gray-100 border rounded-xl text-gray-500" readOnly value={formData.sku || ""} /></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Category</label>
                                        <select className="w-full p-4 bg-white border rounded-xl" value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="">Select Category</option>
                                            <option value="men">Men's</option>
                                            <option value="women">Women's</option>
                                            <option value="couple">Couple</option>
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">Stock Qty</label><input type="number" className="w-full p-4 bg-white border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Description</h3>
                                <textarea className="w-full p-4 bg-white border rounded-xl h-32 resize-none" placeholder="Write a catchy description..." value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Flame size={16}/> Marketing & Sorting</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tags (Single Selection)</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["Featured", "Sale", "Limited Edition", "Fire", "New Arrival", "Best Seller"].map(tag => (
                                                <button type="button" key={tag} onClick={() => selectTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${formData.tags === tag ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white text-gray-400 border-gray-200'}`}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">Priority (1-100)</label><input type="number" className="w-full p-3 border rounded-xl bg-white" value={formData.priority} onChange={e => setFormData({...formData, priority: Number(e.target.value)})} /></div>
                                        <div><label className="text-xs font-bold text-gray-500">Fake Views (Manual)</label><input type="number" className="w-full p-3 border rounded-xl bg-white" value={formData.viewCount || 0} onChange={e => setFormData({...formData, viewCount: Number(e.target.value)})} /></div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.isEidExclusive ? 'bg-black border-aura-gold' : 'bg-white border-gray-200'}`}>
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

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Pricing</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-gray-200">
                                    <div><label className="text-xs font-bold text-gray-500">Original Price</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.originalPrice || 0} onChange={e => handlePriceChange('originalPrice', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Discount %</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.discount || 0} onChange={e => handlePriceChange('discount', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-aura-brown">Sale Price</label><div className="w-full p-3 bg-aura-gold/20 rounded-xl font-bold text-aura-brown">Rs {(formData.price || 0).toLocaleString()}</div></div>
                                    <div><label className="text-xs font-bold text-gray-400">Cost Price (For Finance Tab)</label><input type="number" className="w-full p-3 border rounded-xl bg-gray-50" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Visuals & Variants</h3>
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    <div className="w-full md:w-40 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2">Main Image</label>
                                            <div className={`w-full h-40 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold bg-white ${formData.mainImage ? 'border-aura-gold' : 'border-gray-300'}`}
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'main')} onPaste={(e) => handlePaste(e, 'main')} tabIndex={0}>
                                                {formData.mainImage ? (
                                                    <>
                                                        {isVideoFile(formData.mainImage) ? <video src={formData.mainImage} className="object-cover w-full h-full" /> : <Image src={formData.mainImage} alt="" fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />}
                                                        <button type="button" onClick={(e) => {e.stopPropagation(); removeImage('main');}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><X size={14}/></button>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer"><Upload size={24} className="mx-auto text-gray-300"/><span className="text-xs text-gray-400 mt-1">Upload</span><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'main')}/></label>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-[10px] font-bold text-aura-gold flex items-center gap-1 uppercase tracking-tight"><Palette size={10}/> Main Color</label>
                                            <select 
                                                className="w-full p-2 bg-aura-gold/5 border border-aura-gold/20 rounded-lg text-xs font-bold text-aura-brown" 
                                                value={formData.baseColorName} 
                                                onChange={e => setFormData({...formData, baseColorName: e.target.value})}
                                            >
                                                {POPULAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Gallery</label>
                                        <div className="flex flex-wrap gap-4">
                                            {formData.gallery.map((img, i) => (
                                                <div key={i} className="w-24 h-24 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200 group bg-white">
                                                    {isVideoFile(img) ? <video src={img} className="object-cover w-full h-full" /> : <Image src={img} alt="" fill sizes="100px" className="object-cover"/>}
                                                    <button type="button" onClick={() => removeImage('gallery', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                                </div>
                                            ))}
                                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold flex-shrink-0 bg-white"
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'gallery')} onPaste={(e) => handlePaste(e, 'gallery')} tabIndex={0}>
                                                <label className="w-full h-full flex items-center justify-center cursor-pointer"><Plus size={20} className="text-gray-400"/><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery')}/></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Additional Color Variants</label>
                                    <div className="space-y-4">
                                        {formData.colors.map((color, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <input type="color" className="w-10 h-10 rounded border-none cursor-pointer" value={color.hex || "#ffffff"} onChange={(e) => { const c = [...formData.colors]; c[index].hex = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <select className="flex-1 p-2 border rounded-lg text-sm bg-white" value={color.name || ""} onChange={(e) => { const name = e.target.value; const c = [...formData.colors]; c[index].name = name; if (COLOR_MAP[name]) c[index].hex = COLOR_MAP[name]; setFormData({...formData, colors: c}); }}>
                                                    <option value="">Select Variant Color</option>
                                                    {POPULAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100 w-full md:w-auto justify-center border">
                                                    {color.image ? "Image Uploaded" : "Upload Image"} <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'color', index)}/>
                                                </label>
                                                <button type="button" onClick={() => setFormData({...formData, colors: formData.colors.filter((_, i) => i !== index)})} className="text-red-400"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setFormData({...formData, colors: [...formData.colors, { name: "Silver", hex: "#C0C0C0", image: "" }]})} className="text-sm font-bold text-aura-brown flex items-center gap-2 hover:text-aura-gold transition-colors"><Plus size={16} /> Add Another Color</button>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Specifications</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Case & Dial</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Material</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.caseMaterial || ""} onChange={e => setFormData({...formData, caseMaterial: e.target.value})}><option value="">Select Material</option><option>Stainless Steel</option><option>Alloy</option><option>Titanium</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Diameter</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.caseDiameter} onChange={e => setFormData({...formData, caseDiameter: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Thickness</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.caseThickness} onChange={e => setFormData({...formData, caseThickness: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Glass Type</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.glass || ""} onChange={e => setFormData({...formData, glass: e.target.value})}><option value="">Select Glass</option><option>Mineral</option><option>Sapphire</option><option>Hardlex</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Dial Color</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.dialColor || ""} onChange={e => setFormData({...formData, dialColor: e.target.value})}><option value="">Select Color</option>{POPULAR_COLORS.map(c => <option key={c}>{c}</option>)}</select></div>

                                    <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Strap & Movement</h4></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Material</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.strapMaterial || ""} onChange={e => setFormData({...formData, strapMaterial: e.target.value})}><option value="">Select Material</option><option>Leather</option><option>Metal</option><option>Chain</option><option>Silicon</option><option>Stainless Steel</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap Color</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.strapColor || ""} onChange={e => setFormData({...formData, strapColor: e.target.value})}><option value="">Select Color</option>{POPULAR_COLORS.map(c=><option key={c}>{c}</option>)}</select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Movement</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.movement || "Quartz (Battery)"} onChange={e => setFormData({...formData, movement: e.target.value})}><option>Quartz (Battery)</option><option>Automatic (Mechanical)</option><option>Digital</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Water Resistance</label><select className="w-full p-3 bg-white border rounded-xl" value={formData.waterResistance || "0ATM (No Resistance)"} onChange={e => setFormData({...formData, waterResistance: e.target.value})}><option>0ATM (No Resistance)</option><option>3ATM (Splash)</option><option>5ATM (Swim)</option><option>10ATM (Dive)</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Weight</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.weight || "135g"} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                                    
                                    <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Features</h4></div>
                                    <div className="flex gap-4 col-span-2 md:col-span-4">
                                        <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.luminous || false} onChange={e => setFormData({...formData, luminous: e.target.checked})} /> Luminous Hands</label>
                                        <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.dateDisplay || false} onChange={e => setFormData({...formData, dateDisplay: e.target.checked})} /> Date Display</label>
                                        <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.boxIncluded || false} onChange={e => setFormData({...formData, boxIncluded: e.target.checked})} /> Box Included</label>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Star size={16}/> Manual Reviews</h3>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <input placeholder="Reviewer Name" className="p-3 border rounded-xl text-sm" value={newReview.user || ""} onChange={e => setNewReview({...newReview, user: e.target.value})} />
                                        <input type="date" className="p-3 border rounded-xl text-sm" value={newReview.date || ""} onChange={e => setNewReview({...newReview, date: e.target.value})} />
                                        <select className="p-3 border rounded-xl text-sm" value={newReview.rating || 5} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}>
                                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                            <option value="4">⭐⭐⭐⭐ (4)</option>
                                            <option value="3">⭐⭐⭐ (3)</option>
                                        </select>
                                    </div>
                                    <textarea placeholder="Review message..." className="w-full p-3 border rounded-xl text-sm mb-3" value={newReview.comment || ""} onChange={e => setNewReview({...newReview, comment: e.target.value})}></textarea>
                                    
                                    {/* DRAG & DROP ZONE FOR MULTIPLE REVIEW PICS */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Review Images (Multiple)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {newReview.images.map((img, idx) => (
                                                <div key={idx} className="w-16 h-16 rounded-lg relative overflow-hidden border border-gray-200 group">
                                                    <Image src={img} alt="" fill className="object-cover" />
                                                    <button type="button" onClick={() => removeImage('review', idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-80 hover:opacity-100"><X size={12}/></button>
                                                </div>
                                            ))}
                                            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold bg-gray-50"
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'review')} onPaste={(e) => handlePaste(e, 'review')} tabIndex={0}>
                                                <label className="w-full h-full flex items-center justify-center cursor-pointer"><Plus size={16} className="text-gray-400"/><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'review')}/></label>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" onClick={addReview} className="bg-aura-brown text-white px-4 py-2 rounded-lg text-sm font-bold w-full md:w-auto">Add Fake Review</button>

                                    <div className="mt-6 space-y-2">
                                        {(formData.manualReviews || []).map((rev, i) => (
                                            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold">{rev.user || ""} <span className="text-aura-gold">{'★'.repeat(rev.rating || 5)}</span></p>
                                                        <p className="text-[10px] text-gray-500">{rev.comment || ""}</p>
                                                        {/* DISPLAY MULTIPLE IMAGES IN LIST */}
                                                        {rev.images && rev.images.length > 0 && (
                                                            <div className="flex gap-1 mt-1">
                                                                {rev.images.map((img: string, k: number) => (
                                                                    <div key={k} className="w-8 h-8 relative rounded overflow-hidden border">
                                                                        <Image src={img} fill className="object-cover" alt=""/>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* BACKWARD COMPATIBILITY FOR OLD SINGLE IMAGE REVIEWS */}
                                                        {!rev.images && rev.image && (
                                                            <div className="w-8 h-8 relative rounded overflow-hidden border mt-1">
                                                                <Image src={rev.image} fill className="object-cover" alt=""/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => deleteReview(i)} className="text-red-400 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Package size={16}/> Shipping & Warranty</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Warranty</label>
                                        <select className="w-full p-3 bg-white border rounded-xl" value={formData.warranty || "No Official Warranty"} onChange={e => setFormData({...formData, warranty: e.target.value})}>
                                            <option>No Official Warranty</option>
                                            <option>6 Months Official Warranty</option>
                                            <option>1 Year Official Warranty</option>
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">Shipping Info</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.shippingText || ""} onChange={e => setFormData({...formData, shippingText: e.target.value})} /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Return Policy</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.returnPolicy || ""} onChange={e => setFormData({...formData, returnPolicy: e.target.value})} /></div>
                                </div>
                            </section>
                        </form>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-end gap-4 bg-white rounded-b-[2rem]">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50">Cancel</button>
                        <button onClick={(e) => {
                            const form = document.getElementById('productForm') as HTMLFormElement;
                            if (form) form.requestSubmit();
                        }} className="px-8 py-3 rounded-xl bg-aura-brown text-white font-bold hover:bg-aura-gold transition-colors flex items-center gap-2 shadow-xl"><Save size={18} /> {isEditing ? "Update Timepiece" : "Publish Timepiece"}</button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}