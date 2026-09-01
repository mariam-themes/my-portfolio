"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';
import { compressImageFile } from '@/lib/imageCompression';

const inputClass =
  'w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white placeholder:text-rose-500/50 focus:outline-none focus:border-rose-500 transition-colors';

const labelClass = 'text-xs font-medium text-rose-200';

interface BlogFormProps {
  mode: 'create' | 'edit';
  blogId?: string;
}

export default function BlogForm({ mode, blogId }: BlogFormProps) {
  const router = useRouter();
  const t = useTranslations('Admin.blogsPage');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(mode === 'create');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    seoTitle: { en: '', ar: '' },
    seoDescription: { en: '', ar: '' },
  });

  useEffect(() => {
    if (mode === 'edit' && blogId) {
      fetch(`/api/blogs/${blogId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            const b = json.data;
            setFormData({
              title: b.title || '',
              slug: b.slug || '',
              excerpt: b.excerpt || '',
              content: b.content || '',
              coverImage: b.coverImage || '',
              tags: (b.tags || []).join(', '),
              seoTitle: {
                en: b.seoTitle?.en || '',
                ar: b.seoTitle?.ar || '',
              },
              seoDescription: {
                en: b.seoDescription?.en || '',
                ar: b.seoDescription?.ar || '',
              },
            });
          }
        })
        .catch((err) => console.error('Failed to load blog:', err))
        .finally(() => setReady(true));
    }
  }, [mode, blogId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileToUpload = await compressImageFile(file);
      const data = new FormData();
      data.append('file', fileToUpload);
      data.append('folder', 'portfolio_blogs');
      data.append('resource_type', 'image');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, coverImage: json.data.secure_url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Clean up localized SEO fields — only include non-empty values
      const cleanLocalized = (val: { en: string; ar: string }) => {
        const result: { en?: string; ar?: string } = {};
        if (val.en?.trim()) result.en = val.en.trim();
        if (val.ar?.trim()) result.ar = val.ar.trim();
        return Object.keys(result).length > 0 ? result : undefined;
      };

      const seoTitle = cleanLocalized(formData.seoTitle);
      const seoDescription = cleanLocalized(formData.seoDescription);

      const payload: any = { ...formData, tags: tagsArray };
      if (seoTitle) payload.seoTitle = seoTitle;
      else delete payload.seoTitle;
      if (seoDescription) payload.seoDescription = seoDescription;
      else delete payload.seoDescription;

      const res =
        mode === 'edit'
          ? await fetch(`/api/blogs/${blogId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch('/api/blogs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      const json = await res.json();
      if (json.success) {
        router.push('/admin/blogs');
        router.refresh();
      } else {
        alert(json.error);
      }
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/blogs" className="inline-flex items-center text-rose-400 hover:text-rose-300 transition-colors mb-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {mode === 'edit' ? t('editTitle') : t('title')}
        </h1>
        <p className="text-rose-200/60 mt-1">
          {mode === 'edit' ? t('editSubtitle') : t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 p-6 md:p-8 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClass}>{t('titleLabel')}</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('titlePh')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('slugLabel')}</label>
            <input
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder={t('slugPh')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{t('excerptLabel')}</label>
          <input
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder={t('excerptPh')}
            className={inputClass}
          />
        </div>

        {/* ── SEO Settings ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-rose-900/30" />
            <div className="text-center">
              <h3 className="text-sm font-semibold text-rose-300 uppercase tracking-widest">{t('seoSettings')}</h3>
              <p className="text-xs text-rose-500/60 mt-0.5">{t('seoSub')}</p>
            </div>
            <div className="flex-1 h-px bg-rose-900/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t('metaTitleEn')}</label>
              <input
                maxLength={70}
                value={formData.seoTitle.en}
                onChange={(e) => setFormData({ ...formData, seoTitle: { ...formData.seoTitle, en: e.target.value } })}
                placeholder={t('metaTitleEnPh')}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('metaTitleAr')}</label>
              <input
                maxLength={70}
                dir="rtl"
                value={formData.seoTitle.ar}
                onChange={(e) => setFormData({ ...formData, seoTitle: { ...formData.seoTitle, ar: e.target.value } })}
                placeholder={t('metaTitleArPh')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>{t('metaDescEn')}</label>
              <textarea
                rows={2}
                maxLength={160}
                value={formData.seoDescription.en}
                onChange={(e) => setFormData({ ...formData, seoDescription: { ...formData.seoDescription, en: e.target.value } })}
                placeholder={t('metaDescEnPh')}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('metaDescAr')}</label>
              <textarea
                rows={2}
                maxLength={160}
                dir="rtl"
                value={formData.seoDescription.ar}
                onChange={(e) => setFormData({ ...formData, seoDescription: { ...formData.seoDescription, ar: e.target.value } })}
                placeholder={t('metaDescArPh')}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t('coverLabel')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full text-sm text-rose-100 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-900/50 file:px-4 file:py-2 file:text-rose-200 hover:file:bg-rose-800 file:transition-colors file:cursor-pointer"
          />
          {formData.coverImage && (
            <p className="text-sm text-emerald-400">{t('imageUploaded')}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{t('tagsLabel')}</label>
          <input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder={t('tagsPh')}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t('contentLabel')}</label>
          {ready ? (
            <TiptapEditor
              content={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
            />
          ) : (
            <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 px-4 py-6 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('loadingContent')}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-rose-900/30">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'edit'
              ? loading
                ? t('updating')
                : t('update')
              : loading
              ? t('saving')
              : t('publish')}
          </button>
        </div>
      </form>
    </div>
  );
}
