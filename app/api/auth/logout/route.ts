// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

/**
 * Logs out the user by clearing the auth cookie
 * 
 * Terminates user's session on client side
 * Clears JWT token from cookies
 * Invalidates session on client side
 * 
 * Called when user clicks logout button
 * 
 * Creates a JSON response
 * Overwrites the auth cookie with an empty value and immediate expiration
 * return success response to client
 */

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}