'use client';

import { OrderItem, useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface PlaceOrderModalProps {
  cartItems: OrderItem[];
  onClose: () => void;
}

export function PlaceOrderModal({ cartItems, onClose }: PlaceOrderModalProps) {
  const total = cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-2 border-[#e8d8c7] bg-[#fffaf4] shadow-2xl">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-[#7a432d]">Shopping Cart</h2>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between rounded bg-[#faf3ea] p-2">
                <div>
                  <p className="font-semibold text-[#7a432d]">{item.title}</p>
                  <p className="text-sm text-[#94644f]">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-[#c95a2e]">${(((item.price ?? 0) * item.quantity)).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 border-t-2 border-[#eadbcc] pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[#7a432d]">Subtotal:</span>
              <span className="text-[#7a432d]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[#7a432d]">Tax:</span>
              <span className="text-[#7a432d]">${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#7a432d]">Total:</span>
              <span className="text-lg font-bold text-[#c95a2e]">${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full bg-[#c95a2e] text-white hover:bg-[#ab4a22]">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
