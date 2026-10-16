import { NextResponse, type NextRequest } from 'next/server';
import { POST as signPost } from '@/app/api/upload/sign/route';

export async function POST(request: NextRequest) {
  // Delegate directly to the unified signing route
  return signPost(request);
}
