"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer"; // Ensure Footer is imported if not in layout
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F2F0E9] text-aura-brown">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-aura-gold flex items-center gap-1"><Home size={14}/></Link>
            <ChevronRight size={14}/>
            <Link href="/support" className="hover:text-aura-gold">Support</Link>
            <ChevronRight size={14}/>
            <span className="font-bold text-aura-brown">Privacy Policy</span>
        </div>

        <h1 className="text-4xl font-serif font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm space-y-8 text-gray-600 leading-relaxed">
            <p className="text-lg">
                At <strong>AURA-X</strong>, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
            </p>

            <section>
                <h3 className="text-xl font-bold mb-3 text-aura-brown">1. Information We Collect</h3>
                <p>We collect information when you place an order, subscribe, or contact us. This includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Name, email, and phone number</li>
                    <li>Shipping and billing addresses</li>
                </ul>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-3 text-aura-brown">2. How We Use Information</h3>
                <p>Your data is used to process orders, send updates, and improve our services. We do not sell your data.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold mb-3 text-aura-brown">3. Contact Us</h3>
                <p>If you have questions, email us at <strong>support@aura-x.com</strong>.</p>
            </section>
        </div>
      </div>
    </main>
  );
}