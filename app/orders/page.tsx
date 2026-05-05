"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedLayout } from "@/app/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/lib/auth-context";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Status: status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setEditingOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions: OrderStatus[] = ["Active", "Completed", "Cancelled"];

  if (!user) return null;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            {user.role === "employee" ? "Manage Orders" : "My Orders"}
          </h1>
          <p className="text-amber-700 mb-8">
            {user.role === "employee"
              ? "View and update the status of all orders"
              : "Track your orders and order history"}
          </p>

          {isLoading ? (
            <p className="text-amber-700">Loading orders...</p>
          ) : orders.length === 0 ? (
            <Card className="border-2 border-amber-200 p-8 text-center">
              <p className="text-amber-700 text-lg">
                {user.role === "client"
                  ? "You haven't placed any orders yet."
                  : "No orders yet."}
              </p>
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Back to Dashboard
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className={`border-2 overflow-hidden ${
                    editingOrderId === order.id
                      ? "border-amber-500 ring-2 ring-amber-300"
                      : "border-amber-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-amber-900">
                          Order #{String(order.id).slice(-6)}
                        </h3>
                        <p className="text-sm text-amber-700">
                          {user.role === "employee" &&
                            `Customer: ${order.userName}`}
                          {user.role === "client" &&
                            `Placed on: ${new Date(order.createdAt!).toLocaleDateString()}`}
                        </p>
                      </div>

                      <div
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(order.status!)}`}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-amber-50 rounded border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-amber-900">
                              {item.title} x {item.quantity}
                            </span>
                            <span className="text-amber-600 font-semibold">
                              ${(item.price! * item.quantity!).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-amber-700 mb-1">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                          ${order.total?.toFixed(2)}
                        </p>
                      </div>

                      {user.role === "employee" && (
                        <div className="flex gap-2">
                          {editingOrderId === order.id ? (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  order.id!,
                                  e.target.value as OrderStatus,
                                )
                              }
                              className="px-3 py-2 border-2 border-amber-300 rounded-md bg-white text-amber-900 font-semibold"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Button
                              onClick={() => setEditingOrderId(order.id!)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Update Status
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
