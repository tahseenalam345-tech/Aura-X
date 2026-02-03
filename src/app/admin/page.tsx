"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import Image from "next/image";
import { Plus, Trash2, Edit, X, Save, Upload, Package, LogOut, Star, Tag, Layers, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";

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

// --- HELPER: Upload to Supabase ---
const uploadImageToSupabase = async (file: File | Blob, fileNameRaw: string) => {
  const fileName = `${Date.now()}-${fileNameRaw.replace(/\s/g, '-')}.jpg`;
  const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
  if (error) { console.error("Upload Error", error); return null; }
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return publicUrl;
};

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();

  // Redirect non-admins immediately
  useEffect(() => {
    if (!isAdmin) {
        // If we are still loading auth, this might trigger early, 
        // but typically AuthContext handles the initial state.
        // You can add a 'loading' state to AuthContext if needed for smoother redirects.
        router.push("/login");
    }
  }, [isAdmin, router]);

  const [products, setProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // --- FULL FORM STATE ---
  const [formData, setFormData] = useState({
    name: "", brand: "AURA-X", category: "men", tags: [] as string[],
    // Specs
    movement: "Automatic", strap: "Leather", waterResistance: "30m", warranty: "2 Years International", caseSize: "40mm",
    // Pricing
    price: 0, originalPrice: 0, discount: 0, 
    // Content
    description: "", customSections: [] as { title: string; content: string }[], 
    // Visuals
    mainImage: "", colors: [] as { name: string; hex: string; images: string[] }[],
    // Reviews
    manualReviews: [] as { user: string; rating: number; comment: string }[]
  });

  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (data) setProducts(data);
  };
  useEffect(() => { fetchProducts(); }, []);

  // --- HANDLERS ---
  const handlePriceChange = (field: string, value: number) => {
    let newForm = { ...formData, [field]: value };
    if (field === 'originalPrice' || field === 'discount') {
        const discountAmount = (newForm.originalPrice * newForm.discount) / 100;
        newForm.price = Math.round(newForm.originalPrice - discountAmount);
    }
    setFormData(newForm);
  };

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    else setFormData({ ...formData, tags: [...formData.tags, tag] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'color', index?: number) => {
    if (!e.target.files?.[0]) return;
    const compressedBlob = await compressImage(e.target.files[0]);
    const url = await uploadImageToSupabase(compressedBlob, e.target.files[0].name);
    if (!url) return;

    if (target === 'main') {
        setFormData({ ...formData, mainImage: url });
    } else if (index !== undefined) {
        const newColors = [...formData.colors];
        newColors[index].images.push(url);
        setFormData({ ...formData, colors: newColors });
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const productPayload = {
          name: formData.name, brand: formData.brand, category: formData.category, 
          price: formData.price, original_price: formData.originalPrice, discount: formData.discount, 
          description: formData.description, main_image: formData.mainImage, tags: formData.tags, 
          is_sale: formData.discount > 0,
          specs: { 
              movement: formData.movement, strap: formData.strap, 
              water_resistance: formData.waterResistance, warranty: formData.warranty, case_size: formData.caseSize 
          },
          colors: formData.colors, 
          custom_sections: formData.customSections, 
          rating: 5.0, 
          reviews_count: formData.manualReviews.length
      };

      const { error } = await supabase.from('products').insert([productPayload]);
      if (!error) {
          alert("Success! Product is live.");
          setShowAddForm(false);
          fetchProducts();
      } else {
          alert("Error: " + error.message);
      }
  };

  // If not admin, don't show dashboard (extra safety)
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
        <aside className="w-64 bg-[#1E1B18] text-white flex flex-col fixed h-full z-20 overflow-y-auto">
            <div className="p-8 border-b border-white/10">
                <h2 className="text-2xl font-serif font-bold text-aura-gold">AURA-X</h2>
                <p className="text-xs text-white/50 tracking-widest uppercase">Admin Portal</p>
            </div>
            <div className="p-4">
                <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-white transition"><LogOut size={16}/> Logout</button>
            </div>
        </aside>

        <div className="flex-1 ml-64 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#1E1B18]">Inventory</h1>
                <button onClick={() => setShowAddForm(true)} className="bg-aura-brown text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-aura-gold transition-colors shadow-lg">
                    <Plus size={18} /> Add New
                </button>
            </div>

            {/* --- FULL RICH ADD FORM --- */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-50"><X /></button>
                        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white z-40">
                             <h2 className="text-2xl font-bold font-serif text-aura-brown">Add New Timepiece</h2>
                        </div>
                        
                        <form onSubmit={handlePublish} className="p-8 space-y-12">
                            
                            {/* 1. IDENTITY */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Product Name</label>
                                        <input required className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Brand</label>
                                        <input className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Category</label>
                                        <select className="w-full p-4 bg-gray-50 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="men">Men's Watches</option><option value="women">Women's Watches</option><option value="couple">Couple Sets</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tags</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["New Arrival", "Trending", "Best Seller", "Limited Edition"].map(tag => (
                                                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold border ${formData.tags.includes(tag) ? 'bg-aura-brown text-white' : 'bg-white text-gray-500'}`}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. SPECIFICATIONS */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Specs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div><label className="text-xs font-bold text-gray-500">Movement</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.movement} onChange={e => setFormData({...formData, movement: e.target.value})}><option>Automatic</option><option>Quartz</option><option>Mechanical</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Strap</label><select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.strap} onChange={e => setFormData({...formData, strap: e.target.value})}><option>Leather</option><option>Metal</option><option>Chain</option></select></div>
                                    <div><label className="text-xs font-bold text-gray-500">Water Resist</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.waterResistance} onChange={e => setFormData({...formData, waterResistance: e.target.value})} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Case Size</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.caseSize} onChange={e => setFormData({...formData, caseSize: e.target.value})} /></div>
                                    <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Warranty</label><input className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} /></div>
                                </div>
                            </div>

                            {/* 3. PRICING */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 grid grid-cols-3 gap-6">
                                <div><label className="text-xs font-bold text-gray-500">Original Price</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.originalPrice} onChange={e => handlePriceChange('originalPrice', Number(e.target.value))} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Discount %</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.discount} onChange={e => handlePriceChange('discount', Number(e.target.value))} /></div>
                                <div><label className="text-xs font-bold text-aura-brown">Final Price</label><div className="w-full p-3 bg-aura-gold/20 rounded-xl font-bold text-aura-brown">Rs {formData.price.toLocaleString()}</div></div>
                            </div>

                            {/* 4. VISUALS */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Upload size={16}/> Visuals</h3>
                                <div className="flex gap-6 items-start">
                                    <div className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden ${formData.mainImage ? 'border-aura-gold' : 'border-gray-300'}`}>
                                        {formData.mainImage ? <Image src={formData.mainImage} alt="" fill className="object-cover" /> : <span className="text-xs text-gray-400">Main</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Upload Main Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main')} className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-full file:bg-aura-gold file:text-aura-brown hover:file:bg-aura-brown hover:file:text-white transition"/>
                                        <p className="text-xs text-gray-400 mt-1">Auto-compressed.</p>
                                    </div>
                                </div>

                                {/* Dynamic Colors */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase text-gray-500">Color Variants</label>
                                    {formData.colors.map((color, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex gap-4 items-center mb-4">
                                                <input type="color" className="w-10 h-10 rounded border-none cursor-pointer" value={color.hex} onChange={(e) => { const c = [...formData.colors]; c[index].hex = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <input placeholder="Color Name" className="flex-1 p-2 border rounded-lg text-sm" value={color.name} onChange={(e) => { const c = [...formData.colors]; c[index].name = e.target.value; setFormData({...formData, colors: c}); }} />
                                                <button type="button" onClick={() => setFormData({...formData, colors: formData.colors.filter((_, i) => i !== index)})} className="text-red-400"><Trash2 size={18}/></button>
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {color.images.map((img, i) => <div key={i} className="w-16 h-16 rounded-lg bg-white border relative flex-shrink-0"><Image src={img} alt="" fill className="object-cover rounded-lg"/></div>)}
                                                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold flex-shrink-0">
                                                    <Plus size={16} className="text-gray-400"/><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'color', index)}/>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setFormData({...formData, colors: [...formData.colors, { name: "", hex: "#000000", images: [] }]})} className="text-sm font-bold text-aura-brown flex items-center gap-2"><Plus size={16} /> Add Color Variant</button>
                                </div>
                            </div>

                            {/* 5. CUSTOM STORY & DETAILS */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Layers size={16}/> Story & Details (Custom Boxes)</h3>
                                {formData.customSections.map((section, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                                        <button type="button" onClick={() => setFormData({...formData, customSections: formData.customSections.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-red-400"><X size={16}/></button>
                                        <input className="w-full bg-transparent font-bold text-aura-brown mb-2 border-b border-gray-200 outline-none" placeholder="Section Title (e.g. The Legacy)" value={section.title} onChange={(e) => { const s = [...formData.customSections]; s[idx].title = e.target.value; setFormData({...formData, customSections: s}); }}/>
                                        <textarea className="w-full bg-transparent text-sm text-gray-600 outline-none h-20 resize-none" placeholder="Content..." value={section.content} onChange={(e) => { const s = [...formData.customSections]; s[idx].content = e.target.value; setFormData({...formData, customSections: s}); }}></textarea>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({...formData, customSections: [...formData.customSections, { title: "", content: "" }]})} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold hover:border-aura-gold hover:text-aura-brown transition-colors">+ Add Custom Information Box</button>
                            </div>

                            {/* 6. REVIEWS MANAGER */}
                            <div className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Star size={16}/> Reviews</h3>
                                {formData.manualReviews.map((review, idx) => (
                                    <div key={idx} className="flex gap-4 items-start bg-gray-50 p-3 rounded-xl">
                                        <div className="flex-1 space-y-2">
                                            <input className="w-full p-2 text-sm border rounded-lg" placeholder="Customer Name" value={review.user} onChange={(e) => { const r = [...formData.manualReviews]; r[idx].user = e.target.value; setFormData({...formData, manualReviews: r}); }} />
                                            <input className="w-full p-2 text-sm border rounded-lg" placeholder="Comment..." value={review.comment} onChange={(e) => { const r = [...formData.manualReviews]; r[idx].comment = e.target.value; setFormData({...formData, manualReviews: r}); }} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <select className="p-2 border rounded-lg text-sm" value={review.rating} onChange={(e) => { const r = [...formData.manualReviews]; r[idx].rating = Number(e.target.value); setFormData({...formData, manualReviews: r}); }} >{[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}</select>
                                            <button type="button" onClick={() => setFormData({...formData, manualReviews: formData.manualReviews.filter((_, i) => i !== idx)})} className="text-red-400 text-xs">Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({...formData, manualReviews: [...formData.manualReviews, { user: "Verified Buyer", rating: 5, comment: "Excellent timepiece!" }]})} className="text-sm font-bold text-aura-brown flex items-center gap-2"><Plus size={16} /> Add Manual Review</button>
                            </div>

                            <div className="pt-8 border-t border-gray-100 flex justify-end gap-4 sticky bottom-0 bg-white p-4 z-50">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-8 py-3 rounded-xl bg-aura-brown text-white font-bold hover:bg-aura-gold transition-colors flex items-center gap-2 shadow-xl">
                                    <Save size={18} /> Publish to Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Product List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-6 text-xs font-bold text-gray-400 uppercase">Product</th><th className="p-6 text-xs font-bold text-gray-400 uppercase">Price</th><th className="p-6 text-xs font-bold text-gray-400 uppercase text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                                <td className="p-6 flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">{item.main_image && <Image src={item.main_image} alt="" fill className="object-cover" unoptimized />}</div><span className="font-bold text-aura-brown">{item.name}</span></td>
                                <td className="p-6 font-bold text-aura-brown">Rs {item.price.toLocaleString()}</td>
                                <td className="p-6 text-right"><button className="text-red-600 text-xs font-bold" onClick={async () => { if(confirm("Delete?")) { await supabase.from('products').delete().eq('id', item.id); fetchProducts(); }}}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}