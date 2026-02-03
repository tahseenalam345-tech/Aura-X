"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- CONFIG ---
const ADMIN_EMAILS = ["tahseenalam345@gmail.com", "dienerd562@gmail.com"];

interface AuthContextType {
  user: string | null;       // The email of the logged-in person
  isAdmin: boolean;          // True if they are one of the 2 admins
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  // Check LocalStorage on load (Keep login active on refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem("aura_user");
    if (storedUser) setUser(storedUser);
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.toLowerCase()) : false;

  const login = (email: string) => {
    setUser(email);
    localStorage.setItem("aura_user", email);
    
    // Redirect logic
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        router.push("/admin");
    } else {
        router.push("/track-order");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aura_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);