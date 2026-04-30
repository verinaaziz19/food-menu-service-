import type { NextRequest } from 'next/server';

import {
  getAllowedStatuses,
  getCurrentUser,
  getOrdersStore,
  normalizeOrder,
} from '@/lib/mock-order-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return Response.json(
        { success: false, error: 'Invalid order id' },
        { status: 400 }
      );
    }

    const order = getOrdersStore().find((entry) => entry.OrderID === orderId);

    if (!order) {
      return Response.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!user.isAdmin && order.UserID !== user.userId) {
      return Response.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      data: normalizeOrder(order),
    });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!user.isAdmin) {
      return Response.json(
        { success: false, error: 'Only employees can update order statuses' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return Response.json(
        { success: false, error: 'Invalid order id' },
        { status: 400 }
      );
    }

    const orders = getOrdersStore();
    const order = orders.find((entry) => entry.OrderID === orderId);

    if (!order) {
      return Response.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validStatuses = getAllowedStatuses(order.FulfillmentType);

    if (!body?.Status) {
      return Response.json(
        { success: false, error: 'Status field is required' },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(body.Status)) {
      return Response.json(
        {
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    order.Status = body.Status;

    return Response.json({
      success: true,
      message: 'Order status updated',
      data: {
        ...normalizeOrder(order),
        UpdatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
