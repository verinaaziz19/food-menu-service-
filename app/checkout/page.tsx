'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedLayout } from '@/app/protected-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { user, cart, addOrder, clearCart } = useAuth();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user || user.role !== 'client') {
    return null;
  }

  if (cart.length === 0) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl font-bold text-amber-900 mb-4">Your cart is empty</h1>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.1;
  const grandTotal = total + tax;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Expiry date must be MM/YY';
    }
    if (!cvv || cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create order
    const newOrder = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      items: cart,
      total: grandTotal,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    addOrder(newOrder);
    clearCart();
    setIsProcessing(false);

    router.push('/orders');
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-amber-900 mb-8">Confirm Your Order</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-amber-200">
                <div className="p-6">
                  <h2 className="font-bold text-amber-900 mb-4 text-lg">Order Summary</h2>

                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between items-center p-2 bg-amber-50 rounded">
                        <div>
                          <p className="font-semibold text-amber-900 text-sm">{item.title}</p>
                          <p className="text-xs text-amber-700">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-amber-600 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-amber-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-900">Subtotal:</span>
                      <span className="text-amber-900">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-900">Tax (10%):</span>
                      <span className="text-amber-900">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t-2 border-amber-200 pt-2">
                      <span className="text-amber-900">Total:</span>
                      <span className="text-amber-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-amber-200">
                <div className="p-6">
                  <h2 className="font-bold text-amber-900 mb-4 text-lg">Payment Information</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">
                        Card Number
                      </label>
                      <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          if (value.length <= 16) {
                            setCardNumber(
                              value
                                .split('')
                                .reduce((acc, digit, idx) => {
                                  if (idx % 4 === 0 && idx !== 0) acc += ' ';
                                  return acc + digit;
                                }, '')
                            );
                          }
                        }}
                        className="border-amber-200"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-amber-900 mb-2">
                          Expiry Date
                        </label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setExpiryDate(
                                value.length >= 2
                                  ? `${value.slice(0, 2)}/${value.slice(2)}`
                                  : value
                              );
                            }
                          }}
                          className="border-amber-200"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-amber-900 mb-2">
                          CVV
                        </label>
                        <Input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 3) {
                              setCvv(value);
                            }
                          }}
                          className="border-amber-200"
                        />
                        {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <p className="text-sm text-amber-700">
                        This is a demo. You can use any card number format.
                      </p>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => router.push('/dashboard')}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {isProcessing ? 'Processing...' : 'Place Order'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
