// lib/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "employee" | "client";

export interface User {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
  role?: UserRole;
  name?: string;
}

export interface UserProfile {
  ProfileID: string | number;
  UserID: string | number;
  Name: string;
  Address: string;
  CellPhone: string;
}

export interface MenuItem {
  ItemID?: string | number;
  ItemName?: string;
  Description?: string;
  Price?: number;
  Category?: string;
  IsAvailable?: number;
  CreatedBy?: string | number;
  CreatedAt?: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  available?: boolean;
  image?: string;
}

export interface OrderDetail {
  OrderDetailID?: string | number;
  OrderID?: string | number;
  ItemID?: string | number;
  Quantity?: number;
  UnitPrice?: number;
  // Frontend convenience
  title?: string;
  menuItemId?: string;
  quantity?: number;
  price?: number;
}

export type OrderStatus = "Active" | "Completed" | "Cancelled";

export interface Order {
  OrderID: string | number;
  UserID: string | number;
  OrderDate: string;
  Status: OrderStatus;
  TotalAmount: number;
  id?: string;
  userId?: string;
  items?: OrderDetail[];
  total?: number;
  status?: OrderStatus;
  createdAt?: Date;
  userName?: string;
}

interface OrderItem {
  menuItemId: string;
  title?: string;
  price?: number;
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  addMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (id: string, item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cart: OrderItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            setUser(data.data.user);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      setUser(data.data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      setUser(data.data.user);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const addMenuItem = async (item: MenuItem) => {
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        Name: item.title,
        Description: item.description,
        Price: item.price,
        Category: item.category || "",
        Image: item.image?.replace("/images/", "") || "",
        Availability: item.available ? 1 : 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add item");
  };

  const updateMenuItem = async (id: string, item: MenuItem) => {
    const res = await fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        Name: item.title,
        Description: item.description,
        Price: item.price,
        Category: item.category || "",
        Image: item.image?.replace("/images/", "") || "",
        Availability: item.available ? 1 : 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update item");
  };

  const deleteMenuItem = async (id: string) => {
    const res = await fetch(`/api/menu/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete item");
  };

  const addOrder = (order: Order) => {
    const newOrders = [...orders, order];
    setOrders(newOrders);
    setCart([]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.menuItemId === item.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map((c) =>
        c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
      );
    } else {
      newCart = [
        ...cart,
        {
          menuItemId: item.id!,
          title: item.title,
          price: item.price,
          quantity: 1,
        },
      ];
    }
    setCart(newCart);
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((c) => c.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    addOrder,
    updateOrderStatus,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
