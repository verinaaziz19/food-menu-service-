import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

export async function GET(request: NextRequest) {
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

    let orders: OrderRow[];

    if (payload.IsAdmin === 1) {
      // Employee sees all orders with customer names
      [orders] = await pool.query<OrderRow[]>(
        `SELECT o.OrderID, o.UserID, o.OrderTime, o.TotalPrice, o.Status, p.Name
         FROM orders o
         LEFT JOIN profiles p ON o.UserID = p.UserID
         ORDER BY o.OrderTime DESC`,
      );
    } else {
      // Client sees only their orders
      [orders] = await pool.query<OrderRow[]>(
        `SELECT o.OrderID, o.UserID, o.OrderTime, o.TotalPrice, o.Status, p.Name
         FROM orders o
         LEFT JOIN profiles p ON o.UserID = p.UserID
         WHERE o.UserID = ?
         ORDER BY o.OrderTime DESC`,
        [payload.UserID],
      );
    }

    // Fetch order details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const [details] = await pool.query<OrderDetailRow[]>(
          `SELECT od.Order_DetailsID, od.OrderID, od.ItemID, od.Quantity, od.UnitPrice, i.Name as ItemName
           FROM order_details od
           LEFT JOIN items i ON od.ItemID = i.ItemID
           WHERE od.OrderID = ?`,
          [order.OrderID],
        );

        return {
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
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: { orders: ordersWithDetails },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { items } = body; // Array of { ItemID, Quantity, UnitPrice }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Items array is required and must not be empty",
        },
        { status: 400 },
      );
    }

    const validItems = items.every(
      (item) => item.ItemID && item.Quantity && item.UnitPrice,
    );
    if (!validItems) {
      return NextResponse.json(
        {
          success: false,
          error: "Each item must have ItemID, Quantity, and UnitPrice",
        },
        { status: 400 },
      );
    }

    // Calculate total
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + item.UnitPrice * item.Quantity,
      0,
    );

    // Insert order
    const [orderResult] = await pool.query<ResultSetHeader>(
      "INSERT INTO orders (UserID, TotalPrice, Status) VALUES (?, ?, ?)",
      [payload.UserID, totalPrice, "Active"],
    );

    const orderID = orderResult.insertId;

    // Insert order details
    for (const item of items) {
      await pool.query(
        "INSERT INTO order_details (OrderID, ItemID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)",
        [orderID, item.ItemID, item.Quantity, item.UnitPrice],
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          order: {
            OrderID: orderID,
            UserID: payload.UserID,
            Status: "Active",
            TotalPrice: totalPrice,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 },
    );
  }
}
