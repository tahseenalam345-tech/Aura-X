import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; // <--- MUST BE HERE
import { Toaster } from "react-hot-toast"; // <--- 1. IMPORT THIS
import { Footer } from "@/components/Footer"; // <--- IMPORT FOOTER
import EidPopup from "@/components/EidPopup"; // <--- 1. IMPORT IT
import { WhatsAppButton } from "@/components/WhatsAppButton";
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ subsets: ["latin"], weight: ['300', '400', '700'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  title: "AURA-X | Luxury Timepieces",
  description: "Swiss Precision, Timeless Elegance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased bg-[#FDFBF7]`}>
        
        {/* ORDER MATTERS: AuthProvider OUTSIDE, CartProvider INSIDE */}
        <AuthProvider>  
          <CartProvider>
            <Toaster position="top-center" /> {/* <--- 2. ADD THIS HERE */}
            <EidPopup />
            {/* 2. WhatsApp Button (NEW) */}
            <WhatsAppButton />
            {children}
            {/* 3. Footer (NOW ADDED HERE) */}
            <Footer />
          </CartProvider>
        
        </AuthProvider>

      </body>
    </html>
  );
}