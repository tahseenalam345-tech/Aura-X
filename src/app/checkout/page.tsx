"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, User, Mail, Phone, MapPin, CreditCard, Lock, ArrowRight, Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import emailjs from '@emailjs/browser';

export default function CheckoutPage() {
  const { cart, clearCart, cartTotal, shippingCost, finalTotal } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: ""
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Prepare Order Items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || "Standard",
        image: item.image,
        isGift: item.isGift,
        addBox: item.addBox
      }));

      // Call API to Save Order (Saves in Supabase)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: fullName,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.postalCode}`,
          },
          items: orderItems,
          total: finalTotal, 
          city: formData.city
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Order failed");

      const orderCode = result.orderId;

      // 🚀 SMART EMAIL PAYLOAD: Includes precise details like Sizes, Colors & Boxes
      const formattedItemsForEmail = cart.map(i => 
        `• ${i.name} (x${i.quantity})\n  Variant: ${i.color || 'Standard'}${i.isGift ? ' [Gift Wrapped]' : ''}${i.addBox ? ' [Premium Box]' : ''}`
      ).join('\n\n');

      const customerEmailParams = {
        email_subject: `Order Confirmation #${orderCode}`,
        to_email: formData.email,
        to_name: fullName,
        email_heading: "Thank You For Your Order!",
        order_id: orderCode,
        email_message: `Your order has been received. We will dispatch your masterpiece to ${formData.city} soon.`,
        order_items: formattedItemsForEmail,
        total_amount: `Rs ${finalTotal.toLocaleString()}`,
        customer_name: fullName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address
      };

      const adminEmailParams = {
        ...customerEmailParams,
        to_email: "tahseenalam345@GMAIL.COM", // Your admin email
        to_name: "Admin",
        email_heading: "⚠️ NEW ORDER RECEIVED",
        email_subject: `New Order Alert: #${orderCode} - Rs ${finalTotal.toLocaleString()}`,
        email_message: `A new order has been placed by ${fullName}. Please check Supabase for complete details.`
      };

      // Send Emails
      await Promise.all([
        emailjs.send('service_wfw89r5', 'template_ccsvo5z', customerEmailParams, 'OQmFriQxX0btmE7W3'),
        emailjs.send('service_wfw89r5', 'template_ccsvo5z', adminEmailParams, 'OQmFriQxX0btmE7W3')
      ]);

      toast.success("Order Placed Successfully!");
      clearCart();
      router.push(`/success?id=${orderCode}&total=${finalTotal}&name=${encodeURIComponent(formData.firstName)}`);

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
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400 shadow-inner">
             <ShoppingBag size={40} />
          </div>
          <h1 className="text-3xl font-serif text-aura-brown mb-4 font-bold">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">You need to add items to your cart before checking out.</p>
          <Link href="/" className="bg-aura-brown text-white px-8 py-4 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-aura-gold hover:shadow-xl transition-all shadow-lg flex items-center gap-2">
            BROWSE COLLECTION <ArrowRight size={16}/>
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
          <Link href="/cart" className="flex items-center gap-1 hover:text-aura-brown transition-colors"><ArrowLeft size={14} /> Back to Cart</Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-aura-gold flex items-center gap-1"><Lock size={12}/> Secure Checkout</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif font-medium mb-12">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">1</span> 
                    Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="firstName">First Name</label>
                      <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input required id="firstName" name="firstName" onChange={handleInputChange} type="text" placeholder="e.g. Ali" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="lastName">Last Name</label>
                      <input required id="lastName" name="lastName" onChange={handleInputChange} type="text" placeholder="e.g. Khan" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="email">Email Address</label>
                      <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input required id="email" name="email" onChange={handleInputChange} type="email" placeholder="e.g. ali@example.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                      </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="phone">Phone Number</label>
                      <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input required id="phone" name="phone" onChange={handleInputChange} type="tel" placeholder="e.g. 0300 1234567" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                      </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">2</span> 
                    Shipping Details
                </h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="address">Full Address</label>
                      <div className="relative">
                          <MapPin className="absolute left-4 top-3 text-gray-300" size={18} />
                          <textarea required id="address" name="address" onChange={handleInputChange} placeholder="House #, Street, Area" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold h-24 resize-none transition-colors" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="city">City</label>
                        <input required id="city" name="city" onChange={handleInputChange} type="text" placeholder="e.g. Lahore" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="postalCode">Postal Code</label>
                        <input id="postalCode" name="postalCode" onChange={handleInputChange} type="text" placeholder="e.g. 54000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-aura-gold/10 text-aura-gold rounded-full flex items-center justify-center text-sm">3</span> 
                    Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 border-aura-gold bg-[#FAF8F1] rounded-xl cursor-pointer shadow-sm">
                    <div className="w-5 h-5 rounded-full border-4 border-aura-gold bg-white"></div>
                    <div className="flex-1">
                        <p className="font-bold text-aura-brown flex items-center gap-2"><CreditCard size={18} /> Cash on Delivery (COD)</p>
                        <p className="text-xs text-gray-500 mt-0.5">Pay securely with cash upon receiving your masterpiece.</p>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>
          
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-aura-gold/20 shadow-xl">
                <h3 className="font-serif text-xl font-bold mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                    <ShoppingBag className="text-aura-gold" size={20} /> Order Summary
                </h3>
                
                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                  {cart.map((item, index) => {
                    const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
                    const itemTotalPrice = (item.price + extras) * item.quantity;
                    
                    return (
                      <div key={`${item.id}-${item.color}-${index}`} className="flex gap-4 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                        <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                            <Image src={item.image} alt={item.name} fill className="object-contain p-1 mix-blend-multiply" unoptimized={true} />
                            <span className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">x{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-aura-brown truncate" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 truncate">{item.color || "Standard"}</p>
                          <div className="flex gap-2 flex-wrap mt-1">
                              {item.isGift && <span className="text-[9px] text-purple-600 font-bold">+ Gift Wrap</span>}
                              {item.addBox && <span className="text-[9px] text-orange-600 font-bold">+ Box</span>}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-aura-brown flex-shrink-0">
                          Rs {itemTotalPrice.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Shipping</span>
                    {shippingCost === 0 ? (
                        <span className="text-green-500 font-bold text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded">FREE</span>
                    ) : (
                        <span className="font-bold text-aura-brown">Rs {shippingCost}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-6 mb-8">
                    <span className="font-bold text-lg text-gray-500 uppercase tracking-widest">Total to Pay</span>
                    <span className="font-serif text-3xl font-bold text-aura-brown">Rs {finalTotal.toLocaleString()}</span>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-aura-brown to-[#2A241D] text-white py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:shadow-2xl transition-all flex items-center justify-center gap-2 group shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 className="animate-spin" size={20} /> SECURING ORDER...</> : <><span className="flex items-center gap-2">PLACE ORDER <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span></>}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-aura-gold" />
                    <span>128-bit Encrypted Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}