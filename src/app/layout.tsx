import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/Footer";
import EidPopup from "@/components/EidPopup";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Script from "next/script"; // <--- 1. IMPORT ADDED

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ subsets: ["latin"], weight: ['300', '400', '700'], variable: '--font-lato', display: 'swap' });

// --- SEO: GLOBAL METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL('https://aura-x-three.vercel.app'),
  title: {
    default: "AURA-X | Luxury Timepieces",
    template: "%s | AURA-X"
  },
  description: "Discover AURA-X, the pinnacle of luxury watches in Pakistan. Shop our exclusive collection of Men's, Women's, and Couple's timepieces. Swiss Precision, Timeless Elegance.",
  keywords: ["luxury watches", "watches pakistan", "men watches", "women watches", "aura-x", "gift watches", "couple watches", "gold watches"],
  
  // --- ✅ GOOGLE VERIFICATION ---
  verification: {
    google: '73OSZgKuDAA1E1m_rcm4CUyCYboI3yXk87hB_jp2-qo',
  },
  
  openGraph: {
    title: "AURA-X | Luxury Timepieces",
    description: "Swiss Precision, Timeless Elegance.",
    url: 'https://aura-x-three.vercel.app',
    siteName: 'AURA-X',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// --- SEO: ORGANIZATION SCHEMA (JSON-LD) ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AURA-X",
  "url": "https://aura-x-three.vercel.app",
  "logo": "https://aura-x-three.vercel.app/logo.png",
  "description": "Luxury Watch Brand in Pakistan",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-336-9871278",
    "contactType": "customer service"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased bg-[#FDFBF7]`}>
        
        {/* --- 2. GOOGLE ANALYTICS TRACKING CODE --- */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-M99HK4HLVG"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M99HK4HLVG');
          `}
        </Script>
        {/* ------------------------------------------- */}

        {/* SEO: Inject JSON-LD Schema for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ORDER MATTERS: AuthProvider OUTSIDE, CartProvider INSIDE */}
        <AuthProvider>  
          <CartProvider>
            <Toaster position="top-center" /> 
            <EidPopup />
            <WhatsAppButton />
            {children}
            <Footer />
          </CartProvider>
        
        </AuthProvider>

      </body>
    </html>
  );
}