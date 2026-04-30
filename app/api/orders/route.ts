import type { NextRequest } from 'next/server';

import {
  catalog,
  getCurrentUser,
  getOrdersStore,
  normalizeOrder,
  parseFulfillmentType,
  roundCurrency,
  validateItems,
} from '@/lib/mock-order-store';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json(
        {
          success: false,
          error:
            'Unauthorized. Provide x-user-id and x-user-role headers, query params, or mock-user cookies.',
        },
        { status: 401 }
      );
    }

    const orders = getOrdersStore();
    const visibleOrders = user.isAdmin
      ? orders
      : orders.filter((order) => order.UserID === user.userId);

    return Response.json({
      success: true,
      data: visibleOrders
        .slice()
        .sort((left, right) => right.OrderDate.localeCompare(left.OrderDate))
        .map(normalizeOrder),
    });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return Response.json(
        {
          success: false,
          error:
            'Unauthorized. Provide x-user-id and x-user-role headers, query params, or mock-user cookies.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const itemsResult = validateItems(body?.items);

    if (!itemsResult.ok) {
      return Response.json(
        { success: false, error: itemsResult.error },
        { status: 400 }
      );
    }

    const fulfillmentType = parseFulfillmentType(body?.FulfillmentType);
    if (!fulfillmentType) {
      return Response.json(
        {
          success: false,
          error: 'FulfillmentType must be either pickup or delivery',
        },
        { status: 400 }
      );
    }

    const orders = getOrdersStore();
    const nextOrderId =
      orders.reduce((maxId, order) => Math.max(maxId, order.OrderID), 0) + 1;
    const nextOrderDetailId =
      orders
        .flatMap((order) => order.items)
        .reduce((maxId, item) => Math.max(maxId, item.OrderDetailID), 0) + 1;

    let detailId = nextOrderDetailId;

    const normalizedItems = itemsResult.value.map((item) => {
      const itemId = Number(item.ItemID);
      const quantity = Number(item.Quantity);
      const catalogItem = catalog.find((entry) => entry.ItemID === itemId);

      if (!Number.isInteger(itemId) || itemId <= 0 || !catalogItem) {
        throw new Error(`Invalid ItemID: ${item.ItemID}`);
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for ItemID ${itemId}`);
      }

      return {
        OrderDetailID: detailId++,
        OrderID: nextOrderId,
        ItemID: itemId,
        Quantity: quantity,
        UnitPrice: catalogItem.Price,
        ItemName: catalogItem.ItemName,
      };
    });

    const totalAmount = roundCurrency(
      normalizedItems.reduce((sum, item) => sum + item.UnitPrice * item.Quantity, 0)
    );

    const createdOrder = {
      OrderID: nextOrderId,
      UserID: user.userId,
      OrderDate: new Date().toISOString(),
      Status: 'Active' as const,
      TotalAmount: totalAmount,
      FulfillmentType: fulfillmentType,
      items: normalizedItems,
    };

    orders.push(createdOrder);

    return Response.json(
      {
        success: true,
        message: 'Order created successfully',
        data: normalizeOrder(createdOrder),
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : null;
    const isValidationError =
      message?.startsWith('Invalid ItemID:') ||
      message?.startsWith('Invalid quantity for ItemID');

    if (isValidationError) {
      return Response.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
