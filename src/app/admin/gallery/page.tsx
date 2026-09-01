'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  UploadCloud, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Maximize2, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { compressImageFile } from '@/lib/imageCompression';

interface UploadItem {
  id: string;
  name: string;
  preview: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function GalleryPage() {
  const t = useTranslations('Admin.galleryPage');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const hasUnsavedChanges = JSON.stringify(images) !== JSON.stringify(initialImages);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const sectionsRes = await fetch('/api/admin/section-layout');
      const sectionsData = await sectionsRes.json();
      
      if (sectionsData.success) {
        const opSection = sectionsData.data.find((s: any) => s.id === 'other-projects');
        const galleryList = opSection && opSection.content?.gallery ? opSection.content.gallery : [];
        setImages(galleryList);
        setInitialImages(galleryList);
      }
    } catch (err) {
      toast.error('Failed to load gallery data');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadSingleFile = async (file: File, itemId: string): Promise<string | null> => {
    try {
      // 1. Compressing stage
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: 'compressing' } : item))
      );

      const compressedFile = await compressImageFile(file);

      // 2. Uploading stage with real-time progress
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: 'uploading', progress: 0 } : item))
      );

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'other-projects');
      formData.append('resource_type', 'image');

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === itemId ? { ...item, progress: percent } : item
              )
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.success && res.data?.secure_url) {
                resolve(res.data.secure_url);
              } else {
                reject(new Error(res.error || 'Failed to upload'));
              }
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));

        xhr.send(formData);
      });

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: 'success', progress: 100 } : item
        )
      );

      return url;
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, status: 'error', error: err.message || 'Upload failed' }
            : item
        )
      );
      return null;
    }
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    // Create queue items with local object URLs for instant previews
    const newQueueItems: UploadItem[] = fileArray.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'compressing',
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);

    // Process all files concurrently
    const uploadPromises = fileArray.map((file, idx) => {
      const queueItem = newQueueItems[idx];
      return uploadSingleFile(file, queueItem.id);
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((url): url is string => Boolean(url));

    if (successfulUrls.length > 0) {
      setImages((prev) => [...prev, ...successfulUrls]);
      toast.success(
        successfulUrls.length === 1
          ? 'Image uploaded successfully!'
          : `${successfulUrls.length} images uploaded successfully!`
      );
    }

    // Clean up queue after a short delay
    setTimeout(() => {
      setUploadQueue((prev) => prev.filter((item) => item.status !== 'success'));
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    if (window.confirm(t('confirmClear') || 'Are you sure you want to remove all gallery images?')) {
      setImages([]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Fetch the current full layout so we can send all sections back
      // (with only other-projects.content updated) — this keeps every
      // other section's visibility and content intact.
      const sectionsRes = await fetch('/api/admin/section-layout');
      if (!sectionsRes.ok) throw new Error('Failed to fetch layout');
      const sectionsData = await sectionsRes.json();
      if (!sectionsData.success) throw new Error('Failed to get layout');

      const payload = (sectionsData.data as Array<{ id: string; isVisible: boolean; content?: unknown }>).map((s) => {
        if (s.id === 'other-projects') {
          return { id: s.id, isVisible: s.isVisible, content: { gallery: images } };
        }
        return { id: s.id, isVisible: s.isVisible, content: s.content ?? null };
      });

      const response = await fetch('/api/admin/section-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to save');

      setInitialImages([...images]);
      toast.success(t('allUploaded') || 'Gallery updated successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update gallery');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white mb-2 font-serif flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            {t('title')}
          </h1>
          <p className="text-rose-200/60 text-sm">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {t('unsavedChanges')}
            </span>
          )}
          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-rose-300/70 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors"
            >
              {t('clearAll')}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg text-sm
              ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/50 hover:shadow-rose-900/50 hover:scale-[1.02]'
                  : 'bg-rose-950/40 text-rose-300/40 border border-rose-900/30 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('saving') || 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Multi-Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center group overflow-hidden
          ${
            isDragging
              ? 'border-rose-400 bg-rose-950/40 scale-[1.01] shadow-2xl shadow-rose-950/50'
              : 'border-rose-900/50 bg-[#120408]/80 hover:border-rose-500/50 hover:bg-rose-950/20'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
          accept="image/*"
          multiple
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600/20 to-rose-900/20 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-rose-500/60 transition-all duration-300">
            <UploadCloud className="w-8 h-8 text-rose-400 group-hover:text-rose-300 transition-colors" />
          </div>
          <div>
            <p className="text-base font-medium text-rose-100 mb-1">
              {t('dragDropMultiple')}
            </p>
            <p className="text-xs text-rose-400/60 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              {t('supportsMultiple')}
            </p>
          </div>
        </div>
      </div>

      {/* Active Upload Queue / Progress Cards */}
      {uploadQueue.length > 0 && (
        <div className="space-y-3 bg-[#17050C]/90 p-5 rounded-2xl border border-rose-900/40">
          <div className="flex items-center justify-between text-xs font-medium text-rose-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              {t('uploadingCount', { count: uploadQueue.length })}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-rose-900/40 text-xs"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-rose-900/50">
                  <Image src={item.preview} alt={item.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-rose-100 truncate mb-1">{item.name}</p>
                  {item.status === 'compressing' ? (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      جارٍ الضغط الفوري...
                    </span>
                  ) : item.status === 'uploading' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-rose-300">
                        <span>رفع...</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-rose-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : item.status === 'success' ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      تم الرفع بنجاح
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-400 flex items-center gap-1 truncate">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {item.error || 'خطأ في الرفع'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="bg-[#120408]/60 p-6 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-rose-100 flex items-center gap-2">
            <span>{t('images')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-900/50 text-rose-300">
              {images.length}
            </span>
          </h2>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12 text-rose-400/50 text-sm">
            لا توجد صور في المعرض حالياً. اسحب أو اختر صوراً لإضافتها.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative rounded-xl overflow-hidden border border-rose-900/50 bg-[#1A050C] aspect-[4/3] shadow-md hover:shadow-rose-950/50 hover:border-rose-500/50 transition-all duration-300"
              >
                <Image
                  src={url}
                  alt={`Gallery item ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />

                {/* Badges / Order */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90">
                  #{i + 1}
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(url)}
                      className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title={t('preview')}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Move Left / Right Controls */}
                  <div className="flex items-center justify-between bg-black/70 backdrop-blur-md rounded-lg p-1 border border-white/10 text-xs">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => handleMoveImage(i, 'left')}
                      className={`p-1 rounded ${i === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                      title={t('moveLeft')}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-white/60">ترتيب</span>
                    <button
                      type="button"
                      disabled={i === images.length - 1}
                      onClick={() => handleMoveImage(i, 'right')}
                      className={`p-1 rounded ${i === images.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                      title={t('moveRight')}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
