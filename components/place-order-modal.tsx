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
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-2 border-amber-300 shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Shopping Cart</h2>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.menuItemId} className="flex justify-between items-center p-2 bg-amber-50 rounded">
                <div>
                  <p className="font-semibold text-amber-900">{item.title}</p>
                  <p className="text-sm text-amber-700">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-amber-600">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-amber-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-900 font-semibold">Subtotal:</span>
              <span className="text-amber-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-900 font-semibold">Tax:</span>
              <span className="text-amber-900">${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-amber-900">Total:</span>
              <span className="text-lg font-bold text-amber-600">${(total * 1.1).toFixed(2)}</span>
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
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
