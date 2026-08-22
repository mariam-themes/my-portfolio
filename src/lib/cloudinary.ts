import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Utility to extract public_id from a secure_url
 * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/projects/sample.jpg -> projects/sample
 */
export const extractPublicId = (url: string) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const fileWithExtension = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const fileName = fileWithExtension.split('.')[0];
    return `${folder}/${fileName}`;
  } catch (error) {
    console.error('Error extracting public_id', error);
    return null;
  }
};

export default cloudinary;
