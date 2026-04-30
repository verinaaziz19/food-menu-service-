import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export type FulfillmentType = 'pickup' | 'delivery';

export type ApiOrderStatus =
  | 'Active'
  | 'Ready for Pickup'
  | 'Picked Up'
  | 'On the Way'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export interface SessionUser {
  userId: number;
  isAdmin: boolean;
}

interface CatalogItem {
  ItemID: number;
  ItemName: string;
  Price: number;
}

export interface OrderDetailRecord {
  OrderDetailID: number;
  OrderID: number;
  ItemID: number;
  Quantity: number;
  UnitPrice: number;
  ItemName: string;
}

export interface OrderRecord {
  OrderID: number;
  UserID: number;
  OrderDate: string;
  Status: ApiOrderStatus;
  TotalAmount: number;
  FulfillmentType: FulfillmentType;
  items: OrderDetailRecord[];
}

export interface RawOrderItemInput {
  ItemID: number | string;
  Quantity: number | string;
}

export const catalog: CatalogItem[] = [
  { ItemID: 1, ItemName: 'Margherita Pizza', Price: 12.99 },
  { ItemID: 2, ItemName: 'Caesar Salad', Price: 8.99 },
  { ItemID: 3, ItemName: 'Chocolate Cake', Price: 5.99 },
];

const seededOrders: OrderRecord[] = [
  {
    OrderID: 1,
    UserID: 1,
    OrderDate: '2026-04-23T02:08:23.000Z',
    Status: 'Ready for Pickup',
    TotalAmount: 31.97,
    FulfillmentType: 'pickup',
    items: [
      {
        OrderDetailID: 1,
        OrderID: 1,
        ItemID: 1,
        Quantity: 2,
        UnitPrice: 12.99,
        ItemName: 'Margherita Pizza',
      },
      {
        OrderDetailID: 2,
        OrderID: 1,
        ItemID: 3,
        Quantity: 1,
        UnitPrice: 5.99,
        ItemName: 'Chocolate Cake',
      },
    ],
  },
  {
    OrderID: 2,
    UserID: 1,
    OrderDate: '2026-04-29T17:15:00.000Z',
    Status: 'On the Way',
    TotalAmount: 17.98,
    FulfillmentType: 'delivery',
    items: [
      {
        OrderDetailID: 3,
        OrderID: 2,
        ItemID: 2,
        Quantity: 2,
        UnitPrice: 8.99,
        ItemName: 'Caesar Salad',
      },
    ],
  },
];

const orderStore = globalThis as typeof globalThis & {
  __ordersStore?: OrderRecord[];
};

export function getOrdersStore() {
  if (!orderStore.__ordersStore) {
    orderStore.__ordersStore = [...seededOrders];
  }

  return orderStore.__ordersStore;
}

function parseBooleanFlag(value: string | null) {
  return value === '1' || value === 'true' || value === 'employee';
}

export async function getCurrentUser(
  request: NextRequest
): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const headerUserId = request.headers.get('x-user-id');
  const cookieUserId = cookieStore.get('mock-user-id')?.value;
  const queryUserId = request.nextUrl.searchParams.get('userId');
  const rawUserId = headerUserId ?? cookieUserId ?? queryUserId;

  const headerRole = request.headers.get('x-user-role');
  const cookieRole = cookieStore.get('mock-user-role')?.value;
  const queryRole = request.nextUrl.searchParams.get('role');
  const rawRole = headerRole ?? cookieRole ?? queryRole;

  if (!rawUserId || !rawRole) {
    return null;
  }

  const userId = Number(rawUserId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return {
    userId,
    isAdmin: parseBooleanFlag(rawRole),
  };
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeOrder(order: OrderRecord) {
  return {
    order: {
      OrderID: order.OrderID,
      UserID: order.UserID,
      OrderDate: order.OrderDate,
      Status: order.Status,
      TotalAmount: order.TotalAmount,
      FulfillmentType: order.FulfillmentType,
    },
    items: order.items.map((item) => ({
      OrderDetailID: item.OrderDetailID,
      OrderID: item.OrderID,
      ItemID: item.ItemID,
      Quantity: item.Quantity,
      UnitPrice: item.UnitPrice,
      ItemName: item.ItemName,
    })),
  };
}

export function validateItems(
  items: unknown
): { ok: true; value: RawOrderItemInput[] } | { ok: false; error: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      ok: false,
      error: 'items array is required and must not be empty',
    };
  }

  const hasOnlyObjects = items.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'ItemID' in item &&
      'Quantity' in item
  );

  if (!hasOnlyObjects) {
    return {
      ok: false,
      error: 'Each item must have ItemID and Quantity',
    };
  }

  return {
    ok: true,
    value: items as RawOrderItemInput[],
  };
}

export function getAllowedStatuses(
  fulfillmentType: FulfillmentType
): ApiOrderStatus[] {
  if (fulfillmentType === 'delivery') {
    return ['Active', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'];
  }

  return ['Active', 'Ready for Pickup', 'Completed', 'Cancelled'];
}

export function parseFulfillmentType(value: unknown): FulfillmentType | null {
  if (value === 'pickup' || value === 'delivery') {
    return value;
  }

  return null;
}
