"use client";

import { MenuItem } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EmployeeMenuActionsProps {
  mode: "create" | "edit";
  item?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

export function EmployeeMenuActions({
  mode,
  item,
  onSave,
  onCancel,
}: EmployeeMenuActionsProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(item?.price?.toString() || "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [image, setImage] = useState(item?.image || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(price))) {
      newErrors.price = "Price must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const newItem: MenuItem = {
      id: item?.id || Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      category: "",
      image: image
        ? image
        : "https://via.placeholder.com/300x200?text=" +
          encodeURIComponent(title),
      available,
    };

    onSave(newItem);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-amber-50 rounded border-2 border-amber-200"
    >
      <h3 className="font-bold text-amber-900 text-lg">
        {mode === "create" ? "Add New Item" : "Edit Item"}
      </h3>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item name"
          className="border-amber-200"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
          className="w-full px-3 py-2 border-2 border-amber-200 rounded-md"
          rows={3}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Price ($)
        </label>
        <Input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="border-amber-200"
        />
        {errors.price && (
          <p className="text-red-600 text-sm mt-1">{errors.price}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Image Filename
        </label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="e.g. margherita.jpg"
          className="border-amber-200"
        />
        <p className="text-amber-600 text-xs mt-1">
          File must be placed in /public/images/
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
          className="w-4 h-4"
        />
        <label
          htmlFor="available"
          className="text-sm font-medium text-amber-900"
        >
          Available for order
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {mode === "create" ? "Add Item" : "Update Item"}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
