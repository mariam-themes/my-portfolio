"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TiptapEditor from '@/components/admin/TiptapEditor';

const inputClass =
  'w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white placeholder:text-rose-500/50 focus:outline-none focus:border-rose-500 transition-colors';

const labelClass = 'text-xs font-medium text-rose-200';

export default function NewBlogPage() {
  const router = useRouter();
  const t = useTranslations('Admin.blogsPage');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'portfolio_blogs');
    data.append('resource_type', 'image');

    try {
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
      const tagsArray = formData.tags.split(',').map(tag => tag.trim());
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
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
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 p-6 md:p-8 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClass}>{t('titleLabel')}</label>
            <input
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder={t('titlePh')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('slugLabel')}</label>
            <input
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder={t('slugPh')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{t('excerptLabel')}</label>
          <input
            value={formData.excerpt}
            onChange={e => setFormData({...formData, excerpt: e.target.value})}
            placeholder={t('excerptPh')}
            className={inputClass}
          />
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
            onChange={e => setFormData({...formData, tags: e.target.value})}
            placeholder={t('tagsPh')}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t('contentLabel')}</label>
          <TiptapEditor
            content={formData.content}
            onChange={(html) => setFormData({...formData, content: html})}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-rose-900/30">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? t('saving') : t('publish')}
          </button>
        </div>
      </form>
    </div>
  );
}
