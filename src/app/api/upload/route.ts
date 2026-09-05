import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';
import { logActivity, extractIp } from '@/lib/activity-log';

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo', // .avi
  // Audio
  'audio/mpeg', // .mp3
  'audio/ogg',  // .ogg
  'audio/wav',  // .wav
  'audio/webm', // .weba
  'audio/mp4', // .m4a
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video';
  return 'raw';
}

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'portfolio_uploads';
    const resourceTypeParam = formData.get('resource_type') as 'auto' | 'image' | 'video' | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Infer MIME type if missing or generic
    let fileType = file.type;
    if (!fileType || fileType === 'application/octet-stream') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'mp4') fileType = 'video/mp4';
      else if (ext === 'webm') fileType = 'video/webm';
      else if (ext === 'mov') fileType = 'video/quicktime';
      else if (ext === 'avi') fileType = 'video/x-msvideo';
      else if (ext === 'jpg' || ext === 'jpeg') fileType = 'image/jpeg';
      else if (ext === 'png') fileType = 'image/png';
      else if (ext === 'webp') fileType = 'image/webp';
      else if (ext === 'gif') fileType = 'image/gif';
      else if (ext === 'svg') fileType = 'image/svg+xml';
      else if (ext === 'mp3') fileType = 'audio/mpeg';
      else if (ext === 'ogg') fileType = 'audio/ogg';
      else if (ext === 'wav') fileType = 'audio/wav';
      else if (ext === 'm4a') fileType = 'audio/mp4';
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: `File type ${fileType || 'unknown'} not allowed. Allowed: images (jpg, png, webp, gif, svg), videos (mp4, webm, mov, avi), and audio (mp3, ogg, wav, m4a).` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resourceType = resourceTypeParam || getResourceType(fileType);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    await logActivity({
      adminId: token.id || 'unknown',
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
      },
      ip: extractIp(request),
    });

    // Determine human-readable media type for the client
    const mediaType: 'gif' | 'video' | 'audio' | 'image' =
      fileType === 'image/gif' ? 'gif'
      : fileType.startsWith('video/') ? 'video'
      : fileType.startsWith('audio/') ? 'audio'
      : 'image';

    return NextResponse.json({ success: true, data: { ...uploadResult, mediaType } }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
