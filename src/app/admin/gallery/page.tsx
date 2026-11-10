'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Loader2, 
  Image as ImageIcon, 
  Trash2, 
  UploadCloud, 
  Sparkles, 
  Maximize2, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { compressImageFile } from '@/lib/imageCompression';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UploadItem {
  id: string;
  name: string;
  preview: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface GalleryItem {
  id: string;
  url: string;
}

interface SortableGalleryItemProps {
  id: string;
  url: string;
  index: number;
  onPreview: (url: string) => void;
  onDelete: (index: number) => void;
  t: any;
}

function SortableGalleryItem({
  id,
  url,
  index,
  onPreview,
  onDelete,
  t,
}: SortableGalleryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden border bg-[#1A050C] aspect-[4/3] shadow-md transition-all duration-300 ${
        isDragging
          ? 'opacity-30 border-dashed border-rose-500 scale-[0.98]'
          : 'border-rose-900/50 hover:shadow-rose-950/50 hover:border-rose-500/50'
      }`}
    >
      <Image
        src={url}
        alt={`Gallery item ${index + 1}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        unoptimized
      />

      {/* Order Badge with Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90 cursor-grab active:cursor-grabbing hover:border-rose-500/60 hover:text-white transition-colors touch-none"
        title="اضغط واسحب لتغيير الترتيب"
      >
        <GripVertical className="w-3 h-3 text-rose-400" />
        <span>#{index + 1}</span>
      </div>

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onPreview(url)}
            className="p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
            title={t('preview')}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1.5 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Handle Button (replacing old arrows) */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex items-center justify-center gap-1.5 bg-black/75 hover:bg-rose-950/80 backdrop-blur-md rounded-lg py-1.5 px-3 border border-white/10 hover:border-rose-500/50 text-xs text-white/80 hover:text-white cursor-grab active:cursor-grabbing transition-all select-none touch-none"
          title="اضغط واسحب لتغيير الترتيب"
        >
          <GripVertical className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] font-medium">سحب للترتيب</span>
        </button>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const t = useTranslations('Admin.galleryPage');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeSortId, setActiveSortId] = useState<string | null>(null);

  const currentUrls = galleryItems.map((g) => g.url);
  const hasUnsavedChanges = JSON.stringify(currentUrls) !== JSON.stringify(initialImages);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        const galleryList: string[] = opSection && opSection.content?.gallery ? opSection.content.gallery : [];
        const items: GalleryItem[] = galleryList.map((url, i) => ({
          id: `item-${i}-${url.slice(-15).replace(/[^a-zA-Z0-9]/g, '')}`,
          url,
        }));
        setGalleryItems(items);
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
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: 'compressing' } : item))
      );

      const compressedFile = await compressImageFile(file);

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

    const newQueueItems: UploadItem[] = fileArray.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'compressing',
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);

    const uploadPromises = fileArray.map((file, idx) => {
      const queueItem = newQueueItems[idx];
      return uploadSingleFile(file, queueItem.id);
    });

    const results = await Promise.all(uploadPromises);
    const successfulUrls = results.filter((url): url is string => Boolean(url));

    if (successfulUrls.length > 0) {
      const newItems: GalleryItem[] = successfulUrls.map((url, i) => ({
        id: `item-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        url,
      }));
      setGalleryItems((prev) => [...prev, ...newItems]);
      toast.success(
        successfulUrls.length === 1
          ? 'Image uploaded successfully!'
          : `${successfulUrls.length} images uploaded successfully!`
      );
    }

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
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (galleryItems.length === 0) return;
    if (window.confirm(t('confirmClear') || 'Are you sure you want to remove all gallery images?')) {
      setGalleryItems([]);
    }
  };

  const handleSave = async (itemsToSave?: GalleryItem[]) => {
    const items = itemsToSave || galleryItems;
    const urls = items.map((g) => g.url);

    setIsSaving(true);
    try {
      const sectionsRes = await fetch('/api/admin/section-layout');
      if (!sectionsRes.ok) throw new Error('Failed to fetch layout');
      const sectionsData = await sectionsRes.json();
      if (!sectionsData.success) throw new Error('Failed to get layout');

      const payload = (sectionsData.data as Array<{ id: string; isVisible: boolean; content?: unknown }>).map((s) => {
        if (s.id === 'other-projects') {
          return { id: s.id, isVisible: s.isVisible, content: { gallery: urls } };
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

      setInitialImages([...urls]);
      toast.success(t('allUploaded') || 'Gallery updated successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSortId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSortId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = galleryItems.findIndex((item) => item.id === active.id);
    const newIndex = galleryItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousItems = [...galleryItems];
    const reordered = arrayMove(galleryItems, oldIndex, newIndex);
    setGalleryItems(reordered);

    // Auto-save immediately to MongoDB
    setIsSaving(true);
    try {
      const sectionsRes = await fetch('/api/admin/section-layout');
      if (!sectionsRes.ok) throw new Error();
      const sectionsData = await sectionsRes.json();
      if (!sectionsData.success) throw new Error();

      const urls = reordered.map((g) => g.url);
      const payload = (sectionsData.data as Array<{ id: string; isVisible: boolean; content?: unknown }>).map((s) => {
        if (s.id === 'other-projects') {
          return { id: s.id, isVisible: s.isVisible, content: { gallery: urls } };
        }
        return { id: s.id, isVisible: s.isVisible, content: s.content ?? null };
      });

      const response = await fetch('/api/admin/section-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();

      setInitialImages([...urls]);
      toast.success('تم تحديث وحفظ ترتيب المعرض بنجاح!');
      router.refresh();
    } catch {
      setGalleryItems(previousItems);
      toast.error('فشل حفظ ترتيب المعرض');
    } finally {
      setIsSaving(false);
    }
  };

  const activeItem = activeSortId ? galleryItems.find((g) => g.id === activeSortId) : null;

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
          <p className="text-rose-200/60 text-sm">{t('subtitle')} (اسحب وأفلت لإعادة الترتيب)</p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {t('unsavedChanges')}
            </span>
          )}
          {galleryItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-rose-300/70 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors"
            >
              {t('clearAll')}
            </button>
          )}
          <button
            onClick={() => handleSave()}
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

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-300">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white mb-1">
              اسحب الصور وأفلتها هنا، أو اضغط للاختيار
            </h3>
            <p className="text-xs text-rose-200/50">
              يتم ضغط الصور تلقائياً قبل الرفع لتسريع تحميل الموقع
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-[#120408]/60 p-5 rounded-2xl border border-rose-900/30 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-semibold text-rose-200 uppercase tracking-wider">
            قائمة الرفع والضغط ({uploadQueue.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* Gallery Grid with Drag and Drop */}
      <div className="bg-[#120408]/60 p-6 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-rose-100 flex items-center gap-2">
            <span>{t('images')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-900/50 text-rose-300">
              {galleryItems.length}
            </span>
          </h2>
          {isSaving && (
            <div className="flex items-center gap-2 text-xs text-rose-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ حفظ الترتيب...</span>
            </div>
          )}
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-12 text-rose-400/50 text-sm">
            لا توجد صور في المعرض حالياً. اسحب أو اختر صوراً لإضافتها.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={galleryItems.map((g) => g.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {galleryItems.map((item, i) => (
                  <SortableGalleryItem
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    index={i}
                    onPreview={(url) => setPreviewImage(url)}
                    onDelete={handleDeleteImage}
                    t={t}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay adjustScale={false}>
              {activeItem ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-rose-500 bg-[#1A050C] aspect-[4/3] shadow-2xl shadow-rose-900/60 ring-4 ring-rose-500/20 scale-105 cursor-grabbing pointer-events-none opacity-95">
                  <Image
                    src={activeItem.url}
                    alt="Dragging gallery item"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
                alt="Enlarged view"
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
