/**
 * Constants and helpers for Cloudinary uploads
 */

export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  // Audio (handled under video resource_type in Cloudinary)
  'audio/mpeg', // .mp3
  'audio/ogg',  // .ogg
  'audio/wav',  // .wav
  'audio/webm', // .weba
  'audio/mp4',  // .m4a
];

export const ALLOWED_FOLDERS = [
  'projects',
  'portfolio_uploads',
  'portfolio_blogs',
  'portfolio_testimonials',
  'other-projects',
  'about',
] as const;

export type AllowedFolder = typeof ALLOWED_FOLDERS[number];

// Cloudinary account limits (Free plan)
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (104,857,600 bytes)
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;  // 10 MB (10,485,760 bytes)
export const MAX_RAW_SIZE_BYTES   = 10 * 1024 * 1024;  // 10 MB

export function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime.toLowerCase());
}

export function isAllowedFolder(folder: string): boolean {
  return ALLOWED_FOLDERS.includes(folder as AllowedFolder);
}

export function getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  const lower = mimeType.toLowerCase();
  if (lower.startsWith('image/')) return 'image';
  if (lower.startsWith('video/') || lower.startsWith('audio/')) return 'video';
  return 'raw';
}

export function inferMimeType(filename: string, fallbackMime?: string): string {
  if (fallbackMime && fallbackMime !== 'application/octet-stream') {
    return fallbackMime.toLowerCase();
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4':  return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov':  return 'video/quicktime';
    case 'avi':  return 'video/x-msvideo';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    case 'gif':  return 'image/gif';
    case 'svg':  return 'image/svg+xml';
    case 'mp3':  return 'audio/mpeg';
    case 'ogg':  return 'audio/ogg';
    case 'wav':  return 'audio/wav';
    case 'm4a':  return 'audio/mp4';
    default:     return fallbackMime || 'application/octet-stream';
  }
}

export function getHumanMediaType(mimeType: string): 'gif' | 'video' | 'audio' | 'image' {
  const lower = mimeType.toLowerCase();
  if (lower === 'image/gif') return 'gif';
  if (lower.startsWith('video/')) return 'video';
  if (lower.startsWith('audio/')) return 'audio';
  return 'image';
}
