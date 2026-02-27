"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 1. Define what a Cart Item looks like
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  quantity: number;
  isGift: boolean;
  addBox: boolean;
  isEidExclusive?: boolean; // 🚀 NEW: Tracks if the item gets Free Shipping
}

// 2. Define the Context functions
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string) => void;
  updateQuantity: (id: string, color: string | undefined, amount: number) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load Cart from LocalStorage on Start
  useEffect(() => {
    const savedCart = localStorage.getItem("aura-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save Cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("aura-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === newItem.id && item.color === newItem.color);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id && item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string, color?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.color === color)));
  };

  const updateQuantity = (id: string, color: string | undefined, amount: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.color === color) {
          const newQty = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("aura-cart");
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const cartTotal = cart.reduce((acc, item) => {
    // 🚀 FIXED: Gift is 300, Box is 200 (Matches your checkout and product page)
    const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
    return acc + (item.price + extras) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. THIS IS THE EXPORT THAT WAS MISSING
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}