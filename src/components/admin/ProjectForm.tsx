'use client';

import { useState, useMemo, useRef, useEffect, type DragEvent } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Loader2, Plus, X, Trash2, Monitor, Smartphone, Layout, Video, ImageIcon, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import ImageUpload from './ImageUpload';

const EMPTY_VD = { colors: [], fonts: [], identity: [], imageStyle: [] } as { colors: string[]; fonts: string[]; identity: string[]; imageStyle: string[] };
const DEFAULT_SECTION_ORDER = ['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup'] as const;

const PROJECT_SECTIONS = [
  { id: 'gallery', tKey: 'sGallery' },
  { id: 'transform', tKey: 'sTransform' },
  { id: 'visual', tKey: 'sVisual' },
  { id: 'deliverables', tKey: 'sDeliverables' },
  { id: 'tools', tKey: 'sTools' },
  { id: 'mockup', tKey: 'sMockup' },
  { id: 'closing', tKey: 'sClosing' },
] as const;

function useDndReorder(onMove: (from: number, to: number) => void) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const captureRects = () => {
    const map = new Map<string, DOMRect>();
    listRef.current?.querySelectorAll<HTMLElement>('[data-dnd-key]').forEach((el) => {
      const key = el.dataset.dndKey;
      if (key) map.set(key, el.getBoundingClientRect());
    });
    return map;
  };

  const flip = (before: Map<string, DOMRect>) => {
    requestAnimationFrame(() => {
      const after = captureRects();
      listRef.current?.querySelectorAll<HTMLElement>('[data-dnd-key]').forEach((el) => {
        const key = el.dataset.dndKey || '';
        const prev = before.get(key);
        const next = after.get(key);
        if (!prev || !next) return;
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (dx === 0 && dy === 0) return;
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.getBoundingClientRect();
        el.style.transition = 'transform 0.24s cubic-bezier(0.2, 0, 0, 1)';
        el.style.transform = '';
      });
    });
  };

  const reset = () => setDragIndex(null);

  return {
    listRef,
    dragIndex,
    isDragging: (index: number) => dragIndex === index,
    handleProps: (index: number) => ({
      draggable: true as const,
      onDragStart: () => setDragIndex(index),
      onDragEnd: reset,
    }),
    dropProps: (index: number) => ({
      onDragEnter: () => {
        if (dragIndex !== null && dragIndex !== index) {
          const before = captureRects();
          onMove(dragIndex, index);
          setDragIndex(index);
          flip(before);
        }
      },
      onDragOver: (e: DragEvent) => e.preventDefault(),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        reset();
      },
    }),
  };
}

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().optional().default(''),
  sector: z.string().optional().default(''),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  tools: z.array(z.string()).default([]),
  platform: z.string().optional().default(''),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 5),
  heroMediaUrl: z.string().min(1, 'Hero media is required'),
  fullPageMockupUrl: z.string().optional().default(''),
  gallery: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(['desktop', 'mobile', 'mockup', 'video', 'gif']),
  })).default([]),
  beforeAfter: z.array(z.object({
    before: z.string().min(1, 'Before image required'),
    after: z.string().min(1, 'After image required'),
  })).default([]),
  closingImageUrl: z.string().optional().default(''),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  metaTitle: z
    .object({
      en: z.string().optional().default(''),
      ar: z.string().optional().default(''),
    })
    .optional()
    .default({ en: '', ar: '' }),
  metaDescription: z
    .object({
      en: z.string().optional().default(''),
      ar: z.string().optional().default(''),
    })
    .optional()
    .default({ en: '', ar: '' }),
  visualDirection: z
    .object({
      colors: z.array(z.string()).default([]),
      fonts: z.array(z.string()).default([]),
      identity: z.array(z.string()).default([]),
      imageStyle: z.array(z.string()).default([]),
    })
    .optional()
    .default({ colors: [], fonts: [], identity: [], imageStyle: [] }),
  sectionOrder: z.array(z.enum(['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup', 'closing'])).default([]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: any;
}

// ─── Gallery type icons ─────────────────────────────────────────────────────
const GALLERY_TYPES = [
  { value: 'desktop', icon: Monitor },
  { value: 'mobile', icon: Smartphone },
  { value: 'mockup', icon: Layout },
  { value: 'video', icon: Video },
  { value: 'gif', icon: ImageIcon },
] as const;

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const t = useTranslations('Admin.projectForm');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch available categories on mount — hide placeholder / system categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const hidden = new Set(['uncategorized', 'selected project', 'selected projects']);
          setCategories(
            json.data
              .map((c: any) => c.name)
              .filter((name: string) => !hidden.has(name.trim().toLowerCase()))
          );
        }
      })
      .catch(() => {/* silently fail — form still usable */});
  }, []);

  const localizedSchema = z.object({
    title: z.string().min(3, t('errTitle')),
    category: z.string().optional().default(''),
    sector: z.string().optional().default(''),
    description: z.string().min(10, t('errDesc')),
    services: z.array(z.string()).min(1, t('errServices')),
    tools: z.array(z.string()).default([]),
    platform: z.string().optional().default(''),
    year: z.number().int().min(1990).max(new Date().getFullYear() + 5),
    heroMediaUrl: z.string().min(1, t('errHero')),
    fullPageMockupUrl: z.string().optional().default(''),
    gallery: z.array(z.object({
      url: z.string().min(1),
      type: z.enum(['desktop', 'mobile', 'mockup', 'video', 'gif']),
    })).default([]),
    beforeAfter: z.array(z.object({
      before: z.string().min(1, t('errBefore')),
      after: z.string().min(1, t('errAfter')),
    })).default([]),
    closingImageUrl: z.string().optional().default(''),
    closingImages: z.array(z.string().min(1)).default([]),
    liveUrl: z.string().url(t('errUrl')).optional().or(z.literal('')),
    isFeatured: z.boolean().default(false),
    metaTitle: z
      .object({
        en: z.string().optional().default(''),
        ar: z.string().optional().default(''),
      })
      .optional()
      .default({ en: '', ar: '' }),
    metaDescription: z
      .object({
        en: z.string().optional().default(''),
        ar: z.string().optional().default(''),
      })
      .optional()
      .default({ en: '', ar: '' }),
    visualDirection: z
      .object({
        colors: z.array(z.string()).default([]),
        fonts: z.array(z.string()).default([]),
        identity: z.array(z.string()).default([]),
        imageStyle: z.array(z.string()).default([]),
      })
      .optional()
      .default(EMPTY_VD),
    sectionOrder: z.array(z.enum(['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup', 'closing'])).default([]),
  });

  const defaults = useMemo(() => {
    const saved = initialData && (initialData as { visualDirection?: object; sectionOrder?: string[] });
    return {
      ...{
        title: '',
        category: '',
        sector: '',
        description: '',
        services: [],
        tools: [],
        platform: '',
        year: new Date().getFullYear(),
        heroMediaUrl: '',
        fullPageMockupUrl: '',
        gallery: [],
        beforeAfter: [],
        closingImageUrl: '',
        closingImages: [],
        liveUrl: '',
        isFeatured: false,
        metaTitle: { en: '', ar: '' },
        metaDescription: { en: '', ar: '' },
      },
      ...(initialData || {}),
      visualDirection: { ...EMPTY_VD, ...(saved?.visualDirection || {}) },
      sectionOrder: saved?.sectionOrder?.length ? [...saved.sectionOrder] : [...DEFAULT_SECTION_ORDER],
    };
  }, [initialData]);

  const form = useForm<z.input<typeof localizedSchema>, any, z.output<typeof localizedSchema>>({
    resolver: zodResolver(localizedSchema),
    defaultValues: defaults,
  });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
    move: moveGallery,
  } = useFieldArray({
    control: form.control,
    name: 'gallery',
  });

  const { fields: beforeAfterFields, append: appendBeforeAfter, remove: removeBeforeAfter } = useFieldArray({
    control: form.control,
    name: 'beforeAfter',
  });

  const {
    fields: closingImagesFields,
    append: appendClosingImage,
    remove: removeClosingImage,
    move: moveClosingImage,
  } = useFieldArray({
    control: form.control,
    name: 'closingImages' as never,
  });

  // ─── Section order handlers ─────────────────────────────────────────────────
  type SectionId = 'gallery' | 'transform' | 'visual' | 'deliverables' | 'tools' | 'mockup' | 'closing';
  const sectionOrderList = (form.watch('sectionOrder') || [...DEFAULT_SECTION_ORDER]) as SectionId[];

  const toggleSection = (id: SectionId) => {
    if (sectionOrderList.includes(id)) {
      form.setValue('sectionOrder', sectionOrderList.filter((s) => s !== id));
    } else {
      form.setValue('sectionOrder', [...sectionOrderList, id]);
    }
  };

  const moveSectionByIndex = (from: number, to: number) => {
    const next = [...sectionOrderList];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    form.setValue('sectionOrder', next);
  };

  const galleryDnD = useDndReorder((from, to) => moveGallery(from, to));
  const closingImagesDnD = useDndReorder((from, to) => moveClosingImage(from, to));
  const sectionDnD = useDndReorder(moveSectionByIndex);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    try {
      const cleanLocalized = (value?: { en?: string; ar?: string }) => {
        const result: { en?: string; ar?: string } = {};
        if (value?.en?.trim()) result.en = value.en.trim();
        if (value?.ar?.trim()) result.ar = value.ar.trim();
        return Object.keys(result).length > 0 ? result : undefined;
      };
      type ProjectSubmitValues = Omit<ProjectFormValues, 'metaTitle' | 'metaDescription' | 'visualDirection' | 'sectionOrder'> & {
        metaTitle?: { en?: string; ar?: string };
        metaDescription?: { en?: string; ar?: string };
        visualDirection?: { colors?: string[]; fonts?: string[]; identity?: string[]; imageStyle?: string[] };
        sectionOrder?: string[];
      };
      const payload = { ...data, sectionOrder: form.getValues('sectionOrder') } as ProjectSubmitValues;
      const metaTitle = cleanLocalized(data.metaTitle);
      const metaDescription = cleanLocalized(data.metaDescription);
      if (metaTitle) payload.metaTitle = metaTitle;
      else delete payload.metaTitle;
      if (metaDescription) payload.metaDescription = metaDescription;
      else delete payload.metaDescription;

      const vd = payload.visualDirection as
        | { colors?: string[]; fonts?: string[]; identity?: string[]; imageStyle?: string[] }
        | undefined;
      if (vd && !vd.colors?.length && !vd.fonts?.length && !vd.identity?.length && !vd.imageStyle?.length) {
        delete payload.visualDirection;
      }
      if (!payload.sectionOrder) {
        payload.sectionOrder = [];
      }

      const url = initialData ? `/api/admin/projects/${initialData._id}` : '/api/admin/projects';
      const method = initialData ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('errSave'));
      toast.success(initialData ? t('toastUpdated') : t('toastPublished'));
      router.push('/admin/projects');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Chip Input (reusable) ────────────────────────────────────────────────
  const ChipInput = ({ fieldName, label, placeholder }: { fieldName: any; label: React.ReactNode; placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');
    const items: string[] = form.watch(fieldName) || [];
    const handleAdd = () => {
      if (inputValue.trim() && !items.includes(inputValue.trim())) {
        form.setValue(fieldName, [...items, inputValue.trim()], { shouldValidate: true });
        setInputValue('');
      }
    };
    const errorPath = fieldName.split('.');
    const error = errorPath.reduce((obj: any, key: any) => obj?.[key], form.formState.errors);
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-rose-200">{label}</label>
        <div className="flex gap-2">
          <input
            type="text" value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            placeholder={placeholder}
            className="flex-1 bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
          <button type="button" onClick={handleAdd} className="bg-rose-900/50 hover:bg-rose-800 text-rose-200 px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error.message}</p>}
        <div className="flex flex-wrap gap-2 mt-1">
          {items.map((item: string) => (
            <span key={item} className="flex items-center gap-1 bg-rose-900/30 text-rose-300 px-3 py-1 rounded-full text-sm border border-rose-800/50">
              {item}
              <button type="button" onClick={() => form.setValue(fieldName, items.filter((i) => i !== item), { shouldValidate: true })} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  // ─── Section Header ───────────────────────────────────────────────────────
  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-rose-900/30" />
      <div className="text-center">
        <h3 className="text-sm font-semibold text-rose-300 uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-xs text-rose-500/60 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-rose-900/30" />
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit, (errors) => { toast.error(t('formErrors') || 'Please fix the errors in the form before publishing.'); console.error(errors); })} className="space-y-10 bg-black/40 p-6 md:p-8 rounded-2xl border border-rose-900/30 backdrop-blur-xl">


      {/* ══ SECTION 1: Basic Info ══ */}
      <div className="space-y-6">
        <SectionHeader title={t('basicInfo')} subtitle={t('basicInfoSub')} />

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('projectTitle')} <span className="text-rose-500">*</span></label>
            <input {...form.register('title')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder={t('projectTitlePh')} />
            {form.formState.errors.title && <p className="text-red-400 text-xs">{form.formState.errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('category')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            {categories.length > 0 ? (
              <select
                {...form.register('category')}
                autoComplete="off"
                className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="" disabled hidden>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#4a0d14] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...form.register('category')}
                autoComplete="off"
                className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
                placeholder={t('categoryPh')}
              />
            )}
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('sector')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <input {...form.register('sector')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder={t('sectorPh')} />
          </div>

          {/* Platform (optional) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">
              {t('platform')}
              <span className="ms-1 text-rose-200/40 font-normal text-[11px]">{t('liveUrlOptional')}</span>
            </label>
            <input {...form.register('platform')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder={t('platformPh')} />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('description')} <span className="text-rose-500">*</span></label>
            <textarea {...form.register('description')} rows={3} dir="auto"
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
              placeholder={t('descriptionPh')} />
            {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          {/* Services */}
          <ChipInput fieldName="services" label={<>{t('services')} <span className="text-rose-500">*</span></>} placeholder={t('servicesPh')} />

          {/* Tools */}
          <ChipInput fieldName="tools" label={<>{t('tools')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></>} placeholder={t('toolsPh')} />
        </div>

        {/* Year & Live URL (not bilingual) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('year')} <span className="text-rose-500">*</span></label>
            <input type="number" {...form.register('year', { valueAsNumber: true })}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors" />
            {form.formState.errors.year && <p className="text-red-400 text-xs">{form.formState.errors.year.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('liveUrl')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <input {...form.register('liveUrl')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="https://..." />
            {form.formState.errors.liveUrl && <p className="text-red-400 text-xs">{form.formState.errors.liveUrl.message}</p>}
          </div>
        </div>
      </div>

      {/* ══ SECTION 2: Cover & Full-Page Mockup ══ */}
      <div className="space-y-6">
        <SectionHeader title={t('coverMedia')} subtitle={t('coverMediaSub')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-rose-950/10 rounded-xl border border-rose-900/20">
          <div className="space-y-2">
            <Controller name="heroMediaUrl" control={form.control}
              render={({ field }) => <ImageUpload label={<>{t('heroCover')} <span className="text-rose-500">*</span></>} value={field.value} onChange={field.onChange} folder="projects" />} />
            {form.formState.errors.heroMediaUrl && <p className="text-red-400 text-xs">{form.formState.errors.heroMediaUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Controller name="fullPageMockupUrl" control={form.control}
              render={({ field }) => <ImageUpload label={<>{t('fullPageMockup')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></>} value={field.value || ''} onChange={field.onChange} folder="projects" accept="image/*" />} />
            <p className="text-xs text-rose-500/50">{t('fullPageHint')}</p>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3: Gallery ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('gallery')} subtitle={t('gallerySub')} />
        <div ref={galleryDnD.listRef} className="space-y-4">
          {galleryFields.map((field, index) => (
            <div key={field.id} data-dnd-key={field.id} {...galleryDnD.dropProps(index)}
              suppressHydrationWarning
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${galleryDnD.isDragging(index) ? 'opacity-40 ring-1 ring-rose-500/70 border-rose-500/60 bg-rose-950/20' : 'bg-rose-950/10 border-rose-900/20'}`}>
              <button type="button" {...galleryDnD.handleProps(index)}
                className="mt-1 cursor-grab text-rose-500/80 transition-colors hover:text-rose-300 active:cursor-grabbing" title={t('dragToReorder')} aria-label={t('dragToReorder')}>
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex-1 space-y-3">
                <Controller name={`gallery.${index}.url`} control={form.control}
                  render={({ field }) => <ImageUpload label={`${t('galleryImage')} ${index + 1}`} value={form.watch(`gallery.${index}.url`) || ''} onChange={(url) => form.setValue(`gallery.${index}.url`, url)} folder="projects" />} />
                <div className="flex gap-2 flex-wrap">
                  {GALLERY_TYPES.map(({ value, icon: Icon }) => (
                    <button key={value} type="button"
                      onClick={() => form.setValue(`gallery.${index}.type`, value as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.watch(`gallery.${index}.type`) === value ? 'bg-rose-600 text-white border-rose-500' : 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:border-rose-500'}`}>
                      <Icon className="w-3.5 h-3.5" /> {t(`type${value[0].toUpperCase()}${value.slice(1)}` as any)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <button type="button" onClick={() => moveGallery(index, index - 1)} disabled={index === 0} className="text-rose-400 hover:text-rose-200 transition-colors disabled:opacity-25 disabled:pointer-events-none" aria-label="Move up">
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => moveGallery(index, index + 1)} disabled={index === galleryFields.length - 1} className="text-rose-400 hover:text-rose-200 transition-colors disabled:opacity-25 disabled:pointer-events-none" aria-label="Move down">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              <button type="button" onClick={() => removeGallery(index)} className="text-red-400 hover:text-red-300 transition-colors mt-1">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendGallery({ url: '', type: 'desktop' })}
            className="w-full py-3 border-2 border-dashed border-rose-900/50 hover:border-rose-500/50 rounded-xl text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t('addGalleryImage')}
          </button>
        </div>
      </div>

      {/* ══ SECTION 4: Before / After (Optional) ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('beforeAfter')} subtitle={t('beforeAfterSub')} />
        <div className="space-y-4">
          {beforeAfterFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-rose-950/10 rounded-xl border border-rose-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-rose-300">{t('pair')} {index + 1}</span>
                <button type="button" onClick={() => removeBeforeAfter(index)} className="text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload label={t('beforeLabel')} value={form.watch(`beforeAfter.${index}.before`) || ''} onChange={(url) => form.setValue(`beforeAfter.${index}.before`, url)} folder="projects" accept="image/*" />
                <ImageUpload label={t('afterLabel')} value={form.watch(`beforeAfter.${index}.after`) || ''} onChange={(url) => form.setValue(`beforeAfter.${index}.after`, url)} folder="projects" accept="image/*" />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendBeforeAfter({ before: '', after: '' })}
            className="w-full py-3 border-2 border-dashed border-rose-900/50 hover:border-rose-500/50 rounded-xl text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t('addPair')}
          </button>
        </div>
      </div>

      {/* ══ SECTION 5: Closing Image ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('closingImage')} subtitle={t('closingImageSub')} />
        <div className="p-6 bg-rose-950/10 rounded-xl border border-rose-900/20 space-y-6">
          <div ref={closingImagesDnD.listRef} className="space-y-4">
            {closingImagesFields.map((field, index) => (
              <div key={field.id} data-dnd-key={field.id} {...closingImagesDnD.dropProps(index)}
                suppressHydrationWarning
                className={`relative group p-4 rounded-xl border flex flex-col gap-4 items-start transition-colors ${closingImagesDnD.isDragging(index) ? 'opacity-40 ring-1 ring-rose-500/70 border-rose-500/60 bg-rose-950/20' : 'bg-[#1A050C] border-rose-900/30'}`}>
                <div className="flex items-center w-full gap-4">
                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-rose-500/50 hover:text-rose-400 opacity-50 group-hover:opacity-100 transition-opacity"
                    {...closingImagesDnD.handleProps(index)}>
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <Controller name={`closingImages.${index}` as never} control={form.control}
                      render={({ field }) => <ImageUpload label={t('closingImageLabel')} value={field.value as string} onChange={field.onChange} folder="projects" accept="image/*,video/*" />} />
                  </div>
                </div>
                <button type="button" onClick={() => removeClosingImage(index)} className="absolute -top-3 -right-3 p-1.5 bg-red-950/80 border border-red-900/50 rounded-full text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => appendClosingImage('')}
            className="w-full py-4 border-2 border-dashed border-rose-900/50 hover:border-rose-500/50 rounded-xl text-rose-400 hover:text-rose-300 transition-colors flex flex-col items-center gap-2">
            <Plus className="w-6 h-6" /> <span className="font-medium text-sm">Add Closing Media</span>
          </button>
        </div>
      </div>

      {/* ══ SECTION 6: Visual Direction (Optional) ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('visualDirection')} subtitle={t('visualDirectionSub')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChipInput fieldName="visualDirection.colors" label={t('vdColors')} placeholder={t('vdColorsPh')} />
          <ChipInput fieldName="visualDirection.fonts" label={t('vdFonts')} placeholder={t('vdFontsPh')} />
          <ChipInput fieldName="visualDirection.identity" label={t('vdIdentity')} placeholder={t('vdIdentityPh')} />
          <ChipInput fieldName="visualDirection.imageStyle" label={t('vdImageStyle')} placeholder={t('vdImageStylePh')} />
        </div>
      </div>

      {/* ══ SECTION 7: Section Order ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('sections')} subtitle={t('sectionsSub')} />
        <div className="space-y-2">
          {/* Active / Sorted Sections */}
          <div ref={sectionDnD.listRef} className="space-y-2">
            {sectionOrderList.map((secId, pos) => {
              const sec = PROJECT_SECTIONS.find((s) => s.id === secId);
              if (!sec) return null;
              return (
                <div key={sec.id} data-dnd-key={sec.id} {...sectionDnD.dropProps(pos)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${sectionDnD.isDragging(pos) ? 'opacity-40 ring-1 ring-rose-500/70 border-rose-500/60 bg-rose-950/20' : 'bg-rose-950/10 border-rose-900/20'}`}>
                  <span className="text-xs font-bold text-rose-500/60 tabular-nums">0{pos + 1}</span>
                  <button type="button" {...sectionDnD.handleProps(pos)}
                    className="cursor-grab text-rose-500/80 transition-colors hover:text-rose-300 active:cursor-grabbing" title={t('dragToReorder')} aria-label={t('dragToReorder')}>
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                    <input type="checkbox" checked={true} onChange={() => toggleSection(sec.id)} className="w-4 h-4 accent-rose-500 cursor-pointer" />
                    <span className="text-sm font-medium text-rose-200">{t(sec.tKey)}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSectionByIndex(pos, pos - 1)} disabled={pos === 0}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-900/30 hover:text-rose-200 transition-colors disabled:opacity-25 disabled:pointer-events-none" aria-label="Move up">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSectionByIndex(pos, pos + 1)} disabled={pos === sectionOrderList.length - 1}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-900/30 hover:text-rose-200 transition-colors disabled:opacity-25 disabled:pointer-events-none" aria-label="Move down">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Inactive Sections */}
          {PROJECT_SECTIONS.filter(s => !sectionOrderList.includes(s.id)).length > 0 && (
            <div className="pt-4 border-t border-rose-900/30 space-y-2">
              <p className="text-xs text-rose-500/60 mb-2 font-bold uppercase">{t('addSection', { defaultValue: 'Available Sections' })}</p>
              {PROJECT_SECTIONS.filter(s => !sectionOrderList.includes(s.id)).map(sec => (
                <div key={sec.id} className="flex items-center gap-3 p-3 rounded-xl border border-rose-900/10 bg-black/20 opacity-60 hover:opacity-100 transition-opacity">
                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none ml-8">
                    <input type="checkbox" checked={false} onChange={() => toggleSection(sec.id)} className="w-4 h-4 accent-rose-500 cursor-pointer" />
                    <span className="text-sm font-medium text-rose-200">{t(sec.tKey)}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ SEO Settings ══ */}
      <div className="space-y-4">
        <SectionHeader title={t('seoSettings')} subtitle={t('seoSub')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('metaTitleEn')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <input {...form.register('metaTitle.en')} maxLength={70}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder={t('metaTitleEnPh')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('metaTitleAr')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <input {...form.register('metaTitle.ar')} maxLength={70} dir="rtl"
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder={t('metaTitleArPh')} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('metaDescEn')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <textarea {...form.register('metaDescription.en')} rows={2} maxLength={160}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
              placeholder={t('metaDescEnPh')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">{t('metaDescAr')} <span className="text-rose-500/50 text-[10px] mx-1">{t('liveUrlOptional')}</span></label>
            <textarea {...form.register('metaDescription.ar')} rows={2} maxLength={160} dir="rtl"
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
              placeholder={t('metaDescArPh')} />
          </div>
        </div>
      </div>

      {/* ══ Featured Toggle ══ */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse bg-rose-950/20 p-4 rounded-lg border border-rose-900/30">
        <input type="checkbox" id="isFeatured" {...form.register('isFeatured')} className="w-5 h-5 accent-rose-500 cursor-pointer" />
        <label htmlFor="isFeatured" className="text-sm font-medium text-rose-200 cursor-pointer select-none">
          {t('featured')}
        </label>
      </div>

      {/* ══ Submit ══ */}
      <div className="flex justify-end pt-6 border-t border-rose-900/30">
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {initialData ? t('update') : t('publish')}
        </button>
      </div>
    </form>
  );
}
