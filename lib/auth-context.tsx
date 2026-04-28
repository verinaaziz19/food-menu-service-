'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDemoUsers } from './init-demo';

export type UserRole = 'employee' | 'client';

export interface User {
  UserID: string | number;
  Email: string;
  IsAdmin: number; // 0 = client, 1 = employee
  CreatedAt: string;
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

export type OrderStatus = 'Active' | 'Completed' | 'Cancelled';

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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
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

const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    title: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and basil',
    price: 12.99,
    image: 'https://via.placeholder.com/300x200?text=Margherita+Pizza',
    available: true,
  },
  {
    id: '2',
    title: 'Spaghetti Carbonara',
    description: 'Traditional pasta with eggs, cheese, and pancetta',
    price: 14.99,
    image: 'https://via.placeholder.com/300x200?text=Spaghetti+Carbonara',
    available: true,
  },
  {
    id: '3',
    title: 'Risotto ai Funghi',
    description: 'Creamy risotto with mushrooms',
    price: 13.99,
    image: 'https://via.placeholder.com/300x200?text=Risotto+Funghi',
    available: true,
  },
  {
    id: '4',
    title: 'Tiramisu',
    description: 'Classic Italian dessert with mascarpone and coffee',
    price: 6.99,
    image: 'https://via.placeholder.com/300x200?text=Tiramisu',
    available: true,
  },
  {
    id: '5',
    title: 'Lasagna Bolognese',
    description: 'Layered pasta with rich meat sauce',
    price: 13.50,
    image: 'https://via.placeholder.com/300x200?text=Lasagna+Bolognese',
    available: true,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    // Initialize demo users if needed
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: '1',
          email: 'client@example.com',
          password: 'password123',
          name: 'John Customer',
          role: 'client',
        },
        {
          id: '2',
          email: 'employee@example.com',
          password: 'password123',
          name: 'Maria Chef',
          role: 'employee',
        },
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    const storedUser = localStorage.getItem('user');
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedOrders = localStorage.getItem('orders');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedMenuItems) {
      setMenuItems(JSON.parse(storedMenuItems));
    }
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
      }));
      setOrders(parsedOrders);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      console.log('[v0] Login attempt with email:', email);
      // Mock login - just check if user exists
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('[v0] Stored users:', storedUsers);
      const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);

      if (!foundUser) {
        console.log('[v0] User not found');
        reject(new Error('Invalid email or password'));
        return;
      }

      console.log('[v0] User found, setting user:', foundUser);
      const newUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      resolve();
    });
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    return new Promise<void>((resolve, reject) => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');

      if (storedUsers.some((u: any) => u.email === email)) {
        reject(new Error('Email already exists'));
        return;
      }

      const newUserData = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role,
      };

      storedUsers.push(newUserData);
      localStorage.setItem('users', JSON.stringify(storedUsers));

      const newUser = {
        id: newUserData.id,
        email: newUserData.email,
        name: newUserData.name,
        role: newUserData.role,
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      resolve();
    });
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
  };

  const addMenuItem = (item: MenuItem) => {
    const newItem = { ...item, id: Date.now().toString() };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (id: string, item: MenuItem) => {
    setMenuItems(menuItems.map((m) => (m.id === id ? { ...item, id } : m)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((m) => m.id !== id));
  };

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
    setCart([]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.menuItemId === item.id);
    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
