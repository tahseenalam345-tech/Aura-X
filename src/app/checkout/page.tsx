"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase"; 
import { ArrowLeft, ArrowRight, Lock, MapPin, Phone, User, Mail, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { sendOrderEmails } from "@/lib/emailService"; 

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: ""
  });

  const FREE_SHIPPING_THRESHOLD = 5000;
  const STANDARD_SHIPPING_COST = 250;
  
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : STANDARD_SHIPPING_COST;
  const finalTotal = cartTotal + shippingCost;

  // --- GENERATE SHORT ID FUNCTION ---
  const generateOrderCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ORD-${result}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const shortId = generateOrderCode();

        const orderItems = cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color || "Standard",
            image: item.image,
            isGift: item.isGift,
            addBox: item.addBox
        }));

        // 1. SAVE TO DATABASE
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    order_code: shortId,
                    customer_name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: `${formData.address}, ${formData.postalCode}`,
                    city: formData.city,
                    total: finalTotal,
                    status: 'Processing', 
                    items: orderItems,
                    admin_notes: ""
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // 2. SEND EMAILS (Background Process)
        if (data) {
            await sendOrderEmails(data); 
        }

        // 3. CLEANUP & REDIRECT
        clearCart();
        router.push(`/success?id=${shortId}&total=${finalTotal}&name=${formData.firstName}`);

    } catch (error) {
        console.error("Order Failed:", error);
        toast.error("Something went wrong. Please try again.");
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
          <h1 className="text-3xl font-serif text-aura-brown mb-4">Your Cart is Empty</h1>
          <Link href="/men" className="bg-aura-brown text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold transition-colors">
            BROWSE COLLECTION
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-32">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 md:pt-40">
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
           <Link href="/cart" className="flex items-center gap-1 hover:text-aura-brown transition-colors"><ArrowLeft size={14}/> Back to Cart</Link>
           <span className="text-gray-300">|</span>
           <span className="font-bold text-aura-gold">Secure Checkout</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-medium mb-12">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-7">
             <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">1</span> Contact Information</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase">First Name</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/><input required name="firstName" onChange={handleInputChange} type="text" placeholder="e.g. Ali" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" /></div></div>
                      <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase">Last Name</label><input required name="lastName" onChange={handleInputChange} type="text" placeholder="e.g. Khan" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" /></div>
                      <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/><input required name="email" onChange={handleInputChange} type="email" placeholder="e.g. ali@example.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" /></div></div>
                      <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/><input required name="phone" onChange={handleInputChange} type="tel" placeholder="e.g. 0300 1234567" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" /></div></div>
                   </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">2</span> Shipping Details</h2>
                   <div className="space-y-4">
                      <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase">Full Address</label><div className="relative"><MapPin className="absolute left-4 top-3 text-gray-300" size={18}/><textarea required name="address" onChange={handleInputChange} placeholder="House #, Street, Area" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold h-24 resize-none" /></div></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase">City</label><input required name="city" onChange={handleInputChange} type="text" placeholder="e.g. Lahore" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" /></div>
                          
                          {/* UPDATED: Postal Code is now Optional */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Postal Code (Optional)</label>
                            <input 
                                name="postalCode" 
                                onChange={handleInputChange} 
                                type="text" 
                                placeholder="e.g. 54000" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold" 
                            />
                          </div>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                   <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">3</span> Payment Method</h2>
                   <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 border border-aura-gold bg-[#FAF8F1] rounded-xl cursor-pointer">
                         <div className="w-5 h-5 rounded-full border-4 border-aura-gold bg-white"></div>
                         <div className="flex-1"><p className="font-bold text-aura-brown flex items-center gap-2"><CreditCard size={18}/> Cash on Delivery (COD)</p><p className="text-xs text-gray-500">Pay securely with cash upon receiving your order.</p></div>
                      </label>
                   </div>
                </div>
             </form>
          </div>
          <div className="lg:col-span-5">
             <div className="sticky top-32">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-aura-gold/20 shadow-xl">
                   <h3 className="font-serif text-xl font-bold mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
                   <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                      {cart.map((item) => (
                         <div key={`${item.id}-${item.color}`} className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0"><Image src={item.image} alt={item.name} fill className="object-contain p-1 mix-blend-multiply" /><span className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">x{item.quantity}</span></div>
                            <div className="flex-1 min-w-0"><p className="font-bold text-sm text-aura-brown truncate">{item.name}</p><p className="text-xs text-gray-400">{item.color || "Standard"}</p>{item.isGift && <span className="text-[9px] text-purple-600 block">+ Gift Wrap</span>}{item.addBox && <span className="text-[9px] text-orange-600 block">+ Box</span>}</div>
                            <span className="text-sm font-bold text-aura-brown">Rs {((item.price + (item.isGift?150:0) + (item.addBox?100:0)) * item.quantity).toLocaleString()}</span>
                         </div>
                      ))}
                   </div>
                   <div className="space-y-3 text-sm text-gray-600 mb-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">Rs {cartTotal.toLocaleString()}</span></div>
                      <div className="flex justify-between items-center"><span>Shipping</span>{isFreeShipping ? <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">Free</span> : <span className="font-bold text-aura-brown">Rs {STANDARD_SHIPPING_COST}</span>}</div>
                   </div>
                   <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mb-8"><span className="font-bold text-lg">Total to Pay</span><span className="font-serif text-3xl font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span></div>
                   <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-aura-brown text-white py-4 rounded-full font-bold text-sm tracking-widest hover:bg-aura-gold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed">{loading ? "PROCESSING..." : "PLACE ORDER"} {!loading && <ArrowRight size={16} />}</button>
                   <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"><Lock size={12} /><span>128-bit Encrypted Security</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}