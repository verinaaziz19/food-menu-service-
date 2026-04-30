'use client';

import { MenuItem, useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { EmployeeMenuActions } from './employee-menu-actions';

interface MenuGridProps {
  items: MenuItem[];
  isEmployee: boolean;
  onSelectItem?: (item: MenuItem) => void;
}

export function MenuGrid({ items, isEmployee, onSelectItem }: MenuGridProps) {
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
            className="bg-[#88b95f] text-white hover:bg-[#6e9f48]"
          >
            {showAddForm ? 'Cancel' : '+ Add New Item'}
          </Button>
        </div>
      )}

      {isEmployee && showAddForm && (
        <EmployeeMenuActions
          mode="create"
          onSave={(item) => {
            addMenuItem(item);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const itemId = item.id ?? String(item.ItemID ?? `item-${index}`);
          const itemPrice = item.price ?? item.Price ?? 0;
          const itemTitle = item.title ?? item.ItemName ?? 'Menu Item';
          const itemDescription = item.description ?? item.Description ?? '';
          const itemImage = item.image ?? 'https://via.placeholder.com/300x200?text=Ostria+Dish';
          const isAvailable = item.available ?? Boolean(item.IsAvailable ?? true);

          return (
          <Card
            key={itemId}
            className={`overflow-hidden shadow-lg hover:shadow-xl transition border-2 ${
              isEmployee ? 'border-[#e8d8c7]' : 'border-[#f0dfcd]'
            } ${editingId === itemId ? 'ring-2 ring-[#c95a2e]' : ''}`}
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={itemImage}
                alt={itemTitle}
                className="w-full h-full object-cover"
              />
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Unavailable</span>
                </div>
              )}
            </div>

            <div className="p-4">
              {editingId === itemId && isEmployee ? (
                <EmployeeMenuActions
                  mode="edit"
                  item={item}
                  onSave={(updatedItem) => {
                    updateMenuItem(itemId, updatedItem);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <h3 className="mb-1 text-lg font-bold text-[#7a432d]">{itemTitle}</h3>
                  <p className="mb-3 text-sm text-[#94644f]">{itemDescription}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#c95a2e]">${itemPrice.toFixed(2)}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>

                  {isEmployee ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(itemId)}
                        className="flex-1 bg-[#88b95f] text-white hover:bg-[#6e9f48]"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteMenuItem(itemId)}
                        className="flex-1 bg-[#c95a2e] text-white hover:bg-[#ab4a22]"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSelectItem(item)}
                      disabled={!isAvailable}
                      className={`w-full ${
                        isAvailable
                          ? 'bg-[#c95a2e] hover:bg-[#ab4a22]'
                          : 'bg-gray-400'
                      } text-white`}
                    >
                      {isAvailable ? 'Select' : 'Out of Stock'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        )})}
      </div>
    </div>
  );
}
