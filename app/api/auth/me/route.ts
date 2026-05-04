// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface UserProfileRow extends RowDataPacket {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
  Name?: string;
}

/**
 * Gets the current user's info
 * 
 * Verifies if a user is logged in
 * Fetches profile data
 * Restores user session on page refresh
 * checks authentication status on client side
 * 
 * Called when 
 * app loads to check if user is logged in
 * page is refreshed to restore session
 * to verify token validy before making API calls
 * to get fresh data after profile updates
 * 
 * Extracts JWT token from cookie
 * validates it
 * extracts userid
 * fetches user data from database using userid
 * returns user info (except password)
 * 
 * throwsa 401 error if not authenticated or invalid token
 * throws a 404 error if user not found
 * throws a 500 error if database query fails
 */

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const [users] = await pool.query<UserProfileRow[]>(
      `SELECT u.UserID, u.Email, u.IsAdmin, p.Name
       FROM Users u
       LEFT JOIN Profiles p ON u.UserID = p.UserID
       WHERE u.UserID = ?`,
      [payload.UserID]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          UserID: user.UserID,
          Email: user.Email,
          IsAdmin: user.IsAdmin,
          name: user.Name || '',
          role: user.IsAdmin === 1 ? 'employee' : 'client',
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}