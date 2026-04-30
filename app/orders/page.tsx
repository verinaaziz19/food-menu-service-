'use client';

import { ProtectedLayout } from '@/app/protected-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import type { FulfillmentType, OrderStatus } from '@/lib/auth-context';
import { useState } from 'react';

const deliveryStatusOptions: OrderStatus[] = [
  'Active',
  'Picked Up',
  'On the Way',
  'Delivered',
  'Cancelled',
];

const pickupStatusOptions: OrderStatus[] = [
  'Active',
  'Ready for Pickup',
  'Completed',
  'Cancelled',
];

export default function OrdersPage() {
  const { user, orders, updateOrderStatus } = useAuth();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const userId = String(user.id ?? user.UserID ?? '');
  const userOrders =
    user.role === 'client'
      ? orders.filter((order) => String(order.userId ?? order.UserID) === userId)
      : orders;
  const sortedOrders = [...userOrders].sort((left, right) => {
    const leftDate = new Date(left.createdAt ?? left.OrderDate).getTime();
    const rightDate = new Date(right.createdAt ?? right.OrderDate).getTime();
    return rightDate - leftDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ready for Pickup':
        return 'bg-blue-100 text-blue-800';
      case 'Picked Up':
        return 'bg-cyan-100 text-cyan-800';
      case 'On the Way':
        return 'bg-indigo-100 text-indigo-800';
      case 'Delivered':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = (fulfillmentType: FulfillmentType | undefined) =>
    fulfillmentType === 'delivery' ? deliveryStatusOptions : pickupStatusOptions;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[linear-gradient(145deg,#f8f1e8_0%,#f3e5d8_55%,#eef5e8_100%)] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="mb-2 text-4xl font-bold text-[#7a432d]">
            {user.role === 'employee' ? 'Manage Orders' : 'My Orders'}
          </h1>
          <p className="mb-8 text-[#94644f]">
            {user.role === 'employee'
              ? 'View and update the status of all orders'
              : 'Track your pickup and delivery orders'}
          </p>

          {userOrders.length === 0 ? (
            <Card className="border-2 border-[#e8d8c7] bg-[#fffaf4]/95 p-8 text-center">
              <p className="text-lg text-[#94644f]">
                {user.role === 'client'
                  ? "You haven't placed any orders yet."
                  : 'No orders yet.'}
              </p>
              <Button
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="mt-4 bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
              >
                Back to Dashboard
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {sortedOrders.map((order) => {
                const orderId = String(order.id ?? order.OrderID ?? '');
                const status = order.status ?? order.Status ?? 'Active';
                const fulfillmentType = order.fulfillmentType ?? 'pickup';
                const items = order.items ?? [];
                const total = order.total ?? order.TotalAmount ?? 0;
                const placedAt = order.createdAt
                  ? new Date(order.createdAt)
                  : new Date(order.OrderDate);

                return (
                  <Card
                    key={orderId}
                    className={`border-2 overflow-hidden ${
                      editingOrderId === orderId
                        ? 'border-[#c95a2e] ring-2 ring-[#e7b69f]'
                        : 'border-[#e8d8c7]'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#7a432d]">
                            Order #{orderId.slice(-6)}
                          </h3>
                          <p className="text-sm text-[#94644f]">
                            {user.role === 'employee'
                              ? `Customer: ${order.userName ?? 'Guest'}`
                              : `Placed on: ${placedAt.toLocaleDateString()}`}
                          </p>
                          <p className="mt-1 text-sm capitalize text-[#6e9f48]">
                            {fulfillmentType}
                            {fulfillmentType === 'delivery' && order.deliveryAddress
                              ? ` to ${order.deliveryAddress}`
                              : fulfillmentType === 'pickup'
                                ? ' order'
                                : ''}
                          </p>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </div>
                      </div>

                      <div className="mb-4 rounded border border-[#eadbcc] bg-[#faf3ea] p-4">
                        <h4 className="mb-3 font-semibold text-[#7a432d]">Items</h4>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
                            <div
                              key={`${orderId}-${idx}`}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-[#7a432d]">
                                {item.title} x {item.quantity}
                              </span>
                              <span className="font-semibold text-[#c95a2e]">
                                ${(((item.price ?? 0) * item.quantity)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="mb-1 text-sm text-[#94644f]">Total Amount</p>
                          <p className="text-2xl font-bold text-[#c95a2e]">
                            ${total.toFixed(2)}
                          </p>
                        </div>

                        {user.role === 'employee' && (
                          <div className="flex gap-2">
                            {editingOrderId === orderId ? (
                              <select
                                value={status}
                                onChange={(e) => {
                                  updateOrderStatus(
                                    orderId,
                                    e.target.value as OrderStatus
                                  );
                                  setEditingOrderId(null);
                                }}
                                className="rounded-md border-2 border-[#dec8b4] bg-white px-3 py-2 font-semibold text-[#7a432d]"
                              >
                                {getStatusOptions(fulfillmentType).map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>
                                    {statusOption}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Button
                                onClick={() => setEditingOrderId(orderId)}
                                className="bg-[#88b95f] text-white hover:bg-[#6e9f48]"
                              >
                                Update Status
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
