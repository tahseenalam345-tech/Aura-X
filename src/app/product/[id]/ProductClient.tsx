"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { 
  Star, Truck, ShieldCheck, 
  Minus, Plus, ShoppingBag, Heart, Share2, 
  ChevronDown, AlertCircle, Camera, Gift, ArrowRight, X, Maximize2, Home, Eye, Check, Play, Bell, Package, Sun, Calendar, Filter, Image as ImageIcon, Video
} from "lucide-react";
import toast from "react-hot-toast"; 

const isVideoFile = (url: string) => url?.toLowerCase().includes('.mp4') || url?.toLowerCase().includes('.webm');

// Helper for random avatar colors
const getAvatarColor = (name: string) => {
    const colors = ['bg-red-100 text-red-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];
    const index = name.length % colors.length;
    return colors[index];
};

export default function ProductClient() {
  const { id } = useParams();
  const router = useRouter(); 
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("description");
  
  const [isLiked, setIsLiked] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [addBox, setAddBox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [viewCount, setViewCount] = useState(0); 
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewSort, setReviewSort] = useState("all"); // NEW: Sort State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UPDATED PRICES
  const GIFT_COST = 300;
  const BOX_COST = 200;

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
           setProductReviews(currentProduct.manual_reviews || []);

           const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
           const exists = wishlist.some((w: any) => w.id === currentProduct.id);
           setIsLiked(exists);

           const { data: related } = await supabase
             .from('products')
             .select('*')
             .eq('category', currentProduct.category)
             .neq('id', id)
             .limit(4);
           
           if (related) setRelatedProducts(related);
           const dbViews = currentProduct.specs?.view_count || 0;
           setViewCount(dbViews);
       }
       setLoading(false);
    };
    fetchData();
  }, [id]);

  const averageRating = useMemo(() => {
      if (productReviews.length === 0) return 5;
      const totalStars = productReviews.reduce((acc, review) => acc + (Number(review.rating) || 5), 0);
      return totalStars / productReviews.length;
  }, [productReviews]);

  const sortedReviews = useMemo(() => {
      if (reviewSort === 'with_images') {
          return productReviews.filter(r => (r.images && r.images.length > 0) || r.image);
      }
      if (reviewSort !== 'all') {
          return productReviews.filter(r => Math.round(Number(r.rating)) === Number(reviewSort));
      }
      return productReviews;
  }, [productReviews, reviewSort]);

  const { totalPrice, specs, selectedColor, allImages } = useMemo(() => {
      if (!product) return { basePrice: 0, extras: 0, totalPrice: 0, specs: {}, selectedColor: null, allImages: [] };

      const bPrice = product.price * quantity;
      const ex = (isGift ? GIFT_COST : 0) + (addBox ? BOX_COST : 0);
      
      const imgs = [
        product?.main_image,
        product?.specs?.video, 
        ...(product?.specs?.gallery || []),
        ...(product?.colors?.map((c: any) => c.image).filter(Boolean) || [])
      ].filter((img, index, self) => img && self.indexOf(img) === index);

      return {
          basePrice: bPrice,
          extras: ex,
          totalPrice: bPrice + ex,
          specs: product.specs || {},
          selectedColor: product.colors?.[selectedColorIndex] || null,
          allImages: imgs
      };
  }, [product, quantity, isGift, addBox, selectedColorIndex]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-aura-brown font-serif text-xl animate-pulse">Loading Masterpiece...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Product Not Found</div>;

  const handleWishlistToggle = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (isLiked) {
          const newWishlist = wishlist.filter((item: any) => item.id !== product.id);
          localStorage.setItem('wishlist', JSON.stringify(newWishlist));
          setIsLiked(false);
          toast.success("Removed from Wishlist");
      } else {
          const newItem = {
              id: product.id,
              name: product.name,
              price: product.price,
              main_image: product.main_image,
              category: product.category,
              original_price: product.original_price,
              discount: product.discount
          };
          localStorage.setItem('wishlist', JSON.stringify([...wishlist, newItem]));
          setIsLiked(true);
          toast.success("Added to Wishlist");
      }
  };

  const handleAddToCart = () => {
    if (specs.stock <= 0) {
        return toast.error("Sorry, this item is currently out of stock.");
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedColor?.image || activeImage,
      color: selectedColor?.name || "Standard", 
      quantity: quantity,
      isGift: isGift,
      addBox: addBox
    });

    toast.success(`${product.name} added to bag!`, {
        style: { border: '1px solid #D4AF37', padding: '16px', color: '#4A3B32' },
        iconTheme: { primary: '#D4AF37', secondary: '#FFFAEE' },
    });

    setTimeout(() => { router.push("/cart"); }, 800);
  };

  const handleNotifyMe = () => {
      toast.success("We'll notify you when it's back!", {
          icon: '🔔',
          style: { background: '#1E1B18', color: '#fff' }
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReviewImage(URL.createObjectURL(file));
  };

  const uploadReviewImage = async (file: File) => {
    const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return toast.error("Please select a star rating!");
    if (!reviewName.trim()) return toast.error("Please enter your name!"); 
    if (!reviewText.trim()) return toast.error("Please write a comment!");

    const loadingToast = toast.loading("Posting review...");
    try {
        let finalImageUrl = null;
        if (fileInputRef.current?.files?.[0]) {
            finalImageUrl = await uploadReviewImage(fileInputRef.current.files[0]);
            if (!finalImageUrl) throw new Error("Image upload failed");
        }
        const newReview = {
            id: Date.now(),
            user: reviewName, 
            rating: reviewRating,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            comment: reviewText,
            image: finalImageUrl, // Keep backward compatibility
            images: finalImageUrl ? [finalImageUrl] : [] // New multi-image support
        };
        const { data: freshProduct } = await supabase.from('products').select('manual_reviews').eq('id', product.id).single();
        const currentReviews = freshProduct?.manual_reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const { error } = await supabase.from('products').update({ manual_reviews: updatedReviews }).eq('id', product.id);
        if (error) throw error;
        setProductReviews(updatedReviews);
        toast.dismiss(loadingToast);
        toast.success("Review Posted!");
        setReviewRating(0); setReviewName(""); setReviewText(""); setReviewImage(null); setShowReviewForm(false);
    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to post review. Try again.");
    }
  };

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
             {isVideoFile(lightboxImage) ? (
                 <video src={lightboxImage} controls autoPlay className="w-full h-full object-contain" />
             ) : (
                 <Image src={lightboxImage} alt="Zoomed view" fill className="object-contain" quality={90} />
             )}
           </div>
        </div>
      )}

      {/* --- TRUST STRIP (Fixed Padding to Avoid Cut-off) --- */}
      <div className="pt-24 md:pt-32"> 
          <div className="bg-[#1E1B18] border-y border-aura-gold py-3 text-center shadow-lg">
            <p className="text-xs md:text-sm font-bold text-white flex items-center justify-center gap-2 tracking-wide">
              <ShieldCheck size={16} className="text-aura-gold"/> 
              OFFICIAL POLICY: Open Parcel Before Payment Allowed
            </p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-4 md:mb-6 font-medium">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1"><Home size={14}/> Home</Link>
            <span>/</span>
            <Link href={`/${product.category}`} className="hover:text-aura-gold capitalize">{product.category}</Link>
            <span>/</span>
            <span className="text-aura-brown truncate max-w-[150px] md:max-w-none capitalize">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-24">
          <div className="lg:col-span-7 h-fit lg:sticky lg:top-32 self-start">
            <div className="relative aspect-square w-full bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-aura-gold/10">
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
                 <button onClick={handleWishlistToggle} className={`bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-all ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`}><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></button>
                 <button onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success("Link Copied!")}} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-400 hover:text-blue-500"><Share2 size={18} /></button>
              </div>
              <button onClick={() => setLightboxImage(activeImage)} className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-gray-500 hover:text-aura-gold"><Maximize2 size={18} /></button>
              
              {activeImage && (
                isVideoFile(activeImage) ? (
                    <video src={activeImage} autoPlay muted loop playsInline className="object-cover w-full h-full cursor-pointer" onClick={() => setLightboxImage(activeImage)} />
                ) : (
                    <Image src={activeImage} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 60vw" className="object-cover cursor-zoom-in" onClick={() => setLightboxImage(activeImage)} />
                )
              )}
            </div>
            
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
               {allImages.map((img: string, i: number) => (
                 img && (
                   <button key={i} onClick={() => setActiveImage(img)} className={`relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-xl border-2 overflow-hidden transition-all ${activeImage === img ? 'border-aura-gold scale-105 shadow-md' : 'border-transparent'}`}>
                     {isVideoFile(img) ? (
                         <div className="w-full h-full flex items-center justify-center bg-gray-100">
                             <video src={img} className="object-cover w-full h-full absolute inset-0 opacity-80" muted />
                             <Play size={20} className="relative z-10 text-aura-brown" fill="currentColor"/>
                         </div>
                     ) : (
                         <Image src={img} alt="Thumbnail" fill className="object-cover p-1.5 mix-blend-multiply" sizes="100px" quality={75} />
                     )}
                   </button>
                 )
               ))}
            </div>
          </div>

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
                           {[1,2,3,4,5].map(star => (
                               <Star key={star} size={14} fill={star <= Math.round(averageRating) ? "#D4AF37" : "#E5E7EB"} className={star <= Math.round(averageRating) ? "text-aura-gold" : "text-gray-200"} />
                           ))}
                        </div>
                        <span className="text-gray-400 text-xs">({productReviews.length} Reviews)</span>
                    </div>
                    {viewCount > 0 && (
                        <div className="flex items-center gap-2 text-xs font-medium text-red-500 animate-pulse">
                            <Eye size={14} />
                            <span>{viewCount}+ People viewed this recently</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-serif font-bold text-aura-brown">Rs {totalPrice.toLocaleString()}</span>
                        {product.original_price > product.price && <span className="text-base text-gray-300 line-through decoration-red-300">Rs {product.original_price.toLocaleString()}</span>}
                    </div>
                </div>

                {/* --- KEY FEATURES BADGES --- */}
                {(specs.luminous || specs.date_display || specs.box_included) && (
                    <div className="flex flex-wrap gap-3 mb-6">
                        {specs.luminous && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-aura-gold/5 border border-aura-gold/20 rounded-lg text-xs font-bold text-aura-brown/80">
                                <Sun size={14} className="text-aura-gold"/> Luminous Hands
                            </span>
                        )}
                        {specs.date_display && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-aura-gold/5 border border-aura-gold/20 rounded-lg text-xs font-bold text-aura-brown/80">
                                <Calendar size={14} className="text-aura-gold"/> Date Display
                            </span>
                        )}
                        {specs.box_included && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-aura-gold/5 border border-aura-gold/20 rounded-lg text-xs font-bold text-aura-brown/80">
                                <Package size={14} className="text-aura-gold"/> Box Included
                            </span>
                        )}
                    </div>
                )}

                {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select Finish</p>
                        <div className="flex gap-4 flex-wrap">
                          {product.colors.map((color: any, index: number) => (
                             <button 
                                key={index} 
                                onClick={() => { 
                                  setSelectedColorIndex(index); 
                                  if(color.image) setActiveImage(color.image); 
                                }} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    selectedColorIndex === index 
                                    ? 'ring-2 ring-offset-2 ring-aura-brown scale-110 shadow-lg' 
                                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                             >
                                {selectedColorIndex === index && (
                                    <Check size={14} className="text-white drop-shadow-md mix-blend-difference" />
                                )}
                             </button>
                          ))}
                        </div>
                        <p className="text-xs mt-2 text-aura-brown font-medium opacity-80 italic">
                            Finish: {product.colors[selectedColorIndex]?.name || "Standard"}
                        </p>
                    </div>
                )}

                <div className="mb-8 space-y-3">
                    <div onClick={() => setIsGift(!isGift)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isGift ? 'bg-[#FAF8F1] border-aura-gold shadow-sm' : 'bg-white border-gray-100'}`}>
                       <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${isGift ? 'bg-aura-gold text-white' : 'bg-gray-100 text-gray-400'}`}><Gift size={16} /></div><p className="font-bold text-sm text-aura-brown">Gift Wrap</p></div><span className="text-xs font-bold text-aura-gold">+ Rs {GIFT_COST}</span>
                    </div>
                    <div onClick={() => setAddBox(!addBox)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${addBox ? 'bg-[#FAF8F1] border-aura-gold shadow-sm' : 'bg-white border-gray-100'}`}>
                       <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${addBox ? 'bg-aura-gold text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}><Package size={16} /></div><p className="font-bold text-sm text-aura-brown">Luxury Box</p></div><span className="text-xs font-bold text-aura-gold">+ Rs {BOX_COST}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                    {specs.stock > 0 ? (
                        <>
                            <div className="flex gap-3 h-12">
                                <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-aura-gold"><Minus size={14}/></button>
                                    <span className="w-6 text-center font-bold text-sm text-aura-brown">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-aura-gold"><Plus size={14}/></button>
                                </div>
                                <button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-aura-brown to-[#4A3B32] text-white rounded-full font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
                                    <ShoppingBag size={16} /> ADD TO BAG
                                </button>
                            </div>
                            <button onClick={handleAddToCart} className="w-full h-12 border border-aura-gold/50 text-aura-brown rounded-full font-bold text-xs tracking-widest hover:bg-aura-gold hover:text-white transition-all">BUY NOW</button>
                            
                            {/* --- UPDATED: BOLD & LARGE PACKING VIDEO NOTE --- */}
                            <p className="text-sm font-bold text-center text-aura-brown flex items-center justify-center gap-2 mt-4 p-2 bg-aura-gold/10 rounded-lg border border-aura-gold/20 shadow-sm">
                                <Video size={18} className="text-aura-brown"/> 
                                We share packing video before dispatch.
                            </p>
                        </>
                    ) : (
                        <div className="w-full bg-[#FAF9F6] border border-red-100 p-4 rounded-xl text-center">
                            <p className="text-red-500 font-bold mb-2 text-sm flex items-center justify-center gap-2"><AlertCircle size={16}/> Currently Unavailable</p>
                            <button onClick={handleNotifyMe} className="w-full h-12 bg-white border border-aura-brown text-aura-brown rounded-full font-bold text-xs tracking-widest hover:bg-aura-brown hover:text-white transition-colors flex items-center justify-center gap-2"><Bell size={16} /> NOTIFY WHEN AVAILABLE</button>
                        </div>
                    )}
                </div>

                <div className="border-t border-aura-gold/20">
                    <AccordionItem title="Description" id="description"><p>{product.description}</p></AccordionItem>
                    <AccordionItem title="Technical Specifications" id="specs">
                        <ul className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                           {specs && Object.entries(specs).filter(([key]) => !['gallery', 'stock', 'view_count', 'warranty', 'cost_price', 'shipping_text', 'return_policy', 'box_included', 'luminous', 'date_display', 'adjustable', 'type', 'style', 'video'].includes(key)).map(([key, value]) => (
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
                        </div>
                    </AccordionItem>
                </div>
             </div>
          </div>
        </div>

        {/* TESTIMONIALS SECTION */}
        <div className="mb-12 md:mb-24 border-t border-gray-200 pt-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                   <h2 className="text-2xl md:text-3xl font-serif text-aura-brown">Testimonials</h2>
                   <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-aura-brown text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-aura-gold transition-colors">{showReviewForm ? "Cancel Review" : "Write a Review"}</button>
                </div>

                {/* SORTING CONTROLS */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                    {["all", "5", "4", "3", "with_images"].map((type) => (
                        <button 
                            key={type} 
                            onClick={() => setReviewSort(type)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${reviewSort === type ? 'bg-aura-brown text-white border-aura-brown' : 'bg-white text-gray-500 border-gray-200 hover:border-aura-gold'}`}
                        >
                            {type === "with_images" ? <span className="flex items-center gap-1"><ImageIcon size={12}/> With Photos</span> : type === "all" ? "All Reviews" : `${type} Stars`}
                        </button>
                    ))}
                </div>

                {showReviewForm && (
                   <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-inner mb-8 border border-aura-gold/20 max-w-2xl mx-auto">
                      <div className="space-y-4">
                          <p className="font-bold text-center text-aura-brown mb-2">How would you rate this product?</p>
                          <div className="flex justify-center gap-3 text-gray-300 pb-4 border-b border-gray-200">
                             {[1,2,3,4,5].map(star => <Star key={star} size={32} onClick={() => setReviewRating(star)} fill={star <= reviewRating ? "#D4AF37" : "none"} className={`cursor-pointer transition-transform hover:scale-110 ${star <= reviewRating ? "text-aura-gold" : "text-gray-300"}`} />)}
                          </div>
                          <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your Name" className="w-full border border-gray-200 p-3 rounded-xl bg-white text-sm focus:border-aura-gold outline-none" />
                          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell us what you think..." className="w-full border border-gray-200 p-3 rounded-xl bg-white h-24 text-sm focus:border-aura-gold outline-none"></textarea>
                          <div className="flex justify-between items-center pt-2">
                              <input type="file" id="review-image-upload" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                              <div className="flex items-center gap-3">
                                 <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-aura-brown transition-colors"><Camera size={16} /> {reviewImage ? "Change Photo" : "Add Photo"}</button>
                                 {reviewImage && <div className="relative w-10 h-10 rounded border border-aura-gold overflow-hidden"><Image src={reviewImage} alt="Preview" fill className="object-cover" /><button onClick={() => setReviewImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><X size={12}/></button></div>}
                              </div>
                              <button onClick={handleSubmitReview} className="bg-aura-brown text-white px-8 py-2.5 rounded-full text-xs font-bold hover:shadow-lg hover:bg-aura-gold transition-all">Post Review</button>
                          </div>
                      </div>
                   </div>
                )}

                {/* REVIEWS GRID (Masonry-like feel) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                   {sortedReviews.length > 0 ? sortedReviews.map((review: any, index: number) => (
                      <div key={review.id || index} className="break-inside-avoid bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(review.user || "A")}`}>
                                    {(review.user || "A").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{review.user}</p>
                                    <span className="text-[10px] text-gray-400 block">{review.date}</span>
                                </div>
                             </div>
                             <div className="flex text-aura-gold bg-aura-gold/5 px-2 py-1 rounded-lg">
                                {[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-aura-gold" : "text-gray-200"}/>))}
                             </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{review.comment}"</p>
                          
                          {(review.images?.length > 0 || review.image) && (
                              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                  {review.images ? (
                                      review.images.map((img: string, i: number) => (
                                          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 cursor-zoom-in" onClick={() => setLightboxImage(img)}>
                                              <Image src={img} alt="Review" fill className="object-cover hover:scale-110 transition-transform" />
                                          </div>
                                      ))
                                  ) : (
                                      review.image && (
                                          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in" onClick={() => setLightboxImage(review.image)}>
                                              <Image src={review.image} alt="Review" fill className="object-cover hover:scale-105 transition-transform" />
                                          </div>
                                      )
                                  )}
                              </div>
                          )}
                      </div>
                   )) : <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">No reviews found matching your filter.</div>}
                </div>
            </div>
        </div>

        <div className="border-t border-gray-200 pt-10 mb-12">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl md:text-3xl font-serif text-aura-brown">Similar Watches</h2>
                 {relatedProducts.length > 0 && (
                   <Link href={`/${product.category}`} className="text-xs font-bold flex items-center gap-1 hover:text-aura-gold">View All <ArrowRight size={12}/></Link>
                 )}
             </div>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
        </div>
      </div>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-50 flex items-center justify-between safe-area-bottom shadow-lg">
         <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</span>
            <div className="flex items-baseline gap-1"><span className="font-serif font-bold text-aura-brown text-xl">Rs {totalPrice.toLocaleString()}</span></div>
         </div>
         {specs.stock > 0 ? (
             <button onClick={handleAddToCart} className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest active:scale-95 transition-transform shadow-md">ADD TO BAG</button>
         ) : (
             <button onClick={handleNotifyMe} className="bg-white border border-aura-brown text-aura-brown px-6 py-3 rounded-full font-bold text-xs tracking-widest">NOTIFY ME</button>
         )}
      </div>
    </main>
  );
}