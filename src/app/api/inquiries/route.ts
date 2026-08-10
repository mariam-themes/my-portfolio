import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Inquiry } from '@/models/Inquiry';
import { sendNewInquiryNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const service = typeof body.service === 'string' ? body.service.trim() : '';

    if (!name || !email || !service) {
      return NextResponse.json(
        { success: false, error: 'Name, email and service are required' },
        { status: 400 }
      );
    }

    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      service,
      budget: typeof body.budget === 'string' ? body.budget.trim() : undefined,
      timeline: typeof body.timeline === 'string' ? body.timeline.trim() : undefined,
      message: typeof body.message === 'string' ? body.message.trim() : '',
    });

    // Notify the owner (non-fatal: never fails the request).
    await sendNewInquiryNotification(inquiry);

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      const messages = Object.values(
        (error as { errors?: Record<string, { message: string }> }).errors ?? {}
      ).map((err) => err.message);
      return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}