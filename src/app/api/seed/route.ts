import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();
    
    const email = 'admin@admin.com';
    const password = 'password123';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create or update admin user
    await User.findOneAndUpdate(
      { email },
      {
        name: 'M Portfolio Admin',
        email,
        passwordHash,
        role: 'admin'
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Admin seeded successfully! You can now login.',
      credentials: {
        email,
        password
      }
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
