"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_EMAILS = ["tahseenalam345@gmail.com", "dienerd562@gmail.com"];

interface AuthContextType {
  user: string | null;
  isAdmin: boolean;
  isLoading: boolean; // 1. Add isLoading here
  login: (email: string) => Promise<string>; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    isAdmin: false, 
    isLoading: true, // Default to loading
    login: async () => "", 
    logout: () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 2. Initialize as true

  useEffect(() => {
    // 3. Check Local Storage once on mount
    const storedUser = localStorage.getItem("aura_user");
    if (storedUser) {
        setUser(storedUser);
    }
    setIsLoading(false); // 4. Mark loading as done (whether found or not)
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.toLowerCase()) : false;

  const login = async (email: string): Promise<string> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Set State
    setUser(cleanEmail);
    localStorage.setItem("aura_user", cleanEmail);

    // Return Role
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