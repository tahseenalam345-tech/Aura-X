"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color?: string; // 🚀 Includes Color, Size, and Box details
  quantity: number;
  isGift: boolean;
  addBox: boolean;
  isEidExclusive?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string) => void;
  updateQuantity: (id: string, color: string | undefined, amount: number) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
  shippingCost: number; 
  finalTotal: number;   
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("aura-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

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
    const extras = (item.isGift ? 300 : 0) + (item.addBox ? 200 : 0);
    return acc + (item.price + extras) * item.quantity;
  }, 0);

  // 🚀 FIXED: Standard Flat Rate Shipping (Rs 250)
  const shippingCost = cart.length === 0 ? 0 : 250;
  
  const finalTotal = cartTotal + shippingCost;

  return (
    <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        cartTotal,
        shippingCost,
        finalTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}