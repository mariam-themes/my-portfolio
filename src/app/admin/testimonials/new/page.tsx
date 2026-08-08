"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/ui/typography';

export default function NewTestimonialPage() {
  const router = useRouter();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'audioUrl', resourceType: 'image' | 'video' = 'auto') => {
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
      <H1 className="mb-8">Add New Testimonial</H1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client Name</label>
          <Input 
            required
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
            placeholder="John Doe" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role (optional)</label>
            <Input 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              placeholder="CEO" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company (optional)</label>
            <Input 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder="Acme Corp" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rating (1-5)</label>
          <Input 
            type="number"
            min="1" max="5" required
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Testimonial Content</label>
          <textarea 
            required
            className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            placeholder="They did an amazing job..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar Image (optional)</label>
          <Input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'avatarUrl', 'image')} 
          />
          {formData.avatarUrl && <p className="text-sm text-green-600">Avatar uploaded!</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Voice Testimonial Audio (optional)</label>
          <Input 
            type="file" 
            accept="audio/*"
            onChange={(e) => handleFileUpload(e, 'audioUrl', 'video')} 
          />
          {formData.audioUrl && <p className="text-sm text-green-600">Audio uploaded!</p>}
          <p className="text-xs text-slate-500">Cloudinary accepts audio files via the video resource type.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Add Testimonial'}
        </Button>
      </form>
    </div>
  );
}
