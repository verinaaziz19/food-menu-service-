// lib/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "employee" | "client";

export interface User {
  UserID: string | number;
  Email: string;
  IsAdmin: number; // 0 = client, 1 = employee
  // Frontend convenience properties
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
  ItemID: string | number;
  ItemName: string;
  Description: string;
  Price: number;
  Category: string;
  IsAvailable: number; // 0 = unavailable, 1 = available
  CreatedBy: string | number;
  CreatedAt: string;
  // Frontend convenience properties
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  available?: boolean;
  image?: string;
}

export interface OrderDetail {
  OrderDetailID: string | number;
  OrderID: string | number;
  ItemID: string | number;
  Quantity: number;
  UnitPrice: number;
  // Frontend convenience
  title?: string;
  menuItemId?: string;
}

export type OrderStatus = "Active" | "Completed" | "Cancelled";

export interface Order {
  OrderID: string | number;
  UserID: string | number;
  OrderDate: string;
  Status: OrderStatus;
  TotalAmount: number;
  // Frontend convenience properties
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
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cart: OrderItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const MOCK_MENU_ITEMS: MenuItem[] = [
//   {
//     id: '1',
//     title: 'Margherita Pizza',
//     description: 'Classic pizza with tomato, mozzarella, and basil',
//     price: 12.99,
//     image: 'https://via.placeholder.com/300x200?text=Margherita+Pizza',
//     available: true,
//   },
//   {
//     id: '2',
//     title: 'Spaghetti Carbonara',
//     description: 'Traditional pasta with eggs, cheese, and pancetta',
//     price: 14.99,
//     image: 'https://via.placeholder.com/300x200?text=Spaghetti+Carbonara',
//     available: true,
//   },
//   {
//     id: '3',
//     title: 'Risotto ai Funghi',
//     description: 'Creamy risotto with mushrooms',
//     price: 13.99,
//     image: 'https://via.placeholder.com/300x200?text=Risotto+Funghi',
//     available: true,
//   },
//   {
//     id: '4',
//     title: 'Tiramisu',
//     description: 'Classic Italian dessert with mascarpone and coffee',
//     price: 6.99,
//     image: 'https://via.placeholder.com/300x200?text=Tiramisu',
//     available: true,
//   },
//   {
//     id: '5',
//     title: 'Lasagna Bolognese',
//     description: 'Layered pasta with rich meat sauce',
//     price: 13.50,
//     image: 'https://via.placeholder.com/300x200?text=Lasagna+Bolognese',
//     available: true,
//   },
// ];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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

  /**
   *
   * sends credentials to api/auth/login
   * stores user state and token on success
   * cookie is stored HTTPonly automatically by server
   *
   */

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.data.user);

      // Store token in localStorage for API calls
      if (data.data.token) {
        localStorage.setItem("auth-token", data.data.token);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  /**
   * Creates new user account /api/auth/register
   *
   * automatically logs user in (returns token) after register
   * User can immediately access protected routes
   */

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

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data.data.user);

      // Store token in localStorage for API calls
      if (data.data.token) {
        localStorage.setItem("auth-token", data.data.token);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  /**
   * Calls /api/auth/logout to clear HTTP-only cookie
   *
   * Clears local user state, cart, and localStorage
   * User must log in again to access protected routes
   */

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
    localStorage.removeItem("user"); // Clean up old localStorage data
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update localStorage for consistency
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const addMenuItem = (item: MenuItem) => {
    const newItem = { ...item, id: Date.now().toString() };
    setMenuItems([...menuItems, newItem]);
    localStorage.setItem("menuItems", JSON.stringify([...menuItems, newItem]));
  };

  const updateMenuItem = (id: string, item: MenuItem) => {
    const updatedItems = menuItems.map((m) =>
      m.id === id ? { ...item, id } : m,
    );
    setMenuItems(updatedItems);
    localStorage.setItem("menuItems", JSON.stringify(updatedItems));
  };

  const deleteMenuItem = (id: string) => {
    const filteredItems = menuItems.filter((m) => m.id !== id);
    setMenuItems(filteredItems);
    localStorage.setItem("menuItems", JSON.stringify(filteredItems));
  };

  const addOrder = (order: Order) => {
    const newOrders = [...orders, order];
    setOrders(newOrders);
    localStorage.setItem("orders", JSON.stringify(newOrders));
    setCart([]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status } : o,
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
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
          menuItemId: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
        },
      ];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (menuItemId: string) => {
    const newCart = cart.filter((c) => c.menuItemId !== menuItemId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    menuItems,
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

/**
 * Custom hook to access auth context anywhere in the app.
 *
 * throws error if used outside AuthProvider (helps catch bugs).
 * e.g.
 * const { user, login, logout } = useAuth();
 */

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
