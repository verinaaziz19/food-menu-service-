'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'employee' | 'client';

export interface User {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
  CreatedAt: string;
  role?: UserRole;
  name?: string;
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
  available?: boolean;
  image?: string;
}

export interface OrderItem {
  menuItemId: string;
  title?: string;
  price?: number;
  quantity: number;
}

export type OrderStatus = 'Active' | 'Completed' | 'Cancelled';

export interface Order {
  OrderID?: string | number;
  UserID?: string | number;
  OrderDate?: string;
  Status?: OrderStatus;
  TotalAmount?: number;
  id?: string;
  userId?: string;
  items?: OrderItem[];
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

const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', title: 'Margherita Pizza', description: 'Classic pizza with tomato, mozzarella, and basil', price: 12.99, image: 'https://via.placeholder.com/300x200?text=Margherita+Pizza', available: true },
  { id: '2', title: 'Spaghetti Carbonara', description: 'Traditional pasta with eggs, cheese, and pancetta', price: 14.99, image: 'https://via.placeholder.com/300x200?text=Spaghetti+Carbonara', available: true },
  { id: '3', title: 'Risotto ai Funghi', description: 'Creamy risotto with mushrooms', price: 13.99, image: 'https://via.placeholder.com/300x200?text=Risotto+Funghi', available: true },
  { id: '4', title: 'Tiramisu', description: 'Classic Italian dessert with mascarpone and coffee', price: 6.99, image: 'https://via.placeholder.com/300x200?text=Tiramisu', available: true },
  { id: '5', title: 'Lasagna Bolognese', description: 'Layered pasta with rich meat sauce', price: 13.5, image: 'https://via.placeholder.com/300x200?text=Lasagna+Bolognese', available: true },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedMenuItems = localStorage.getItem('menuItems');
    const storedOrders = localStorage.getItem('orders');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedMenuItems) setMenuItems(JSON.parse(storedMenuItems));
    if (storedOrders) setOrders(JSON.parse(storedOrders));

    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const newUser: User = {
      UserID: Date.now().toString(),
      Email: email,
      IsAdmin: role === 'employee' ? 1 : 0,
      CreatedAt: new Date().toISOString(),
      name,
      role,
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems([...menuItems, { ...item, id: Date.now().toString() }]);
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
    const itemId = item.id || String(item.ItemID);

    const existingItem = cart.find((c) => c.menuItemId === itemId);

    if (existingItem) {
      setCart(cart.map((c) => (c.menuItemId === itemId ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([
        ...cart,
        {
          menuItemId: itemId,
          title: item.title || item.ItemName,
          price: item.price || item.Price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((c) => c.menuItemId !== menuItemId));
  };

  const clearCart = () => setCart([]);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}