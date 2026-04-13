"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
// 🚀 SUPABASE IMPORT ZAROORI HAI AUTO-SAVE KE LIYE
import { supabase } from "@/lib/supabase"; 
import { ArrowLeft, User, Mail, Phone, MapPin, ArrowRight, Loader2, ShieldCheck, ShoppingBag, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser';

export default function CheckoutPage() {
  const { cart, clearCart, cartTotal, shippingCost, finalTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 🚀 COMPACT STATE: No Zip Code, Single Name Field
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", city: ""
  });

  // 🚀 SILENT SAVER STATE (For Incomplete Orders)
  const draftIdRef = useRef<number | null>(null);

  // 🚀 AUTO-SAVE FUNCTION (Runs silently when user stops typing for 2 seconds)
  useEffect(() => {
    if (cart.length === 0) return;

    const saveIncompleteOrder = async () => {
      // Sirf tab save karega jab Name ya Phone mein kuch likha ho
      if (formData.fullName.length > 2 || formData.phone.length > 5) {
        try {
          const payload = {
            customer_name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            city: formData.city,
            address: formData.address,
            cart_details: JSON.stringify(cart),
            total_amount: finalTotal,
            status: 'incomplete'
          };

          if (!draftIdRef.current) {
            // First time insert
            const { data, error } = await supabase.from('incomplete_orders').insert([payload]).select().single();
            if (data) draftIdRef.current = data.id;
          } else {
            // Update existing draft
            await supabase.from('incomplete_orders').update(payload).eq('id', draftIdRef.current);
          }
        } catch (error) {
          console.error("Silent save failed", error);
        }
      }
    };

    const timer = setTimeout(saveIncompleteOrder, 2000);
    return () => clearTimeout(timer);
  }, [formData, cart, finalTotal]);


  // 🚀 WHATSAPP ORDER GENERATOR
  const handleWhatsAppOrder = () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error("Please fill Name, Phone, City, and Address to order via WhatsApp.");
      return;
    }

    let msg = `*NEW ORDER (Via WhatsApp)* 🛍️\n\n*Items:*\n`;
    cart.forEach(i => {
      msg += `▪️ ${i.name} (x${i.quantity})\n  Variant: ${i.color || 'Standard'}${i.isGift ? ' [Gift]' : ''}${i.addBox ? ' [Box]' : ''}\n`;
    });
    
    msg += `\n*Total Payable:* Rs ${finalTotal.toLocaleString()}\n\n`;
    msg += `*Customer Details:*\nName: ${formData.fullName}\nPhone: ${formData.phone}\nCity: ${formData.city}\nAddress: ${formData.address}`;
    
    // ⚠️ Yahan Apna Business WhatsApp Number likhein (92 ke sath, bina + ya 0 ke)
    const whatsappNumber = "923369871278"; 
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare Order Items
      const orderItems = cart.map(item => ({
        id: item.id, name: item.name, price: item.price, quantity: item.quantity,
        color: item.color || "Standard", image: item.image, isGift: item.isGift, addBox: item.addBox
      }));

      // Call API to Save Order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.fullName,
            email: formData.email || "No Email",
            phone: formData.phone,
            address: formData.address,
          },
          items: orderItems,
          total: finalTotal, 
          city: formData.city
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Order failed");

      const orderCode = result.orderId;

      // Agar order successfully place ho gaya, toh 'incomplete_orders' ka status update kar do
      if (draftIdRef.current) {
        await supabase.from('incomplete_orders').update({ status: 'completed' }).eq('id', draftIdRef.current);
      }

      // 🚀 SMART EMAIL PAYLOAD
      const formattedItemsForEmail = cart.map(i => 
        `• ${i.name} (x${i.quantity})\n   Variant: ${i.color || 'Standard'}${i.isGift ? ' [Gift Wrapped]' : ''}${i.addBox ? ' [Premium Box]' : ''}`
      ).join('\n\n');

      const customerEmailParams = {
        email_subject: `Order Confirmation #${orderCode}`,
        to_email: formData.email || "tahseenalam345@gmail.com", // Fallback to admin if no email provided
        to_name: formData.fullName,
        email_heading: "Thank You For Your Order!",
        order_id: orderCode,
        email_message: `Your order has been received. We will dispatch your masterpiece to ${formData.city} soon.`,
        order_items: formattedItemsForEmail,
        total_amount: `Rs ${finalTotal.toLocaleString()}`,
        customer_name: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address
      };

      const adminEmailParams = {
        ...customerEmailParams,
        to_email: "tahseenalam345@GMAIL.COM",
        to_name: "Admin",
        email_heading: "⚠️ NEW ORDER RECEIVED",
        email_subject: `New Order Alert: #${orderCode} - Rs ${finalTotal.toLocaleString()}`,
        email_message: `A new order has been placed by ${formData.fullName}. Please check Supabase for complete details.`
      };

      // Send Emails (Only send to customer if they provided an email)
      const emailPromises = [emailjs.send('service_wfw89r5', 'template_ccsvo5z', adminEmailParams, 'OQmFriQxX0btmE7W3')];
      if (formData.email) {
          emailPromises.push(emailjs.send('service_wfw89r5', 'template_ccsvo5z', customerEmailParams, 'OQmFriQxX0btmE7W3'));
      }
      
      await Promise.all(emailPromises);

      toast.success("Order Placed Successfully!");
      clearCart();
      router.push(`/success?id=${orderCode}&total=${finalTotal}&name=${encodeURIComponent(formData.fullName)}`);

    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
             <ShoppingBag size={32} />
          </div>
          <h1 className="text-2xl font-serif text-aura-brown mb-2 font-bold">Your Cart is Empty</h1>
          <Link href="/" className="bg-aura-brown text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-aura-gold transition-all flex items-center gap-2 mt-4">
            BROWSE COLLECTION <ArrowRight size={16}/>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 md:pt-32">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-aura-gold/20 flex flex-col md:flex-row">
          
          {/* 🚀 LEFT SIDE: ULTRA-COMPACT FORM */}
          <div className="flex-1 p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-aura-brown">Delivery Details</h1>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider border border-green-200">COD Available</span>
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              
              {/* Row 1: Name & Phone (Side by Side on all screens) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required id="fullName" name="fullName" onChange={handleInputChange} type="text" placeholder="Full Name *" className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                </div>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required id="phone" name="phone" onChange={handleInputChange} type="tel" placeholder="Phone No. *" className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                </div>
              </div>

              {/* Row 2: City & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required id="city" name="city" onChange={handleInputChange} type="text" placeholder="City *" className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input id="email" name="email" onChange={handleInputChange} type="email" placeholder="Email (Optional)" className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                </div>
              </div>

              {/* Row 3: Address */}
              <div className="relative">
                  <textarea required id="address" name="address" onChange={handleInputChange} placeholder="Complete Delivery Address (House #, Street, Area) *" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold h-16 resize-none transition-colors" />
              </div>

              {/* 🚀 COMPACT SUMMARY ON MOBILE */}
              <div className="mt-4 p-4 bg-[#FAF8F1] rounded-xl border border-aura-gold/30">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 font-bold">Subtotal ({cart.length} items)</span>
                      <span className="text-xs font-bold text-aura-brown">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                      <span className="text-xs text-gray-600 font-bold">Delivery</span>
                      {shippingCost === 0 ? <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Free</span> : <span className="text-xs font-bold text-aura-brown">Rs {shippingCost}</span>}
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Total</span>
                      <span className="text-xl font-serif font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span>
                  </div>
              </div>

              {/* 🚀 BUTTONS (Place Order & WhatsApp Side by Side) */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                  <button 
                    type="submit" 
                    form="checkout-form" 
                    disabled={loading} 
                    className="flex-1 bg-gradient-to-r from-[#1A1612] to-[#3A2A18] text-white py-3.5 rounded-xl font-bold text-[11px] md:text-xs tracking-widest uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : <><ShoppingBag size={16} /> Place Order (COD)</>}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleWhatsAppOrder}
                    disabled={loading} 
                    className="flex-1 bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white py-3.5 rounded-xl font-bold text-[11px] md:text-xs tracking-widest uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Order Via WhatsApp
                  </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                  <ShieldCheck size={12} className="text-aura-gold" /> 128-bit Encrypted Checkout
              </div>

            </form>
          </div>
          
          {/* 🚀 RIGHT SIDE: ITEMS PREVIEW (Hidden on small mobile, visible on tablet/desktop) */}
          <div className="hidden md:block w-72 bg-gray-50 p-6 border-l border-gray-100">
             <h3 className="font-serif text-sm font-bold mb-4 uppercase tracking-widest text-aura-brown/70">Your Cart</h3>
             <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="relative w-12 h-12 bg-gray-50 rounded flex-shrink-0 border border-gray-100">
                            <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-multiply p-1" unoptimized={true} />
                            <span className="absolute -top-1 -right-1 bg-aura-gold text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-aura-brown truncate" title={item.name}>{item.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 truncate">{item.color || "Standard"}</p>
                        </div>
                    </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}