"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { 
  Star, Truck, ShieldCheck, 
  Minus, Plus, ShoppingBag, Heart, Share2, 
  ChevronDown, AlertCircle, Camera, Gift, ArrowRight, X, Maximize2, Home, Eye, Check
} from "lucide-react";
import { useRouter } from "next/navigation"; // <--- Add this
import toast from "react-hot-toast"; // <--- Add this
export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter(); // <--- Initialize Router
  const { addToCart } = useCart(); 

  // --- STATE ---
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- UI STATE ---
  const [activeImage, setActiveImage] = useState("");
  // CHANGED: We now track the INDEX of the selected color to prevent duplicate name bugs
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("description");
  
  // ACTION STATES
  const [isLiked, setIsLiked] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [addBox, setAddBox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // REVIEWS & VIEWS
  const [viewCount, setViewCount] = useState(1000);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GIFT_COST = 150;
  const BOX_COST = 100;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
       if (!id) return;
       setLoading(true);

       const { data: currentProduct } = await supabase
         .from('products')
         .select('*')
         .eq('id', id)
         .single();

       if (currentProduct) {
           setProduct(currentProduct);
           setActiveImage(currentProduct.main_image);
           
           // Reviews
           setProductReviews(currentProduct.manual_reviews || []);

           // Related Products
           const { data: related } = await supabase
              .from('products')
              .select('*')
              .eq('category', currentProduct.category)
              .neq('id', id)
              .limit(4);
           
           if (related) setRelatedProducts(related);

           // View Count
           const baseCount = 800;
           const idNum = parseInt(currentProduct.id) || 1;
           setViewCount(baseCount + (idNum * 123) % 500);
       }
       setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-aura-brown font-serif text-xl animate-pulse">Loading Masterpiece...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Product Not Found</div>;

  // --- CALCULATIONS ---
  const basePrice = product.price * quantity;
  const extras = (isGift ? GIFT_COST : 0) + (addBox ? BOX_COST : 0);
  const totalPrice = basePrice + extras;
  const specs = product.specs || {};
  
  // Get Current Selected Color Object
  const selectedColor = product.colors?.[selectedColorIndex];

  // Clean Image List
  const allImages = [
    product?.main_image,
    ...(product?.specs?.gallery || []),
    ...(product?.colors?.map((c: any) => c.image).filter(Boolean) || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index);

 // --- NEW HANDLER ---
  const handleAddToCart = () => {
    // 1. Add to Global State
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: activeImage,
      color: selectedColor?.name || "Standard", 
      quantity: quantity,
      isGift: isGift,
      addBox: addBox
    });

    // 2. Sleek Notification (Replaces the boring Alert)
    toast.success(`${product.name} added to bag!`, {
        style: { border: '1px solid #D4AF37', padding: '16px', color: '#4A3B32' },
        iconTheme: { primary: '#D4AF37', secondary: '#FFFAEE' },
    });

    // 3. Auto Redirect to Cart after 0.8 seconds
    setTimeout(() => {
        router.push("/cart");
    }, 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReviewImage(URL.createObjectURL(file));
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) return alert("Please select a star rating!");
    if (!reviewText.trim()) return alert("Please write a comment!");
    const newReview = {
      id: Date.now(),
      user: "You (Guest)",
      rating: reviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      comment: reviewText,
      image: reviewImage
    };
    setProductReviews([newReview, ...productReviews]);
    setReviewRating(0); setReviewText(""); setReviewImage(null); setShowReviewForm(false);
  };

  // --- HELPER COMPONENTS ---
  const AccordionItem = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <div className="border-b border-aura-gold/20">
      <button 
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex justify-between items-center py-4 text-left font-serif text-lg text-aura-brown hover:text-aura-gold transition-colors group"
      >
        <span className="group-hover:translate-x-1 transition-transform">{title}</span>
        <ChevronDown className={`transition-transform duration-300 text-aura-gold ${openSection === id ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === id ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
        <div className="text-sm text-gray-600 leading-relaxed pl-2 border-l-2 border-aura-gold/20">{children}</div>
      </div>
    </div>
  );

  const formatSpecValue = (val: any) => {
      // Fixes "true" showing as text
      if (val === true || val === "true") return "Yes";
      if (val === false || val === "false") return "No";
      return val;
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32 md:pb-24">
      <Navbar />

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"><X size={30}/></button>
           <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
              <Image src={lightboxImage} alt="Zoom" fill className="object-contain" />
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-36">
        
        {/* BREADCRUMBS */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-4 md:mb-6 font-medium">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1"><Home size={14}/> Home</Link>
            <span>/</span>
            <Link href={`/${product.category}`} className="hover:text-aura-gold capitalize underline-offset-4 hover:underline">{product.category}</Link>
            <span>/</span>
            <span className="text-aura-brown truncate max-w-[150px] md:max-w-none capitalize">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-24">
          
          {/* GALLERY */}
          <div className="lg:col-span-7 h-fit lg:sticky lg:top-32 self-start">
            <div className="relative aspect-square w-full bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-aura-gold/10 group">
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                 <button onClick={() => setIsLiked(!isLiked)} className={`bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-all ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`}><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></button>
                 <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert("Link Copied!")}} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-400 hover:text-blue-500"><Share2 size={18} /></button>
              </div>
              <button onClick={() => setLightboxImage(activeImage)} className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-gray-500 hover:text-aura-gold"><Maximize2 size={18} /></button>
              {activeImage && <Image src={activeImage} alt={product.name} fill className="object-contain p-6 md:p-8 mix-blend-multiply transition-transform duration-700 cursor-zoom-in" onClick={() => setLightboxImage(activeImage)}/>}
            </div>
            
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
               {allImages.map((img, i) => (
                 img && (
                   <button key={i} onClick={() => setActiveImage(img)} className={`relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-xl border-2 overflow-hidden transition-all ${activeImage === img ? 'border-aura-gold scale-105 shadow-md' : 'border-transparent'}`}>
                     <Image src={img} alt="Thumb" fill className="object-cover p-1.5 mix-blend-multiply" />
                   </button>
                 )
               ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-aura-gold/10 text-aura-gold text-[10px] font-bold tracking-[0.2em] uppercase rounded-full">{product.category}</span>
                    {specs.stock > 0 
                        ? <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> In Stock</span>
                        : <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold tracking-widest uppercase rounded-full">Out of Stock</span>
                    }
                </div>
                <h1 className="text-3xl md:text-5xl font-serif font-medium text-aura-brown mb-2 md:mb-4 leading-tight capitalize">{product.name}</h1>
                
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                           {[1,2,3,4,5].map(star => <Star key={star} size={14} fill={star <= (product.rating || 5) ? "#D4AF37" : "#E5E7EB"} className={star <= (product.rating || 5) ? "text-aura-gold" : "text-gray-200"} />)}
                        </div>
                        <span className="text-gray-400 text-xs">({productReviews.length} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-red-500 animate-pulse">
                        <Eye size={14} />
                        <span>{viewCount}+ People viewed this in the last 7 days</span>
                    </div>
                </div>

                <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-serif font-bold text-aura-brown">Rs {totalPrice.toLocaleString()}</span>
                        {product.original_price > product.price && <span className="text-base text-gray-300 line-through decoration-red-300">Rs {product.original_price.toLocaleString()}</span>}
                    </div>
                </div>

                {/* COLORS (Using INDEX to prevent bugs) */}
                {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Finish</p>
                        <div className="flex gap-4 flex-wrap">
                          {product.colors.map((color: any, index: number) => (
                             <button 
                                key={index} 
                                onClick={() => { setSelectedColorIndex(index); if(color.image) setActiveImage(color.image); }} 
                                title={color.name}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                                    selectedColorIndex === index // Use Index logic here
                                    ? 'ring-2 ring-offset-2 ring-aura-brown scale-110 shadow-lg' 
                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: color.hex }}
                             >
                                {selectedColorIndex === index && (
                                    <Check size={14} className="text-white drop-shadow-md mix-blend-difference" />
                                )}
                             </button>
                          ))}
                        </div>
                        {/* Show name of selected color */}
                        <p className="text-xs mt-2 text-aura-brown font-medium opacity-80">
                            {product.colors[selectedColorIndex]?.name || "Standard"}
                        </p>
                    </div>
                )}

                {/* ADD-ONS */}
                <div className="mb-8">
                    <div className="space-y-3">
                        <div onClick={() => setIsGift(!isGift)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isGift ? 'bg-[#FAF8F1] border-aura-gold shadow-sm' : 'bg-white border-gray-100'}`}>
                           <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGift ? 'bg-aura-gold text-white' : 'bg-gray-100 text-gray-400'}`}><Gift size={16} /></div><div><p className="font-bold text-sm text-aura-brown">Gift Wrap</p></div></div><span className="text-xs font-bold text-aura-gold">+ Rs {GIFT_COST}</span>
                        </div>
                        <div onClick={() => setAddBox(!addBox)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${addBox ? 'bg-[#FAF8F1] border-aura-gold shadow-sm' : 'bg-white border-gray-100'}`}>
                           <div className="flex items-center gap-3"><div className="relative w-8 h-8 rounded overflow-hidden border border-gray-200"><Image src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200&auto=format&fit=crop" alt="Box" fill className="object-cover" /></div><div><p className="font-bold text-sm text-aura-brown">Luxury Box</p></div></div><span className="text-xs font-bold text-aura-gold">+ Rs {BOX_COST}</span>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 mb-8">
                    <div className="flex gap-3 h-12">
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 shadow-sm">
                           <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-aura-gold"><Minus size={14}/></button>
                           <span className="w-6 text-center font-bold text-sm text-aura-brown">{quantity}</span>
                           <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-aura-gold"><Plus size={14}/></button>
                        </div>
                        <button onClick={handleAddToCart} disabled={specs.stock === 0} className="flex-1 bg-gradient-to-r from-aura-brown to-[#4A3B32] text-white rounded-full font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed hover:scale-[1.02]">
                            <ShoppingBag size={16} /> {specs.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                        </button>
                    </div>
                    {specs.stock > 0 && <button className="w-full h-12 border border-aura-gold/50 text-aura-brown rounded-full font-bold text-xs tracking-widest hover:bg-aura-gold hover:text-white transition-all">BUY NOW</button>}
                </div>

                {/* SPECS (Filtered) */}
                <div className="border-t border-aura-gold/20">
                    <AccordionItem title="Description" id="description"><p>{product.description}</p></AccordionItem>
                    
                    <AccordionItem title="Technical Specifications" id="specs">
                        <ul className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                           {specs && Object.entries(specs).filter(([key]) => 
                             !['gallery', 'stock', 'view_count', 'warranty', 'cost_price', 'shipping_text', 'return_policy', 
                               'box_included', 'luminous', 'date_display', 'adjustable', 'type', 'style'].includes(key)
                           ).map(([key, value]) => (
                             <li key={key} className="flex flex-col pb-1 border-b border-dashed border-gray-100">
                                 <span className="font-bold text-aura-gold uppercase text-[10px]">{key.replace(/_/g, " ")}</span>
                                 <span className="text-gray-600 truncate">{formatSpecValue(value)}</span>
                             </li>
                           ))}
                        </ul>
                    </AccordionItem>
                    
                    <AccordionItem title="Shipping & Warranty" id="shipping">
                        <div className="flex flex-col gap-3 text-xs">
                           <div className="flex items-center gap-2"><Truck className="text-aura-gold" size={16}/><span className="font-bold">Standard Delivery:</span> {specs.shipping_text || "2-4 Working Days"}</div>
                           <div className="flex items-center gap-2"><ShieldCheck className="text-aura-gold" size={16}/><span className="font-bold">Warranty:</span> {specs.warranty || "1 Year Official"}</div>
                           <div className="flex items-center gap-2"><AlertCircle className="text-aura-gold" size={16}/><span className="font-bold">Returns:</span> {specs.return_policy || "7 Days"}</div>
                           <p className="text-gray-500 mt-2">All orders are shipped via insured couriers (Leopard/TCS).</p>
                        </div>
                    </AccordionItem>
                </div>
             </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mb-12 md:mb-24 border-t border-gray-200 pt-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                   <h2 className="text-2xl md:text-3xl font-serif text-aura-brown">Testimonials</h2>
                   <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm font-bold text-aura-gold border-b border-aura-gold pb-0.5">{showReviewForm ? "Close" : "Write Review"}</button>
                </div>

                {showReviewForm && (
                   <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-inner mb-8">
                      <div className="space-y-3">
                          <div className="flex gap-2 text-gray-300">
                             {[1,2,3,4,5].map(star => <Star key={star} size={24} onClick={() => setReviewRating(star)} fill={star <= reviewRating ? "#D4AF37" : "none"} className="cursor-pointer text-aura-gold"/>)}
                          </div>
                          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write your review..." className="w-full border border-gray-200 p-3 rounded-xl bg-white h-24 text-sm"></textarea>
                          <div className="flex justify-between items-center">
                              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                              <div className="flex items-center gap-3">
                                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs font-bold text-gray-500"><Camera size={16} /> {reviewImage ? "Change" : "Add Photo"}</button>
                                 {reviewImage && <div className="relative w-8 h-8 rounded border border-aura-gold"><Image src={reviewImage} alt="Preview" fill className="object-cover" /><button onClick={() => setReviewImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><X size={12}/></button></div>}
                              </div>
                              <button onClick={handleSubmitReview} className="bg-aura-brown text-white px-6 py-2 rounded-full text-xs font-bold shadow-md">Post</button>
                          </div>
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {productReviews.length > 0 ? productReviews.map((review: any, index: number) => (
                      <div key={review.id || index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-aura-brown font-bold text-xs">{(review.user || "G").charAt(0)}</div>
                                <div><p className="font-bold text-sm text-gray-800">{review.user}</p><div className="flex text-aura-gold">{[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />))}</div></div>
                             </div>
                             <span className="text-[10px] text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-xs mb-3 italic">"{review.comment}"</p>
                          {review.image && <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in" onClick={() => setLightboxImage(review.image)}><Image src={review.image} alt="Review" fill className="object-cover hover:scale-110 transition-transform" /></div>}
                      </div>
                   )) : <p className="text-gray-400 italic text-sm text-center col-span-2">No reviews yet. Be the first!</p>}
                </div>
            </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="border-t border-gray-200 pt-10 mb-12">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl md:text-3xl font-serif text-aura-brown">Similar Watches</h2>
                 {relatedProducts.length > 0 && (
                   <Link href={`/${product.category}`} className="text-xs font-bold flex items-center gap-1 hover:text-aura-gold">View All <ArrowRight size={12}/></Link>
                 )}
             </div>
             {relatedProducts.length > 0 ? (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                  {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
               </div>
             ) : (
               <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-gray-400 italic text-sm">No similar watches found.</p>
               </div>
             )}
        </div>
      </div>
      
      {/* MOBILE STICKY TOTAL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
         <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</span>
            <div className="flex items-baseline gap-1"><span className="font-serif font-bold text-aura-brown text-xl">Rs {totalPrice.toLocaleString()}</span></div>
         </div>
         <button onClick={handleAddToCart} disabled={specs.stock === 0} className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest shadow-lg active:scale-95 transition-transform disabled:bg-gray-300">
             {specs.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
         </button>
      </div>

    </main>
  );
}