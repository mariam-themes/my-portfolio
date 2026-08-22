import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Sort by order ascending
    const services = await Service.find({}).sort({ order: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching public services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
