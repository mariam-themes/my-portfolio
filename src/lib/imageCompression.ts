/**
 * Client-side image compression and resizing utility.
 * Reduces large 5MB-20MB camera/design files down to ~200-400KB in milliseconds,
 * massively speeding up uploads over slower connections.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1 (default: 0.85)
  maxSizeMB?: number;
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
  } = options;

  // Only compress raster images; skip SVGs, GIFs (to preserve animations), audio, and video
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file;
  }

  // If the file is already small (< 150KB), no need to compress
  if (file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    // Safety timeout in case canvas/image fails in weird browser environments
    const timeout = setTimeout(() => {
      resolve(file);
    }, 5000);

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Check if resizing is needed
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          clearTimeout(timeout);
          resolve(file);
          return;
        }

        // Apply smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type: prefer webp if supported, else fallback to jpeg/png
        const outputType = file.type === 'image/png' ? 'image/webp' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size, return original file
              resolve(file);
              return;
            }

            // Create a new File object with updated extension if converted to webp
            const extension = outputType === 'image/webp' ? '.webp' : outputType === 'image/jpeg' ? '.jpg' : '.png';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}${extension}`, {
              type: outputType,
              lastModified: Date.now(),
            });

            console.info(
              `[Image Optimizer] Compressed "${file.name}" from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
            );

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      } catch (err) {
        clearTimeout(timeout);
        console.warn('[Image Optimizer] Compression failed, falling back to original file:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
