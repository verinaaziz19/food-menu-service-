'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedLayout } from '@/app/protected-layout';
import { MenuItem } from '@/lib/auth-context';
import { MenuGrid } from '@/components/menu-grid';
import { PlaceOrderModal } from '@/components/place-order-modal';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, menuItems, cart } = useAuth();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);

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
              {user.role === 'employee' ? 'Manage your restaurant menu' : 'Browse our delicious Italian dishes'}
            </p>
          </div>

          {/* Menu Grid */}
          <div className="mb-8">
            <MenuGrid
              items={menuItems}
              isEmployee={user.role === 'employee'}
              onSelectItem={setSelectedItem}
            />
          </div>

          {/* Place Order Modal - shows when items are selected for clients and showCartModal is true */}
          {user.role === 'client' && cart.length > 0 && showCartModal && (
            <PlaceOrderModal
              cartItems={cart}
              onClose={() => setShowCartModal(false)}
            />
          )}

          {/* Show cart button when items are in cart but modal is hidden */}
          {user.role === 'client' && cart.length > 0 && !showCartModal && (
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
