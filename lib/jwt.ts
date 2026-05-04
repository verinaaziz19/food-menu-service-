// lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  UserID: string | number;
  Email: string;
  IsAdmin: number;
}

/**
 * 
 * handle JWT token generation and verification and extraction
 * 
 * JWT is a secure token that contains user info wiht a header.payload.signature
 * 
 * allows for authentication, contains user info, and secure
 * 
 * generatoken() is used on register/login
 * verifyToken() is used on protected routes to check if token is valid and get user info
 * getTokenFromRequest() is used to extract token from request headers or cookies
 *
*/


/** 
 * generateToken creates a signed token containing user info
 * signed with JWT_SECRET and expires in 7 days
 * 
 * payload holds userid, email, isadmin
 * 
 */

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/*
 * verifyToken checks token signature and expiration
 * returns decoded payload if valid, otherwise null
 * 
 * rejects tamperred tokens, expired tokens, or malformed tokens
 * 
 */

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/*
 * getTokenFromRequest checks for token in auythorization header (Bearer token) or in cookies (auth-token)
 * 
 * header has first priority
 * 
 * returns token string or null if not found
 * 
 */

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const tokenMatch = cookie.match(/auth-token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }
  
  return null;
}