"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 1. Optimized effect to prevent layout thrashing
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Use useCallback to prevent function recreation on every render
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // 3. Render a placeholder with the same dimensions to prevent layout shift
  if (!mounted) {
    return (
      <div className="w-9 h-9 p-2 rounded-full border-2 border-transparent opacity-0" aria-hidden="true" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle system theme"
      className="p-2 rounded-full border-2 transition-all duration-300 transform active:scale-90
      border-aura-slate text-aura-slate hover:bg-aura-slate hover:text-white
      dark:border-aura-cyan dark:text-aura-cyan dark:hover:bg-aura-cyan dark:hover:text-aura-navy"
    >
      {theme === "dark" ? (
        <Sun size={20} className="animate-in zoom-in duration-300" />
      ) : (
        <Moon size={20} className="animate-in zoom-in duration-300" />
      )}
    </button>
  );
}