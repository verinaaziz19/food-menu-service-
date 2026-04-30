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
      <div className="min-h-screen bg-[linear-gradient(140deg,#f9f3eb_0%,#f4e6d7_55%,#eef5e8_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#7a432d]">Menu</h1>
            <p className="mt-2 text-[#94644f]">
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
                className="rounded-xl bg-[#c95a2e] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#ab4a22]"
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
