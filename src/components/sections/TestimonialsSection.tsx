"use client";

import { useEffect, useState } from 'react';
import { H2, P } from '@/components/ui/typography';
import TestimonialCard from '@/components/ui/TestimonialCard';
import { useTranslations } from 'next-intl';

export default function TestimonialsSection() {
  const t = useTranslations('TestimonialsPreview');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        const json = await res.json();
        if (json.success) {
          // Filter to only show featured testimonials, or show all if none are featured
          const featured = json.data.filter((t: any) => t.isFeatured);
          setTestimonials(featured.length > 0 ? featured : json.data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-6 lg:px-12">
        
        <div className="max-w-4xl mx-auto mb-20 text-start">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50"></span>
            {t('kicker')}
          </div>
          <div className="font-serif text-lg tracking-[0.3em] text-foreground/80 mb-2">{t('maison')}</div>
          <h2 className="text-5xl md:text-7xl font-serif font-normal text-foreground">
            {t('title')}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed rounded-xl">
            {t('noTestimonials')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <TestimonialCard 
                key={t._id}
                clientName={t.clientName}
                role={t.role}
                company={t.company}
                content={t.content}
                rating={t.rating}
                avatarUrl={t.avatarUrl}
                audioUrl={t.audioUrl}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
