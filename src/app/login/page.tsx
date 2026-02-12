"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // <--- IMPORT SUPABASE
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth(); // We keep this to update local state if needed
  const router = useRouter(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. REAL SUPABASE LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // 2. Sync Context (Optional but good)
      if (login) await login(email, password); 

      toast.success("Login Successful! Redirecting...");
      
      // 3. THE FIX: Force a hard navigation.
      // This ensures Supabase cookies are fully set before the Admin page loads.
      // It prevents the Admin page from kicking you out accidentally.
      if (email.toLowerCase() === "admin@aurax.com") {
          window.location.href = "/admin"; 
      } else {
          window.location.href = "/track-order";
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login Failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1E1B18] text-white flex flex-col">
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
         <Link href="/" className="text-2xl font-serif font-bold text-aura-gold">AURA-X</Link>
         <Link href="/" className="text-sm text-gray-400 hover:text-white transition">Back to Store</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#2A2724] border border-white/5 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
           
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-aura-gold shadow-[0_0_40px_rgba(212,175,55,0.6)]"></div>

           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#1E1B18] rounded-full flex items-center justify-center mx-auto mb-4 border border-aura-gold/20 text-aura-gold font-serif text-2xl">A</div>
              <h1 className="text-3xl font-serif text-white mb-2">Welcome</h1>
              <p className="text-gray-400 text-sm">Sign in to manage orders or access your account.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-aura-gold uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#1E1B18] border border-white/10 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-white placeholder:text-gray-600"
                      placeholder="admin@aurax.com"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-aura-gold uppercase tracking-widest ml-1">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#1E1B18] border border-white/10 rounded-xl focus:outline-none focus:border-aura-gold focus:ring-1 focus:ring-aura-gold transition-all text-white placeholder:text-gray-600"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-aura-gold hover:text-aura-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                 {loading ? <><Loader2 className="animate-spin" size={18} /> Authenticating...</> : <>Sign In <ArrowRight size={18} /></>}
              </button>
           </form>
        </div>
      </div>
    </main>
  );
}