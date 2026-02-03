import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext"; // IMPORT THIS

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "AURA-X | Luxury Timepieces",
  description: "Define your legacy with AURA-X.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#F2F0E9]`}>
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}