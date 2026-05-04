// lib/auth.ts
import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import pool from './db';

// Secret key for JWT (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Define the JWT Payload type
export interface JWTPayload {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
}

// Define the Session type (if using database sessions)
interface SessionRow extends RowDataPacket {
  UserID: string | number;
  Token: string;
  ExpiresAt: Date;
}

// Define the User type
interface UserRow extends RowDataPacket {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
  Name?: string;
  Address?: string;
  CellPhone?: string;
}

// Helper function to get token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    return token;
  }
  
  return null;
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function getCurrentUserId(request: NextRequest): Promise<string | number | null> {
  try {
    // Get token from request
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return null;
    }
    
    // Verify JWT token
    const payload = verifyToken(token);
    if (payload && payload.UserID) {
      return payload.UserID;
    }
    
    // Fallback to database sessions (if you're still using them)
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

// Helper function to get the current user with profile info
export async function getCurrentUser(request: NextRequest) {
  const userId = await getCurrentUserId(request);
  if (!userId) return null;
  
  try {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT u.UserID, u.Email, u.IsAdmin,
              p.Name, p.Address, p.CellPhone
       FROM Users u
       LEFT JOIN Profiles p ON u.UserID = p.UserID
       WHERE u.UserID = ?`,
      [userId]
    );
    
    if (rows && rows.length > 0) {
      const user = rows[0];
      return {
        UserID: user.UserID,
        Email: user.Email,
        IsAdmin: user.IsAdmin,
        name: user.Name || '',
        address: user.Address || '',
        cellPhone: user.CellPhone || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}