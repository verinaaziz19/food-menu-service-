// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

// Define types
interface UserProfileRow extends RowDataPacket {
  UserID: string | number;
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

/**
 * GET /api/users/profile
 * 
 * fetch the current user's profile information
 *
 *  retrieves users info (email, role)
 * profile data (name, address, phone)
 * displays info on profile page
 * 
 * called when user visits profile page
 * after profile update to refrehs data
 * page refresh when on profile page
 * 
 * extracts and validates JWT token
 * gets userID from token
 * joins users and profiles table
 * returns combined user and profile data
 * 
 * throws 401 if no valid token or userID
 * throws 404 if no user found for userID
 * 
 */



export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/users/profile - Starting');
    const UserID = await getCurrentUserId(request);
    console.log('UserID from auth:', UserID);
    
    if (!UserID) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Querying database for UserID:', UserID);
    
    const [rows] = await pool.query<UserProfileRow[]>(
      `SELECT u.UserID, u.Email, u.IsAdmin,
              p.ProfileID, p.Name, p.Address, p.CellPhone
       FROM Users u
       LEFT JOIN Profiles p ON u.UserID = p.UserID
       WHERE u.UserID = ?`,
      [UserID]
    );
    
    console.log('Query results:', rows);
    
    if (!rows || rows.length === 0) {
      console.log('No user found for ID:', UserID);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
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
          Name: user.Name || '',
          Address: user.Address || '',
          CellPhone: user.CellPhone || '',
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/users/profile - Starting');
    const body = await request.json();
    console.log('Request body:', body);
    
    const UserID = await getCurrentUserId(request);
    console.log('UserID from auth:', UserID);
    
    if (!UserID) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only include fields that exist in your database
    const allowedFields = ['Name', 'Address', 'CellPhone'];
    const updateData: Record<string, any> = {};
    const values: any[] = [];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        let value = body[field];
        
        // Clean and validate phone number if it's the CellPhone field
        if (field === 'CellPhone') {
          // Remove all non-numeric characters
          const cleaned = value.replace(/\D/g, '');
          
          // Format as XXX-XXX-XXXX
          if (cleaned.length === 10) {
            value = `${cleaned.slice(0,3)}-${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
          } else if (cleaned.length > 0) {
            value = cleaned;
          }
          
          // Truncate if too long (max 50 characters)
          if (value.length > 50) {
            value = value.substring(0, 50);
          }
        }
        
        // Truncate other fields
        if (field === 'Name' && value.length > 255) {
          value = value.substring(0, 255);
        }
        if (field === 'Address' && value.length > 255) {
          value = value.substring(0, 255);
        }
        
        updateData[field] = value;
        values.push(value);
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Check if Profiles record exists
    const [existingRows] = await pool.query<ProfileExistsRow[]>(
      'SELECT ProfileID FROM Profiles WHERE UserID = ?',
      [UserID]
    );
    
    if (existingRows && existingRows.length > 0) {
      // Update existing profile
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      values.push(UserID);
      await pool.query<ResultSetHeader>(
        `UPDATE Profiles SET ${setClause} WHERE UserID = ?`,
        values
      );
    } else {
      // Insert new profile
      const columns = ['UserID', ...Object.keys(updateData)];
      const placeholders = columns.map(() => '?').join(', ');
      const insertValues = [UserID, ...values];
      await pool.query<ResultSetHeader>(
        `INSERT INTO Profiles (${columns.join(', ')}) VALUES (${placeholders})`,
        insertValues
      );
    }
    
    // Fetch updated profile
    const [updatedRows] = await pool.query<UserProfileRow[]>(
      `SELECT ProfileID, UserID, Name, Address, CellPhone
       FROM Profiles WHERE UserID = ?`,
      [UserID]
    );
    
    const updatedProfile = (updatedRows && updatedRows[0]) || {};
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}