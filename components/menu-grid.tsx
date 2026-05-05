"use client";

import { MenuItem, useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { EmployeeMenuActions } from "./employee-menu-actions";

interface MenuGridProps {
  items: MenuItem[];
  isEmployee: boolean;
  onSelectItem?: (item: MenuItem) => void;
  onItemAdded?: () => void;
}

export function MenuGrid({
  items,
  isEmployee,
  onSelectItem,
  onItemAdded,
}: MenuGridProps) {
  const { addToCart, deleteMenuItem, updateMenuItem, addMenuItem } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelectItem = (item: MenuItem) => {
    if (!isEmployee) {
      addToCart(item);
      onSelectItem?.(item);
    }
  };

  return (
    <div>
      {isEmployee && (
        <div className="mb-6 flex gap-4">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {showAddForm ? "Cancel" : "+ Add New Item"}
          </Button>
        </div>
      )}

      {isEmployee && showAddForm && (
        <EmployeeMenuActions
          mode="create"
          onSave={async (item) => {
            await addMenuItem(item);
            onItemAdded?.();
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`overflow-hidden shadow-lg hover:shadow-xl transition border-2 ${
              isEmployee ? "border-amber-200" : "border-amber-100"
            } ${editingId === item.id ? "ring-2 ring-amber-500" : ""}`}
          >
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {!item.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Unavailable</span>
                </div>
              )}
            </div>

            <div className="p-4">
              {editingId === item.id && isEmployee ? (
                <EmployeeMenuActions
                  mode="edit"
                  item={item}
                  onSave={async (updatedItem) => {
                    await updateMenuItem(item.id!, updatedItem);
                    onItemAdded?.();
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600">
                      ${item.price?.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.available ? "Available" : "Out of Stock"}
                    </span>
                  </div>

                  {isEmployee ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(item.id!)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={async () => {
                          await deleteMenuItem(item.id!);
                          onItemAdded?.();
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSelectItem(item)}
                      disabled={!item.available}
                      className={`w-full ${
                        item.available
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-gray-400"
                      } text-white`}
                    >
                      {item.available ? "Select" : "Out of Stock"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
