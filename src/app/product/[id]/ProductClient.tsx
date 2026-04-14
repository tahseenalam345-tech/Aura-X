"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Heart, Share2, 
  ChevronDown, ChevronLeft, ChevronRight, X, Maximize2, Home, Check, Play, Package, Sun, Calendar, Sparkles, Gift,
  Minus, Plus, Truck, ShieldCheck, Flame, MapPin, Palette, Star, Quote, Edit3, ImagePlus, Loader2, BellRing
} from "lucide-react";
import toast from "react-hot-toast"; 
import * as fbq from "@/lib/fpixel";

const isVideoFile = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('/video/upload/');
};

// 🚀 CLOUDFLARE SHIELD
const optimizeCloudinaryUrl = (url: string) => {
    if (!url) return url;

    if (url.includes('cloudinary.com')) {
        if (url.includes('f_auto') || url.includes('q_auto')) return url; 
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    if (url.includes('kxsthielcdurxinctkxi.supabase.co')) {
        return url.replace(
            'https://kxsthielcdurxinctkxi.supabase.co', 
            'https://image-proxy-aurax.tahseenalam345.workers.dev'
        );
    }

    return url;
};

// 🚀 REVIEWS DATA FOR TICKER
const customerReviews = [
  { name: "Ali R.", city: "Lahore", text: "Quality is just outstanding. Totally worth the price! The packaging felt very premium.", rating: 5 },
  { name: "Usman K.", city: "Karachi", text: "Fast delivery and the product looks exactly like the pictures. Highly recommended.", rating: 5 },
  { name: "Sara A.", city: "Islamabad", text: "Bought this as a gift for my husband, he absolutely loved it. Excellent customer service.", rating: 5 },
  { name: "Faizan M.", city: "Multan", text: "I was skeptical at first, but the finish and weight of the product scream luxury. 10/10.", rating: 5 },
  { name: "Hassan T.", city: "Rawalpindi", text: "Very smooth checkout process and received my order within 2 days. Will buy again.", rating: 4 },
  { name: "Zainab S.", city: "Faisalabad", text: "The detail on this piece is amazing. Found my new favorite store for accessories.", rating: 5 }
];

// 🚀 Image Compression Helper
const compressImage = async (file: File, maxWidth = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                } else {
                    reject(new Error("Compression failed"));
                }
            }, 'image/webp', 0.8);
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-sm">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function ProductClient() {
  const { id } = useParams();
  const router = useRouter(); 
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [genericReviews, setGenericReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", city: "", comment: "", rating: 5 });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [mediaIndex, setMediaIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [extraColors, setExtraColors] = useState<(number | null)[]>([]);
  
  const [openSection, setOpenSection] = useState<string | null>(null); 
  const [isLiked, setIsLiked] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [boxType, setBoxType] = useState<'none' | 'black' | 'rolex'>('none');
  
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [showColorWarning, setShowColorWarning] = useState(false);

  const GIFT_COST = 300;

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
      setZoomLevel(1);
  }, [lightboxImage]);

  useEffect(() => {
    const fetchData = async () => {
       if (!id) return;
       setLoading(true);
       
       window.scrollTo({ top: 0, behavior: 'smooth' });

       const { data: currentProduct } = await supabase.from('products').select('*').eq('id', id).single();

       if (currentProduct) {
           setProduct(currentProduct);
           
           if (currentProduct.variants?.sizes?.length > 0) setSelectedSize(null);
           
           if (currentProduct.colors?.length === 1) {
               setSelectedColorIndex(0); 
           } else if (currentProduct.colors?.length > 1) {
               setSelectedColorIndex(null); 
           }

           const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
           setIsLiked(wishlist.some((w: any) => w.id === currentProduct.id));

           const localRecent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
           const filteredRecent = localRecent.filter((item: any) => item.id !== currentProduct.id);
           setRecentlyViewed(filteredRecent.slice(0, 4));
           
           localStorage.setItem('recently_viewed', JSON.stringify([currentProduct, ...filteredRecent].slice(0, 10)));

           const { data: sameCategoryData } = await supabase
               .from('products')
               .select('*')
               .eq('category', currentProduct.category)
               .neq('id', id)
               .limit(4);
               
           let finalRelated = sameCategoryData || [];

           if (finalRelated.length < 4) {
               const { data: otherData } = await supabase
                   .from('products')
                   .select('*')
                   .neq('category', currentProduct.category)
                   .neq('id', id)
                   .limit(4 - finalRelated.length);
                   
               if (otherData) {
                   finalRelated = [...finalRelated, ...otherData];
               }
           }
           setRelatedProducts(finalRelated);

           // 🚀 FIXED TYPESCRIPT ERROR HERE: Added "as string"
           const { data: productReviews } = await supabase
               .from('product_reviews')
               .select('*')
               .eq('product_id', id as string)
               .order('created_at', { ascending: false });
           
           if (productReviews) {
               setReviews(productReviews);
           }

           const { data: randomReviews } = await supabase
               .from('product_reviews')
               .select('*')
               .limit(8);
           if (randomReviews && randomReviews.length > 0) {
               setGenericReviews(randomReviews);
           }
       }
       setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
      if (quantity > 1) {
          setExtraColors(prev => {
              const newExtras = [...prev];
              while(newExtras.length < quantity - 1) newExtras.push(null);
              return newExtras.slice(0, quantity - 1);
          });
      } else {
          setExtraColors([]);
      }
  }, [quantity]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 5 * 1024 * 1024) {
              toast.error("Image must be less than 5MB");
              return;
          }
          setReviewImage(file);
          setReviewImagePreview(URL.createObjectURL(file));
      }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return; // Prevent any undefined ID errors
      
      if (!reviewForm.name || !reviewForm.comment) {
          toast.error("Please provide your name and a comment.");
          return;
      }
      setIsSubmittingReview(true);

      let uploadedImageUrl = null;

      try {
          if (reviewImage) {
              const compressedFile = await compressImage(reviewImage);
              const fileExt = compressedFile.name.split('.').pop();
              const fileName = `${Math.random()}.${fileExt}`;
              const filePath = `reviews/${fileName}`;

              const { error: uploadError } = await supabase.storage
                  .from('review-images') 
                  .upload(filePath, compressedFile);

              if (uploadError) {
                  console.error("Upload error:", uploadError);
                  toast.error("Failed to upload image, but saving review...");
              } else {
                  const { data } = supabase.storage.from('review-images').getPublicUrl(filePath);
                  uploadedImageUrl = data.publicUrl;
              }
          }

          // 🚀 FIXED TYPESCRIPT ERROR HERE: Added "as string"
          const newReview = {
              product_id: id as string,
              customer_name: reviewForm.name,
              rating: reviewForm.rating,
              comment: reviewForm.comment,
              city: reviewForm.city || "Pakistan",
              image_url: uploadedImageUrl
          };

          const { error } = await supabase.from('product_reviews').insert([newReview]);

          if (error) throw error;

          toast.success("Thank you for your review!");
          setReviews([newReview, ...reviews]);
          setShowReviewModal(false);
          setReviewForm({ name: "", city: "", comment: "", rating: 5 });
          setReviewImage(null);
          setReviewImagePreview(null);

      } catch (err) {
          console.error(err);
          toast.error("Could not post review. Please try again later.");
      } finally {
          setIsSubmittingReview(false);
      }
  };

  const handleNotifyMe = () => {
      toast.success("We'll notify you when it's back in stock!");
  };

  const categoryName = product?.category?.toLowerCase() || '';
  const isWatch = ['men', 'women', 'couple', 'watches'].includes(categoryName);
  const sizesAvailable = product?.variants?.sizes || [];
  const isOutOfStock = product?.specs?.stock <= 0; 

  const unifiedMedia = useMemo(() => {
      if (!product) return [];
      const mediaList: { url: string; type: string; colorIndex?: number }[] = [];
      
      if (product.main_image) mediaList.push({ url: optimizeCloudinaryUrl(product.main_image), type: 'main', colorIndex: 0 });
      if (product.specs?.video) mediaList.push({ url: optimizeCloudinaryUrl(product.specs.video), type: 'video' });
      if (product.image && product.image !== product.main_image) mediaList.push({ url: optimizeCloudinaryUrl(product.image), type: 'hover' });
      
      if (product.colors && product.colors.length > 0) {
          product.colors.forEach((c: any, idx: number) => {
              if (c.image && c.image !== product.main_image) {
                  mediaList.push({ url: optimizeCloudinaryUrl(c.image), type: 'color', colorIndex: idx });
              }
          });
      }
      
      if (product.specs?.gallery?.length > 0) {
          product.specs.gallery.forEach((gImg: string) => {
              const optimizedImg = optimizeCloudinaryUrl(gImg);
              if (!mediaList.find(m => m.url === optimizedImg)) mediaList.push({ url: optimizedImg, type: 'gallery' });
          });
      }
      return mediaList;
  }, [product]);

  const hasColorMedia = unifiedMedia.some(m => m.type === 'main' || m.type === 'color');
  const hasGalleryMedia = unifiedMedia.some(m => m.type === 'hover' || m.type === 'gallery' || m.type === 'video');
  const currentDisplayMedia = unifiedMedia[mediaIndex] || null;

  const { totalPrice, specs, selectedColor } = useMemo(() => {
      if (!product) return { basePrice: 0, extras: 0, totalPrice: 0, specs: {}, selectedColor: null };
      const bPrice = product.price * quantity;
      const boxCost = boxType === 'rolex' ? 300 : boxType === 'black' ? 200 : 0;
      const ex = (isGift ? GIFT_COST : 0) + boxCost;
      return {
          basePrice: bPrice, extras: ex, totalPrice: bPrice + ex,
          specs: product.specs || {},
          selectedColor: selectedColorIndex !== null ? product.colors?.[selectedColorIndex] : null,
      };
  }, [product, quantity, isGift, boxType, selectedColorIndex]);

  const displayDiscount = useMemo(() => {
      if (!product) return 0;
      if (product.discount > 0) return product.discount;
      if (product.original_price > product.price) {
          return Math.round(((product.original_price - product.price) / product.original_price) * 100);
      }
      return 0;
  }, [product]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDFBF7] to-[#F5EEDC] text-aura-brown font-serif text-xl font-bold animate-pulse">Accessing Masterpiece...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDFBF7] to-[#F5EEDC] font-serif text-xl font-bold text-aura-brown">Product Not Found</div>;

  const displayShortName = product.name?.includes('|') ? product.name.split('|')[0].trim() : product.name;

  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e: any) => { touchStartX = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e: any) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) setMediaIndex((prev) => (prev + 1) % unifiedMedia.length); 
      if (touchEndX > touchStartX + 40) setMediaIndex((prev) => (prev - 1 + unifiedMedia.length) % unifiedMedia.length); 
  };

  const handleColorToggle = (index: number, colorImgUrl?: string) => {
      setSelectedColorIndex(index); 
      if (colorImgUrl) {
          const mediaIdx = unifiedMedia.findIndex(m => m.url === optimizeCloudinaryUrl(colorImgUrl));
          if (mediaIdx !== -1) setMediaIndex(mediaIdx);
      } else if (index === 0 && product.main_image) {
          const mediaIdx = unifiedMedia.findIndex(m => m.type === 'main');
          if (mediaIdx !== -1) setMediaIndex(mediaIdx);
      }
  };

  const handleWishlistToggle = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (isLiked) {
          const newWishlist = wishlist.filter((item: any) => item.id !== product.id);
          localStorage.setItem('wishlist', JSON.stringify(newWishlist));
          setIsLiked(false);
          toast.success("Removed from Wishlist");
      } else {
          localStorage.setItem('wishlist', JSON.stringify([...wishlist, {
              id: product.id, name: displayShortName, price: product.price, 
              main_image: product.main_image, category: product.category, 
              original_price: product.original_price, discount: product.discount
          }]));
          setIsLiked(true);
          toast.success("Added to Wishlist");
      }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    if (product.colors?.length > 1) {
        if (selectedColorIndex === null) {
            setShowColorWarning(true); 
            return; 
        }
        if (quantity > 1 && extraColors.includes(null)) {
            toast.error("Please select Finishes for all items!");
            return;
        }
    }
    
    if (sizesAvailable.length > 0 && !selectedSize) return toast.error("Please select a Size first!");

    const finalColorName = selectedColor?.name || "Standard";
    let variantParts = [];
    
    if (quantity > 1 && product.colors?.length > 0) {
        let multiColors = [`Item 1: ${finalColorName}`];
        extraColors.forEach((idx, i) => {
            multiColors.push(`Item ${i+2}: ${idx !== null ? product.colors[idx].name : ""}`);
        });
        variantParts.push(multiColors.join(", "));
    } else {
        if (finalColorName !== "Standard") variantParts.push(finalColorName);
    }
    
    if (selectedSize) variantParts.push(`Size: ${selectedSize}`);
    if (boxType === 'rolex') variantParts.push('Rolex Box');
    if (boxType === 'black') variantParts.push('Black Box');
    
    const finalVariantString = variantParts.length > 0 ? variantParts.join(" | ") : "Standard Variant";
    const basePriceWithBox = product.price + (boxType === 'rolex' ? 300 : boxType === 'black' ? 200 : 0);

    addToCart({
      id: product.id, name: displayShortName, price: basePriceWithBox,
      image: selectedColor?.image || product.main_image, color: finalVariantString, 
      quantity: quantity, isGift: isGift, addBox: boxType !== 'none', isEidExclusive: product.is_eid_exclusive
    });

    fbq.event('AddToCart', {
        content_name: displayShortName, content_ids: [product.id],
        content_type: 'product', value: (basePriceWithBox + (isGift ? GIFT_COST : 0)) * quantity, currency: 'PKR',
    });

    toast.success(`${displayShortName} added to bag!`);
    setTimeout(() => { router.push("/cart"); }, 800);
  };

  const seoAltText = `${product.name} - Premium Luxury Item | AURA-X`;

  const fullCategory = `${product?.category || ''} ${product?.sub_category || ''}`.toLowerCase();
  
  const globalHiddenKeys = [
      'gallery', 'stock', 'video', 'view_count', 'extra_notes', 
      'delivery_charge', 'cost_price', 'rfid', 'coinPocket', 
      'return_policy', 'shipping_text', 'warranty', 
      'luminous', 'date_display'
  ];

  let categoryHiddenKeys: string[] = [];

  if (fullCategory.includes('smart')) {
      categoryHiddenKeys = ['premium_black_box', 'weight', 'movement', 'case_size', 'adjustable', 'case_color', 'case_shape', 'strap_width', 'case_thickness'];
  } else if (fullCategory.includes('wallet')) {
      categoryHiddenKeys = ['premium_black_box', 'weight', 'movement', 'case_size', 'adjustable', 'case_color', 'case_shape', 'strap_width', 'case_thickness', 'water_resistance'];
  } else if (fullCategory.includes('bracelet')) {
      categoryHiddenKeys = ['weight', 'movement', 'case_size', 'adjustable', 'case_color', 'case_shape', 'strap_width', 'case_thickness', 'water_resistance'];
  } else if (fullCategory.includes('earbud') || fullCategory.includes('pod') || fullCategory.includes('audio')) {
      categoryHiddenKeys = ['premium_black_box', 'weight', 'movement', 'case_size', 'adjustable', 'case_color', 'case_shape', 'strap_width', 'case_thickness'];
  } else if (fullCategory.includes('men') || fullCategory.includes('women') || fullCategory.includes('couple') || fullCategory.includes('watch')) {
      categoryHiddenKeys = ['case_color', 'case_shape', 'strap_width', 'case_thickness', 'case_size'];
  } else {
      categoryHiddenKeys = ['premium_black_box', 'weight', 'movement', 'case_size', 'adjustable', 'case_color', 'case_shape', 'strap_width', 'case_thickness'];
  }

  const allHiddenKeys = [...globalHiddenKeys, ...categoryHiddenKeys];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F5EEDC] text-aura-brown pb-24 md:pb-10 font-serif selection:bg-aura-gold/30">
      <Navbar />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * 6 - 1rem * 6)); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4af37; 
          border-radius: 4px;
        }
      `}} />

      <AnimatePresence>
        {showReviewModal && (
            <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border-t-8 border-aura-gold max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors"><X size={18}/></button>
                    <div className="mb-6 mt-2">
                        <h3 className="text-2xl font-bold text-aura-brown font-serif flex items-center gap-2"><Edit3 size={20} className="text-aura-gold"/> Write a Review</h3>
                        <p className="text-xs text-gray-500 mt-1">Share your experience with others.</p>
                    </div>
                    
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name *</label>
                                <input required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold text-sm" placeholder="Ali Raza" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</label>
                                <input value={reviewForm.city} onChange={e => setReviewForm({...reviewForm, city: e.target.value})} type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold text-sm" placeholder="Lahore" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}>
                                        <Star size={24} className={star <= reviewForm.rating ? "text-aura-gold" : "text-gray-200"} fill={star <= reviewForm.rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review *</label>
                            <textarea required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold text-sm h-24 resize-none" placeholder="I absolutely loved this piece..."></textarea>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Upload Photo (Optional)</label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-aura-gold/30 border-dashed rounded-xl cursor-pointer bg-[#FDFBF7] hover:bg-aura-gold/5 transition-colors overflow-hidden relative">
                                    {reviewImagePreview ? (
                                        <Image src={reviewImagePreview} alt="Preview" fill className="object-contain p-1" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImagePlus className="w-6 h-6 mb-2 text-aura-gold" />
                                            <p className="text-xs text-gray-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                                        </div>
                                    )}
                                    <input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <button disabled={isSubmittingReview} type="submit" className="w-full bg-gradient-to-r from-aura-brown to-yellow-800 text-white py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSubmittingReview ? <><Loader2 className="animate-spin" size={16}/> Submitting...</> : "Submit Review"}
                        </button>
                    </form>
                </div>
            </div>
        )}
      </AnimatePresence>

      {showColorWarning && product.colors && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border-t-8 border-aura-gold">
                  <button onClick={() => setShowColorWarning(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors"><X size={18}/></button>
                  <div className="text-center mb-5 mt-2">
                      <div className="w-14 h-14 bg-amber-50 text-aura-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                          <Palette size={24}/>
                      </div>
                      <h3 className="text-xl font-bold text-aura-brown font-serif">Select Your Article</h3>
                      <p className="text-xs text-gray-500 mt-1">Please select a finish before adding to bag.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1 scrollbar-hide">
                      {product.colors.map((color: any, idx: number) => (
                          <button
                              key={idx}
                              onClick={() => {
                                  handleColorToggle(idx, color.image);
                                  setShowColorWarning(false);
                              }}
                              className="flex flex-col items-center gap-2 p-2.5 border-2 border-gray-100 rounded-xl hover:border-aura-gold hover:shadow-md transition-all group bg-gray-50/50 hover:bg-white"
                          >
                              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                  {color.image ? (
                                      <Image src={optimizeCloudinaryUrl(color.image)} alt={color.name} fill className="object-cover" unoptimized={true} />
                                  ) : (
                                      <div className="w-full h-full" style={{ backgroundColor: color.hex || '#ccc' }}></div>
                                  )}
                              </div>
                              <span className="text-xs font-bold text-gray-700 truncate w-full text-center group-hover:text-aura-gold">{color.name}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
           <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full z-50 border border-white/20 shadow-xl">
               <button onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))} className="text-white hover:text-aura-gold transition-colors"><Minus size={20}/></button>
               <span className="text-white text-xs font-bold w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
               <button onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))} className="text-white hover:text-aura-gold transition-colors"><Plus size={20}/></button>
           </div>
           
           <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 text-white bg-white/10 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all hover:scale-110 z-50 border border-white/20"><X size={24}/></button>
           
           <div 
               className="relative w-full h-full max-w-6xl overflow-auto flex items-center justify-center scrollbar-hide cursor-zoom-in"
               onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)}
           >
             {isVideoFile(lightboxImage) ? (
                 <video src={lightboxImage} autoPlay muted loop playsInline poster={optimizeCloudinaryUrl(product.main_image)} className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" />
             ) : (
                 <div className="relative transition-transform duration-300 ease-out origin-center" style={{ transform: `scale(${zoomLevel})`, width: '100%', height: '100%', minHeight: '50vh' }}>
                     <Image src={lightboxImage} alt="Zoomed view" fill className="object-contain drop-shadow-2xl" quality={100} priority unoptimized={true} />
                 </div>
             )}
           </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-20 md:pt-28">
        
        <div className="w-full bg-gradient-to-r from-[#D4AF37] via-[#F9E596] to-[#D4AF37] py-3 rounded-xl mb-6 z-40 relative shadow-[0_5px_15px_rgba(212,175,55,0.3)] border border-[#8B7355]/30">
            <div className="flex justify-center items-center gap-2 md:gap-4 px-2">
                <Truck size={18} className="text-[#1E1B18] animate-bounce" />
                <p className="text-[#1E1B18] font-black text-[10px] md:text-sm tracking-[0.10em] md:tracking-[0.20em] uppercase text-center drop-shadow-sm">
                    100% Free Delivery & Up To 30% Off
                </p>
                <Gift size={18} className="text-[#1E1B18] animate-pulse" />
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-xs mb-3 font-bold uppercase tracking-widest text-aura-brown/60">
            <Link href="/" className="hover:text-aura-gold flex items-center transition-colors"><Home size={12} className="mr-1"/> Home</Link>
            <span>/</span>
            
            {product.category && (
                <>
                    <Link href={`/${product.category.toLowerCase()}`} className="hover:text-aura-gold transition-colors">
                        {product.category}
                    </Link>
                    <span>/</span>
                </>
            )}
            
            {product.sub_category && (
                <>
                    <Link href={`/${product.sub_category.toLowerCase()}`} className="hover:text-aura-gold transition-colors">
                        {product.sub_category}
                    </Link>
                    <span>/</span>
                </>
            )}

            <span className="truncate max-w-[120px] md:max-w-none text-aura-brown drop-shadow-sm" title={product.name}>
                {displayShortName}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 mb-6">
          
          <div className="lg:col-span-6 h-fit lg:sticky lg:top-24 self-start flex flex-col w-full">
            <div className="flex gap-2.5 w-full">
                <div 
                    className="flex-1 relative aspect-square bg-[#FDFBF7] rounded-[1rem] overflow-hidden shadow-[0_8px_25px_rgba(212,175,55,0.15)] border border-aura-gold/40 group touch-pan-y hover:shadow-[0_12px_35px_rgba(212,175,55,0.25)] transition-all duration-300"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
                     {displayDiscount > 0 && (
                         <span className="bg-gradient-to-r from-red-700 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest shadow-md border border-red-400/30 animate-pulse">
                             -{displayDiscount}%
                         </span>
                     )}
                     <button onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }} className={`pointer-events-auto bg-white/90 backdrop-blur p-2 rounded-full shadow-md transition-transform hover:scale-110 border ${isLiked ? 'text-red-500 border-red-200' : 'text-aura-brown border-aura-gold/30 hover:text-red-500'}`}><Heart size={16} fill={isLiked ? "currentColor" : "none"} /></button>
                     <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); toast.success("Link Copied!"); }} className="pointer-events-auto bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-aura-brown transition-transform hover:scale-110 border border-aura-gold/30 hover:text-aura-gold"><Share2 size={16} /></button>
                  </div>
                  <button onClick={() => currentDisplayMedia && setLightboxImage(currentDisplayMedia.url)} className="absolute bottom-2 right-2 z-20 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-aura-brown border border-aura-gold/30 hover:text-aura-gold transition-all"><Maximize2 size={14} /></button>
                  
                  {currentDisplayMedia && (
                    isVideoFile(currentDisplayMedia.url) ? (
                        <video key={currentDisplayMedia.url} autoPlay muted loop playsInline poster={optimizeCloudinaryUrl(product.main_image)} className="object-cover w-full h-full cursor-pointer" onClick={() => setLightboxImage(currentDisplayMedia.url)}>
                            <source src={currentDisplayMedia.url} type="video/mp4" />
                        </video>
                    ) : (
                        <Image src={currentDisplayMedia.url} alt={seoAltText} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-2 cursor-zoom-in transition-all duration-500 group-hover:scale-105" unoptimized={true} onClick={() => setLightboxImage(currentDisplayMedia.url)} />
                    )
                  )}
                </div>

                {hasColorMedia && (
                    <div className="w-12 md:w-16 flex flex-col gap-2.5 overflow-y-auto scrollbar-hide shrink-0 py-0.5">
                        {unifiedMedia.map((m, i) => {
                            if (m.type === 'main' || m.type === 'color') {
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => { setMediaIndex(i); }} 
                                        className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-[2px] transition-all duration-200 shrink-0 ${mediaIndex === i ? 'border-aura-brown scale-105 shadow-md' : 'border-aura-gold/30 opacity-80 hover:opacity-100 hover:border-aura-gold/80'}`}
                                    >
                                        <Image src={m.url} alt="Color Variant" fill className="object-cover" sizes="60px" unoptimized={true} />
                                    </button>
                                )
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>

            {hasGalleryMedia && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                   {unifiedMedia.map((m, i) => {
                       if (m.type === 'hover' || m.type === 'gallery' || m.type === 'video') {
                           return (
                             <button key={i} onClick={() => setMediaIndex(i)} className={`relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden border-[2px] transition-all duration-200 ${mediaIndex === i ? 'border-aura-brown shadow-md scale-105' : 'border-aura-gold/30 opacity-80 hover:opacity-100 hover:border-aura-gold/80'}`}>
                                 {isVideoFile(m.url) ? (
                                     <div className="w-full h-full flex items-center justify-center relative bg-[#FDFBF7]">
                                         <Image src={optimizeCloudinaryUrl(product.main_image)} alt="Video Preview" fill className="object-cover opacity-60" sizes="60px" unoptimized={true} />
                                         <div className="absolute inset-0 bg-black/20"></div> 
                                         <Play size={16} className="relative z-10 text-white drop-shadow-md" fill="currentColor"/>
                                     </div>
                                 ) : (
                                     <Image src={m.url} alt="Gallery Thumb" fill className="object-cover" sizes="60px" quality={60} unoptimized={true} />
                                 )}
                             </button>
                           )
                       }
                       return null;
                   })}
                </div>
            )}
          </div>

          <div className="lg:col-span-6 flex flex-col">
             <div className="mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-1 bg-gradient-to-r from-white to-[#FAF8F1] border border-aura-gold/40 text-aura-brown text-[9px] font-bold tracking-widest uppercase rounded shadow-sm">{product.sub_category || product.category}</span>
                    {!isOutOfStock 
                        ? <span className="px-2.5 py-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-300 text-green-800 text-[9px] font-bold tracking-widest uppercase rounded flex items-center gap-1.5 shadow-sm"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span> IN STOCK</span>
                        : <span className="px-2.5 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 text-[9px] font-bold tracking-widest uppercase rounded shadow-sm">OUT OF STOCK</span>
                    }
                </div>
                
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-aura-brown mb-3 leading-tight capitalize tracking-tight drop-shadow-sm" title={product.name}>
                  {displayShortName}
                </h1>
                
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-aura-brown to-yellow-700 drop-shadow-sm">Rs {totalPrice.toLocaleString()}</span>
                    {product.original_price > product.price && (
                        <span className="text-sm md:text-base font-bold text-aura-brown/40 line-through decoration-red-500/70 decoration-2">Rs {product.original_price.toLocaleString()}</span>
                    )}
                </div>
             </div>

             {product.colors && product.colors.length > 1 && (
                <div className="mb-3 p-4 rounded-2xl border border-aura-gold/30 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-bold text-aura-brown uppercase tracking-widest">Select Finish {quantity > 1 ? "(Item 1)" : ""} <span className="text-red-500 drop-shadow-sm">*</span></span>
                        <span className="text-[11px] text-aura-gold font-bold drop-shadow-sm bg-aura-gold/10 px-2 py-0.5 rounded-md">{selectedColorIndex !== null ? product.colors[selectedColorIndex]?.name : "Required"}</span>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {product.colors.map((color: any, index: number) => (
                            <button 
                                key={index} 
                                onClick={() => handleColorToggle(index, color.image)} 
                                className={`relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 border-2 ${
                                    selectedColorIndex === index 
                                    ? 'border-aura-brown bg-gradient-to-b from-aura-gold/10 to-transparent shadow-md scale-[1.02]' 
                                    : 'border-gray-100 bg-gray-50/50 hover:border-aura-gold/50 hover:bg-white'
                                }`}
                                title={color.name}
                            >
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
                                    {color.image ? (
                                        <Image src={optimizeCloudinaryUrl(color.image)} alt={color.name} fill className="object-cover" unoptimized={true} />
                                    ) : (
                                        <div className="w-full h-full" style={{ backgroundColor: color.hex }}></div>
                                    )}
                                    {selectedColorIndex === index && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                            <Check size={16} className="text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-bold text-center leading-tight truncate w-full px-1 ${selectedColorIndex === index ? 'text-aura-brown' : 'text-gray-500'}`}>{color.name}</span>
                            </button>
                        ))}
                    </div>

                    {quantity > 1 && extraColors.map((extColorIdx, extI) => (
                        <div key={extI} className="mt-5 pt-4 border-t border-aura-gold/20">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-bold text-aura-brown uppercase tracking-widest">Select Finish (Item {extI + 2}) <span className="text-red-500 drop-shadow-sm">*</span></span>
                                <span className="text-[11px] text-aura-gold font-bold drop-shadow-sm bg-aura-gold/10 px-2 py-0.5 rounded-md">{extColorIdx !== null ? product.colors[extColorIdx]?.name : "Required"}</span>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                                {product.colors.map((color: any, index: number) => (
                                    <button 
                                        key={index} 
                                        onClick={() => {
                                            const newExtras = [...extraColors];
                                            newExtras[extI] = index;
                                            setExtraColors(newExtras);
                                            if (color.image) {
                                                const mediaIdx = unifiedMedia.findIndex(m => m.url === optimizeCloudinaryUrl(color.image));
                                                if (mediaIdx !== -1) setMediaIndex(mediaIdx);
                                            }
                                        }} 
                                        className={`relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 border-2 ${
                                            extColorIdx === index 
                                            ? 'border-aura-brown bg-gradient-to-b from-aura-gold/10 to-transparent shadow-md scale-[1.02]' 
                                            : 'border-gray-100 bg-gray-50/50 hover:border-aura-gold/50 hover:bg-white'
                                        }`}
                                        title={color.name}
                                    >
                                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
                                            {color.image ? (
                                                <Image src={optimizeCloudinaryUrl(color.image)} alt={color.name} fill className="object-cover" unoptimized={true} />
                                            ) : (
                                                <div className="w-full h-full" style={{ backgroundColor: color.hex }}></div>
                                            )}
                                            {extColorIdx === index && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                                    <Check size={16} className="text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] md:text-[10px] font-bold text-center leading-tight truncate w-full px-1 ${extColorIdx === index ? 'text-aura-brown' : 'text-gray-500'}`}>{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
             )}

             {sizesAvailable.length > 0 && (
                <div className="mb-3 p-3 rounded-xl border border-aura-gold/30 bg-gradient-to-r from-[#FDFBF7] to-[#F5EEDC] shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-aura-brown uppercase tracking-widest">Select Size <span className="text-red-500 drop-shadow-sm">*</span></span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {sizesAvailable.map((size: string) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 border-2 ${
                                    selectedSize === size 
                                    ? 'border-aura-gold bg-gradient-to-r from-aura-gold to-yellow-700 text-white shadow-[0_4px_15px_rgba(212,175,55,0.4)] scale-105' 
                                    : 'border-aura-gold/30 text-aura-brown hover:border-aura-gold hover:bg-aura-gold/10'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
             )}

             {isWatch && (specs.luminous || specs.date_display) && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {specs.luminous && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-aura-gold/30 rounded-lg text-[10px] font-bold text-aura-brown uppercase shadow-sm"><Sun size={12} className="text-yellow-600 drop-shadow-sm"/> Luminous</span>}
                    {specs.date_display && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-aura-gold/30 rounded-lg text-[10px] font-bold text-aura-brown uppercase shadow-sm"><Calendar size={12} className="text-blue-500 drop-shadow-sm"/> Date</span>}
                </div>
             )}

             {specs.extra_notes && (
                <div className="mb-3 p-4 rounded-xl bg-gradient-to-br from-[#2A241D] to-[#1A1612] border border-aura-gold/40 shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                        <Sparkles className="text-aura-gold animate-pulse" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-aura-gold drop-shadow-sm">Special Note</span>
                    </div>
                    <p className="text-xs text-[#F5EEDC] font-medium leading-relaxed relative z-10 italic drop-shadow-sm">{specs.extra_notes}</p>
                </div>
             )}

             <div className="space-y-2 mb-4">
                <div onClick={() => setIsGift(!isGift)} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isGift ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-aura-gold shadow-sm' : 'bg-white border-aura-gold/20'}`}>
                    <div className="flex items-center gap-2.5"><Gift size={16} className={isGift ? 'text-aura-gold drop-shadow-md' : 'text-aura-brown/60'}/><span className="text-xs font-bold text-aura-brown uppercase tracking-wide">Add Gift Wrap</span></div>
                    <span className="text-[11px] font-bold text-aura-gold drop-shadow-sm">+Rs {GIFT_COST}</span>
                </div>
                <div onClick={() => setBoxType(boxType === 'black' ? 'none' : 'black')} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${boxType === 'black' ? 'bg-gradient-to-r from-[#2A241D] to-[#1A1612] border-aura-gold/50 shadow-md' : 'bg-white border-aura-gold/20'}`}>
                    <div className="flex items-center gap-2.5"><Package size={16} className={boxType === 'black' ? 'text-aura-gold drop-shadow-md' : 'text-aura-brown/60'}/><span className={`text-xs font-bold uppercase tracking-wide ${boxType === 'black' ? 'text-white' : 'text-aura-brown'}`}>Premium Black Box</span></div>
                    <span className={`text-[11px] font-bold drop-shadow-sm ${boxType === 'black' ? 'text-aura-gold' : 'text-aura-brown/60'}`}>+Rs 200</span>
                </div>
                {isWatch && (
                  <div onClick={() => setBoxType(boxType === 'rolex' ? 'none' : 'rolex')} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${boxType === 'rolex' ? 'bg-gradient-to-r from-[#004A2A] to-[#00331D] border-[#004A2A] shadow-md' : 'bg-white border-aura-gold/20'}`}>
                      <div className="flex items-center gap-2.5"><Package size={16} className={boxType === 'rolex' ? 'text-white drop-shadow-md' : 'text-aura-brown/60'}/><span className={`text-xs font-bold uppercase tracking-wide ${boxType === 'rolex' ? 'text-white' : 'text-aura-brown'}`}>Official Rolex Box</span></div>
                      <span className={`text-[11px] font-bold drop-shadow-sm ${boxType === 'rolex' ? 'text-green-200' : 'text-aura-brown/60'}`}>+Rs 300</span>
                  </div>
                )}
             </div>

             {/* 🚀 ESTIMATED DELIVERY TIMELINE */}
             <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-[#FFFFFF] via-[#FDFBF7] to-[#F5EEDC] border border-aura-gold/40 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-aura-gold/10 rounded-full blur-3xl pointer-events-none"></div>
                <p className="text-[10px] font-bold text-aura-brown uppercase tracking-widest mb-6 text-center relative z-10">Estimated Delivery Timeline</p>
                <div className="flex justify-between items-center relative px-2 md:px-8 z-10">
                    <div className="absolute top-5 left-[10%] right-[50%] border-t-2 border-[#C8A97E] -translate-y-1/2 z-0"></div>
                    <div className="absolute top-5 left-[50%] right-[10%] border-t-2 border-dashed border-[#C8A97E]/60 -translate-y-1/2 z-0"></div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C8A97E] text-white flex items-center justify-center shadow-md"><ShoppingBag size={18}/></div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-0.5">Order</span>
                            <span className="text-xs font-bold text-aura-brown">{formatShortDate(todayDate)}</span>
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C8A97E] text-white flex items-center justify-center shadow-md"><Truck size={18}/></div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-0.5">Dispatch</span>
                            <span className="text-xs font-bold text-aura-brown">{formatShortDate(dispatchDate)}</span>
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C8A97E] text-[#C8A97E] flex items-center justify-center bg-white shadow-[0_0_15px_rgba(212,175,55,0.2)]"><MapPin size={18}/></div>
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-aura-gold uppercase block tracking-wider mb-0.5">Delivery</span>
                            <span className="text-xs font-bold text-aura-brown">{formatShortDate(deliveryDate)}</span>
                        </div>
                    </div>
                </div>
             </div>

             <div className="flex flex-col gap-3 mb-6 mt-4">
                 {/* 🚀 OUT OF STOCK LOGIC APPLIED HERE */}
                 {isOutOfStock ? (
                     <button 
                         onClick={handleNotifyMe} 
                         className="w-full h-12 md:h-14 bg-gray-200 text-gray-500 rounded-full font-bold text-xs md:text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-inner border border-gray-300"
                     >
                         <BellRing size={18}/> NOTIFY ME WHEN AVAILABLE
                     </button>
                 ) : (
                     <>
                         <div className="flex gap-3 h-12 md:h-14">
                             <div className="flex items-center bg-white border border-aura-gold/30 rounded-full px-3 shadow-sm">
                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-aura-gold text-aura-brown/60"><Minus size={16}/></button>
                                 <span className="w-8 text-center font-bold text-sm text-aura-brown">{quantity}</span>
                                 <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-aura-gold text-aura-brown/60"><Plus size={16}/></button>
                             </div>
                             <button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-aura-brown to-yellow-800 text-white rounded-full font-bold text-xs md:text-sm tracking-widest flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_20px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all border border-aura-gold/40">
                                 <ShoppingBag size={18}/> ADD TO BAG
                             </button>
                         </div>
                         <button onClick={handleAddToCart} className="w-full h-12 md:h-14 border-2 border-aura-gold/40 text-aura-brown bg-transparent rounded-full font-bold text-xs md:text-sm tracking-widest hover:bg-aura-gold/10 transition-all shadow-sm">
                             ORDER NOW
                         </button>
                     </>
                 )}
             </div>

             <div className="border-t border-aura-gold/30">
                <div className="border-b border-aura-gold/20 group">
                  <button onClick={() => setOpenSection(openSection === 'desc' ? null : 'desc')} className="w-full flex justify-between items-center py-3 text-xs font-bold uppercase tracking-widest text-aura-brown hover:text-aura-gold transition-colors">Description <ChevronDown size={14} className={`transition-transform duration-300 text-aura-brown/60 group-hover:text-aura-gold ${openSection === 'desc' ? 'rotate-180 text-aura-gold' : ''}`}/></button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === 'desc' ? 'max-h-[800px] pb-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <p className="text-[11px] text-aura-brown/80 font-medium leading-relaxed px-1">{product.description}</p>
                  </div>
                </div>
                
                <div className="border-b border-aura-gold/20 group">
                  <button onClick={() => setOpenSection(openSection === 'spec' ? null : 'spec')} className="w-full flex justify-between items-center py-3 text-xs font-bold uppercase tracking-widest text-aura-brown hover:text-aura-gold transition-colors">Details & Specs <ChevronDown size={14} className={`transition-transform duration-300 text-aura-brown/60 group-hover:text-aura-gold ${openSection === 'spec' ? 'rotate-180 text-aura-gold' : ''}`}/></button>
                  <div className={`overflow-hidden transition-all duration-300 ${openSection === 'spec' ? 'max-h-[1500px] pb-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] px-1">
                        {Object.entries(specs).filter(([k, v]) => {
                            const isHiddenField = allHiddenKeys.includes(k);
                            const isEmptyValue = v === null || v === "" || v === false || String(v).toLowerCase() === "n/a" || String(v).toLowerCase() === "none";
                            return !isHiddenField && !isEmptyValue;
                        }).map(([k, v]) => {
                            const isLongText = String(v).length > 25; 
                            return (
                                <li key={k} className={`flex flex-col border-b border-dashed border-aura-gold/30 pb-1.5 hover:bg-aura-gold/5 transition-colors rounded ${isLongText ? 'col-span-2' : ''}`}>
                                    <span className="text-aura-brown/60 uppercase font-bold tracking-wider text-[9px] mb-0.5">{k.replace(/_/g, " ")}</span>
                                    <span className="text-aura-brown font-bold leading-snug break-words whitespace-normal pr-1">{v === true ? "Yes" : String(v)}</span>
                                </li>
                            )
                        })}
                    </ul>
                  </div>
                </div>

                {(specs.shipping_text || specs.return_policy || specs.warranty) && (
                  <div className="border-b border-aura-gold/20 group">
                    <button onClick={() => setOpenSection(openSection === 'policy' ? null : 'policy')} className="w-full flex justify-between items-center py-3 text-xs font-bold uppercase tracking-widest text-aura-brown hover:text-aura-gold transition-colors">Delivery & Policies <ChevronDown size={14} className={`transition-transform duration-300 text-aura-brown/60 group-hover:text-aura-gold ${openSection === 'policy' ? 'rotate-180 text-aura-gold' : ''}`}/></button>
                    <div className={`overflow-hidden transition-all duration-300 ${openSection === 'policy' ? 'max-h-[800px] pb-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col gap-4 px-1 text-[11px] text-aura-brown/80 font-medium leading-relaxed">
                          {specs.warranty && <div><strong className="text-aura-brown block uppercase text-[9px] tracking-widest mb-0.5">Warranty</strong>{specs.warranty}</div>}
                          {specs.shipping_text && <div><strong className="text-aura-brown block uppercase text-[9px] tracking-widest mb-0.5">Shipping Details</strong>{specs.shipping_text}</div>}
                          {specs.return_policy && <div><strong className="text-aura-brown block uppercase text-[9px] tracking-widest mb-0.5">Return Policy</strong>{specs.return_policy}</div>}
                      </div>
                    </div>
                  </div>
                )}
             </div>
             
          </div>
        </div>

        {/* 🚀 WHY CHOOSE AURA-X */}
        <div className="mb-12 max-w-5xl mx-auto border border-aura-gold/20 rounded-2xl overflow-hidden bg-white shadow-sm mt-8">
            <div className="bg-[#FDFBF7] p-4 border-b border-aura-gold/20 text-center">
                <h4 className="text-sm font-bold text-aura-brown tracking-[0.2em] uppercase">Why Choose AURA-X</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-sm">
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Flame className="text-red-500" size={28}/>
                    <span className="font-bold text-aura-brown">Lowest Prices</span>
                    <span className="text-[10px] text-gray-500">Unbeatable market rates</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <ShieldCheck className="text-aura-gold" size={28}/>
                    <span className="font-bold text-aura-brown">Authentic Sourced</span>
                    <span className="text-[10px] text-gray-500">100% Genuine Quality</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Check className="text-aura-gold" size={28} />
                    <span className="font-bold text-aura-brown">Premium Craft</span>
                    <span className="text-[10px] text-gray-500">Flawless design standards</span>
                </div>
                <div className="p-6 flex flex-col items-center text-center gap-2 hover:bg-gray-50 transition-colors">
                    <Truck className="text-aura-gold" size={28}/>
                    <span className="font-bold text-aura-brown">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-500">Pay only when you receive</span>
                </div>
            </div>
        </div>

        {/* 🚀 OUR JOURNEY SO FAR */}
        <div className="mb-12 max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-[#2A241D] to-[#1A1612] border border-aura-gold/30 shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden mt-8 p-6 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-aura-gold/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-aura-gold/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Our Journey So Far</h2>
                <p className="text-[10px] md:text-xs font-medium text-aura-gold uppercase tracking-widest">Trusted across Pakistan</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
                <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <AnimatedCounter end={1250} suffix="+" />
                    <span className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase text-center">Happy Customers</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <AnimatedCounter end={1500} suffix="+" />
                    <span className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase text-center">Orders Delivered</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <AnimatedCounter end={85} suffix="+" />
                    <span className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase text-center">Cities Served</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <AnimatedCounter end={45} suffix="+" />
                    <span className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium tracking-wider uppercase text-center">Premium Models</span>
                </div>
            </div>
        </div>

        {/* 🚀 CUSTOMER REVIEWS (Moving Marquee & Real Product Reviews) */}
        <div className="mb-10 max-w-6xl mx-auto overflow-hidden border-t border-b border-aura-gold/20 py-8 bg-[#FAF8F1]">
            <div className="flex flex-col items-center text-center mb-6 px-4">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-aura-brown drop-shadow-sm flex items-center justify-center gap-2">
                   <Star size={20} className="text-aura-gold" fill="currentColor"/> Verified Reviews <Star size={20} className="text-aura-gold" fill="currentColor"/>
                </h2>
                <div className="flex justify-between items-center w-full max-w-sm mt-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">What our customers say</p>
                    <button onClick={() => setShowReviewModal(true)} className="bg-aura-gold text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-yellow-600 transition flex items-center gap-1 shadow-sm">
                        <Edit3 size={12}/> Write a Review
                    </button>
                </div>
            </div>
            
            {/* 🚀 1. Real Reviews for this specific product (if any) */}
            {reviews.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-4 custom-scrollbar mb-6 snap-x">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="w-[280px] md:w-[320px] bg-white p-5 rounded-2xl shadow-sm border border-aura-gold/30 flex-shrink-0 snap-center flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-aura-brown text-sm flex items-center gap-1">
                                        {review.customer_name} <Check size={12} className="text-green-500 bg-green-50 rounded-full p-0.5"/>
                                    </p>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">{review.city}, PK</p>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < review.rating ? "text-aura-gold" : "text-gray-200"} fill={i < review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic relative mb-3 flex-1">
                                <Quote size={12} className="inline text-aura-gold/40 mr-1 -mt-1" />
                                {review.comment}
                            </p>
                            {review.image_url && (
                                <div className="relative w-full h-32 rounded-xl overflow-hidden mt-auto border border-gray-100">
                                    <Image src={optimizeCloudinaryUrl(review.image_url)} alt="Review" fill className="object-cover hover:scale-105 transition-transform duration-500" unoptimized={true} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 🚀 2. Generic Scrolling Reviews (Fetched from DB randomly) */}
            <div className="relative w-full flex overflow-hidden group">
                <div className="flex gap-4 md:gap-6 px-4 animate-scroll whitespace-nowrap min-w-max opacity-80">
                    {/* Double the array for seamless infinite scrolling */}
                    {[...genericReviews, ...genericReviews].map((review, idx) => (
                        <div key={`generic-${idx}`} className="w-[280px] md:w-[320px] bg-white/60 p-5 rounded-2xl shadow-sm border border-aura-gold/10 inline-block whitespace-normal flex-shrink-0">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-aura-brown text-sm">{review.customer_name}</p>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">{review.city || "Pakistan"}</p>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < review.rating ? "text-aura-gold" : "text-gray-200"} fill={i < review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic relative">
                                <Quote size={12} className="inline text-aura-gold/40 mr-1 -mt-1" />
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#FAF8F1] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#FAF8F1] to-transparent z-10 pointer-events-none"></div>
            </div>
        </div>

        {/* 🚀 RECENTLY VIEWED (Cache Memory) */}
        {recentlyViewed.length > 0 && (
          <div className="border-t border-aura-gold/30 pt-6 mt-4">
               <div className="flex justify-between items-center mb-4">
                   <h2 className="text-xl md:text-2xl font-serif font-bold text-aura-brown drop-shadow-sm">Recently Viewed</h2>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  {recentlyViewed.map((p: any) => <ProductCard key={p.id} product={p} />)}
               </div>
          </div>
        )}

        {/* 🚀 SIMILAR DISCOVERIES (1 Per Category) */}
        <div className="border-t border-aura-gold/30 pt-6 mt-4">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl md:text-2xl font-serif font-bold text-aura-brown drop-shadow-sm">Similar Discoveries</h2>
             </div>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
        </div>
      </div>
      
      {/* 🚀 MOBILE BOTTOM BAR (With Out of Stock Logic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-aura-gold/30 p-2.5 z-[60] flex justify-center pb-safe shadow-[0_-5px_15px_rgba(212,175,55,0.15)]">
         {isOutOfStock ? (
             <button onClick={handleNotifyMe} className="w-full max-w-[320px] h-12 bg-gray-200 text-gray-500 rounded-full font-bold text-[10px] tracking-widest flex items-center justify-center gap-2 border border-gray-300">
                <BellRing size={14}/> NOTIFY ME
             </button>
         ) : (
             <button onClick={handleAddToCart} className="w-full max-w-[320px] h-12 bg-gradient-to-r from-aura-brown to-yellow-800 text-white rounded-full font-bold text-xs tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(212,175,55,0.3)] active:scale-95 transition-all border border-aura-gold/40">
                <span className="bg-white/20 p-1 rounded-full"><ShoppingBag size={14}/></span> ADD TO BAG
             </button>
         )}
      </div>
    </main>
  );
}