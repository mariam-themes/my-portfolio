import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from '@/lib/cloudinary';
import {
  ALLOWED_FOLDERS,
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedFolder,
  isAllowedMimeType,
  inferMimeType,
} from '@/lib/upload-constants';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: login required' }, { status: 401 });
    }

    if (token.role && token.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: admin privilege required' }, { status: 403 });
    }

    // 2. Parse request body
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const folder = (body.folder || 'projects').trim();
    const filename = (body.filename || '').trim();
    let mimeType = (body.mimeType || '').trim();
    const fileSize = typeof body.fileSize === 'number' ? body.fileSize : undefined;

    if (filename && (!mimeType || mimeType === 'application/octet-stream')) {
      mimeType = inferMimeType(filename, mimeType);
    }

    // 3. Strict Folder Validation
    if (!isAllowedFolder(folder)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid target folder "${folder}". Allowed: ${ALLOWED_FOLDERS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. File Format Validation (if supplied)
    if (mimeType && !isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type "${mimeType}" is not allowed.`,
        },
        { status: 400 }
      );
    }

    // Determine resource type: images go to image/, videos & audio go to video/
    let resourceType: 'image' | 'video' | 'auto' = 'auto';
    if (body.resourceType && ['image', 'video', 'auto'].includes(body.resourceType)) {
      resourceType = body.resourceType;
    } else if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      resourceType = 'video';
    }

    // 5. Size limits verification
    if (fileSize !== undefined) {
      if (resourceType === 'video' && fileSize > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Video file exceeds ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)} MB limit.`,
          },
          { status: 400 }
        );
      }
      if (resourceType === 'image' && fileSize > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Image file exceeds ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB limit.`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Verify Cloudinary Credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[upload/sign] Missing Cloudinary environment variables');
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: Cloudinary credentials missing.' },
        { status: 500 }
      );
    }

    // 7. Generate Signature
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, any> = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        resourceType,
        uploadUrl,
        maxFileSize: resourceType === 'image' ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES,
      },
    });
  } catch (error: any) {
    console.error('[upload/sign] Error generating signature:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
