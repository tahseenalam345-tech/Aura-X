"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Save, Upload, Tag, Settings, Flame, Star, Package, Check, Palette, LayoutGrid, List, Table as TableIcon, Search, Calendar, Filter, Eye, Loader2, Copy, Link as LinkIcon, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

// --- CONSTANTS FOR DROPDOWNS ---
const COLOR_MAP: Record<string, string> = {
  "Silver": "#C0C0C0", "Gold": "#FFD700", "Rose Gold": "#B76E79", "Black": "#000000",
  "Two-Tone (Silver/Gold)": "#F5F5DC", "Two-Tone (Silver/Rose Gold)": "#FFE4E1", "Two-Tone (Black/Gold)": "#B8860B", "Two-Tone (Black/Silver)": "#708090",
  "Blue": "#0000FF", "Green": "#008000", "White": "#FFFFFF", "Brown": "#A52A2A",
  "Grey": "#808080", "Gunmetal": "#2a3439", "Red": "#FF0000", "Tiffany Blue": "#0ABAB5",
  "Champagne": "#F7E7CE", "Mother of Pearl": "#F0EAD6", "Navy": "#000080",
  "Yellow": "#FFFF00", "Orange": "#FFA500", "Purple": "#800080", "Pink": "#FFC0CB",
  "Bronze": "#CD7F32", "Copper": "#B87333", "Maroon": "#800000", "Olive": "#808000",
  "Teal": "#008080", "Turquoise": "#40E0D0", "Beige": "#F5F5DC", "Tan": "#D2B48C"
};
const POPULAR_COLORS = Object.keys(COLOR_MAP).sort();

const MATERIAL_MAP = ["Leather", "Metal", "Silicon", "Stainless Steel", "Mesh", "Rubber", "Fabric/Nylon", "Ceramic", "Titanium", "Alloy"];
const GLASS_MAP = ["Mineral", "Sapphire", "Hardlex", "Acrylic", "Resin"];
const FRAGRANCE_VOLUMES = ["30ml", "50ml", "100ml", "150ml", "200ml"];
const FRAGRANCE_CONCENTRATIONS = ["Eau De Parfum (EDP)", "Eau De Toilette (EDT)", "Parfum", "Extrait De Parfum", "Body Mist"];
const FRAGRANCE_FAMILIES = ["Woody", "Floral", "Citrus", "Spicy", "Oriental", "Fresh", "Aromatic", "Aquatic", "Fruity"];
const WALLET_MATERIALS = ["Genuine Cowhide Leather", "Premium PU Leather", "Carbon Fiber", "Vegan Leather"];
const CARD_SLOTS = ["4 Slots", "6 Slots", "8 Slots", "10+ Slots"];
const BELT_MATERIALS = ["Genuine Leather", "Cowhide Leather", "PU Leather", "Nylon", "Canvas"];
const BUCKLE_TYPES = ["Auto-Lock", "Pin Buckle", "Reversible", "Plaque"];
const FRAME_STYLES = ["Aviator", "Wayfarer", "Round", "Square", "Rimless", "Clubmaster", "Cat Eye"];
const LENS_FEATURES = ["Polarized", "UV400 Protection", "Gradient", "Mirrored", "Anti-Reflective", "Blue Light Blocking"];
const FRAME_MATERIALS = ["Metal", "Acetate", "TR90", "Polycarbonate", "Titanium", "Alloy"];
const JEWELRY_MATERIALS = ["Stainless Steel", "Sterling Silver 925", "Titanium", "Alloy", "Tungsten"];
const PLATINGS = ["18K Gold Plated", "Rhodium Plated", "Rose Gold Plated", "Silver Plated", "No Plating"];
const STONES = ["Zirconia (CZ)", "Rhinestone", "Swarovski", "None"];
const DISPLAY_TYPES = ["AMOLED", "IPS", "TFT", "OLED"];
const SCREEN_SIZES = ["1.3 inches", "1.43 inches", "1.9 inches", "2.0 inches", "2.2 inches"];
const BLUETOOTH_VERSIONS = ["Bluetooth 5.0", "Bluetooth 5.2", "Bluetooth 5.3", "Bluetooth 5.4"];

// --- HELPER FUNCTIONS ---
const isVideoFile = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('/video/upload/');
};

const compressImage = (file: File, isReview: boolean = false): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = isReview ? 600 : 1000; 
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) { 
            height = height * (MAX_WIDTH / width); 
            width = MAX_WIDTH; 
        }
        
        canvas.width = width; 
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
        }
        
        const quality = isReview ? 0.7 : 0.85;
        canvas.toBlob((blob) => { 
            if (blob) resolve(blob); 
            else reject(new Error("Compression failed")); 
        }, "image/jpeg", quality); 
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const processFileUpload = async (file: File, isReview: boolean = false, onProgress?: (p: number) => void) => {
    const isVideo = file.type.startsWith('video/');
    let fileToUpload: File | Blob = file;

    if (!isVideo) { 
        try { fileToUpload = await compressImage(file, isReview); } 
        catch (e) { console.error("Compression failed:", e); return null; } 
    }

    const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const cleanName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10);
    const fileName = `v4-${Date.now()}-${cleanName}.${ext}`;

    const targetBucket = 'product-images';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress > 90) progress = 90;
        if (onProgress) onProgress(progress);
    }, 400);

    const { error } = await supabase.storage.from(targetBucket).upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false
    }); 

    clearInterval(interval);

    if (error) { 
        console.error("Upload Error:", error.message); 
        return null; 
    }

    if (onProgress) onProgress(100);

    const { data: { publicUrl } } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
    return publicUrl;
};

// 🚀 BRAND NEW CUSTOM COLOR DROPDOWN COMPONENT
const CustomColorSelect = ({ value, onChange, placeholder, className }: { value: string, onChange: (name: string, hex: string) => void, placeholder: string, className?: string }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value || "");

    useEffect(() => {
        if (!open) setSearch(value || "");
    }, [value, open]);

    const filtered = POPULAR_COLORS.filter(c => c.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className={`relative ${className || 'w-full'}`}>
            <div className="relative">
                {COLOR_MAP[value] && !open && (
                    <div 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-300 shadow-sm pointer-events-none"
                        style={{ backgroundColor: COLOR_MAP[value] }}
                    />
                )}
                <input
                    type="text"
                    className={`w-full p-3 ${COLOR_MAP[value] && !open ? 'pl-9' : 'pl-3'} border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-aura-gold transition-all`}
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setOpen(true);
                        onChange(e.target.value, COLOR_MAP[e.target.value] || "#ffffff");
                    }}
                    onFocus={() => {
                        setSearch(""); 
                        setOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {open && (
                <div className="absolute z-[60] w-full mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-1">
                    {filtered.length > 0 ? filtered.map(c => (
                        <div 
                            key={c}
                            className="flex items-center gap-3 p-2.5 hover:bg-aura-gold/10 rounded-lg cursor-pointer transition-colors"
                            onMouseDown={(e) => { 
                                e.preventDefault(); 
                                setSearch(c);
                                onChange(c, COLOR_MAP[c]);
                                setOpen(false);
                            }}
                        >
                            <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm shrink-0" style={{ backgroundColor: COLOR_MAP[c] }}></div>
                            <span className="text-sm font-bold text-gray-700 truncate">{c}</span>
                        </div>
                    )) : (
                        <div className="p-3 text-xs text-gray-400 text-center font-medium">Type to use as custom color name</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function InventoryTab({ products, fetchProducts }: { products: any[], fetchProducts: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('grid');
  
  const [uploadQueue, setUploadQueue] = useState<{ id: string, progress: number, type: string, index?: number }[]>([]);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandModalTab, setBrandModalTab] = useState<'men' | 'women' | 'couple'>('men');
  const [brandSettings, setBrandSettings] = useState<Record<string, { brand_name: string; sort_order: number; db_key: string }[]>>({
      men: [], women: [], couple: []
  });

  const [showViewsModal, setShowViewsModal] = useState(false);
  const [bulkViewCategory, setBulkViewCategory] = useState("All");
  const [minViews, setMinViews] = useState(50);
  const [maxViews, setMaxViews] = useState(250);

  const [searchQuery, setSearchQuery] = useState(""); 
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [newReview, setNewReview] = useState<any>({ user: "", date: "", rating: 5, comment: "", images: [] });
  
  const [externalGalleryLink, setExternalGalleryLink] = useState("");
  const [sizesInput, setSizesInput] = useState("");
  
  const [hasMultipleColors, setHasMultipleColors] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const initialFormState = {
    name: "", brand: "AURA-X", sku: "", stock: 5, category: "", sub_category: "", 
    price: 0, originalPrice: 0, discount: 0, costPrice: 0, deliveryCharge: 250,
    tags: "" as string, priority: 100, viewCount: 0, 
    isEidExclusive: false, isPinned: false, 
    movement: "Quartz (Battery)", waterResistance: "0ATM (No Resistance)", 
    glass: "", caseMaterial: "", caseColor: "Silver", caseShape: "Round", 
    caseDiameter: "40mm", caseThickness: "10mm", 
    strapMaterial: "", strapColor: "", strapWidth: "20mm", adjustable: true,
    dialColor: "", luminous: false, dateDisplay: false, weight: "135g", 
    description: "", extra_notes: "", warranty: "6 Months Official Warranty", 
    shippingText: "2-4 Working Days", returnPolicy: "7 Days Return Policy", boxIncluded: false, 
    mainImage: "", hoverImage: "", baseColorName: "Silver", 
    gallery: [] as string[], colors: [] as { name: string; hex: string; image: string }[],
    manualReviews: [] as any[], variants: { sizes: [] as string[] },
    
    // FRAGRANCE SPECS
    volume: "", concentration: "", fragranceFamily: "", topNotes: "", heartNotes: "", baseNotes: "", longevity: "",
    // WALLET SPECS
    walletMaterial: "", cardSlots: "", rfid: false, coinPocket: false, dimensions: "",
    // BELT SPECS
    beltMaterial: "", buckleType: "", buckleMaterial: "",
    // SUNGLASSES SPECS
    lensFeature: "", frameMaterial: "", lensMaterial: "", eyewearShape: "",
    // JEWELRY SPECS
    jewelryMaterial: "", plating: "", stone: "",
    // SMART TECH SPECS
    displayType: "", screenSize: "", smartFeatures: "", appSupport: "", bluetoothVersion: "", earbudFeatures: "", playtime: "", waterResistanceSmart: ""
  };
  
  const [formData, setFormData] = useState<any>(initialFormState);

  const isWatchCategory = ['men', 'women', 'couple', 'watches'].includes(formData.category.toLowerCase());
  const isFragrance = formData.category === 'fragrances';
  const isWallet = formData.sub_category === 'wallets';
  const isBelt = formData.sub_category === 'belts';
  const isSunglasses = formData.sub_category === 'sunglasses';
  const isJewelry = formData.sub_category === 'jewelry';
  const isSmartwatch = formData.sub_category === 'smartwatches';
  const isEarbuds = formData.sub_category === 'earbuds';
  
  const needsSizes = ['jewelry', 'belts'].includes(formData.sub_category.toLowerCase());

  const handleAIAutoFill = async () => {
      if (!formData.mainImage) {
          toast.error("Please upload a Main Image first so the AI can analyze it!");
          return;
      }
      
      setIsAnalyzingAI(true);
      const loadingToast = toast.loading("AI is analyzing the image...");

      try {
          const res = await fetch('/api/ai-vision', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: formData.mainImage, category: formData.category || 'watch' })
          });
          
          const data = await res.json();
          
          if (res.ok && data.success && data.specs) {
              setFormData((prev: any) => ({
                  ...prev,
                  name: prev.name || data.specs.name || "",
                  description: prev.description || data.specs.description || "",
                  dialColor: data.specs.dialColor || prev.dialColor,
                  strapColor: data.specs.strapColor || prev.strapColor,
                  strapMaterial: data.specs.strapMaterial || prev.strapMaterial,
                  caseColor: data.specs.caseColor || prev.caseColor
              }));
              toast.success("AI successfully auto-filled details!");
          } else {
              const errorMsg = data.error || "Unknown Backend Error";
              toast.error(`AI Failed: ${errorMsg}`, { duration: 6000 });
          }
      } catch (error: any) {
          toast.error(`System Error: ${error.message}`, { duration: 6000 });
      } finally {
          setIsAnalyzingAI(false);
          toast.dismiss(loadingToast);
      }
  };

  const processFiles = async (files: File[], type: 'main' | 'hover' | 'gallery' | 'color' | 'review', index?: number) => {
      for (const file of files) {
          const id = Math.random().toString();
          setUploadQueue(prev => [...prev, { id, progress: 0, type, index }]);
          
          const url = await processFileUpload(file, type === 'review', (p) => {
              setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, progress: p } : item));
          });

          setTimeout(() => {
              setUploadQueue(prev => prev.filter(item => item.id !== id));
          }, 1500); 

          if (url) {
              applyImageToState(url, type, index);
              toast.success(`${file.name.substring(0, 15)}... Uploaded!`);
          } else {
              toast.error(`Failed to upload ${file.name}`);
          }
      }
  };

  const handleDrop = async (e: React.DragEvent, type: 'main' | 'hover' | 'gallery' | 'color' | 'review', index?: number) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files || []);
      if (!files.length) return;
      
      const filesToProcess = (type === 'gallery' || type === 'review') ? files : [files[0]];
      await processFiles(filesToProcess, type, index);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover' | 'gallery' | 'color' | 'review', index?: number) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      
      const filesToProcess = (type === 'gallery' || type === 'review') ? files : [files[0]];
      await processFiles(filesToProcess, type, index);
      e.target.value = ''; 
  };

  const applyBulkViews = async () => {
    if (minViews >= maxViews) return toast.error("Max views must be greater than Min views.");
    const loadingToast = toast.loading(`Generating random views...`);

    let targetProducts = products;
    if (bulkViewCategory !== "All") {
        targetProducts = products.filter(p => p.category === bulkViewCategory);
    }

    if (targetProducts.length === 0) {
        toast.dismiss(loadingToast);
        return toast.error("No products found in this category.");
    }

    try {
        const promises = targetProducts.map(async (p) => {
            const randomViewCount = Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
            const currentSpecs = p.specs || {};
            const newSpecs = { ...currentSpecs, view_count: randomViewCount };
            return supabase.from('products').update({ specs: newSpecs }).eq('id', p.id);
        });

        await Promise.all(promises);
        toast.dismiss(loadingToast);
        toast.success(`Successfully added views to ${targetProducts.length} items!`);
        setShowViewsModal(false);
        fetchProducts(); 
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate bulk views.");
    }
  };

  const handleManageBrands = async () => {
      const loadingToast = toast.loading("Loading brands...");
      const { data: prods } = await supabase.from('products').select('brand, category');
      const { data: settings } = await supabase.from('brand_settings').select('*');
      const settingsMap = new Map(settings?.map(s => [s.brand_name, s.sort_order]));

      const categories = ['men', 'women', 'couple'];
      const newSettings: any = { men: [], women: [], couple: [] };

      categories.forEach(cat => {
          const catProds = prods?.filter(p => p.category === cat) || [];
          const uniqueBrands = Array.from(new Set(catProds.map(p => p.brand || "AURA-X").filter(Boolean)));
          
          newSettings[cat] = uniqueBrands.map(brand => {
              const key = `${cat}__${brand}`;
              const order = settingsMap.get(key) ?? settingsMap.get(brand as string) ?? 99;
              return { brand_name: brand as string, sort_order: order, db_key: key };
          }).sort((a: any, b: any) => a.sort_order - b.sort_order);
      });

      setBrandSettings(newSettings);
      setBrandModalTab('men');
      toast.dismiss(loadingToast);
      setShowBrandModal(true);
  };

  const saveBrandOrder = async () => {
      const loadingToast = toast.loading("Saving order...");
      const payload: any[] = [];
      ['men', 'women', 'couple'].forEach(cat => {
          brandSettings[cat].forEach(b => {
              payload.push({ brand_name: b.db_key, sort_order: b.sort_order });
          });
      });

      const { error } = await supabase.from('brand_settings').upsert(payload);
      if (error) {
          toast.error("Failed to save brand order!");
      } else {
          toast.success("Brand order updated successfully!");
          setShowBrandModal(false);
      }
      toast.dismiss(loadingToast);
  };

  const filteredProducts = products.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
                          (item.name || "").toLowerCase().includes(q) || 
                          (item.specs?.sku || "").toLowerCase().includes(q) ||
                          (item.brand || "").toLowerCase().includes(q);
                          
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewClick = () => {
    const randomSku = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({ ...initialFormState, sku: randomSku });
    setSizesInput("");
    setHasMultipleColors(false);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (item: any) => {
    const specs = item.specs || {};
    const variants = item.variants || {};
    
    const safeGallery = Array.isArray(specs.gallery) ? specs.gallery : [];
    const safeColors = Array.isArray(item.colors) ? item.colors : [];
    const safeReviews = Array.isArray(item.manual_reviews) ? item.manual_reviews : [];
    const safeSizes = Array.isArray(variants.sizes) ? variants.sizes : [];

    let singleTag = "";
    if (Array.isArray(item.tags) && item.tags.length > 0) singleTag = item.tags[0];
    else if (typeof item.tags === 'string') singleTag = item.tags;

    const editHasColors = safeColors.length > 1; 

    const existingSku = specs.sku || item.sku;
    const finalSku = existingSku ? existingSku : `AX-${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
        ...initialFormState,
        name: item.name || "",
        brand: item.brand || "AURA-X",
        category: item.category || "",
        sub_category: item.sub_category || "",
        price: item.price ?? 0,
        originalPrice: item.original_price ?? 0,
        discount: item.discount ?? 0,
        description: item.description || "",
        extra_notes: specs.extra_notes || "",
        mainImage: item.main_image || "",
        hoverImage: item.image || "", 
        baseColorName: safeColors[0]?.name || "Silver",
        tags: singleTag,
        priority: item.priority ?? 100,
        isEidExclusive: item.is_eid_exclusive ?? false,
        isPinned: item.is_pinned ?? false, 
        colors: editHasColors ? safeColors.slice(1) : [], 
        manualReviews: safeReviews,
        variants: { sizes: safeSizes },
        
        sku: finalSku, 
        
        stock: specs.stock ?? 5, 
        costPrice: specs.cost_price ?? 0,
        deliveryCharge: specs.delivery_charge ?? (item.is_eid_exclusive ? 0 : 250),
        viewCount: specs.view_count ?? 0,
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
        warranty: specs.warranty || "6 Months Official Warranty",
        shippingText: specs.shipping_text || "2-4 Working Days",
        returnPolicy: specs.return_policy || "7 Days Return Policy",
        boxIncluded: specs.box_included ?? false,
        gallery: safeGallery,
        
        volume: specs.volume || "", concentration: specs.concentration || "", fragranceFamily: specs.fragranceFamily || "",
        topNotes: specs.topNotes || "", heartNotes: specs.heartNotes || "", baseNotes: specs.baseNotes || "", longevity: specs.longevity || "",
        walletMaterial: specs.walletMaterial || "", cardSlots: specs.cardSlots || "", rfid: specs.rfid || false, coinPocket: specs.coinPocket || false, dimensions: specs.dimensions || "",
        beltMaterial: specs.beltMaterial || "", buckleType: specs.buckleType || "", buckleMaterial: specs.buckleMaterial || "",
        lensFeature: specs.lensFeature || "", frameMaterial: specs.frameMaterial || "", lensMaterial: specs.lensMaterial || "", eyewearShape: specs.eyewearShape || "",
        jewelryMaterial: specs.jewelryMaterial || "", plating: specs.plating || "", stone: specs.stone || "",
        displayType: specs.displayType || "", screenSize: specs.screenSize || "", smartFeatures: specs.smartFeatures || "", appSupport: specs.appSupport || "", bluetoothVersion: specs.bluetoothVersion || "", earbudFeatures: specs.earbudFeatures || "", playtime: specs.playtime || "", waterResistanceSmart: specs.waterResistanceSmart || ""
    });
    
    setSizesInput(safeSizes.join(", "));
    setHasMultipleColors(editHasColors);
    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCopyClick = (item: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    handleEditClick(item);
    
    const randomSku = `AX-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData((prev: any) => ({
        ...prev,
        name: `${item.name || ""} (Copy)`,
        sku: randomSku,
    }));
    
    setEditId(null); 
    setIsEditing(false); 
    setShowForm(true);
    toast.success("Copied details! Update the images and publish.");
  };

  const applyImageToState = (url: string, type: string, index?: number) => {
    if (type === 'main') setFormData((prev: any) => ({ ...prev, mainImage: url }));
    else if (type === 'hover') setFormData((prev: any) => ({ ...prev, hoverImage: url }));
    else if (type === 'gallery') setFormData((prev: any) => ({ ...prev, gallery: Array.isArray(prev.gallery) ? [...prev.gallery, url] : [url] }));
    else if (type === 'review') setNewReview((prev: any) => ({ ...prev, images: Array.isArray(prev.images) ? [...prev.images, url] : [url] })); 
    else if (type === 'color' && index !== undefined) {
        setFormData((prev: any) => {
            const newColors = Array.isArray(prev.colors) ? [...prev.colors] : [];
            if(newColors[index]) {
                newColors[index].image = url;
            }
            return { ...prev, colors: newColors };
        });
    }
  };

  const handlePaste = async (e: React.ClipboardEvent, type: 'main' | 'hover' | 'gallery' | 'review') => {
    const items = e.clipboardData.items;
    const filesToUpload: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("video") !== -1) {
            const file = items[i].getAsFile();
            if (file) filesToUpload.push(file);
        }
    }
    
    if (filesToUpload.length > 0) {
        const processList = (type === 'gallery' || type === 'review') ? filesToUpload : [filesToUpload[0]];
        await processFiles(processList, type);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const mainColorVariant = {
          name: formData.baseColorName,
          hex: COLOR_MAP[formData.baseColorName] || "#C0C0C0",
          image: formData.mainImage
      };
      
      let allColors = [mainColorVariant];
      if (hasMultipleColors && Array.isArray(formData.colors)) {
          const additionalColors = formData.colors.filter((c: any) => c && c.name && c.image);
          allColors = [mainColorVariant, ...additionalColors];
      }
      
      const tagsArray = formData.tags ? [formData.tags] : [];
      const sizesArray = sizesInput.split(',').map(s => s.trim()).filter(s => s !== "");

      const productPayload = {
          name: formData.name, brand: formData.brand, category: formData.category, sub_category: formData.sub_category, 
          price: formData.price, original_price: formData.originalPrice, discount: formData.discount, 
          description: formData.description, 
          main_image: formData.mainImage, 
          image: formData.hoverImage || formData.mainImage,
          tags: tagsArray, 
          rating: formData.priority, is_sale: formData.discount > 0, 
          priority: formData.priority, 
          is_eid_exclusive: formData.isEidExclusive, 
          is_pinned: formData.isPinned, 
          colors: allColors, manual_reviews: formData.manualReviews, 
          variants: { sizes: sizesArray }, 
          specs: { 
              sku: formData.sku, stock: formData.stock, cost_price: formData.costPrice, view_count: formData.viewCount,
              delivery_charge: formData.deliveryCharge, extra_notes: formData.extra_notes, weight: formData.weight,
              warranty: formData.warranty, shipping_text: formData.shippingText, return_policy: formData.returnPolicy, box_included: formData.boxIncluded,
              gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
              
              movement: formData.movement, water_resistance: formData.waterResistance, glass: formData.glass,
              case_material: formData.caseMaterial, case_color: formData.caseColor, case_shape: formData.caseShape, 
              case_size: formData.caseDiameter, case_thickness: formData.caseThickness,
              strap: formData.strapMaterial, strap_color: formData.strapColor, strap_width: formData.strapWidth, adjustable: formData.adjustable,
              dial_color: formData.dialColor, luminous: formData.luminous, date_display: formData.dateDisplay,
              
              volume: formData.volume, concentration: formData.concentration, fragranceFamily: formData.fragranceFamily,
              topNotes: formData.topNotes, heartNotes: formData.heartNotes, baseNotes: formData.baseNotes, longevity: formData.longevity,
              
              walletMaterial: formData.walletMaterial, cardSlots: formData.cardSlots, rfid: formData.rfid, coinPocket: formData.coinPocket, dimensions: formData.dimensions,
              beltMaterial: formData.beltMaterial, buckleType: formData.buckleType, buckleMaterial: formData.buckleMaterial,
              
              lensFeature: formData.lensFeature, frameMaterial: formData.frameMaterial, lensMaterial: formData.lensMaterial, eyewearShape: formData.eyewearShape,
              jewelryMaterial: formData.jewelryMaterial, plating: formData.plating, stone: formData.stone,
              
              displayType: formData.displayType, screenSize: formData.screenSize, smartFeatures: formData.smartFeatures, appSupport: formData.appSupport,
              bluetoothVersion: formData.bluetoothVersion, earbudFeatures: formData.earbudFeatures, playtime: formData.playtime, waterResistanceSmart: formData.waterResistanceSmart
          }
      };

      try {
          if (isEditing && editId) {
              const { error } = await supabase.from('products').update(productPayload).eq('id', editId);
              if (error) throw error;
              toast.success("Product Updated");
          } else {
              const { error } = await supabase.from('products').insert([productPayload]);
              if (error) throw error;
              toast.success("Product Published");
          }
          setShowForm(false); 
          fetchProducts();
      } catch (error: any) {
          console.error("Supabase Save Error:", error);
          toast.error(`Failed to save: ${error.message}`);
      }
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

  const removeImage = (type: 'main' | 'hover' | 'gallery' | 'review', index?: number) => {
    if(type === 'main') setFormData((prev: any) => ({...prev, mainImage: ""}));
    else if(type === 'hover') setFormData((prev: any) => ({...prev, hoverImage: ""}));
    else if(type === 'gallery' && index !== undefined) {
        setFormData((prev: any) => ({...prev, gallery: Array.isArray(prev.gallery) ? prev.gallery.filter((_: any, i: number) => i !== index) : []}));
    }
    else if(type === 'review' && index !== undefined) {
        setNewReview((prev: any) => ({...prev, images: Array.isArray(prev.images) ? prev.images.filter((_: any, i: number) => i !== index) : []}));
    }
  };

  const selectTag = (tag: string) => {
    if (formData.tags === tag) setFormData({ ...formData, tags: "" });
    else setFormData({ ...formData, tags: tag });
  };

  const addReview = () => {
    setFormData((prev: any) => ({...prev, manualReviews: Array.isArray(prev.manualReviews) ? [newReview, ...prev.manualReviews] : [newReview]}));
    setNewReview({ user: "", date: "", rating: 5, comment: "", images: [] });
  };

  const deleteReview = (index: number) => {
    setFormData((prev: any) => ({ ...prev, manualReviews: Array.isArray(prev.manualReviews) ? prev.manualReviews.filter((_: any, i: number) => i !== index) : [] }));
  };

  return (
    <>
        <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B18]">Inventory</h1>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button onClick={() => setShowViewsModal(true)} className="bg-white border border-red-200 text-red-600 px-5 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-50 hover:shadow-md transition-all text-sm md:text-base justify-center"><Eye size={18} /> Bulk Fake Views</button>
                    <button onClick={handleManageBrands} className="bg-white border border-gray-200 text-aura-brown px-5 py-3 rounded-full font-bold flex items-center gap-2 hover:border-aura-gold hover:shadow-md transition-all text-sm md:text-base justify-center"><List size={18} /> Manage Brands</button>
                    <button onClick={handleAddNewClick} className="bg-aura-brown text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-aura-gold transition-colors shadow-lg text-sm md:text-base w-full md:w-auto justify-center"><Plus size={18} /> Add New</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search Name, SKU, Brand..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl border border-gray-200">
                        <Filter size={14} className="text-gray-400"/>
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer py-1.5"
                        >
                            <option value="All">All Categories</option>
                            <option value="men">Men's Watches</option>
                            <option value="women">Women's Watches</option>
                            <option value="couple">Couple Watches</option>
                            <option value="accessories">Accessories</option>
                            <option value="fragrances">Fragrances</option>
                            <option value="smart-tech">Smart Tech</option>
                        </select>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="Grid View"><LayoutGrid size={18}/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="List View"><List size={18}/></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm text-aura-brown' : 'text-gray-500'}`} title="Table View"><TableIcon size={18}/></button>
                    </div>
                </div>
            </div>
        </div>

        {/* Views Modal */}
        {showViewsModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative border-t-8 border-red-500">
                    <div className="p-6 text-center border-b border-gray-100 relative">
                        <button onClick={() => setShowViewsModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Eye size={30}/></div>
                        <h2 className="text-xl font-bold font-serif text-aura-brown">Bulk Fake Views</h2>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Instantly add random "Currently Viewing" numbers to your products to boost FOMO.</p>
                    </div>
                    
                    <div className="p-6 space-y-5 bg-gray-50 flex-1">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Apply To Category</label>
                            <select className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 font-medium" value={bulkViewCategory} onChange={(e) => setBulkViewCategory(e.target.value)}>
                                <option value="All">All Categories (Entire Store)</option>
                                <option value="men">Men's Watches Only</option>
                                <option value="women">Women's Watches Only</option>
                                <option value="accessories">Accessories Only</option>
                                <option value="fragrances">Fragrances Only</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Min Views</label>
                                <input type="number" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none font-bold text-center focus:border-red-500" value={minViews} onChange={(e) => setMinViews(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Max Views</label>
                                <input type="number" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none font-bold text-center focus:border-red-500" value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-3 items-start mt-2">
                            <Flame className="text-red-500 flex-shrink-0" size={18} />
                            <p className="text-[10px] text-red-800 leading-tight">This will permanently overwrite the current view counts of all selected products with a random number between {minViews} and {maxViews}.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <button onClick={applyBulkViews} className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-red-700 transition-colors shadow-lg flex justify-center items-center gap-2">
                            <Flame size={16}/> Generate Now
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* View Modes */}
        {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20">
                {filteredProducts.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => handleEditClick(item)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:border-aura-gold hover:shadow-md transition-all relative"
                    >
                        <div className="relative aspect-square w-full bg-gray-50">
                            {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" unoptimized={true} />)}
                            
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {item.is_pinned && <span className="text-[9px] bg-aura-gold text-black px-2 py-0.5 rounded shadow font-bold flex items-center gap-1"><Star size={8} fill="currentColor"/> PINNED</span>}
                                {item.is_eid_exclusive && <span className="text-[9px] bg-black text-aura-gold px-2 py-0.5 rounded shadow font-bold">EID</span>}
                                {item.specs?.stock <= 0 && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded shadow font-bold">OUT OF STOCK</span>}
                                {item.specs?.view_count > 0 && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded shadow font-bold flex items-center gap-1"><Eye size={8}/> {item.specs.view_count} VIEWS</span>}
                            </div>

                            <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => handleCopyClick(item, e)} 
                                    className="bg-white/90 backdrop-blur p-1.5 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                                    title="Duplicate Item"
                                >
                                    <Copy size={16} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} 
                                    className="bg-white/90 backdrop-blur p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                    title="Delete Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-aura-brown text-sm truncate">{item.name || "Unnamed"}</h3>
                            <div className="flex justify-between items-center mt-1 mb-1">
                                <p className="text-aura-gold font-bold text-xs">Rs {(item.price || 0).toLocaleString()}</p>
                                <span className="text-[10px] text-gray-400">Stock: {item.specs?.stock || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-gray-400 border-t pt-1.5 mt-1 truncate">
                                <span className="font-bold uppercase">{item.sub_category || item.category || ""}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {viewMode === 'list' && (
            <div className="space-y-3 pb-20">
                {filteredProducts.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => handleEditClick(item)}
                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-aura-gold hover:bg-gray-50 transition-all group relative"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border">
                             {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="100px" className="object-cover" unoptimized={true} />)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-aura-brown truncate text-sm md:text-base flex items-center gap-2">
                                {item.name || "Unnamed"} 
                                {item.is_pinned && <Star size={12} className="text-aura-gold" fill="currentColor"/>}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-0.5">
                                <span>{item.sub_category || item.category || ""}</span>
                                <span>SKU: {item.specs?.sku || ""}</span>
                                <span className={(item.specs?.stock || 0) > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>Stock: {item.specs?.stock || 0}</span>
                                <span className="font-bold text-aura-gold">Rs {(item.price || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={(e) => handleCopyClick(item, e)} className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Duplicate"><Copy size={16}/></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {viewMode === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto pb-20">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="p-4 text-xs font-bold text-gray-400 uppercase">Product</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Category</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Stock</th><th className="p-4 text-xs font-bold text-gray-400 uppercase">Price</th><th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((item) => (
                            <tr key={item.id} onClick={() => handleEditClick(item)} className="hover:bg-aura-gold/5 cursor-pointer transition-colors group">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {item.main_image && (isVideoFile(item.main_image) ? <video src={item.main_image} className="w-full h-full object-cover" muted /> : <Image src={item.main_image} alt="" fill sizes="40px" className="object-cover" unoptimized={true} />)}
                                    </div>
                                    <div className="truncate max-w-[200px]">
                                        <p className="font-bold text-aura-brown text-sm group-hover:text-aura-gold transition-colors flex items-center gap-1">
                                            {item.name || "Unnamed"} {item.is_pinned && <Star size={10} className="text-aura-gold" fill="currentColor"/>}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-gray-500 uppercase">{item.sub_category || item.category || ""}</td>
                                <td className="p-4 text-sm font-medium">{item.specs?.stock || 0}</td>
                                <td className="p-4 font-bold text-aura-brown text-sm">Rs {(item.price || 0).toLocaleString()}</td>
                                <td className="p-4 text-right flex justify-end gap-1">
                                    <button onClick={(e) => handleCopyClick(item, e)} className="p-2 text-gray-300 hover:text-blue-600 transition-colors" title="Duplicate"><Copy size={16}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 text-gray-300 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Brand Modal */}
        {showBrandModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold font-serif text-aura-brown">Brand Ordering</h2>
                            <p className="text-xs text-gray-500 mt-1">Manage brand priority per category.</p>
                        </div>
                        <button onClick={() => setShowBrandModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex bg-gray-200 p-1 rounded-xl">
                            {['men', 'women', 'couple'].map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setBrandModalTab(cat as any)}
                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${brandModalTab === cat ? 'bg-white shadow text-aura-brown' : 'text-gray-500'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-gray-50/50">
                        {brandSettings[brandModalTab].length === 0 ? (
                            <p className="text-center text-gray-400 text-sm">No brands found in this category.</p>
                        ) : (
                            brandSettings[brandModalTab].map((brand, index) => (
                                <div key={brand.db_key} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-aura-gold transition-colors">
                                    <span className="font-bold text-gray-700">{brand.brand_name}</span>
                                    <input 
                                        type="number" 
                                        className="w-20 p-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-bold outline-none focus:border-aura-gold focus:bg-white transition-colors"
                                        value={brand.sort_order}
                                        onChange={(e) => {
                                            const newSettings = { ...brandSettings };
                                            newSettings[brandModalTab][index].sort_order = Number(e.target.value);
                                            setBrandSettings(newSettings);
                                        }}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button onClick={saveBrandOrder} className="w-full py-3 bg-aura-brown text-white rounded-xl font-bold tracking-widest uppercase text-sm hover:bg-aura-gold transition-colors shadow-lg flex justify-center items-center gap-2">
                            <Save size={16}/> Save Ordering
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 🚀 MAIN ADD/EDIT FORM */}
        {showForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-none md:rounded-[2rem] w-full max-w-6xl h-[100dvh] md:h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                         <h2 className="text-2xl font-bold font-serif text-aura-brown">{isEditing ? "Edit Masterpiece" : "Add New Masterpiece"}</h2>
                         <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                        <form id="productForm" onSubmit={handlePublish} className="space-y-12">
                            
                            {/* SECTION: Identity */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest"><Tag size={16}/> Identity</h3>
                                    <button type="button" onClick={handleAIAutoFill} disabled={isAnalyzingAI} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5 disabled:opacity-50">
                                        {isAnalyzingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {isAnalyzingAI ? "Analyzing..." : "Auto-Fill with AI"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Product Name</label><input required className="w-full p-4 bg-white border rounded-xl focus:border-aura-gold outline-none" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Royal Oak Rose Gold" /></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Brand</label>
                                        <input list="brandList" className="w-full p-4 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.brand || ""} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. AURA-X" />
                                        <datalist id="brandList"><option value="AURA-X" /></datalist>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">SKU (Auto)</label><input className="w-full p-4 bg-gray-100 border rounded-xl text-gray-500" readOnly value={formData.sku || ""} /></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Main Category</label>
                                        <select className="w-full p-4 bg-white border rounded-xl" value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value, sub_category: ""})}>
                                            <option value="">Select Main Category</option>
                                            <option value="men">Men's Watches</option>
                                            <option value="women">Women's Watches</option>
                                            <option value="couple">Couple Watches</option>
                                            <option value="accessories">Accessories</option>
                                            <option value="fragrances">Fragrances</option>
                                            <option value="smart-tech">Smart Tech</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Sub Category</label>
                                        <select className="w-full p-4 bg-white border rounded-xl" value={formData.sub_category || ""} onChange={e => setFormData({...formData, sub_category: e.target.value})}>
                                            <option value="">Select Sub Category</option>
                                            {formData.category === 'accessories' && (<><option value="wallets">Wallets</option><option value="belts">Belts</option><option value="sunglasses">Sunglasses</option><option value="jewelry">Jewelry (Rings/Bracelets)</option></>)}
                                            {formData.category === 'fragrances' && (<><option value="perfume-men">Men's Perfume</option><option value="perfume-women">Women's Perfume</option></>)}
                                            {formData.category === 'smart-tech' && (<><option value="smartwatches">Smartwatches</option><option value="earbuds">Earbuds</option></>)}
                                            {['men', 'women', 'couple'].includes(formData.category) && (<option value="watches">Standard Watches</option>)}
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">Stock Qty</label><input type="number" className="w-full p-4 bg-white border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            {/* SECTION: Description */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Description & Notes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-2">Product Description</label>
                                        <textarea className="w-full p-4 bg-white border rounded-xl h-32 resize-none outline-none focus:border-aura-gold" placeholder="Write a catchy description..." value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-2 flex items-center gap-2"><Sparkles size={14} className="text-aura-gold"/> Special / Extra Note (Optional)</label>
                                        <textarea className="w-full p-4 bg-gray-50 border rounded-xl h-20 resize-none text-sm outline-none focus:border-aura-gold" placeholder="e.g. Please note that the dial pattern may slightly vary as it is naturally sourced..." value={formData.extra_notes || ""} onChange={e => setFormData({...formData, extra_notes: e.target.value})}></textarea>
                                        <p className="text-[10px] text-gray-400 mt-1">This will be highlighted in a stylish dark box on the product page.</p>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION: Visuals & Images */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Visuals & Color Variants</h3>
                                
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    <div className="w-full md:w-1/2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2">Main Image (Pic 1)</label>
                                            <div className={`w-full h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold bg-white ${formData.mainImage && !formData.mainImage.includes('cloudinary') ? 'border-aura-gold' : 'border-gray-300'}`}
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'main')} onPaste={(e) => handlePaste(e, 'main')} tabIndex={0}>
                                                
                                                {uploadQueue.filter(u => u.type === 'main').map(u => (
                                                    <div key={u.id} className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                                        <Loader2 className="animate-spin text-aura-gold mb-2" size={24} />
                                                        <div className="text-xs font-bold text-aura-brown">{u.progress}%</div>
                                                    </div>
                                                ))}

                                                {formData.mainImage ? (
                                                    <>
                                                        {isVideoFile(formData.mainImage) ? <video src={formData.mainImage} className="object-cover w-full h-full" autoPlay muted loop playsInline /> : <img src={formData.mainImage} alt="" className="object-cover w-full h-full" />}
                                                        <button type="button" onClick={(e) => {e.stopPropagation(); removeImage('main');}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><X size={14}/></button>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer"><Upload size={24} className="mx-auto text-gray-300"/><span className="text-[10px] text-gray-400 mt-1">Upload/Paste File</span><input type="file" className="hidden" onChange={(e) => handleImageUpload(e as any, 'main')}/></label>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 bg-blue-50/50 border border-blue-100 p-2 rounded-xl relative">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1.5">
                                                    <LinkIcon size={12}/> EXTERNAL MAIN IMAGE LINK
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Paste Cloudinary URL..." 
                                                        value={formData.mainImage} 
                                                        onChange={(e) => setFormData({...formData, mainImage: e.target.value})}
                                                        className="w-full p-2 pr-8 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                                                    />
                                                    {formData.mainImage && (
                                                        <button type="button" onClick={() => setFormData({...formData, mainImage: ""})} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={14}/></button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-1/2 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2">Hover Image (Pic 2) - <span className="text-gray-400 font-normal">Shows when card is hovered</span></label>
                                            <div className={`w-full h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-aura-gold bg-white ${formData.hoverImage && !formData.hoverImage.includes('cloudinary') ? 'border-aura-gold' : 'border-gray-300'}`}
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'hover')} onPaste={(e) => handlePaste(e, 'hover')} tabIndex={0}>
                                                
                                                {uploadQueue.filter(u => u.type === 'hover').map(u => (
                                                    <div key={u.id} className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                                        <Loader2 className="animate-spin text-aura-gold mb-2" size={24} />
                                                        <div className="text-xs font-bold text-aura-brown">{u.progress}%</div>
                                                    </div>
                                                ))}

                                                {formData.hoverImage ? (
                                                    <>
                                                        {isVideoFile(formData.hoverImage) ? <video src={formData.hoverImage} className="object-cover w-full h-full" autoPlay muted loop playsInline /> : <img src={formData.hoverImage} alt="" className="object-cover w-full h-full" />}
                                                        <button type="button" onClick={(e) => {e.stopPropagation(); removeImage('hover');}} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 z-10"><X size={14}/></button>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer"><Upload size={24} className="mx-auto text-gray-300"/><span className="text-[10px] text-gray-400 mt-1">Upload/Paste File</span><input type="file" className="hidden" onChange={(e) => handleImageUpload(e as any, 'hover')}/></label>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 bg-blue-50/50 border border-blue-100 p-2 rounded-xl relative">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1.5">
                                                    <LinkIcon size={12}/> EXTERNAL HOVER IMAGE LINK
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Paste Cloudinary URL..." 
                                                        value={formData.hoverImage} 
                                                        onChange={(e) => setFormData({...formData, hoverImage: e.target.value})}
                                                        className="w-full p-2 pr-8 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                                                    />
                                                    {formData.hoverImage && (
                                                        <button type="button" onClick={() => setFormData({...formData, hoverImage: ""})} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={14}/></button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 border-t border-gray-100 pt-6">
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Gallery (Multiple Images for Detail Page)</label>
                                    <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-2xl min-h-[160px]"
                                        onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'gallery')} onPaste={(e) => handlePaste(e, 'gallery')} tabIndex={0}>
                                        
                                        {(Array.isArray(formData.gallery) ? formData.gallery : []).map((img: string, i: number) => (
                                            <div key={i} className="w-24 h-24 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200 group bg-gray-50">
                                                {isVideoFile(img) ? <video src={img} className="object-cover w-full h-full" autoPlay muted loop playsInline /> : <img src={img} alt="" className="object-cover w-full h-full" />}
                                                <button type="button" onClick={() => removeImage('gallery', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><X size={12}/></button>
                                            </div>
                                        ))}

                                        {uploadQueue.filter(u => u.type === 'gallery').map(u => (
                                            <div key={u.id} className="w-24 h-24 rounded-xl border-2 border-aura-gold flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                                                <Loader2 className="animate-spin text-aura-gold mb-1" size={16} />
                                                <div className="text-[10px] font-bold text-aura-gold">{u.progress}%</div>
                                            </div>
                                        ))}

                                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold flex-shrink-0 bg-gray-50 transition-colors">
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                <Plus size={20} className="text-gray-400 mb-1"/>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">Add Media</span>
                                                <input type="file" multiple accept="image/*,video/mp4,video/webm" className="hidden" onChange={(e) => handleImageUpload(e as any, 'gallery')}/>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-3">
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1.5">
                                                <LinkIcon size={12}/> ADD EXTERNAL GALLERY MEDIA
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Paste Cloudinary URL here..." 
                                                    value={externalGalleryLink} 
                                                    onChange={(e) => setExternalGalleryLink(e.target.value)}
                                                    className="flex-1 p-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        if (!externalGalleryLink) return;
                                                        setFormData((prev: any) => ({ ...prev, gallery: Array.isArray(prev.gallery) ? [...prev.gallery, externalGalleryLink] : [externalGalleryLink] }));
                                                        setExternalGalleryLink("");
                                                        toast.success("Added to gallery!");
                                                    }}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 bg-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> Main Color Base</label>
                                            <p className="text-[10px] text-gray-400">Select the color of the Main Image</p>
                                        </div>
                                        <div className="relative w-48 z-40">
                                          <CustomColorSelect 
                                              value={formData.baseColorName} 
                                              onChange={(name, hex) => setFormData({...formData, baseColorName: name})} 
                                              placeholder="Search Color..." 
                                          />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 py-3 border-t border-gray-100 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded text-aura-brown focus:ring-aura-gold cursor-pointer"
                                            checked={hasMultipleColors}
                                            onChange={(e) => {
                                                setHasMultipleColors(e.target.checked);
                                                if (e.target.checked && (!Array.isArray(formData.colors) || formData.colors.length === 0)) {
                                                    setFormData({...formData, colors: [{ name: "Silver", hex: "#C0C0C0", image: "" }]});
                                                }
                                            }}
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-gray-700 group-hover:text-aura-brown transition-colors">Include Multiple Colors</p>
                                            <p className="text-[10px] text-gray-400">Enable this to allow users to select from different color finishes.</p>
                                        </div>
                                    </label>

                                    {hasMultipleColors && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 bg-gray-50/50 p-4 rounded-xl">
                                            {(Array.isArray(formData.colors) ? formData.colors : []).map((color: any, index: number) => (
                                                <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                    
                                                    <input type="color" className="w-10 h-10 rounded border-none cursor-pointer flex-shrink-0" value={color?.hex || "#ffffff"} onChange={(e) => { const c = [...formData.colors]; c[index].hex = e.target.value; setFormData({...formData, colors: c}); }} title="Custom Hex Picker" />
                                                    
                                                    <div className="flex-1 w-full relative z-30">
                                                      <CustomColorSelect 
                                                          value={color?.name || ""} 
                                                          onChange={(name, hex) => { 
                                                              const c = [...formData.colors]; 
                                                              c[index].name = name; 
                                                              if (hex !== "#ffffff") c[index].hex = hex; 
                                                              setFormData({...formData, colors: c}); 
                                                          }} 
                                                          placeholder="Type or select color..." 
                                                      />
                                                    </div>

                                                    <div className="flex flex-col gap-2 w-full md:w-auto items-center">
                                                        <label 
                                                            onDragOver={(e) => e.preventDefault()} 
                                                            onDrop={(e) => { e.preventDefault(); handleDrop(e, 'color', index); }}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all w-full justify-center border relative overflow-hidden ${color?.image ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white hover:bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {uploadQueue.find(u => u.type === 'color' && u.index === index) ? (
                                                                <span className="text-aura-gold animate-pulse">Uploading...</span>
                                                            ) : color?.image ? "Change Image File" : "Upload File"} 
                                                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e as any, 'color', index)}/>
                                                        </label>
                                                        
                                                        {color?.image && (
                                                            <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden shrink-0">
                                                                <img src={color.image} className="object-cover w-full h-full" alt="" />
                                                            </div>
                                                        )}

                                                        <div className="w-full relative">
                                                          <input 
                                                              type="text" 
                                                              placeholder="Or paste URL..." 
                                                              value={(color?.image || '').includes('http') ? color.image : ''} 
                                                              onChange={(e) => {
                                                                  const c = [...formData.colors];
                                                                  c[index].image = e.target.value;
                                                                  setFormData({...formData, colors: c});
                                                              }}
                                                              className="w-full p-1.5 text-[10px] border border-gray-200 rounded outline-none focus:border-blue-400 bg-white"
                                                          />
                                                        </div>
                                                    </div>
                                                    
                                                    <button type="button" onClick={() => setFormData({...formData, colors: formData.colors.filter((_: any, i: number) => i !== index)})} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setFormData({...formData, colors: Array.isArray(formData.colors) ? [...formData.colors, { name: "Silver", hex: "#C0C0C0", image: "" }] : [{ name: "Silver", hex: "#C0C0C0", image: "" }]})} className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg text-aura-brown flex items-center justify-center w-full gap-2 hover:border-aura-gold transition-colors"><Plus size={14} /> Add Another Color Finish</button>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Tag size={16}/> Pricing</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 bg-white p-6 rounded-2xl border border-gray-200">
                                    <div><label className="text-xs font-bold text-gray-500">Original Price</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.originalPrice || 0} onChange={e => handlePriceChange('originalPrice', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-gray-500">Discount %</label><input type="number" className="w-full p-3 border rounded-xl" value={formData.discount || 0} onChange={e => handlePriceChange('discount', Number(e.target.value))} /></div>
                                    <div><label className="text-xs font-bold text-aura-brown">Sale Price</label><div className="w-full p-3 bg-aura-gold/20 rounded-xl font-bold text-aura-brown">Rs {(formData.price || 0).toLocaleString()}</div></div>
                                    <div><label className="text-xs font-bold text-gray-400">Cost Price</label><input type="number" className="w-full p-3 border rounded-xl bg-gray-50" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} /></div>
                                    <div><label className="text-xs font-bold text-gray-400">Delivery (DC)</label><input type="number" className="w-full p-3 border rounded-xl bg-gray-50" value={formData.deliveryCharge} onChange={e => setFormData({...formData, deliveryCharge: Number(e.target.value)})} /></div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Flame size={16}/> Marketing & Visibility</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Tags</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["Featured", "Sale", "Limited Edition", "Fire", "New Arrival", "Best Seller"].map(tag => (
                                                <button type="button" key={tag} onClick={() => selectTag(tag)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${formData.tags === tag ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white text-gray-400 border-gray-200'}`}>{tag}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-gray-500">Priority</label><input type="number" className="w-full p-3 border rounded-xl bg-white outline-none focus:border-aura-gold" value={formData.priority} onChange={e => setFormData({...formData, priority: Number(e.target.value)})} /></div>
                                        <div><label className="text-xs font-bold text-gray-500">Fake Views</label><input type="number" className="w-full p-3 border rounded-xl bg-white outline-none focus:border-aura-gold" value={formData.viewCount || 0} onChange={e => setFormData({...formData, viewCount: Number(e.target.value)})} /></div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.isEidExclusive ? 'bg-black border-aura-gold' : 'bg-white border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={formData.isEidExclusive} 
                                                onChange={e => {
                                                    const isChecked = e.target.checked;
                                                    setFormData({...formData, isEidExclusive: isChecked, deliveryCharge: isChecked ? 0 : 250});
                                                }} 
                                            />
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isEidExclusive ? 'bg-aura-gold border-aura-gold text-black' : 'bg-white border-gray-300'}`}>
                                                {formData.isEidExclusive && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${formData.isEidExclusive ? 'text-aura-gold' : 'text-gray-600'}`}>Mark as Eid Exclusive</p>
                                                <p className="text-xs text-gray-400">Hidden from normal shop, only on Locked Page.</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.isPinned ? 'bg-aura-gold/10 border-aura-gold' : 'bg-white border-gray-200'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} />
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isPinned ? 'bg-aura-gold border-aura-gold text-black' : 'bg-white border-gray-300'}`}>
                                                {formData.isPinned && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm flex items-center gap-1 ${formData.isPinned ? 'text-aura-brown' : 'text-gray-600'}`}><Star size={14} fill={formData.isPinned ? "currentColor" : "none"}/> Pin to Top</p>
                                                <p className="text-xs text-gray-400">Shows in the top exclusive row on the home page.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* 🚀 CATEGORY SPECIFIC SPECIFICATIONS (DYNAMIC) */}
                            <section className="space-y-6">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Specifications</h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    
                                    {/* --- 1. WATCHES --- */}
                                    {isWatchCategory && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Case & Dial</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Case Material</label>
                                                <input list="caseMaterials" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.caseMaterial || ""} onChange={e => setFormData({...formData, caseMaterial: e.target.value})} placeholder="e.g. Stainless Steel" />
                                                <datalist id="caseMaterials">{MATERIAL_MAP.map(m => <option key={m} value={m} />)}</datalist>
                                            </div>
                                            <div><label className="text-xs font-bold text-gray-500">Case Diameter</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.caseDiameter} onChange={e => setFormData({...formData, caseDiameter: e.target.value})} placeholder="e.g. 40mm"/></div>
                                            <div><label className="text-xs font-bold text-gray-500">Case Thickness</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.caseThickness} onChange={e => setFormData({...formData, caseThickness: e.target.value})} placeholder="e.g. 10mm"/></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Glass Type</label>
                                                <input list="glassTypes" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.glass || ""} onChange={e => setFormData({...formData, glass: e.target.value})} placeholder="e.g. Mineral" />
                                                <datalist id="glassTypes">{GLASS_MAP.map(g => <option key={g} value={g} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Dial Color</label>
                                                <input list="dialColors" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.dialColor || ""} onChange={e => setFormData({...formData, dialColor: e.target.value})} placeholder="Type color..." />
                                                <datalist id="dialColors">{POPULAR_COLORS.map(c => <option key={c} value={c} />)}</datalist>
                                            </div>

                                            <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Strap & Movement</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Strap Material</label>
                                                <input list="strapMaterials" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.strapMaterial || ""} onChange={e => setFormData({...formData, strapMaterial: e.target.value})} placeholder="e.g. Leather" />
                                                <datalist id="strapMaterials">{MATERIAL_MAP.map(m => <option key={m} value={m} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Strap Color</label>
                                                <input list="strapColors" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.strapColor || ""} onChange={e => setFormData({...formData, strapColor: e.target.value})} placeholder="Type color..." />
                                                <datalist id="strapColors">{POPULAR_COLORS.map(c => <option key={c} value={c} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Movement</label>
                                                <select className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.movement || "Quartz (Battery)"} onChange={e => setFormData({...formData, movement: e.target.value})}>
                                                    <option>Quartz (Battery)</option><option>Automatic (Mechanical)</option><option>Digital</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Water Resistance</label>
                                                <select className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.waterResistance || "0ATM (No Resistance)"} onChange={e => setFormData({...formData, waterResistance: e.target.value})}>
                                                    <option>0ATM (No Resistance)</option><option>3ATM (Splash)</option><option>5ATM (Swim)</option><option>10ATM (Dive)</option>
                                                </select>
                                            </div>
                                            
                                            <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Features</h4></div>
                                            <div className="flex flex-wrap gap-4 col-span-2 md:col-span-4">
                                                <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.luminous || false} onChange={e => setFormData({...formData, luminous: e.target.checked})} /> Luminous Hands</label>
                                                <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.dateDisplay || false} onChange={e => setFormData({...formData, dateDisplay: e.target.checked})} /> Date Display</label>
                                            </div>
                                        </>
                                    )}

                                    {/* --- 2. FRAGRANCES --- */}
                                    {isFragrance && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Fragrance Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Volume</label>
                                                <input list="fVolumes" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.volume || ""} onChange={e => setFormData({...formData, volume: e.target.value})} placeholder="e.g. 50ml" />
                                                <datalist id="fVolumes">{FRAGRANCE_VOLUMES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Concentration</label>
                                                <input list="fConcentrations" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.concentration || ""} onChange={e => setFormData({...formData, concentration: e.target.value})} placeholder="e.g. EDP" />
                                                <datalist id="fConcentrations">{FRAGRANCE_CONCENTRATIONS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Fragrance Family</label>
                                                <input list="fFamilies" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.fragranceFamily || ""} onChange={e => setFormData({...formData, fragranceFamily: e.target.value})} placeholder="e.g. Woody" />
                                                <datalist id="fFamilies">{FRAGRANCE_FAMILIES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Longevity</label>
                                                <input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.longevity || ""} onChange={e => setFormData({...formData, longevity: e.target.value})} placeholder="e.g. 8-12 Hours" />
                                            </div>
                                            
                                            <div className="col-span-2 md:col-span-4 mt-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Scent Notes</h4></div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Top Notes</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.topNotes || ""} onChange={e => setFormData({...formData, topNotes: e.target.value})} placeholder="e.g. Citrus, Bergamot" /></div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Heart Notes</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.heartNotes || ""} onChange={e => setFormData({...formData, heartNotes: e.target.value})} placeholder="e.g. Rose, Jasmine" /></div>
                                            <div className="col-span-2 md:col-span-4"><label className="text-xs font-bold text-gray-500">Base Notes</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.baseNotes || ""} onChange={e => setFormData({...formData, baseNotes: e.target.value})} placeholder="e.g. Musk, Vanilla" /></div>
                                        </>
                                    )}

                                    {/* --- 3. WALLETS --- */}
                                    {isWallet && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Wallet Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Material</label>
                                                <input list="wMaterials" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.walletMaterial || ""} onChange={e => setFormData({...formData, walletMaterial: e.target.value})} placeholder="e.g. Genuine Leather" />
                                                <datalist id="wMaterials">{WALLET_MATERIALS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Card Slots</label>
                                                <input list="wSlots" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.cardSlots || ""} onChange={e => setFormData({...formData, cardSlots: e.target.value})} placeholder="e.g. 6 Slots" />
                                                <datalist id="wSlots">{CARD_SLOTS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Dimensions</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.dimensions || ""} onChange={e => setFormData({...formData, dimensions: e.target.value})} placeholder="e.g. 11cm x 9cm" /></div>
                                            
                                            <div className="flex gap-4 col-span-2 md:col-span-4 mt-2">
                                                <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.rfid || false} onChange={e => setFormData({...formData, rfid: e.target.checked})} /> RFID Protection</label>
                                                <label className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg cursor-pointer border"><input type="checkbox" checked={formData.coinPocket || false} onChange={e => setFormData({...formData, coinPocket: e.target.checked})} /> Coin Pocket</label>
                                            </div>
                                        </>
                                    )}

                                    {/* --- 4. BELTS --- */}
                                    {isBelt && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Belt Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Belt Material</label>
                                                <input list="bMaterials" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.beltMaterial || ""} onChange={e => setFormData({...formData, beltMaterial: e.target.value})} placeholder="e.g. Cowhide Leather" />
                                                <datalist id="bMaterials">{BELT_MATERIALS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Buckle Type</label>
                                                <input list="bTypes" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.buckleType || ""} onChange={e => setFormData({...formData, buckleType: e.target.value})} placeholder="e.g. Auto-Lock" />
                                                <datalist id="bTypes">{BUCKLE_TYPES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Buckle Material</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.buckleMaterial || ""} onChange={e => setFormData({...formData, buckleMaterial: e.target.value})} placeholder="e.g. Alloy / Stainless Steel" /></div>
                                        </>
                                    )}

                                    {/* --- 5. SUNGLASSES --- */}
                                    {isSunglasses && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Sunglasses Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Frame Style/Shape</label>
                                                <input list="sShapes" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.eyewearShape || ""} onChange={e => setFormData({...formData, eyewearShape: e.target.value})} placeholder="e.g. Aviator" />
                                                <datalist id="sShapes">{FRAME_STYLES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Lens Features</label>
                                                <input list="sLensFeatures" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.lensFeature || ""} onChange={e => setFormData({...formData, lensFeature: e.target.value})} placeholder="e.g. UV400" />
                                                <datalist id="sLensFeatures">{LENS_FEATURES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Frame Material</label>
                                                <input list="sFrameMats" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.frameMaterial || ""} onChange={e => setFormData({...formData, frameMaterial: e.target.value})} placeholder="e.g. Metal" />
                                                <datalist id="sFrameMats">{FRAME_MATERIALS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div><label className="text-xs font-bold text-gray-500">Lens Material</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.lensMaterial || ""} onChange={e => setFormData({...formData, lensMaterial: e.target.value})} placeholder="e.g. Resin/Glass" /></div>
                                        </>
                                    )}

                                    {/* --- 6. JEWELRY --- */}
                                    {isJewelry && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Jewelry Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Base Material</label>
                                                <input list="jMaterials" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.jewelryMaterial || ""} onChange={e => setFormData({...formData, jewelryMaterial: e.target.value})} placeholder="e.g. Sterling Silver" />
                                                <datalist id="jMaterials">{JEWELRY_MATERIALS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Plating</label>
                                                <input list="jPlatings" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.plating || ""} onChange={e => setFormData({...formData, plating: e.target.value})} placeholder="e.g. 18K Gold" />
                                                <datalist id="jPlatings">{PLATINGS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-gray-500">Main Stone</label>
                                                <input list="jStones" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.stone || ""} onChange={e => setFormData({...formData, stone: e.target.value})} placeholder="e.g. Zirconia" />
                                                <datalist id="jStones">{STONES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                        </>
                                    )}

                                    {/* --- 7. SMARTWATCHES --- */}
                                    {isSmartwatch && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Smartwatch Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Display Type</label>
                                                <input list="swDisplays" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.displayType || ""} onChange={e => setFormData({...formData, displayType: e.target.value})} placeholder="e.g. AMOLED" />
                                                <datalist id="swDisplays">{DISPLAY_TYPES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Screen Size</label>
                                                <input list="swSizes" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.screenSize || ""} onChange={e => setFormData({...formData, screenSize: e.target.value})} placeholder="e.g. 2.0 inches" />
                                                <datalist id="swSizes">{SCREEN_SIZES.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div><label className="text-xs font-bold text-gray-500">App Support</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.appSupport || ""} onChange={e => setFormData({...formData, appSupport: e.target.value})} placeholder="e.g. WearFit Pro" /></div>
                                            <div><label className="text-xs font-bold text-gray-500">Water Resistance</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.waterResistanceSmart || ""} onChange={e => setFormData({...formData, waterResistanceSmart: e.target.value})} placeholder="e.g. IP68" /></div>
                                            <div className="col-span-2 md:col-span-4"><label className="text-xs font-bold text-gray-500">Key Features</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.smartFeatures || ""} onChange={e => setFormData({...formData, smartFeatures: e.target.value})} placeholder="e.g. Bluetooth Calling, Heart Rate" /></div>
                                        </>
                                    )}

                                    {/* --- 8. EARBUDS --- */}
                                    {isEarbuds && (
                                        <>
                                            <div className="col-span-2 md:col-span-4"><h4 className="text-xs font-bold text-aura-brown bg-aura-gold/10 p-2 rounded">Earbuds Details</h4></div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Bluetooth Version</label>
                                                <input list="ebBluetooth" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.bluetoothVersion || ""} onChange={e => setFormData({...formData, bluetoothVersion: e.target.value})} placeholder="e.g. 5.3" />
                                                <datalist id="ebBluetooth">{BLUETOOTH_VERSIONS.map(v => <option key={v} value={v} />)}</datalist>
                                            </div>
                                            <div><label className="text-xs font-bold text-gray-500">Playtime</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.playtime || ""} onChange={e => setFormData({...formData, playtime: e.target.value})} placeholder="e.g. 24 Hours with case" /></div>
                                            <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Audio Features</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.earbudFeatures || ""} onChange={e => setFormData({...formData, earbudFeatures: e.target.value})} placeholder="e.g. ANC, ENC, Gaming Mode" /></div>
                                        </>
                                    )}
                                    
                                    {/* UNIVERSAL WEIGHT */}
                                    <div className="col-span-2 md:col-span-4 mt-2">
                                        <div><label className="text-xs font-bold text-gray-500">Item Weight (General)</label><input className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.weight || "135g"} onChange={e => setFormData({...formData, weight: e.target.value})} /></div>
                                    </div>
                                    
                                </div>
                            </section>
                            
                            {needsSizes && (
                                <section className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Settings size={16}/> Size Variants</h3>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Available Sizes (Comma Separated)</label>
                                        <input type="text" className="w-full p-4 bg-white border rounded-xl focus:border-aura-gold outline-none" value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="e.g. Small, Medium, Large OR 40, 42, 44" />
                                    </div>
                                </section>
                            )}

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
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Review Images</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(newReview.images) ? newReview.images : []).map((img: string, idx: number) => (
                                                <div key={idx} className="w-16 h-16 rounded-lg relative overflow-hidden border border-gray-200 group">
                                                    <Image src={img} alt="" fill className="object-cover" unoptimized={true} />
                                                    <button type="button" onClick={() => removeImage('review', idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-80 hover:opacity-100"><X size={12}/></button>
                                                </div>
                                            ))}
                                            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-aura-gold bg-gray-50"
                                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'review')} onPaste={(e) => handlePaste(e, 'review')} tabIndex={0}>
                                                <label className="w-full h-full flex items-center justify-center cursor-pointer"><Plus size={16} className="text-gray-400"/><input type="file" multiple accept="image/*,video/mp4,video/webm" className="hidden" onChange={(e) => handleImageUpload(e as any, 'review')}/></label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={addReview} className="bg-aura-brown text-white px-4 py-2 rounded-lg text-sm font-bold w-full md:w-auto">Add Fake Review</button>
                                    <div className="mt-6 space-y-2">
                                        {(Array.isArray(formData.manualReviews) ? formData.manualReviews : []).map((rev: any, i: number) => (
                                            <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold">{rev.user || ""} <span className="text-aura-gold">{'★'.repeat(rev.rating || 5)}</span></p>
                                                        <p className="text-[10px] text-gray-500">{rev.comment || ""}</p>
                                                        {Array.isArray(rev.images) && rev.images.length > 0 && (
                                                            <div className="flex gap-1 mt-1">
                                                                {rev.images.map((img: string, k: number) => (
                                                                    <div key={k} className="w-8 h-8 relative rounded overflow-hidden border">
                                                                        <Image src={img} fill className="object-cover" alt="" unoptimized={true}/>
                                                                    </div>
                                                                ))}
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
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2"><Package size={16}/> Shipping & Packaging</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Warranty</label>
                                        <input list="warrantyOpts" className="w-full p-3 bg-white border rounded-xl outline-none focus:border-aura-gold" value={formData.warranty || ""} onChange={e => setFormData({...formData, warranty: e.target.value})} />
                                        <datalist id="warrantyOpts"><option value="6 Months Official Warranty"/><option value="1 Year Official Warranty"/><option value="No Official Warranty"/></datalist>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">Shipping Info</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.shippingText || ""} onChange={e => setFormData({...formData, shippingText: e.target.value})} /></div>
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Return Policy</label><input className="w-full p-3 bg-white border rounded-xl" value={formData.returnPolicy || ""} onChange={e => setFormData({...formData, returnPolicy: e.target.value})} /></div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm bg-white px-4 py-3 rounded-xl cursor-pointer border mt-5">
                                            <input type="checkbox" checked={formData.boxIncluded || false} onChange={e => setFormData({...formData, boxIncluded: e.target.checked})} /> 
                                            <span className="font-bold text-gray-600">Premium Box Included</span>
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </form>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-end gap-4 bg-white rounded-b-[2rem]">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50">Cancel</button>
                        <button onClick={(e) => {
                            const form = document.getElementById('productForm') as HTMLFormElement;
                            if (form) form.requestSubmit();
                        }} className="px-8 py-3 rounded-xl bg-aura-brown text-white font-bold hover:bg-aura-gold transition-colors flex items-center gap-2 shadow-xl"><Save size={18} /> {isEditing ? "Update Masterpiece" : "Publish Masterpiece"}</button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}