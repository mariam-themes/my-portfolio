"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/ui/typography';

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
        router.push('/admin');
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
    <div className="max-w-2xl mx-auto py-8">
      <H1 className="mb-8">{t('title')}</H1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('clientName')}</label>
          <Input 
            required
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
            placeholder={t('clientNamePh')} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('role')}</label>
            <Input 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              placeholder={t('rolePh')} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('company')}</label>
            <Input 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder={t('companyPh')} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('rating')}</label>
          <Input 
            type="number"
            min="1" max="5" required
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('content')}</label>
          <textarea 
            required
            className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            placeholder={t('contentPh')} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('avatar')}</label>
          <Input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'avatarUrl', 'image')} 
          />
          {formData.avatarUrl && <p className="text-sm text-green-600">{t('avatarUploaded')}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('audio')}</label>
          <Input 
            type="file" 
            accept="audio/*"
            onChange={(e) => handleFileUpload(e, 'audioUrl', 'video')} 
          />
          {formData.audioUrl && <p className="text-sm text-green-600">{t('audioUploaded')}</p>}
          <p className="text-xs text-slate-500">{t('audioHint')}</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('saving') : t('add')}
        </Button>
      </form>
    </div>
  );
}
