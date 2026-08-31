import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { Inquiry } from '@/models/Inquiry';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Mark all unread inquiries as read
    await Inquiry.updateMany({ isRead: false }, { $set: { isRead: true } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error marking inquiries read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark inquiries read' },
      { status: 500 }
    );
  }
}
