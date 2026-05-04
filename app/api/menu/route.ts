import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ItemRow extends RowDataPacket {
  ItemID: number;
  Name: string;
  Description: string;
  Price: number;
  Category: string;
  Availability: number;
  Image: string;
}

export async function GET() {
  try {
    const [items] = await pool.query<ItemRow[]>(
      'SELECT ItemID, Name, Description, Price, Category, Availability, Image FROM items WHERE Availability = 1 ORDER BY Category, Name'
    );

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify employee auth
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.IsAdmin !== 1) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { Name, Description, Price, Category, Image } = body;

    // Validate required fields
    if (!Name || !Description || !Price || !Category) {
      return NextResponse.json(
        { success: false, error: 'Name, Description, Price, and Category are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO items (Name, Description, Price, Category, Availability, Image) VALUES (?, ?, ?, ?, 1, ?)',
      [Name, Description, Price, Category, Image || '']
    );

    return NextResponse.json({
      success: true,
      message: 'Menu item created',
      data: {
        item: {
          ItemID: result.insertId,
          Name, Description, Price, Category,
          Availability: 1,
          Image: Image || '',
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}