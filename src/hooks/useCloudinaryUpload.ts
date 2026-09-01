import { useState, useCallback } from 'react';
import { compressImageFile } from '@/lib/imageCompression';

export type UploadState = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video';
  skipCompression?: boolean;
  onProgress?: (progress: number) => void;
}

export const useCloudinaryUpload = () => {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setError(null);
  }, []);

  const uploadFile = async (
    file: File,
    folderOrOptions: string | UploadOptions = 'projects'
  ): Promise<string | null> => {
    const options: UploadOptions =
      typeof folderOrOptions === 'string'
        ? { folder: folderOrOptions }
        : folderOrOptions;

    const folder = options.folder || 'projects';
    const resourceType = options.resourceType || 'auto';
    const skipCompression = options.skipCompression || false;

    setError(null);
    setProgress(0);

    try {
      let fileToUpload = file;

      // Fast Client-side optimization/compression for images
      if (!skipCompression && file.type.startsWith('image/')) {
        setState('compressing');
        fileToUpload = await compressImageFile(file);
      }

      setState('uploading');

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);
      formData.append('resource_type', resourceType);

      // Upload with progress tracking via XMLHttpRequest
      const uploadPromise = new Promise<{ success: boolean; data?: { secure_url: string }; error?: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload', true);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              setProgress(percentComplete);
              if (options.onProgress) {
                options.onProgress(percentComplete);
              }
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (err) {
                reject(new Error('Invalid response from upload server'));
              }
            } else {
              let errorMsg = 'Failed to upload file';
              try {
                const errData = JSON.parse(xhr.responseText);
                if (errData?.error) errorMsg = errData.error;
              } catch {
                /* non-JSON response */
              }
              reject(new Error(errorMsg));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network error during upload. Please check your connection.'));
          };

          xhr.ontimeout = () => {
            reject(new Error('Upload timed out. Please try a smaller file.'));
          };

          xhr.send(formData);
        }
      );

      const result = await uploadPromise;

      if (!result?.success || !result?.data?.secure_url) {
        throw new Error(result?.error || 'Failed to retrieve uploaded file URL');
      }

      setProgress(100);
      setState('success');
      return result.data.secure_url;
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
      setState('error');
      return null;
    }
  };

  return {
    uploadFile,
    state,
    progress,
    isCompressing: state === 'compressing',
    error,
    reset,
  };
};