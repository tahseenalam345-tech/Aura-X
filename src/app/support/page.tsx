"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Truck, RotateCcw, FileText, HelpCircle, Mail, Lock } from "lucide-react"; // Added Lock icon

export default function SupportPage() {
  const cards = [
    { title: "Track Your Order", icon: Truck, link: "/track-order", desc: "Check the status of your shipment" },
    { title: "Shipping Policy", icon: FileText, link: "/support/shipping", desc: "Delivery times and charges" },
    { title: "Return & Exchange", icon: RotateCcw, link: "/support/return", desc: "Submit a return request" },
    { title: "FAQs", icon: HelpCircle, link: "#faqs", desc: "Common questions answered" },
    { title: "Contact Us", icon: Mail, link: "/support/contact", desc: "Get in touch with support" },
    // NEW 6TH CARD - BALANCES THE GRID
    { title: "Privacy Policy", icon: Lock, link: "/privacy-policy", desc: "How we protect your data" },
  ];

  const scrollToFAQs = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const element = document.getElementById('faqs');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 150; 
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Support Center</h1>
            <p className="text-gray-500">How can we assist you today?</p>
        </div>

        {/* GRID IS NOW PERFECTLY BALANCED (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {cards.map((card, i) => (
                <Link 
                    key={i} 
                    href={card.link} 
                    onClick={card.link === "#faqs" ? scrollToFAQs : undefined}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-aura-gold/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 bg-aura-gold/10 rounded-full flex items-center justify-center text-aura-brown mb-6 group-hover:bg-aura-gold group-hover:text-white transition-colors">
                        <card.icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-500">{card.desc}</p>
                </Link>
            ))}
        </div>

        {/* --- FAQ SECTION --- */}
        <div id="faqs" className="mt-24 pt-10 border-t border-gray-200 scroll-mt-32">
            <h2 className="text-3xl font-serif font-bold mb-10 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { q: "How do I track my order?", a: "You can track your order by clicking on the 'Track Your Order' button above and entering your Order ID." },
                    { q: "What is the delivery time?", a: "We aim to deliver within 3-5 working days for major cities and 5-7 days for remote areas." },
                    { q: "Do you offer Cash on Delivery?", a: "Yes, we offer Cash on Delivery (COD) services nationwide across Pakistan." },
                    { q: "What is your return policy?", a: "We have a 7-day return policy for defective or damaged items. The product must be unused and in original packaging." },
                    { q: "Are the watches water-resistant?", a: "Yes, most of our timepieces are 3ATM water-resistant, meaning they can withstand splashes but not swimming." },
                    { q: "Can I open the parcel before payment?", a: "Per courier policy, parcels cannot be opened before payment. However, we offer a full refund if the item is not as described." },
                    { q: "Does the watch come with a box?", a: "Our watches come in standard secure packaging. You can upgrade to a Premium Luxury Box for an additional price during checkout, which is perfect for gifting." },
                    { q: "Do you ship internationally?", a: "Currently, we only ship within Pakistan. Stay tuned for international shipping updates." }
                ].map((faq, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-aura-gold/30 transition-colors">
                        <h4 className="font-bold mb-2 text-lg text-aura-brown">{faq.q}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}