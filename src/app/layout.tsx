import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/Footer";
import FacebookPixel from "@/components/FacebookPixel";
import Script from "next/script";
import { FloatingAction } from "@/components/FloatingAction";

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ subsets: ["latin"], weight: ['300', '400', '700'], variable: '--font-lato', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://aurax-watches.com'),
  title: {
    // 🚀 DYNAMIC LUXURY TITLE
    default: "AURA-X | Luxury Timepieces & Accessories",
    template: "%s | AURA-X"
  },
  // 🚀 BROADER DESCRIPTION FOR MULTI-CATEGORY
  description: "Discover AURA-X, the pinnacle of luxury lifestyle in Pakistan. Shop our exclusive collection of Men's & Women's Timepieces, Premium Leather Wallets, Signature Fragrances, and Designer Sunglasses. Unmatched Precision, Timeless Elegance.",
  // 🚀 ADDED NEW KEYWORDS FOR PERFUMES AND ACCESSORIES
  keywords: [
    "luxury watches pakistan", "men watches", "women watches", "aura-x", 
    "couple watches", "gold watches", "premium leather wallets", 
    "designer sunglasses", "luxury perfumes pakistan", "men fragrances", 
    "custom gift combos", "smartwatches"
  ],
  verification: {
    google: '73OSZgKuDAA1E1m_rcm4CUyCYboI3yXk87hB_jp2-qo',
    other: {
      'facebook-domain-verification': ['w76jut9we3xkj7njchqemt4lvb79a8'],
    },
  },
  openGraph: {
    title: "AURA-X | Luxury Lifestyle & Timepieces",
    description: "Swiss Precision, Timeless Elegance. Explore luxury watches, fragrances, and premium accessories.",
    url: 'https://aurax-watches.com',
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AURA-X",
  "url": "https://aurax-watches.com",
  "logo": "https://aurax-watches.com/logo.png",
  // 🚀 UPDATED STRUCTURED DATA
  "description": "Premium Luxury Lifestyle Brand in Pakistan offering Watches, Fragrances, and Leather Accessories.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-336-9871278",
    "contactType": "customer service"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://kdwpnvkgghdksnajalmj.supabase.co" />
        <link rel="preconnect" href="https://www.transparenttextures.com" />
      </head>
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased bg-[#FDFBF7]`}>
        
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-M99HK4HLVG"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M99HK4HLVG');
          `}
        </Script>

        {/* 🚀 TIKTOK PIXEL INSTALLED HERE */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              
              // 👇 TIKTOK PIXEL ID 👇
              ttq.load('D6NRJURC77U3SAC8BIFG');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <AuthProvider>  
          <CartProvider>
            <Toaster position="top-center" /> 
            
            {children}
            
            <FacebookPixel />
            <Footer />
          </CartProvider>
        </AuthProvider>
        
        <FloatingAction />
      </body>
    </html>
  );
}