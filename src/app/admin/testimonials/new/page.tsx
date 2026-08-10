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

<<<<<<< HEAD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'audioUrl', resourceType: 'image' | 'video' | 'auto' = 'auto') => {
=======
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'audioUrl', resourceType: 'image' | 'video' = 'video') => {
>>>>>>> main
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
<<<<<<< HEAD
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-background/50 flex items-center justify-center border border-card-border">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <H1 className="text-3xl font-bold text-foreground m-0 font-serif">Add New Testimonial</H1>
      </div>
=======
      <H1 className="mb-8">{t('title')}</H1>
>>>>>>> main
      
      <div className="p-8 md:p-10 glass-card relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
<<<<<<< HEAD
          <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Client Name</label>
=======
          <label className="text-sm font-medium">{t('clientName')}</label>
>>>>>>> main
          <Input 
            required
            value={formData.clientName}
            onChange={e => setFormData({...formData, clientName: e.target.value})}
<<<<<<< HEAD
            placeholder="John Doe" 
            className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
=======
            placeholder={t('clientNamePh')} 
>>>>>>> main
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
<<<<<<< HEAD
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Role (optional)</label>
            <Input 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              placeholder="CEO" 
              className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Company (optional)</label>
            <Input 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              placeholder="Acme Corp" 
              className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
=======
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
>>>>>>> main
            />
          </div>
        </div>

        <div className="space-y-2">
<<<<<<< HEAD
          <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Rating (1-5)</label>
=======
          <label className="text-sm font-medium">{t('rating')}</label>
>>>>>>> main
          <Input 
            type="number"
            min="1" max="5" required
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
            className="bg-background/40 border-card-border text-foreground placeholder:text-foreground/50 focus:border-accent/50 focus:ring-accent/20"
          />
        </div>

        <div className="space-y-2">
<<<<<<< HEAD
          <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Testimonial Content</label>
=======
          <label className="text-sm font-medium">{t('content')}</label>
>>>>>>> main
          <textarea 
            required
            className="flex min-h-[100px] w-full rounded-md border border-card-border bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            placeholder={t('contentPh')} 
          />
        </div>

        <div className="space-y-2">
<<<<<<< HEAD
          <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Avatar Image (optional)</label>
=======
          <label className="text-sm font-medium">{t('avatar')}</label>
>>>>>>> main
          <Input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'avatarUrl', 'image')} 
            className="bg-background/40 border-card-border text-foreground file:text-accent file:bg-background/50 file:border-0 hover:file:bg-card-bg transition-colors"
          />
<<<<<<< HEAD
          {formData.avatarUrl && (
              <p className="text-sm text-emerald-400/90 font-medium flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Avatar uploaded!
              </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wider text-foreground/80 uppercase">Voice Testimonial Audio (optional)</label>
=======
          {formData.avatarUrl && <p className="text-sm text-green-600">{t('avatarUploaded')}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('audio')}</label>
>>>>>>> main
          <Input 
            type="file" 
            accept="audio/*"
            onChange={(e) => handleFileUpload(e, 'audioUrl', 'video')} 
            className="bg-background/40 border-card-border text-foreground file:text-accent file:bg-background/50 file:border-0 hover:file:bg-card-bg transition-colors"
          />
<<<<<<< HEAD
          {formData.audioUrl && (
              <p className="text-sm text-emerald-400/90 font-medium flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Audio uploaded!
              </p>
          )}
          <p className="text-xs text-foreground/40 mt-1">Cloudinary accepts audio files via the video resource type.</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/80 text-background font-bold shadow-lg shadow-accent/20 py-6 text-lg tracking-wide">
          {loading ? 'Saving...' : 'Add Testimonial'}
=======
          {formData.audioUrl && <p className="text-sm text-green-600">{t('audioUploaded')}</p>}
          <p className="text-xs text-slate-500">{t('audioHint')}</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('saving') : t('add')}
>>>>>>> main
        </Button>
      </form>
      </div>
    </div>
  );
}
