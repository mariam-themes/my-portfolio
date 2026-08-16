"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';

const inputClass =
  'w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white placeholder:text-rose-500/50 focus:outline-none focus:border-rose-500 transition-colors';

const fileClass =
  'w-full text-sm text-rose-100 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-900/50 file:px-4 file:py-2 file:text-rose-200 hover:file:bg-rose-800 file:transition-colors file:cursor-pointer';

const labelClass = 'text-xs font-medium text-rose-200';

export default function NewTestimonialPage() {
  const router = useRouter();
  const t = useTranslations('Admin.testimonialsPage');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    avatarUrl: '',
    audioUrl: '',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'audioUrl', resourceType: 'image' | 'video' = 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'portfolio_testimonials');
    data.append('resource_type', resourceType);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, [field]: json.data.secure_url });
      } else {
        alert("Upload failed: " + json.error);
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
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const json = await res.json();
      if (json.success) {
        router.push('/admin/testimonials');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/testimonials" className="inline-flex items-center text-rose-400 hover:text-rose-300 transition-colors mb-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-black/40 p-6 md:p-8 rounded-2xl border border-rose-900/30 backdrop-blur-xl">
        <div className="space-y-1">
          <label className={labelClass}>{t('clientName')}</label>
          <input
            required
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
            placeholder={t('clientNamePh')}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClass}>{t('role')}</label>
            <input
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              placeholder={t('rolePh')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('company')}</label>
            <input
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder={t('companyPh')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{t('rating')}</label>
          <input
            type="number"
            min="1" max="5" required
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass}>{t('content')}</label>
          <textarea
            required
            className="flex min-h-[100px] w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2.5 text-white placeholder:text-rose-500/50 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            placeholder={t('contentPh')}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t('avatar')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'avatarUrl', 'image')}
            className={fileClass}
          />
          {formData.avatarUrl && <p className="text-sm text-emerald-400">{t('avatarUploaded')}</p>}
        </div>

        <div className="space-y-2">
          <label className={labelClass}>{t('audio')}</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileUpload(e, 'audioUrl', 'video')}
            className={fileClass}
          />
          {formData.audioUrl && <p className="text-sm text-emerald-400">{t('audioUploaded')}</p>}
          <p className="text-xs text-rose-500/60">{t('audioHint')}</p>
        </div>

        <div className="flex justify-end pt-4 border-t border-rose-900/30">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-rose-900/20"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? t('saving') : t('add')}
          </button>
        </div>
      </form>
    </div>
  );
}
