import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { RowDataPacket } from "mysql2";

interface ItemRow extends RowDataPacket {
  ItemID: number;
  Name: string;
  Description: string;
  Price: number;
  Category: string;
  Availability: number;
  Image: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [items] = await pool.query<ItemRow[]>(
      "SELECT ItemID, Name, Description, Price, Category, Availability, Image FROM items WHERE ItemID = ?",
      [id],
    );

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { item: items[0] } });
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu item" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify employee auth
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
    const { Name, Description, Price, Category, Image, Availability } = body;

    if (!Name || !Description || !Price) {
      return NextResponse.json(
        { success: false, error: "Name, Description, and Price are required" },
        { status: 400 },
      );
    }

    await pool.query(
      "UPDATE items SET Name = ?, Description = ?, Price = ?, Category = ?, Image = ?, Availability = ? WHERE ItemID = ?",
      [
        Name,
        Description,
        Price,
        Category || "",
        Image || "",
        Availability ?? 1,
        id,
      ],
    );

    return NextResponse.json({
      success: true,
      message: "Menu item updated",
      data: {
        item: {
          ItemID: id,
          Name,
          Description,
          Price,
          Category,
          Image,
          Availability,
        },
      },
    });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update menu item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify employee auth
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

    await pool.query("DELETE FROM items WHERE ItemID = ?", [id]);

    return NextResponse.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}
