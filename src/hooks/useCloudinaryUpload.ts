import { useState, useCallback, useRef } from 'react';
import { compressImageFile } from '@/lib/imageCompression';
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedMimeType,
  inferMimeType,
  getHumanMediaType,
} from '@/lib/upload-constants';

export type UploadState = 'idle' | 'compressing' | 'uploading' | 'verifying' | 'success' | 'error';

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
  const [lastMediaType, setLastMediaType] = useState<'gif' | 'video' | 'audio' | 'image' | null>(null);

  const activeXhrRef = useRef<XMLHttpRequest | null>(null);
  const lastCallRef = useRef<{ file: File; options: UploadOptions } | null>(null);

  const reset = useCallback(() => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setState('idle');
    setProgress(0);
    setError(null);
    setLastMediaType(null);
  }, []);

  const cancel = useCallback(() => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setState('idle');
    setProgress(0);
    setError('Upload cancelled.');
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
    const skipCompression = options.skipCompression || false;

    lastCallRef.current = { file, options };

    setError(null);
    setProgress(0);

    try {
      if (!file) {
        throw new Error('No file provided for upload.');
      }

      // ── 1. Client-Side Usability Pre-Validation ───────────────────────────
      const inferredMime = inferMimeType(file.name, file.type);
      if (!isAllowedMimeType(inferredMime)) {
        throw new Error(
          `File type "${inferredMime || file.type || 'unknown'}" is not supported. Allowed formats: images (jpg, png, webp, gif, svg), videos (mp4, webm, mov, avi), audio (mp3, ogg, wav, m4a).`
        );
      }

      const isVideoOrAudio = inferredMime.startsWith('video/') || inferredMime.startsWith('audio/');
      const isImage = inferredMime.startsWith('image/');

      if (isVideoOrAudio && file.size > MAX_VIDEO_SIZE_BYTES) {
        throw new Error(
          `Video file size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)} MB.`
        );
      }

      let fileToUpload: File = file;

      // ── 2. Client-side Image Optimization (if image) ─────────────────────
      if (!skipCompression && isImage) {
        setState('compressing');
        fileToUpload = await compressImageFile(file);
      }

      if (isImage && fileToUpload.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(
          `Image file size (${(fileToUpload.size / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`
        );
      }

      setState('uploading');
      setProgress(5);

      const targetResourceType: 'image' | 'video' | 'auto' =
        options.resourceType || (isVideoOrAudio ? 'video' : isImage ? 'image' : 'auto');

      // ── 3. Request Cryptographic Upload Signature from Server ────────────
      const signResponse = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder,
          resourceType: targetResourceType,
          filename: file.name,
          mimeType: inferredMime,
          fileSize: fileToUpload.size,
        }),
      });

      if (!signResponse.ok) {
        const signErr = await signResponse.json().catch(() => ({}));
        throw new Error(signErr?.error || `Upload authorization failed (HTTP ${signResponse.status})`);
      }

      const signJson = await signResponse.json();
      if (!signJson.success || !signJson.data) {
        throw new Error(signJson?.error || 'Invalid signature response from server');
      }

      const { signature, timestamp, apiKey, uploadUrl, folder: signedFolder } = signJson.data;

      // ── 4. Direct Upload to Cloudinary (Bypassing Vercel & Node Server) ────
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', signedFolder);

      const uploadPromise = new Promise<{
        public_id: string;
        secure_url: string;
        resource_type: string;
        format?: string;
        bytes?: number;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeXhrRef.current = xhr;

        xhr.open('POST', uploadUrl, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Map 0 -> 100% of upload to 5 -> 90% of overall UI progress
            const uploadPercent = Math.round((e.loaded / e.total) * 100);
            const overallPercent = 5 + Math.round((uploadPercent / 100) * 85);
            setProgress(overallPercent);
            if (options.onProgress) {
              options.onProgress(uploadPercent);
            }
          }
        };

        xhr.onload = () => {
          activeXhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch {
              reject(new Error('Invalid JSON response from Cloudinary upload server'));
            }
          } else {
            let errorMsg = 'Direct upload to Cloudinary failed';
            try {
              const errData = JSON.parse(xhr.responseText);
              if (errData?.error?.message) {
                errorMsg = errData.error.message;
              }
            } catch {
              /* ignore parse error */
            }
            if (xhr.status === 400 && errorMsg.toLowerCase().includes('quota')) {
              errorMsg = 'Cloudinary monthly quota exceeded. Please check dashboard usage.';
            } else if (xhr.status === 400 && errorMsg.toLowerCase().includes('file size')) {
              errorMsg = 'File exceeds your Cloudinary account size limit.';
            }
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          activeXhrRef.current = null;
          reject(new Error('Network error during upload to Cloudinary. Check your internet connection.'));
        };

        xhr.onabort = () => {
          activeXhrRef.current = null;
          reject(new Error('Upload was cancelled.'));
        };

        xhr.ontimeout = () => {
          activeXhrRef.current = null;
          reject(new Error('Upload timed out. Please try again.'));
        };

        xhr.send(formData);
      });

      const cloudinaryResult = await uploadPromise;

      // ── 5. Server-Side Verification and MongoDB Activity Logging ──────────
      setProgress(95);

      const verifyResponse = await fetch('/api/upload/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: cloudinaryResult.public_id,
          resourceType: cloudinaryResult.resource_type,
          expectedFolder: signedFolder,
          filename: file.name,
        }),
      });

      if (!verifyResponse.ok) {
        const verifyErr = await verifyResponse.json().catch(() => ({}));
        throw new Error(verifyErr?.error || `Upload verification failed (HTTP ${verifyResponse.status})`);
      }

      const verifyJson = await verifyResponse.json();
      if (!verifyJson.success || !verifyJson.data?.secure_url) {
        throw new Error(verifyJson?.error || 'Verification failed: invalid asset response');
      }

      // ── 6. Finalize Success State ──────────────────────────────────────────
      setProgress(100);
      setState('success');
      const mediaType = verifyJson.data.mediaType || getHumanMediaType(inferredMime);
      setLastMediaType(mediaType);

      // Notify CloudinaryUsageWidget and other listeners to refresh usage stats
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cloudinary-upload-success'));
      }

      return verifyJson.data.secure_url;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Upload was cancelled.') {
        setState('idle');
        setProgress(0);
        setError('Upload cancelled.');
      } else {
        console.error('Upload Error:', err);
        setError(err.message || 'An unexpected error occurred during upload.');
        setState('error');
        setLastMediaType(null);
      }
      return null;
    }
  };

  const retry = useCallback(async (): Promise<string | null> => {
    if (!lastCallRef.current) return null;
    return uploadFile(lastCallRef.current.file, lastCallRef.current.options);
  }, []);

  return {
    uploadFile,
    state,
    progress,
    isCompressing: state === 'compressing',
    error,
    reset,
    cancel,
    retry,
    lastMediaType,
  };
};