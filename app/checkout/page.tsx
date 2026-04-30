'use client';

import { ProtectedLayout } from '@/app/protected-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import type { FulfillmentType } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { user, cart, addOrder, clearCart } = useAuth();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user || user.role !== 'client') {
    return null;
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );
  const tax = total * 0.1;
  const deliveryFee = fulfillmentType === 'delivery' ? 4.99 : 0;
  const grandTotal = total + tax + deliveryFee;

  if (submittedOrderId) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-[linear-gradient(145deg,#f8f1e8_0%,#f3e5d8_55%,#eef5e8_100%)]">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="border-2 border-green-200 bg-white">
              <div className="p-8 text-center space-y-4">
                <h1 className="text-3xl font-bold text-green-700">
                  Order Successfully Submitted
                </h1>
                <p className="text-[#7a432d]">
                  Your {fulfillmentType} order has been placed and payment was
                  processed successfully.
                </p>
                <p className="text-sm text-[#6e9f48]">
                  Order confirmation number: #{submittedOrderId.slice(-6)}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => router.push('/orders')}
                    className="bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
                  >
                    View My Orders
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-[linear-gradient(145deg,#f8f1e8_0%,#f3e5d8_55%,#eef5e8_100%)]">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-[#7a432d]">
              Your cart is empty
            </h1>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

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
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderId = Date.now().toString();
    const newOrder = {
      OrderID: orderId,
      UserID: user.UserID ?? user.id ?? '',
      OrderDate: new Date().toISOString(),
      Status: 'Active' as const,
      TotalAmount: grandTotal,
      id: orderId,
      userId: String(user.id ?? user.UserID ?? ''),
      userName: user.name,
      items: cart,
      total: grandTotal,
      status: 'Active' as const,
      createdAt: new Date(),
      fulfillmentType,
      deliveryAddress:
        fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
    };

    addOrder(newOrder);
    clearCart();
    setIsProcessing(false);
    setSubmittedOrderId(orderId);
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[linear-gradient(145deg,#f8f1e8_0%,#f3e5d8_55%,#eef5e8_100%)] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="mb-8 text-4xl font-bold text-[#7a432d]">
            Confirm Your Order
          </h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card className="border-2 border-[#e8d8c7] bg-[#fffaf4]/95">
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-[#7a432d]">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between rounded bg-[#faf3ea] p-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#7a432d]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[#94644f]">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#c95a2e]">
                          ${((item.price ?? 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t-2 border-[#eadbcc] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7a432d]">Fulfillment:</span>
                      <span className="capitalize text-[#7a432d]">
                        {fulfillmentType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7a432d]">Subtotal:</span>
                      <span className="text-[#7a432d]">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7a432d]">Tax (10%):</span>
                      <span className="text-[#7a432d]">${tax.toFixed(2)}</span>
                    </div>
                    {fulfillmentType === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7a432d]">Delivery Fee:</span>
                        <span className="text-[#7a432d]">
                          ${deliveryFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t-2 border-[#eadbcc] pt-2 text-lg font-bold">
                      <span className="text-[#7a432d]">Total:</span>
                      <span className="text-[#c95a2e]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="border-2 border-[#e8d8c7] bg-[#fffaf4]/95">
                <div className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-[#7a432d]">
                    Checkout Details
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#7a432d]">
                        Order Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['pickup', 'delivery'] as FulfillmentType[]).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFulfillmentType(type)}
                              className={`rounded-lg border-2 px-4 py-3 text-left transition ${
                                fulfillmentType === type
                                  ? 'border-[#c95a2e] bg-[#f6e0d6] text-[#7a432d]'
                                  : 'border-[#dec8b4] bg-white text-[#94644f]'
                              }`}
                            >
                              <span className="block font-semibold capitalize">
                                {type}
                              </span>
                              <span className="block text-sm">
                                {type === 'pickup'
                                  ? 'Pick up your order from the restaurant.'
                                  : 'Have your order brought to your address.'}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {fulfillmentType === 'delivery' && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#7a432d]">
                          Delivery Address
                        </label>
                        <Input
                          type="text"
                          placeholder="123 Main Street, Apartment 4B"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="border-[#dec8b4]"
                        />
                        {errors.deliveryAddress && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.deliveryAddress}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#7a432d]">
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
                              value.split('').reduce((acc, digit, idx) => {
                                if (idx % 4 === 0 && idx !== 0) {
                                  acc += ' ';
                                }
                                return acc + digit;
                              }, '')
                            );
                          }
                        }}
                        className="border-[#dec8b4]"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#7a432d]">
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
                          className="border-[#dec8b4]"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#7a432d]">
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
                          className="border-[#dec8b4]"
                        />
                        {errors.cvv && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <p className="text-sm text-[#94644f]">
                        This is a demo checkout. Use any 16-digit card number to
                        place the order.
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
                          className="flex-1 bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
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
