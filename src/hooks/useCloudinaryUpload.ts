import { useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export const useCloudinaryUpload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, folder: string = 'projects') => {
    setState('uploading');
    setError(null);

    try {
      // Upload through our backend route. It uses the Cloudinary SDK
      // server-side (upload_stream) so signatures are handled internally,
      // auth is enforced by the proxy, and it works with every file type.
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('resource_type', 'auto');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        let errorMsg = 'Failed to upload. Are you logged in?';
        try {
          const errData = await uploadRes.clone().json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(errorMsg);
      }

      const data = await uploadRes.json();
      if (!data?.success || !data?.data?.secure_url) {
        throw new Error(data?.error || 'Failed to upload');
      }

      setState('success');
      return data.data.secure_url;
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'An unexpected error occurred during upload. Please check your internet connection.');
      setState('error');
      return null;
    }
  };

  return { uploadFile, state, error, reset: () => setState('idle') };
};