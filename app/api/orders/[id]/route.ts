import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { RowDataPacket } from "mysql2";

interface OrderRow extends RowDataPacket {
  OrderID: number;
  UserID: number;
  OrderTime: string;
  TotalPrice: number;
  Status: string;
  Name: string;
}

interface OrderDetailRow extends RowDataPacket {
  Order_DetailsID: number;
  OrderID: number;
  ItemID: number;
  Quantity: number;
  UnitPrice: number;
  ItemName: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const [orders] = await pool.query<OrderRow[]>(
      `SELECT o.OrderID, o.UserID, o.OrderTime, o.TotalPrice, o.Status, p.Name
       FROM orders o
       LEFT JOIN profiles p ON o.UserID = p.UserID
       WHERE o.OrderID = ?`,
      [id],
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const order = orders[0];

    // Clients can only see their own orders
    if (payload.IsAdmin === 0 && order.UserID !== payload.UserID) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const [details] = await pool.query<OrderDetailRow[]>(
      `SELECT od.Order_DetailsID, od.OrderID, od.ItemID, od.Quantity, od.UnitPrice, i.Name as ItemName
       FROM order_details od
       LEFT JOIN items i ON od.ItemID = i.ItemID
       WHERE od.OrderID = ?`,
      [id],
    );

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: String(order.OrderID),
          OrderID: order.OrderID,
          UserID: order.UserID,
          userName: order.Name,
          createdAt: order.OrderTime,
          total: parseFloat(String(order.TotalPrice)),
          status: order.Status,
          items: details.map((d) => ({
            menuItemId: String(d.ItemID),
            title: d.ItemName,
            price: parseFloat(String(d.UnitPrice)),
            quantity: d.Quantity,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.IsAdmin !== 1) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validStatuses = ["Active", "Completed", "Cancelled"];

    if (!body.Status || !validStatuses.includes(body.Status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Status must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    await pool.query("UPDATE orders SET Status = ? WHERE OrderID = ?", [
      body.Status,
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      data: { OrderID: id, Status: body.Status },
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}
