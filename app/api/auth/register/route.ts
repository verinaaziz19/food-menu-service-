// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { generateToken } from '@/lib/jwt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserExistsRow extends RowDataPacket {
  UserID: string | number;
}

/** 
 * Creates a new user account
 * 
 *
 * Validate registration data
 * Check if email is already taken
 * Hash the password with bcrypt for security
 * create user record in Users table
 * Create associated profile in Profiles table
 * Generate JWT token for immediate login
 * Set HTTP-only cookie for session management
 * 
 *called when user submits registration form on /register/page.tsx
 * when admin creats new employee account
 * 
 * Has email format validation
 * password minimum length
 * password hashing
 * SQL inkection prevention with parameterized queries
 * rollback if profile creatgion fails
 * HTTP only cookies for token storage (prevents client-side JS to access)
 * 
 * throws 400 for missing fields or invalid input
 * throws 409 if email already exists
 * throws 500 for database errors, hashing errors, or token generation errors
 **/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    console.log('Registration attempt for email:', email);

    // Validate input
    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const [existingUsers] = await pool.query<UserExistsRow[]>(
        'SELECT UserID FROM Users WHERE Email = ?',
        [email]
      );

      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists:', email);
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database error checking user' },
        { status: 500 }
      );
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return NextResponse.json(
        { success: false, error: 'Error processing password' },
        { status: 500 }
      );
    }

    // Determine IsAdmin based on role
    const IsAdmin = role === 'employee' ? 1 : 0;

    // Insert user into database
    let UserID;
    try {
      const [result] = await pool.query(
        'INSERT INTO Users (Email, Password, IsAdmin) VALUES (?, ?, ?)',
        [email, hashedPassword, IsAdmin]
      );

      const insertResult = result as ResultSetHeader;
      UserID = insertResult.insertId;
      console.log('User inserted with ID:', UserID);
    } catch (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create profile for the user
    try {
      await pool.query(
        'INSERT INTO Profiles (UserID, Name, Address, CellPhone) VALUES (?, ?, ?, ?)',
        [UserID, name, '', '']
      );
      console.log('Profile created for user:', UserID);
    } catch (profileError) {
      console.error('Error creating profile:', profileError);
      // Try to rollback user creation
      await pool.query('DELETE FROM Users WHERE UserID = ?', [UserID]);
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Generate JWT token
    let token;
    try {
      token = generateToken({ UserID, Email: email, IsAdmin });
      console.log('JWT token generated');
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return NextResponse.json(
        { success: false, error: 'Error generating authentication token' },
        { status: 500 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          UserID,
          Email: email,
          IsAdmin,
          name: name,
          role: role,
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

    console.log('Registration successful for:', email);
    return response;

  } catch (error) {
    console.error('Unhandled registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}