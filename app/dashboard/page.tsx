"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedLayout } from "@/app/protected-layout";
import { MenuItem } from "@/lib/auth-context";
import { MenuGrid } from "@/components/menu-grid";
import { PlaceOrderModal } from "@/components/place-order-modal";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, cart } = useAuth();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(
        user?.role === "employee" ? "/api/menu?showAll=true" : "/api/menu",
        { credentials: "include" },
      );

      const data = await res.json();
      if (data.success) {
        const mapped = data.data.items.map((item: any) => ({
          id: String(item.ItemID),
          title: item.Name,
          description: item.Description,
          price: parseFloat(item.Price),
          category: item.Category,
          available: item.Availability === 1,
          image: item.Image ? `/images/${item.Image}` : "",
        }));
        setMenuItems(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-amber-900">Menu</h1>
            <p className="text-amber-700 mt-2">
              {user.role === "employee"
                ? "Manage your restaurant menu"
                : "Browse our delicious Italian dishes"}
            </p>
          </div>

          <div className="mb-8">
            {isLoading ? (
              <p className="text-amber-700">Loading menu...</p>
            ) : (
              <MenuGrid
                items={menuItems}
                isEmployee={user.role === "employee"}
                onSelectItem={setSelectedItem}
                onItemAdded={fetchMenuItems}
              />
            )}
          </div>

          {user.role === "client" && cart.length > 0 && showCartModal && (
            <PlaceOrderModal
              cartItems={cart}
              onClose={() => setShowCartModal(false)}
            />
          )}

          {user.role === "client" && cart.length > 0 && !showCartModal && (
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => setShowCartModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
              >
                View Cart ({cart.length} items)
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
