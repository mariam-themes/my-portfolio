"use client";

import { useEffect, useState } from 'react';
import { H2, P } from '@/components/ui/typography';
import TestimonialCard from '@/components/ui/TestimonialCard';

export default function TestimonialsSection() {
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
    <section className="py-24 bg-slate-50 dark:bg-black">
      <div className="container mx-auto px-6 lg:px-8">
        
        <div className="max-w-2xl text-center mx-auto mb-16">
          <H2 className="border-none text-4xl md:text-5xl font-bold mb-4">
            Hear from our clients
          </H2>
          <P className="text-lg text-slate-600 dark:text-slate-400 mt-0">
            We've had the pleasure of working with some amazing people. Here's what they have to say about their experience.
          </P>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed rounded-xl">
            No testimonials found. Add some from the dashboard!
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
