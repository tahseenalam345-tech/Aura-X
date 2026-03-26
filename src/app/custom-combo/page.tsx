"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Check, Sparkles, ShoppingBag, Info, ArrowUpDown, X, Trash2, Star, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";

export default function CustomComboPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Filter & Sort States
  const [activeCategory, setActiveCategory] = useState("Watches");
  const [sortBy, setSortBy] = useState("default");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Selected items list
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  // Modals States
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false); // 🚀 NEW: Mobile Drawer State

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*");
      if (data) setAllProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const getShortName = (name: string) => {
    if (!name) return "";
    return name.split("|")[0].trim();
  };

  const getFormattedRating = (rating: any) => {
    const num = Number(rating);
    if (isNaN(num) || !rating) return "4.8"; 
    if (num > 5) return (num / 20).toFixed(1); 
    return num.toFixed(1); 
  };

  const currentItems = useMemo(() => {
    let filtered = [];
    if (activeCategory === "Watches") filtered = allProducts.filter(p => ['men', 'women', 'couple', 'watches'].includes(p.category?.toLowerCase()));
    else if (activeCategory === "Perfumes") filtered = allProducts.filter(p => ['fragrances', 'perfume-men', 'perfume-women'].includes(p.category?.toLowerCase()));
    else if (activeCategory === "Wallets") filtered = allProducts.filter(p => p.category?.toLowerCase() === 'wallets' || p.sub_category?.toLowerCase() === 'wallets');
    else if (activeCategory === "Sunglasses") filtered = allProducts.filter(p => p.category?.toLowerCase() === 'sunglasses' || p.sub_category?.toLowerCase() === 'sunglasses');
    else if (activeCategory === "Bracelets") filtered = allProducts.filter(p => p.category?.toLowerCase() === 'jewelry' || p.sub_category?.toLowerCase() === 'jewelry');
    else filtered = allProducts;

    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    return filtered;
  }, [allProducts, activeCategory, sortBy]);

  const subtotal = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const hasDiscount = selectedItems.length >= 2;
  const finalTotal = hasDiscount ? subtotal - 200 : subtotal;

  const toggleItemSelection = (product: any) => {
    const isAlreadySelected = selectedItems.find(item => item.id === product.id);
    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter(item => item.id !== product.id));
    } else {
      setSelectedItems([...selectedItems, product]);
    }
  };

  const handleFinalAddToCart = () => {
    if (selectedItems.length === 0) {
      toast.error("At least aik item select karein!");
      return;
    }
    const discountPerItem = hasDiscount ? 200 / selectedItems.length : 0;
    selectedItems.forEach(item => {
      addToCart({ 
        ...item, 
        price: item.price - discountPerItem, 
        name: getShortName(item.name) 
      });
    });
    toast.success(`${selectedItems.length} items added to cart!`);
    setSelectedItems([]);
    setMobileSummaryOpen(false); // 🚀 Close mobile drawer after adding to cart
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-12 h-12 border-4 border-aura-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32 relative">
      <Navbar />

      {/* QUICK VIEW MODAL (POPUP) */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickViewProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col md:flex-row overflow-hidden border border-aura-gold/20">
              <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"><X size={20}/></button>

              <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center min-h-[300px] relative">
                  <Image src={quickViewProduct.main_image} alt={quickViewProduct.name} fill className="object-contain p-8 mix-blend-multiply" unoptimized />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                  <span className="text-aura-gold text-[10px] font-black uppercase tracking-widest mb-2 block">{quickViewProduct.brand || 'AURA-X'}</span>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1E1B18] mb-3 leading-tight">{getShortName(quickViewProduct.name)}</h2>
                  <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-aura-gold"><Star size={14} className="fill-aura-gold"/></div>
                      <span className="text-xs font-bold text-gray-500">{getFormattedRating(quickViewProduct.rating)} / 5.0</span>
                  </div>
                  <p className="text-2xl font-serif font-bold text-aura-brown mb-6">Rs. {quickViewProduct.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-10 line-clamp-4 leading-relaxed">{quickViewProduct.description || 'A premium masterpiece crafted for absolute perfection and style.'}</p>

                  <div className="mt-auto flex flex-col gap-3">
                      <button 
                        onClick={() => { toggleItemSelection(quickViewProduct); setQuickViewProduct(null); }} 
                        className={`w-full py-4 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg transition-colors ${selectedItems.find(i => i.id === quickViewProduct.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-aura-brown hover:bg-[#1E1B18]'}`}
                      >
                          {selectedItems.find(i => i.id === quickViewProduct.id) ? 'Remove from Bundle' : 'Select for Bundle'}
                      </button>
                      <Link href={`/product/${quickViewProduct.id}`} className="w-full py-4 bg-transparent border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-full text-center hover:border-aura-gold hover:text-aura-brown transition-colors">
                          View Full Details Page
                      </Link>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-28 md:pt-36 max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-serif font-bold">Custom Bundle Studio</h1>
          <p className="text-gray-500 mt-2 italic">Add any 2+ items to unlock Rs. 200 instant discount.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-3xl border border-aura-gold/10 shadow-sm sticky top-20 z-[80]">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
              {["Watches", "Perfumes", "Wallets", "Sunglasses", "Bracelets"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-aura-brown text-white border-aura-brown' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-aura-gold'}`}
                >
                  {cat}
                </button>
              ))}
          </div>

          <div className="relative">
             <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest"
             >
                <ArrowUpDown size={14} /> Sort
             </button>
             <AnimatePresence>
                {showSortMenu && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white shadow-2xl rounded-2xl p-2 z-[100] border border-gray-100">
                      {[
                        { label: 'Featured', val: 'default' },
                        { label: 'Price: Low to High', val: 'price-low' },
                        { label: 'Price: High to Low', val: 'price-high' },
                        { label: 'Alphabetical', val: 'name' }
                      ].map(opt => (
                        <button key={opt.val} onClick={() => { setSortBy(opt.val); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase rounded-xl ${sortBy === opt.val ? 'bg-aura-gold/10 text-aura-gold' : 'hover:bg-gray-50 text-gray-500'}`}>
                          {opt.label}
                        </button>
                      ))}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Grid Area */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentItems.map((product) => {
                  const isSelected = selectedItems.find(item => item.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleItemSelection(product)}
                      className={`relative cursor-pointer bg-white rounded-2xl p-3 border-2 transition-all hover:shadow-md group ${isSelected ? 'border-aura-gold shadow-lg' : 'border-transparent'}`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }} 
                        className="absolute top-2 left-2 z-10 bg-white/90 p-1.5 rounded-full shadow-sm border border-gray-100 hover:bg-aura-gold hover:text-white transition-colors"
                        title="View Details"
                      >
                        <Info size={12} />
                      </button>

                      <div className="aspect-square relative mb-3 overflow-hidden rounded-xl bg-gray-50">
                        <Image src={product.main_image} alt={product.name} fill className="object-contain p-2 mix-blend-multiply" unoptimized />
                      </div>
                      <h3 className="text-[10px] font-black uppercase truncate text-aura-brown">{getShortName(product.name)}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-serif font-bold text-aura-gold">Rs. {product.price.toLocaleString()}</p>
                        <div className="flex items-center text-[8px] text-gray-400"><Star size={8} className="fill-aura-gold text-aura-gold mr-0.5" /> {getFormattedRating(product.rating)}</div>
                      </div>
                      {isSelected && <div className="absolute top-2 right-2 bg-aura-brown text-white rounded-full p-1 shadow-md"><Check size={10} strokeWidth={4} /></div>}
                    </div>
                  );
                })}
            </div>
            {currentItems.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-serif italic bg-white/50 rounded-[2rem] border border-dashed border-gray-200 mt-4">
                    No items found in this category.
                </div>
            )}
          </div>

          {/* 🚀 DESKTOP Checkout Summary Box (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#1E1B18] text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-32 border border-white/5">
              <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3"><ShoppingBag size={20} className="text-aura-gold" /> Your Bundle ({selectedItems.length})</h2>
              
              <div className="max-h-[300px] overflow-y-auto mb-8 pr-2 space-y-4 scrollbar-hide">
                {selectedItems.length === 0 && <p className="text-white/30 text-center py-10 italic text-sm">No items selected yet.</p>}
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 group">
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
                      <Image src={item.main_image} alt="thumb" width={50} height={50} className="object-contain" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold truncate">{getShortName(item.name)}</p>
                      <p className="text-[10px] text-aura-gold font-bold">Rs. {item.price.toLocaleString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleItemSelection(item); }} className="p-2 text-white/20 group-hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/50"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                {hasDiscount && (
                  <div className="flex justify-between text-[11px] font-bold text-green-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Sparkles size={10}/> Combo Discount</span>
                    <span>- Rs. 200</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-serif font-black pt-4 border-t border-white/10 mt-4 text-aura-gold">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalAddToCart}
                disabled={selectedItems.length === 0}
                className="w-full mt-8 py-4 bg-gradient-to-r from-aura-gold to-yellow-600 text-[#1E1B18] rounded-full font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:scale-100 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                ADD TO CART NOW <ShoppingBag size={14}/>
              </button>
              
              {selectedItems.length > 0 && (
                <button onClick={() => setSelectedItems([])} className="w-full mt-4 text-[9px] font-bold text-white/30 uppercase hover:text-red-400 transition-colors">Clear Entire Bundle</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MOBILE STICKY BOTTOM BAR (Visible only on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1E1B18] text-white p-4 px-6 z-[90] rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex justify-between items-center border-t border-white/10">
          <div>
              <p className="text-[10px] text-aura-gold uppercase tracking-widest font-black mb-0.5">Bundle ({selectedItems.length})</p>
              <p className="text-xl font-serif font-bold leading-none">Rs. {finalTotal.toLocaleString()}</p>
          </div>
          <button 
              onClick={() => setMobileSummaryOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-aura-gold to-yellow-600 text-[#1E1B18] rounded-full font-black text-[10px] tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
              View Combo <ChevronRight size={14} />
          </button>
      </div>

      {/* 🚀 MOBILE SLIDE-UP DRAWER (Hidden on Desktop) */}
      <AnimatePresence>
          {mobileSummaryOpen && (
              <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                    onClick={() => setMobileSummaryOpen(false)} 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] lg:hidden" 
                  />
                  <motion.div 
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                    className="fixed bottom-0 left-0 w-full max-h-[85vh] bg-[#1E1B18] z-[101] rounded-t-[2.5rem] p-6 pt-8 shadow-2xl border-t border-white/10 flex flex-col lg:hidden"
                  >
                      <button onClick={() => setMobileSummaryOpen(false)} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"><X size={18}/></button>
                      
                      <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3 text-white"><ShoppingBag size={20} className="text-aura-gold" /> Your Bundle ({selectedItems.length})</h2>
                      
                      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4 scrollbar-hide">
                          {selectedItems.length === 0 && <p className="text-white/30 text-center py-10 italic text-sm">No items selected yet.</p>}
                          {selectedItems.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 group">
                              <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
                                <Image src={item.main_image} alt="thumb" width={50} height={50} className="object-contain" unoptimized />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-white truncate">{getShortName(item.name)}</p>
                                <p className="text-[10px] text-aura-gold font-bold">Rs. {item.price.toLocaleString()}</p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); toggleItemSelection(item); }} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          ))}
                      </div>

                      <div className="border-t border-white/10 pt-6 space-y-3 shrink-0">
                          <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/50"><span>Subtotal</span><span className="text-white">Rs. {subtotal.toLocaleString()}</span></div>
                          {hasDiscount && (
                            <div className="flex justify-between text-[11px] font-bold text-green-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Sparkles size={10}/> Combo Discount</span>
                              <span>- Rs. 200</span>
                            </div>
                          )}
                          <div className="flex justify-between text-2xl font-serif font-black pt-4 border-t border-white/10 mt-2 text-aura-gold">
                            <span>Total</span>
                            <span>Rs. {finalTotal.toLocaleString()}</span>
                          </div>

                          <button 
                            onClick={handleFinalAddToCart}
                            disabled={selectedItems.length === 0}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-aura-gold to-yellow-600 text-[#1E1B18] rounded-full font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 disabled:opacity-30 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                          >
                            ADD TO CART NOW <ShoppingBag size={14}/>
                          </button>
                      </div>
                  </motion.div>
              </>
          )}
      </AnimatePresence>

    </main>
  );
}