"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth(); 
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

      // 2. Sync Context
      if (login) await login(email, password); 

      toast.success("Authentication Successful.");
      
      // 3. Force hard navigation to ensure Supabase cookies are set
      if (email.toLowerCase() === "admin@aurax.com" || email.toLowerCase() === "tahseenalam345@gmail.com") {
          window.location.href = "/admin"; 
      } else {
          window.location.href = "/track-order";
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Authentication Failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0908] text-white flex flex-col relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aura-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="absolute top-0 w-full p-6 md:p-10 flex justify-between items-center z-10">
         <Link href="/" className="text-2xl font-serif font-bold text-aura-gold tracking-widest drop-shadow-md">AURA-X</Link>
         <Link href="/" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white transition flex items-center gap-2">
            <ArrowLeft size={14} /> Store
         </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md bg-[#161412]/80 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in zoom-in duration-500">
            
           {/* Top glowing line */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-aura-gold to-transparent shadow-[0_0_20px_rgba(212,175,55,0.8)]"></div>

           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#0A0908] rounded-full flex items-center justify-center mx-auto mb-6 border border-aura-gold/20 shadow-inner">
                  <Lock size={24} className="text-aura-gold" />
              </div>
              <h1 className="text-3xl font-serif text-white mb-2">Secure Access</h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Enter credentials to proceed</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#0A0908] border border-white/5 rounded-xl focus:outline-none focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold/50 transition-all text-white placeholder:text-gray-700 shadow-inner text-sm"
                      placeholder="admin@domain.com"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                     <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#0A0908] border border-white/5 rounded-xl focus:outline-none focus:border-aura-gold/50 focus:ring-1 focus:ring-aura-gold/50 transition-all text-white placeholder:text-gray-700 shadow-inner text-sm tracking-widest"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-aura-gold to-yellow-600 text-[#0A0908] font-black py-4 rounded-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                 {loading ? <><Loader2 className="animate-spin" size={16} /> Authenticating...</> : <><span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span></>}
              </button>
           </form>
           
           <div className="mt-8 text-center border-t border-white/5 pt-6">
               <p className="text-[10px] text-gray-600 tracking-widest uppercase">Secured by 256-bit encryption</p>
           </div>
        </div>
      </div>
    </main>
  );
}