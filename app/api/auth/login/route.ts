import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE Email = ? LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];

    if (user.Password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: "temporary-token",
      user: {
        UserID: user.UserID,
        Email: user.Email,
        IsAdmin: user.IsAdmin,
        CreatedAt: new Date().toISOString(),
        role: user.IsAdmin === 1 ? "employee" : "client",
        name: user.Email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}