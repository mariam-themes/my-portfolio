import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all projects, sort by year descending
    const projects = await Project.find({}).sort({ year: -1 });
    
    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
