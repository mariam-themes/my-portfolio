import { useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export const useCloudinaryUpload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, folder: string = 'projects') => {
    setState('uploading');
    setError(null);

    try {
      // 1. Get Signature securely from our backend
      const signRes = await fetch('/api/admin/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      
      if (!signRes.ok) throw new Error('Failed to get upload signature. Are you logged in?');
      const signData = await signRes.json();

      // 2. Create FormData for direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      // 3. Upload directly to Cloudinary (bypassing Next.js 4.5MB limits)
      // resource_type: 'auto' handles massive images and videos seamlessly
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error?.message || 'Failed to upload to Cloudinary');
      }

      const data: CloudinaryUploadResponse = await uploadRes.json();
      setState('success');
      
      // Return the secure URL to save in MongoDB
      return data.secure_url; 
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'An unexpected error occurred during upload. Please check your internet connection.');
      setState('error');
      return null;
    }
  };

  return { uploadFile, state, error, reset: () => setState('idle') };
};
