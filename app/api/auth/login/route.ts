// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  UserID: string | number;
  Email: string;
  Password: string;
  IsAdmin: number;
}

/**
 *Authenticate a user and create a session
 *
 * verifies email and password
 * generates JWT token
 * set up an HTTP-only cookie with the token for session management
 * returns user data to frontend
 * 
 * called when user submits login form on /login/page.tsx
 * login after registration
 * refresh page
 * 
 * validates email and password provided
 * looks up user by email in database
 * compares password with hashed password in database
 * fetches users profile name from Profiles table
 * generates JWT token containing userid, email, isadmin
 * sets token as HTTP cookie
 * returns user data
 * 
 * throws 400 if email or password missing
 * throws 401 if user not found or password invalid
 * throws 500 if database error or other server error occurs
 *   
**/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) { //error handling for missing password or email
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const [users] = await pool.query<UserRow[]>(
      'SELECT UserID, Email, Password, IsAdmin FROM Users WHERE Email = ?',
      [email]
    );

    //error handling for user not found
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.Password);
    
    //error handling for invalid password
    if (!isValidPassword) { 
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user profile
    const [profiles] = await pool.query<any[]>(
      'SELECT Name FROM Profiles WHERE UserID = ?',
      [user.UserID]
    );

    const userName = profiles && profiles.length > 0 ? profiles[0].Name : '';

    // Generate JWT token
    const token = generateToken({ 
      UserID: user.UserID, 
      Email: user.Email, 
      IsAdmin: user.IsAdmin 
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          UserID: user.UserID,
          Email: user.Email,
          IsAdmin: user.IsAdmin,
          name: userName,
          role: user.IsAdmin === 1 ? 'employee' : 'client',
        },
        token,
      },
    });

    // Set token in cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) { //error if database error
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    );
  }
}