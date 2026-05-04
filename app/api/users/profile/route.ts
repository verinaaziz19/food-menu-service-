import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/db";

interface UserProfileRow extends RowDataPacket {
  UserID: number;
  Email: string;
  IsAdmin: number;
  ProfileID?: number;
  Name?: string;
  Address?: string;
  CellPhone?: string;
}

interface ProfileExistsRow extends RowDataPacket {
  ProfileID: number;
}

function getCurrentUserId(request: NextRequest): string | null {
  const userId = request.headers.get("X-User-Id");
  return userId || null;
}

export async function GET(request: NextRequest) {
  try {
    const UserID = getCurrentUserId(request);

    if (!UserID) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<UserProfileRow[]>(
      `SELECT u.UserID, u.Email, u.IsAdmin,
              p.ProfileID, p.Name, p.Address, p.CellPhone
       FROM Users u
       LEFT JOIN Profiles p ON u.UserID = p.UserID
       WHERE u.UserID = ?`,
      [UserID]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          UserID: user.UserID,
          Email: user.Email,
          IsAdmin: user.IsAdmin,
        },
        profile: {
          ProfileID: user.ProfileID || null,
          UserID: user.UserID,
          Name: user.Name || "",
          Address: user.Address || "",
          CellPhone: user.CellPhone || "",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const UserID = getCurrentUserId(request);

    if (!UserID) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const Name = body.Name || "";
    const Address = body.Address || "";
    const CellPhone = body.CellPhone || "";

    const [existingRows] = await pool.query<ProfileExistsRow[]>(
      "SELECT ProfileID FROM Profiles WHERE UserID = ?",
      [UserID]
    );

    if (existingRows.length > 0) {
      await pool.query<ResultSetHeader>(
        "UPDATE Profiles SET Name = ?, Address = ?, CellPhone = ? WHERE UserID = ?",
        [Name, Address, CellPhone, UserID]
      );
    } else {
      await pool.query<ResultSetHeader>(
        "INSERT INTO Profiles (UserID, Name, Address, CellPhone) VALUES (?, ?, ?, ?)",
        [UserID, Name, Address, CellPhone]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        UserID,
        Name,
        Address,
        CellPhone,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}