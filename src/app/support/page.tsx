"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Truck, RotateCcw, FileText, HelpCircle, Mail, Lock, ShieldCheck, Sparkles } from "lucide-react"; 

export default function SupportPage() {
  const cards = [
    { title: "Track Your Order", icon: Truck, link: "/track-order", desc: "Check the status of your shipment" },
    { title: "Shipping Policy", icon: FileText, link: "/support/shipping", desc: "Delivery times and charges" },
    { title: "Return & Exchange", icon: RotateCcw, link: "/support/return", desc: "Submit a return request" },
    { title: "FAQs", icon: HelpCircle, link: "#faqs", desc: "Common questions answered" },
    { title: "Contact Us", icon: Mail, link: "/support/contact", desc: "Get in touch with support" },
    { title: "Privacy Policy", icon: Lock, link: "/privacy-policy", desc: "How we protect your data" },
  ];

  const scrollToFAQs = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const element = document.getElementById('faqs');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; 
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-aura-brown pb-20">
      <Navbar />
      
      <div className="pt-32 md:pt-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 flex justify-center items-center gap-2">
                <ShieldCheck size={14} /> At Your Service
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-[#1E1B18]">Support Center</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Need assistance with your masterpiece, signature fragrance, or premium accessory? We are here to help.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center animate-in fade-in duration-1000">
            {cards.map((card, i) => (
                <Link 
                    key={i} 
                    href={card.link} 
                    onClick={card.link === "#faqs" ? scrollToFAQs : undefined}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-aura-gold/40 hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-aura-gold group-hover:to-yellow-600 transition-colors"></div>
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-aura-brown mb-6 group-hover:bg-aura-gold group-hover:text-white transition-colors duration-500 border border-gray-100 group-hover:border-aura-gold shadow-inner group-hover:scale-110">
                        <card.icon size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-3 text-[#1E1B18]">{card.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </Link>
            ))}
        </div>

        {/* --- FAQ SECTION --- */}
        <div id="faqs" className="mt-24 pt-16 border-t border-aura-gold/10 scroll-mt-32">
            <div className="text-center mb-12">
                <p className="text-aura-gold text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-2 flex justify-center items-center gap-2">
                    <Sparkles size={14} /> Knowledge Base
                </p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1E1B18]">Frequently Asked Questions</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {[
                    { q: "How do I track my order?", a: "You can track your order by clicking on the 'Track Your Order' button above and entering the Order ID provided at checkout." },
                    { q: "What is the standard delivery time?", a: "We aim to deliver within 3-5 working days for major cities and 5-7 days for remote areas across Pakistan." },
                    { q: "Do you offer Cash on Delivery (COD)?", a: "Yes, we offer Cash on Delivery (COD) services nationwide. You can securely pay when you receive your parcel." },
                    { q: "Can I open the parcel before making payment?", a: "Yes! As part of our official policy, we allow customers to open and inspect the parcel before handing over the cash." },
                    { q: "What is your return policy for Watches & Accessories?", a: "We offer a 7-day return policy for defective or damaged items. The product must be completely unused, with all tags and original packaging intact." },
                    { q: "Can I return or exchange Fragrances?", a: "Due to hygiene and quality standards, fragrances cannot be returned or exchanged once the outer seal or packaging has been opened." },
                    { q: "Are your watches water-resistant?", a: "Yes, most of our luxury timepieces are 3ATM water-resistant, meaning they can easily withstand daily splashes and rain, but are not suited for swimming." },
                    { q: "Do your products come in premium packaging?", a: "All our products are securely packaged. For an elevated unboxing experience or gifting, you can add a 'Premium Luxury Box' or 'Gift Wrap' during checkout." }
                ].map((faq, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-aura-gold/30 hover:shadow-md transition-all duration-300">
                        <h4 className="font-bold mb-3 text-lg text-aura-brown leading-snug">{faq.q}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}