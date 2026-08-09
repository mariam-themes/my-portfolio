"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { H1, H3 } from '@/components/ui/typography';
import TiptapEditor from '@/components/admin/TiptapEditor';

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
        router.push('/admin'); // Redirect on success
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
    <div className="max-w-4xl mx-auto py-8">
      <H1 className="mb-8">{t('title')}</H1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('titleLabel')}</label>
            <Input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder={t('titlePh')} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('slugLabel')}</label>
            <Input 
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder={t('slugPh')} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('excerptLabel')}</label>
          <Input 
            value={formData.excerpt}
            onChange={e => setFormData({...formData, excerpt: e.target.value})}
            placeholder={t('excerptPh')} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('coverLabel')}</label>
          <Input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload} 
          />
          {formData.coverImage && (
            <p className="text-sm text-green-600">{t('imageUploaded')}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('tagsLabel')}</label>
          <Input 
            value={formData.tags}
            onChange={e => setFormData({...formData, tags: e.target.value})}
            placeholder={t('tagsPh')} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('contentLabel')}</label>
          <TiptapEditor 
            content={formData.content}
            onChange={(html) => setFormData({...formData, content: html})}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('saving') : t('publish')}
        </Button>
      </form>
    </div>
  );
}
