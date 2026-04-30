import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Just test if we can connect
    const connection = await pool.getConnection();
    
    // Simple query without any reserved words
    const [result] = await connection.query('SELECT 1 as test');
    
    connection.release();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      data: {
        connected: true,
        test: (result as any)[0].test
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}