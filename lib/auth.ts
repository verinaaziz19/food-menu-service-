// lib/auth.ts
import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from './db';

// Secret key for JWT (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Define the Session type
interface SessionRow extends RowDataPacket {
  UserID: string | number;
  Token: string;
  ExpiresAt: Date;
}

export async function getCurrentUserId(request: NextRequest): Promise<string | number | null> {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }
    
    // Option 1: If you're using JWT tokens
    // For JWT (you'll need to install jsonwebtoken: npm install jsonwebtoken @types/jsonwebtoken)
    /*
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
    */
    
    // Option 2: If you're using sessions stored in database
    try {
      const [rows] = await pool.query<SessionRow[]>(
        'SELECT UserID FROM Sessions WHERE Token = ? AND ExpiresAt > NOW()',
        [token]
      );
      
      if (rows && rows.length > 0) {
        return rows[0].UserID;
      }
      return null;
    } catch (dbError) {
      console.error('Database error in getCurrentUserId:', dbError);
      return null;
    }
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}


// Define the User type
interface UserRow extends RowDataPacket {
  UserID: string | number;
  Email: string;
  IsAdmin: boolean;
  CreatedAt: Date;
  Name?: string;
  Address?: string;
  CellPhone?: string;
  City?: string;
  PostalCode?: string;
}

// Helper function to get the current user with profile info
export async function getCurrentUser(request: NextRequest) {
  const userId = await getCurrentUserId(request);
  if (!userId) return null;
  
  try {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT u.UserID, u.Email, u.IsAdmin, u.CreatedAt,
              p.Name, p.Address, p.CellPhone, p.City, p.PostalCode
       FROM Users u
       LEFT JOIN Profiles p ON u.UserID = p.UserID
       WHERE u.UserID = ?`,
      [userId]
    );
    
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

