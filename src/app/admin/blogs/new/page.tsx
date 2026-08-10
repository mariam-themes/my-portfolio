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
<<<<<<< HEAD
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-background/50 flex items-center justify-center border border-card-border">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <H1 className="text-3xl font-bold text-white m-0">Create New Blog Post</H1>
      </div>
      
      <div className="p-8 md:p-10 glass-card relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Title</label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Post Title" 
                className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Slug</label>
              <Input 
                required
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                placeholder="post-url-slug" 
                className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Excerpt</label>
            <Input 
              value={formData.excerpt}
              onChange={e => setFormData({...formData, excerpt: e.target.value})}
              placeholder="Short summary of the post..." 
              className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Cover Image</label>
            <Input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload} 
              className="bg-background/40 border-card-border text-foreground file:text-accent file:bg-background/50 file:border-0 hover:file:bg-card-bg transition-colors"
            />
            {formData.coverImage && (
              <p className="text-sm text-emerald-400/90 font-medium flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Image uploaded successfully!
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Tags (comma separated)</label>
            <Input 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="Nextjs, React, Design" 
              className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
=======
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
>>>>>>> main
            />
          </div>

<<<<<<< HEAD
          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Content</label>
            <div className="rounded-xl overflow-hidden border border-card-border bg-background/40">
              <TiptapEditor 
                content={formData.content}
                onChange={(html) => setFormData({...formData, content: html})}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/80 text-background font-bold shadow-lg shadow-accent/20 py-6 text-lg tracking-wide">
            {loading ? 'Publishing...' : 'Publish Blog Post'}
          </Button>
        </form>
      </div>
=======
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
>>>>>>> main
    </div>
  );
}
