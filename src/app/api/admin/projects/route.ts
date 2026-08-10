import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Sort by createdAt descending for admin view
    const projects = await Project.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    const project = await Project.create(body);

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: any) {
    console.error('=== PROJECT CREATE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    // Handle Mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 });
    }
    // Handle Mongo duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'A project with this title/slug already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
