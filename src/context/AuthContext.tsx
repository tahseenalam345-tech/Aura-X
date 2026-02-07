"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_EMAILS = ["tahseenalam345@gmail.com", "dienerd562@gmail.com"];

interface AuthContextType {
  user: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  // UPDATE: Added 'password' as an optional 2nd argument to match your login page
  login: (email: string, password?: string) => Promise<string>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    isAdmin: false, 
    isLoading: true, 
    login: async () => "", 
    logout: () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("aura_user");
    if (storedUser) {
        setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.toLowerCase()) : false;

  // UPDATE: Accepts (email, password) now to fix the build error
  const login = async (email: string, password?: string): Promise<string> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Set State
    setUser(cleanEmail);
    localStorage.setItem("aura_user", cleanEmail);

    // Return Role Logic
    if (ADMIN_EMAILS.includes(cleanEmail)) {
        return "admin";
    } else {
        return "customer";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aura_user");
    window.location.href = "/"; 
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);