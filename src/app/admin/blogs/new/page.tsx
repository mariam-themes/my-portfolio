"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { H1, H3 } from '@/components/ui/typography';
import TiptapEditor from '@/components/admin/TiptapEditor';

export default function NewBlogPage() {
  const router = useRouter();
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
      <H1 className="mb-8">Create New Blog Post</H1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Post Title" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input 
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder="post-url-slug" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Excerpt</label>
          <Input 
            value={formData.excerpt}
            onChange={e => setFormData({...formData, excerpt: e.target.value})}
            placeholder="Short summary of the post..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <Input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload} 
          />
          {formData.coverImage && (
            <p className="text-sm text-green-600">Image uploaded successfully!</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input 
            value={formData.tags}
            onChange={e => setFormData({...formData, tags: e.target.value})}
            placeholder="Nextjs, React, Design" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <TiptapEditor 
            content={formData.content}
            onChange={(html) => setFormData({...formData, content: html})}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Publish Blog Post'}
        </Button>
      </form>
    </div>
  );
}
