"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { login(email); }, 1000); // Simulate network
  };

  return (
    <main className="min-h-screen bg-[#1E1B18] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-aura-gold/20 rounded-full blur-[120px]"></div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[2rem] w-full max-w-md text-center relative z-10 shadow-2xl">
        <div className="w-20 h-20 bg-aura-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-aura-gold/20">
            <span className="text-3xl font-serif font-bold text-aura-brown">A</span>
        </div>
        <h1 className="text-3xl font-serif text-white mb-2">Welcome</h1>
        <p className="text-white/40 text-sm mb-10">Sign in to manage orders or access your account.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left space-y-2">
              <label className="text-xs font-bold uppercase text-aura-gold tracking-widest ml-1">Email Address</label>
              <input type="email" required placeholder="name@example.com" className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aura-gold transition-all" value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="text-left space-y-2">
              <label className="text-xs font-bold uppercase text-aura-gold tracking-widest ml-1">Password</label>
              <input type="password" required placeholder="••••••••" className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aura-gold transition-all"/>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-aura-gold text-aura-brown font-bold py-4 rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50">
             {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}