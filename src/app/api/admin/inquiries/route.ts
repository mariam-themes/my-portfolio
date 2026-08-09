import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { Inquiry } from '@/models/Inquiry';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const filter = status && ['new', 'contacted', 'closed'].includes(status) ? { status } : {};

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: inquiries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}