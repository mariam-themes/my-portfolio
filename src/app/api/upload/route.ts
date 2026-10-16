import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';
import { logActivity, extractIp } from '@/lib/activity-log';
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedMimeType,
  isAllowedFolder,
  inferMimeType,
  getResourceType,
  getHumanMediaType,
} from '@/lib/upload-constants';

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (token.role && token.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: admin privilege required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'portfolio_uploads';
    const resourceTypeParam = formData.get('resource_type') as 'auto' | 'image' | 'video' | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Infer MIME type if missing or generic
    const fileType = inferMimeType(file.name, file.type);

    // Validate file type
    if (!isAllowedMimeType(fileType)) {
      return NextResponse.json(
        { success: false, error: `File type ${fileType || 'unknown'} not allowed. Allowed: images, videos, and audio.` },
        { status: 400 }
      );
    }

    // Validate folder
    if (!isAllowedFolder(folder)) {
      return NextResponse.json(
        { success: false, error: `Invalid folder "${folder}".` },
        { status: 400 }
      );
    }

    const resourceType = resourceTypeParam || getResourceType(fileType);
    const maxSize = resourceType === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${maxSize / (1024 * 1024)} MB limit.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Sanity-check Cloudinary credentials ──────────
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[upload] Missing Cloudinary environment variables');
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: missing Cloudinary env vars.' },
        { status: 500 }
      );
    }

    console.log(`[upload fallback] Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) → folder="${folder}" resource_type="${resourceType}"`);

    const uploadFn = (file.size > 20 * 1024 * 1024 && cloudinary.uploader.upload_chunked_stream)
      ? cloudinary.uploader.upload_chunked_stream.bind(cloudinary.uploader)
      : cloudinary.uploader.upload_stream.bind(cloudinary.uploader);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = uploadFn(
        {
          folder,
          resource_type: resourceType,
          chunk_size: 6000000,
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    const adminId = (token.id as string) || (token.sub as string) || (token.email as string) || 'admin';
    await logActivity({
      adminId,
      action: 'MEDIA_UPLOAD',
      entityType: 'media',
      entityId: uploadResult.public_id,
      details: {
        filename: file.name,
        mimeType: fileType,
        sizeBytes: file.size,
        folder,
        resourceType,
        cloudinaryUrl: uploadResult.secure_url,
        verified: true,
      },
      ip: extractIp(request),
    });

    const mediaType = getHumanMediaType(fileType);

    return NextResponse.json({ success: true, data: { ...uploadResult, mediaType } }, { status: 200 });

  } catch (error: any) {
    console.error('[upload] Upload failed:', error);
    let friendlyMessage = error?.message || 'Upload failed — unknown error';
    const code = error?.http_code ?? error?.status;

    if (code === 401) friendlyMessage = 'Cloudinary credentials are invalid.';
    else if (code === 420 || code === 429) friendlyMessage = 'Cloudinary rate limit reached.';
    else if (code === 400 && error?.message?.toLowerCase().includes('quota')) friendlyMessage = 'Cloudinary monthly quota exceeded.';
    else if (code === 400 && error?.message?.toLowerCase().includes('file size')) friendlyMessage = 'File is too large for your Cloudinary plan.';

    return NextResponse.json({ success: false, error: friendlyMessage }, { status: 500 });
  }
}
