'use client';

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, Plus, X, Trash2, Monitor, Smartphone, Layout, Video } from 'lucide-react';
import ImageUpload from './ImageUpload';

// ─── Zod Schema ────────────────────────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().optional().default(''),
  sector: z.string().optional().default(''),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  tools: z.array(z.string()).default([]),
  platform: z.string().min(1, 'Platform is required'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 5),
  heroMediaUrl: z.string().min(1, 'Hero media is required'),
  fullPageMockupUrl: z.string().optional().default(''),
  gallery: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(['desktop', 'mobile', 'mockup', 'video']),
  })).default([]),
  beforeAfter: z.array(z.object({
    before: z.string().min(1, 'Before image required'),
    after: z.string().min(1, 'After image required'),
  })).default([]),
  closingImageUrl: z.string().optional().default(''),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: any;
}

// ─── Gallery type icons ─────────────────────────────────────────────────────
const GALLERY_TYPES = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'mockup', label: 'Mockup', icon: Layout },
  { value: 'video', label: 'Video', icon: Video },
] as const;

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.input<typeof projectSchema>, any, z.output<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
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
      liveUrl: '',
      isFeatured: false,
    },
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: 'gallery',
  });

  const { fields: beforeAfterFields, append: appendBeforeAfter, remove: removeBeforeAfter } = useFieldArray({
    control: form.control,
    name: 'beforeAfter',
  });

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    try {
      const url = initialData ? `/api/admin/projects/${initialData._id}` : '/api/admin/projects';
      const method = initialData ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save project');
      toast.success(initialData ? 'Project updated!' : 'Project published!');
      router.push('/admin/projects');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Chip Input (reusable) ────────────────────────────────────────────────
  const ChipInput = ({ fieldName, label, placeholder }: { fieldName: any; label: string; placeholder: string }) => {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 bg-black/40 p-6 md:p-8 rounded-2xl border border-rose-900/30 backdrop-blur-xl">


      {/* ══ SECTION 1: Basic Info ══ */}
      <div className="space-y-6">
        <SectionHeader title="Basic Info" subtitle="Project identity" />

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Project Title *</label>
            <input {...form.register('title')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="e.g. Fintech Dashboard" />
            {form.formState.errors.title && <p className="text-red-400 text-xs">{form.formState.errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Category</label>
            <input {...form.register('category')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="e.g. Branding, Websites, AI" />
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Sector / Domain</label>
            <input {...form.register('sector')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="e.g. Healthcare, Fintech" />
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Platform *</label>
            <input {...form.register('platform')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="e.g. Web, Mobile App" />
            {form.formState.errors.platform && <p className="text-red-400 text-xs">{form.formState.errors.platform.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Short Description *</label>
            <textarea {...form.register('description')} rows={3}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
              placeholder="1-2 lines describing the project..." />
            {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          {/* Services */}
          <ChipInput fieldName="services" label="Services *" placeholder="e.g. UX Design" />

          {/* Tools */}
          <ChipInput fieldName="tools" label="Tools — Optional" placeholder="e.g. Figma" />
        </div>

        {/* Year & Live URL (not bilingual) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Year</label>
            <input type="number" {...form.register('year', { valueAsNumber: true })}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors" />
            {form.formState.errors.year && <p className="text-red-400 text-xs">{form.formState.errors.year.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-rose-200">Live URL <span className="text-rose-500/50">(Optional)</span></label>
            <input {...form.register('liveUrl')}
              className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="https://..." />
            {form.formState.errors.liveUrl && <p className="text-red-400 text-xs">{form.formState.errors.liveUrl.message}</p>}
          </div>
        </div>
      </div>

      {/* ══ SECTION 2: Cover & Full-Page Mockup ══ */}
      <div className="space-y-6">
        <SectionHeader title="Cover Media" subtitle="Hero image/video + full-page scrollable mockup" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-rose-950/10 rounded-xl border border-rose-900/20">
          <div className="space-y-2">
            <Controller name="heroMediaUrl" control={form.control}
              render={({ field }) => <ImageUpload label="Hero Cover (Image / Video) *" value={field.value} onChange={field.onChange} folder="projects" />} />
            {form.formState.errors.heroMediaUrl && <p className="text-red-400 text-xs">{form.formState.errors.heroMediaUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Controller name="fullPageMockupUrl" control={form.control}
              render={({ field }) => <ImageUpload label="Full-Page Scrollable Mockup (Optional)" value={field.value || ''} onChange={field.onChange} folder="projects" accept="image/*" />} />
            <p className="text-xs text-rose-500/50">Used for the live scrollable preview when no live URL is available</p>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3: Gallery ══ */}
      <div className="space-y-4">
        <SectionHeader title="Project Gallery" subtitle="Add unlimited images/videos (Desktop, Mobile, Mockup, Video)" />
        <div className="space-y-4">
          {galleryFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 p-4 bg-rose-950/10 rounded-xl border border-rose-900/20">
              <div className="flex-1 space-y-3">
                <Controller name={`gallery.${index}.url`} control={form.control}
                  render={({ field }) => <ImageUpload label={`Gallery Image ${index + 1}`} value={form.watch(`gallery.${index}.url`) || ''} onChange={(url) => form.setValue(`gallery.${index}.url`, url)} folder="projects" />} />
                <div className="flex gap-2 flex-wrap">
                  {GALLERY_TYPES.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button"
                      onClick={() => form.setValue(`gallery.${index}.type`, value as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.watch(`gallery.${index}.type`) === value ? 'bg-rose-600 text-white border-rose-500' : 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:border-rose-500'}`}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => removeGallery(index)} className="text-red-400 hover:text-red-300 transition-colors mt-1">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendGallery({ url: '', type: 'desktop' })}
            className="w-full py-3 border-2 border-dashed border-rose-900/50 hover:border-rose-500/50 rounded-xl text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Gallery Image
          </button>
        </div>
      </div>

      {/* ══ SECTION 4: Before / After (Optional) ══ */}
      <div className="space-y-4">
        <SectionHeader title="Before / After" subtitle="Optional — only add if the project has before/after comparisons" />
        <div className="space-y-4">
          {beforeAfterFields.map((field, index) => (
            <div key={field.id} className="p-4 bg-rose-950/10 rounded-xl border border-rose-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-rose-300">Pair {index + 1}</span>
                <button type="button" onClick={() => removeBeforeAfter(index)} className="text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload label="Before" value={form.watch(`beforeAfter.${index}.before`) || ''} onChange={(url) => form.setValue(`beforeAfter.${index}.before`, url)} folder="projects" accept="image/*" />
                <ImageUpload label="After" value={form.watch(`beforeAfter.${index}.after`) || ''} onChange={(url) => form.setValue(`beforeAfter.${index}.after`, url)} folder="projects" accept="image/*" />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendBeforeAfter({ before: '', after: '' })}
            className="w-full py-3 border-2 border-dashed border-rose-900/50 hover:border-rose-500/50 rounded-xl text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Before / After Pair
          </button>
        </div>
      </div>

      {/* ══ SECTION 5: Closing Image ══ */}
      <div className="space-y-4">
        <SectionHeader title="Closing Image" subtitle="Optional — final visual shown at the end of the case study" />
        <div className="p-6 bg-rose-950/10 rounded-xl border border-rose-900/20">
          <Controller name="closingImageUrl" control={form.control}
            render={({ field }) => <ImageUpload label="Closing Image (Optional)" value={field.value || ''} onChange={field.onChange} folder="projects" accept="image/*" />} />
        </div>
      </div>

      {/* ══ Featured Toggle ══ */}
      <div className="flex items-center space-x-3 bg-rose-950/20 p-4 rounded-lg border border-rose-900/30">
        <input type="checkbox" id="isFeatured" {...form.register('isFeatured')} className="w-5 h-5 accent-rose-500 cursor-pointer" />
        <label htmlFor="isFeatured" className="text-sm font-medium text-rose-200 cursor-pointer select-none">
          Feature this project on the homepage
        </label>
      </div>

      {/* ══ Submit ══ */}
      <div className="flex justify-end pt-6 border-t border-rose-900/30">
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {initialData ? 'Update Project' : 'Publish Project'}
        </button>
      </div>
    </form>
  );
}
