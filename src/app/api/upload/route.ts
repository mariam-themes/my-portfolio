import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'portfolio_uploads';
    const resourceType = formData.get('resource_type') as 'auto' | 'image' | 'video' || 'auto';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert the File object to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType, // Important for audio files (they use 'video' or 'auto')
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Convert Buffer to a Readable stream and pipe it to Cloudinary
      Readable.from(buffer).pipe(uploadStream);
    });

    return NextResponse.json({ success: true, data: uploadResult }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
