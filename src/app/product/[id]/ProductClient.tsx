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
  ChevronDown, AlertCircle, Camera, Gift, ArrowRight, X, Maximize2, Home, Eye, Check, Play, Bell, Package, Sun, Calendar, Filter, Image as ImageIcon, Video, Quote, Flame, MapPin
} from "lucide-react";
import toast from "react-hot-toast"; 

const isVideoFile = (url: string) => url?.toLowerCase().includes('.mp4') || url?.toLowerCase().includes('.webm');

// --- AGGRESSIVE CLIENT-SIDE IMAGE COMPRESSOR ---
const compressClientImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) { height = height * (MAX_WIDTH / width); width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
             const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
             resolve(newFile);
          } else reject(new Error("Compression failed"));
        }, "image/webp", 0.6); 
      };
    };
    reader.onerror = (error) => reject(error);
  });
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
  const [boxType, setBoxType] = useState<'none' | 'black' | 'rolex'>('none');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [viewCount, setViewCount] = useState(0); 
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GIFT_COST = 300;

  // 🚀 DATE CALCULATOR FOR ESTIMATED DELIVERY (Skips Weekends)
  const addBizDays = (date: Date, days: number) => {
      let d = new Date(date);
      let added = 0;
      while(added < days) {
          d.setDate(d.getDate() + 1);
          if(d.getDay() !== 0 && d.getDay() !== 6) added++;
      }
      return d;
  };
  
  const todayDate = new Date();
  const dispatchDate = addBizDays(todayDate, 1);
  const deliveryDate = addBizDays(dispatchDate, 2);
  const formatShortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
       if (!id) return;
       setLoading(true);

       // 1. Fetch Current Product
       const { data: currentProduct } = await supabase.from('products').select('*').eq('id', id).single();

       if (currentProduct) {
           setProduct(currentProduct);
           setActiveImage(currentProduct.main_image);
           
           // 2. Fetch GLOBAL Reviews from ALL products to show massive social proof
           const { data: allProductsData } = await supabase.from('products').select('manual_reviews, name');
           if (allProductsData) {
               let globalReviews: any[] = [];
               allProductsData.forEach(p => {
                   if (p.manual_reviews && p.manual_reviews.length > 0) {
                       // Attach product name to review
                       const shortName = p.name?.includes('|') ? p.name.split('|')[0].trim() : p.name;
                       const reviewsWithName = p.manual_reviews.map((r: any) => ({ ...r, productName: shortName }));
                       globalReviews.push(...reviewsWithName);
                   }
               });
               // Shuffle reviews so they look fresh
               globalReviews = globalReviews.sort(() => 0.5 - Math.random());
               setProductReviews(globalReviews);
           }

           const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
           const exists = wishlist.some((w: any) => w.id === currentProduct.id);
           setIsLiked(exists);

           const { data: related } = await supabase.from('products').select('*').eq('category', currentProduct.category).neq('id', id).limit(4);
           if (related) setRelatedProducts(related);
           
           setViewCount(currentProduct.specs?.view_count || 0);
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

  const { totalPrice, specs, selectedColor, allImages } = useMemo(() => {
      if (!product) return { basePrice: 0, extras: 0, totalPrice: 0, specs: {}, selectedColor: null, allImages: [] };

      const bPrice = product.price * quantity;
      const boxCost = boxType === 'rolex' ? 300 : boxType === 'black' ? 200 : 0;
      const ex = (isGift ? GIFT_COST : 0) + boxCost;
      
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
  }, [product, quantity, isGift, boxType, selectedColorIndex]);

  // 🚀 CALCULATE DISPLAY DISCOUNT FOR RED BADGE
  const displayDiscount = useMemo(() => {
      if (!product) return 0;
      if (product.discount > 0) return product.discount;
      if (product.original_price > product.price) {
          return Math.round(((product.original_price - product.price) / product.original_price) * 100);
      }
      return 0;
  }, [product]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-aura-brown font-serif text-xl animate-pulse">Loading Masterpiece...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">Product Not Found</div>;

  const displayShortName = product.name?.includes('|') ? product.name.split('|')[0].trim() : product.name;

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
              name: displayShortName, 
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
    if (specs.stock <= 0) return toast.error("Sorry, this item is currently out of stock.");

    const finalColorName = selectedColor?.name || "Standard";
    const boxLabel = boxType === 'rolex' ? ' (+ Rolex Box)' : boxType === 'black' ? ' (+ Black Box)' : '';
    const finalPriceWithBox = product.price + (boxType === 'rolex' ? 300 : boxType === 'black' ? 200 : 0);

    addToCart({
      id: product.id, 
      name: displayShortName, 
      price: finalPriceWithBox,
      image: selectedColor?.image || activeImage, 
      color: `${finalColorName}${boxLabel}`, 
      quantity: quantity, 
      isGift: isGift, 
      addBox: false 
    });

    toast.success(`${displayShortName} added to bag!`, {
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
    try {
        const compressedFile = await compressClientImage(file);
        const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return publicUrl;
    } catch (e) {
        console.error("Compression/Upload Failed", e);
        return null;
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return toast.error("Please select a star rating!");
    if (!reviewName.trim()) return toast.error("Please enter your name!"); 
    if (!reviewText.trim()) return toast.error("Please write a comment!");

    const loadingToast = toast.loading("Compressing & Posting review...");
    try {
        let finalImageUrl = null;
        if (fileInputRef.current?.files?.[0]) {
            finalImageUrl = await uploadReviewImage(fileInputRef.current.files[0]);
            if (!finalImageUrl) throw new Error("Image upload failed");
        }
        const newReview = {
            id: Date.now(), user: reviewName, rating: reviewRating,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            comment: reviewText, image: finalImageUrl, images: finalImageUrl ? [finalImageUrl] : [],
            productName: displayShortName 
        };
        
        const { data: freshProduct } = await supabase.from('products').select('manual_reviews').eq('id', product.id).single();
        const currentReviews = freshProduct?.manual_reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        
        const { error } = await supabase.rpc('update_product_reviews', { p_id: product.id, new_reviews: updatedReviews });
        if (error) throw error;

        setProductReviews([newReview, ...productReviews]);
        toast.dismiss(loadingToast);
        toast.success("Review Posted Successfully!");
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

  const seoCategory = product?.category?.toLowerCase() === 'women' ? "Women's" : product?.category?.toLowerCase() === 'couple' ? "Couple" : "Men's";
  const seoAltText = product ? `${product.name} - Premium Luxury ${seoCategory} Watch in Pakistan | AURA-X` : "Luxury Watch | AURA-X";

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32 md:pb-24">
      <Navbar />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"><X size={30}/></button>
           <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
             {isVideoFile(lightboxImage) ? (
                 <video src={lightboxImage} controls autoPlay className="w-full h-full object-contain" />
             ) : (
                 <Image src={lightboxImage} alt={`Zoomed view of ${seoAltText}`} fill className="object-contain" quality={90} />
             )}
           </div>
        </div>
      )}

      <div className="pt-24 md:pt-32"> 
          <div className="bg-[#0A0908] border-y border-aura-gold/40 py-2.5 px-2 relative z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-aura-gold/10 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 md:gap-3 text-[9px] md:text-sm font-bold tracking-widest uppercase text-white leading-tight">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-[3px] shadow-[0_0_12px_rgba(220,38,38,0.8)] flex items-center gap-1 animate-pulse">
                <Flame size={12} className="hidden md:block"/> BREAKING
              </span>
              <span className="text-aura-gold drop-shadow-md">10th Ramzan Drop:</span> 
              <span>Up to 30% OFF + Free Delivery.</span>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400 mb-4 md:mb-6 font-medium">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1"><Home size={14}/> Home</Link>
            <span>/</span>
            <Link href={`/${product.category}`} className="hover:text-aura-gold capitalize">{product.category}</Link>
            <span>/</span>
            <span className="text-aura-brown truncate max-w-[150px] md:max-w-none capitalize" title={product.name}>{displayShortName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 md:mb-20">
          <div className="lg:col-span-7 h-fit lg:sticky lg:top-32 self-start">
            <div className="relative aspect-square w-full bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-aura-gold/10">
              
              {/* 🚀 ACTION BUTTONS & RED DISCOUNT BADGE */}
              <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-3">
                 {displayDiscount > 0 && (
                     <span className="bg-[#750000] text-white text-xs font-bold px-3 py-1 rounded shadow-lg tracking-widest mb-1 animate-pulse">
                         -{displayDiscount}%
                     </span>
                 )}
                 <button onClick={handleWishlistToggle} className={`bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-all ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`}><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></button>
                 <button onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success("Link Copied!")}} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-400 hover:text-blue-500"><Share2 size={18} /></button>
              </div>
              <button onClick={() => setLightboxImage(activeImage)} className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-gray-500 hover:text-aura-gold"><Maximize2 size={18} /></button>
              
              {activeImage && (
                isVideoFile(activeImage) ? (
                    <video src={activeImage} autoPlay muted loop playsInline className="object-cover w-full h-full cursor-pointer" onClick={() => setLightboxImage(activeImage)} />
                ) : (
                    <Image src={activeImage} alt={seoAltText} fill priority sizes="(max-width: 768px) 100vw, 60vw" className="object-cover cursor-zoom-in" onClick={() => setLightboxImage(activeImage)} />
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
                         <Image src={img} alt={`${seoAltText} - View ${i + 1}`} fill className="object-cover p-1.5 mix-blend-multiply" sizes="100px" quality={75} />
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
                
                <h1 className="text-3xl md:text-5xl font-serif font-medium text-aura-brown mb-2 md:mb-4 leading-tight capitalize" title={product.name}>
                  {displayShortName}
                </h1>
                
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                           {[1,2,3,4,5].map(star => (
                               <Star key={star} size={14} fill={star <= Math.round(averageRating) ? "#D4AF37" : "#E5E7EB"} className={star <= Math.round(averageRating) ? "text-aura-gold" : "text-gray-200"} />
                           ))}
                        </div>
                    </div>
                    {viewCount > 0 && (
                        <div className="flex items-center gap-2 text-xs font-medium text-red-500 animate-pulse">
                            <Eye size={14} />
                            <span>{viewCount}+ People viewed this recently</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl md:text-4xl font-serif font-bold text-aura-brown">Rs {totalPrice.toLocaleString()}</span>
                        {product.original_price > product.price && (
                            <span className="text-xl md:text-2xl font-bold text-gray-400 line-through decoration-red-500/70 decoration-[3px]">
                                Rs {product.original_price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

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
                    <div onClick={() => setIsGift(!isGift)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isGift ? 'bg-[#FAF8F1] border-aura-gold shadow-md' : 'bg-white border-gray-100 hover:border-aura-gold/50'}`}>
                       <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGift ? 'bg-aura-gold text-white' : 'bg-gray-100 text-gray-400'}`}><Gift size={18} /></div><p className="font-bold text-sm text-aura-brown">Gift Wrap</p></div><span className="text-xs font-bold text-aura-gold">+ Rs {GIFT_COST}</span>
                    </div>

                    <div onClick={() => setBoxType(boxType === 'black' ? 'none' : 'black')} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${boxType === 'black' ? 'bg-[#1E1B18] border-black shadow-md' : 'bg-white border-gray-100 hover:border-aura-gold/50'}`}>
                       <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${boxType === 'black' ? 'bg-white/10 text-aura-gold shadow-inner' : 'bg-gray-100 text-gray-400'}`}><Package size={18} /></div><p className={`font-bold text-sm ${boxType === 'black' ? 'text-white' : 'text-aura-brown'}`}>Premium Black Box</p></div><span className="text-xs font-bold text-aura-gold">+ Rs 200</span>
                    </div>

                    <div onClick={() => setBoxType(boxType === 'rolex' ? 'none' : 'rolex')} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${boxType === 'rolex' ? 'bg-[#006039] border-[#006039] shadow-md' : 'bg-white border-gray-100 hover:border-aura-gold/50'}`}>
                       <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${boxType === 'rolex' ? 'bg-white/20 text-aura-gold shadow-inner' : 'bg-gray-100 text-gray-400'}`}><Package size={18} /></div><p className={`font-bold text-sm ${boxType === 'rolex' ? 'text-white' : 'text-aura-brown'}`}>Official Rolex Box</p></div><span className="text-xs font-bold text-aura-gold">+ Rs 300</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                    {specs.stock > 0 ? (
                        <>
                            <div className="flex gap-3 h-14">
                                <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-aura-gold"><Minus size={16}/></button>
                                    <span className="w-8 text-center font-bold text-sm text-aura-brown">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-aura-gold"><Plus size={16}/></button>
                                </div>
                                <button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-aura-brown to-[#4A3B32] text-white rounded-full font-bold text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                                    <ShoppingBag size={18} /> ADD TO BAG
                                </button>
                            </div>
                            <button onClick={handleAddToCart} className="w-full h-14 border-2 border-aura-gold/50 text-aura-brown rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold hover:text-white transition-all shadow-sm">BUY NOW</button>
                            
                            <p className="text-sm font-bold text-center text-aura-brown flex items-center justify-center gap-2 mt-4 p-3 bg-aura-gold/10 rounded-xl border border-aura-gold/20 shadow-inner">
                                <Video size={18} className="text-aura-brown"/> 
                                We share packing video before dispatch.
                            </p>
                        </>
                    ) : (
                        <div className="w-full bg-[#FAF9F6] border border-red-100 p-5 rounded-2xl text-center">
                            <p className="text-red-500 font-bold mb-3 text-sm flex items-center justify-center gap-2"><AlertCircle size={18}/> Currently Unavailable</p>
                            <button onClick={handleNotifyMe} className="w-full h-14 bg-white border border-aura-brown text-aura-brown rounded-full font-bold text-sm tracking-widest hover:bg-aura-brown hover:text-white transition-colors flex items-center justify-center gap-2"><Bell size={18} /> NOTIFY WHEN AVAILABLE</button>
                        </div>
                    )}
                </div>

                {/* 🚀 PREMIUM 3D ESTIMATED DELIVERY TIMELINE MOVED HERE */}
                <div className="mt-4 bg-gradient-to-br from-[#FFFFFF] via-[#FDFBF7] to-[#F5EEDC] border border-aura-gold/40 rounded-2xl p-6 mb-8 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-aura-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <p className="text-[10px] font-bold text-aura-brown uppercase tracking-widest mb-6 text-center relative z-10">Estimated Delivery Timeline</p>
                    <div className="flex justify-between items-center relative px-2 md:px-8 z-10">
                        {/* Connecting Line: Solid then Dashed */}
                        <div className="absolute top-5 left-[10%] right-[50%] border-t-2 border-[#C8A97E] -translate-y-1/2 z-0"></div>
                        <div className="absolute top-5 left-[50%] right-[10%] border-t-2 border-dashed border-[#C8A97E]/60 -translate-y-1/2 z-0"></div>
                        
                        {/* 🚀 ORDER: Filled Icon */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#C8A97E] text-white flex items-center justify-center shadow-md"><ShoppingBag size={18}/></div>
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-0.5">Order</span>
                                <span className="text-xs font-bold text-aura-brown">{formatShortDate(todayDate)}</span>
                            </div>
                        </div>
                        
                        {/* 🚀 DISPATCH: Filled Icon */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#C8A97E] text-white flex items-center justify-center shadow-md"><Truck size={18}/></div>
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-0.5">Dispatch</span>
                                <span className="text-xs font-bold text-aura-brown">{formatShortDate(dispatchDate)}</span>
                            </div>
                        </div>
                        
                        {/* 🚀 DELIVERY: Dashed Outline Icon */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C8A97E] text-[#C8A97E] flex items-center justify-center bg-white shadow-[0_0_15px_rgba(212,175,55,0.2)]"><MapPin size={18}/></div>
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-aura-gold uppercase block tracking-wider mb-0.5">Delivery</span>
                                <span className="text-xs font-bold text-aura-brown">{formatShortDate(deliveryDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-aura-gold/20 pt-4">
                    <AccordionItem title="Description" id="description"><p>{product.description}</p></AccordionItem>
                    <AccordionItem title="Technical Specifications" id="specs">
                        <ul className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs">
                           {specs && Object.entries(specs).filter(([key]) => !['gallery', 'stock', 'view_count', 'warranty', 'cost_price', 'shipping_text', 'return_policy', 'box_included', 'luminous', 'date_display', 'adjustable', 'type', 'style', 'video'].includes(key)).map(([key, value]) => (
                             <li key={key} className="flex flex-col pb-1 border-b border-dashed border-gray-100">
                                 <span className="font-bold text-aura-gold uppercase text-[10px]">{key.replace(/_/g, " ")}</span>
                                 <span className="text-gray-600 truncate">{value === true ? "Yes" : value === false ? "No" : String(value)}</span>
                             </li>
                           ))}
                        </ul>
                    </AccordionItem>
                </div>
             </div>
          </div>
        </div>

        <div className="mb-12 md:mb-20 max-w-5xl mx-auto border border-aura-gold/20 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-[#FDFBF7] p-4 border-b border-aura-gold/20 text-center">
                <h4 className="text-sm font-bold text-aura-brown tracking-[0.2em] uppercase">Why Choose AURA-X</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-sm">
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Flame className="text-red-500" size={28}/>
                    <span className="font-bold text-aura-brown">Lowest Prices</span>
                    <span className="text-xs text-gray-500">Unbeatable market rates</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <ShieldCheck className="text-aura-gold" size={28}/>
                    <span className="font-bold text-aura-brown">1 Year Warranty</span>
                    <span className="text-xs text-gray-500">Official machine coverage</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Star className="text-aura-gold" size={28} fill="currentColor"/>
                    <span className="font-bold text-aura-brown">Premium Quality</span>
                    <span className="text-xs text-gray-500">Flawless Swiss standards</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Truck className="text-aura-gold" size={28}/>
                    <span className="font-bold text-aura-brown">Cash on Delivery</span>
                    <span className="text-xs text-gray-500">Pay only when you receive</span>
                </div>
            </div>
        </div>

        <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] py-16 md:py-24 bg-gradient-to-b from-[#1A1612] to-[#0A0908] text-white border-y border-aura-gold/20 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-center mb-10 px-4">
                <p className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 flex justify-center items-center gap-2">
                   <Quote size={14} className="text-aura-gold/50" /> Word on the Street <Quote size={14} className="text-aura-gold/50" />
                </p>
                <h2 className="text-3xl md:text-5xl font-serif text-white drop-shadow-lg">Client Testimonials</h2>
                <div className="mt-6 flex justify-center">
                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-aura-gold text-[#1E1B18] px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors shadow-lg">
                        {showReviewForm ? "Cancel Review" : "Write a Review"}
                    </button>
                </div>
            </div>

            {showReviewForm && (
               <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] shadow-xl mb-12 border border-white/20 max-w-2xl mx-auto relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 text-[150px] text-white/5 font-serif font-black pointer-events-none select-none z-0"><Quote/></div>
                  <div className="relative z-10 space-y-5">
                      <p className="font-bold text-center text-white mb-2 text-lg font-serif">How was your experience with {displayShortName}?</p>
                      <div className="flex justify-center gap-3 text-white/30 pb-5 border-b border-white/10">
                         {[1,2,3,4,5].map(star => <Star key={star} size={36} onClick={() => setReviewRating(star)} fill={star <= reviewRating ? "#D4AF37" : "none"} className={`cursor-pointer transition-transform hover:scale-110 ${star <= reviewRating ? "text-aura-gold drop-shadow-md" : "text-white/30"}`} />)}
                      </div>
                      <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your Name" className="w-full border border-white/20 p-4 rounded-xl bg-white/5 text-white placeholder-gray-400 text-sm focus:border-aura-gold outline-none shadow-sm" />
                      <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts on this timepiece..." className="w-full border border-white/20 p-4 rounded-xl bg-white/5 text-white placeholder-gray-400 h-28 text-sm focus:border-aura-gold outline-none shadow-sm resize-none"></textarea>
                      <div className="flex flex-col md:flex-row justify-between items-center pt-2 gap-4">
                          <input type="file" id="review-image-upload" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                          <div className="flex items-center gap-3 w-full md:w-auto">
                             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 px-4 py-2.5 rounded-lg hover:bg-aura-gold hover:text-black transition-colors border border-white/20"><Camera size={16} /> {reviewImage ? "Change Photo" : "Upload Photo"}</button>
                             {reviewImage && <div className="relative w-12 h-12 rounded-lg border border-aura-gold overflow-hidden shadow-md"><Image src={reviewImage} alt="Preview" fill className="object-cover" /><button onClick={() => setReviewImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white backdrop-blur-sm"><X size={14}/></button></div>}
                          </div>
                          <button onClick={handleSubmitReview} className="bg-aura-gold text-[#1E1B18] w-full md:w-auto px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-xl hover:bg-white transition-all">Submit</button>
                      </div>
                  </div>
               </div>
            )}

            <div className="relative w-full overflow-hidden flex py-4">
               <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#1A1612] to-transparent z-10 pointer-events-none"></div>
               <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#1A1612] to-transparent z-10 pointer-events-none"></div>

               <div className="animate-scroll gap-4 md:gap-6 px-4">
                   {productReviews.length > 0 ? [...productReviews, ...productReviews].map((review: any, i: number) => (
                       <div key={i} className="w-[260px] md:w-[350px] p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-3 flex-shrink-0 hover:bg-white/10 transition-colors shadow-lg">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold shadow-inner bg-gradient-to-br from-aura-gold to-yellow-600 ring-1 ring-aura-gold/20">
                                     {(review.user || "A").charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                     <p className="font-bold text-sm text-white">{review.user}</p>
                                     <p className="text-[9px] text-aura-gold/80 uppercase tracking-widest line-clamp-1">{review.productName || displayShortName}</p>
                                 </div>
                             </div>
                             <div className="flex text-aura-gold mt-1">
                                 {[...Array(5)].map((_, starIdx) => <Star key={starIdx} size={10} fill={starIdx < (review.rating || 5) ? "currentColor" : "none"} />)}
                             </div>
                          </div>
                          <p className="text-xs md:text-sm text-gray-300 italic line-clamp-4 leading-relaxed">"{review.comment}"</p>
                          
                          {(review.images?.length > 0 || review.image) && (
                              <div className="flex gap-2 mt-2">
                                  {review.images ? review.images.map((img: string, idx: number) => (
                                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 cursor-zoom-in" onClick={() => setLightboxImage(img)}>
                                          <Image src={img} alt="Customer Review" fill className="object-cover" />
                                      </div>
                                  )) : review.image && (
                                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 cursor-zoom-in" onClick={() => setLightboxImage(review.image)}>
                                          <Image src={review.image} alt="Customer Review" fill className="object-cover" />
                                      </div>
                                  )}
                              </div>
                          )}
                       </div>
                   )) : <div className="text-gray-400 italic text-center w-full">Loading reviews...</div>}
               </div>
            </div>
        </div>

        <div className="border-t border-aura-gold/20 pt-10 mt-12 mb-12">
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
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-[60] flex items-center justify-between pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
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