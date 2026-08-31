"use client";

import { useEffect, useState, useRef } from 'react';
import TestimonialCard from '@/components/ui/TestimonialCard';
import LeaveReviewModal from '@/components/ui/LeaveReviewModal';
import { useTranslations } from 'next-intl';
import { MessageSquarePlus } from 'lucide-react';

export default function TestimonialsSection() {
  const t = useTranslations('TestimonialsPreview');
  const sectionRef = useRef<HTMLElement>(null);
  const [testimonials, setTestimonials] = useState<{
    _id: string;
    clientName: string;
    role?: string;
    company?: string;
    content: string;
    rating: number;
    avatarUrl?: string;
    audioUrl?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials?public=true');
        const json = await res.json();
        if (json.success) {
          const featured = json.data.filter((t: { isFeatured?: boolean }) => t.isFeatured);
          setTestimonials(featured.length > 0 ? featured : json.data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
      }
    }

    fetchTestimonials();
  }, []);

  // Cards are visible by default; no GSAP hide/show to avoid Lenis conflicts.
  // Use CSS @keyframes fadeInUp instead (no ScrollTrigger dependency).

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const primary = visibleTestimonials[0];
  const rest = visibleTestimonials.slice(1);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 bg-transparent relative z-10 overflow-hidden">
      {/* Subtle depth glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[32rem] w-[42rem] max-w-[90vw] rounded-full bg-[radial-gradient(circle,rgba(149,28,48,0.10),transparent_60%)] blur-3xl"
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative">
        
        <div className="w-full mb-10 md:mb-16 lg:mb-20 text-start">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50"></span>
            {t('kicker')}
          </div>
          <div className="font-serif text-lg tracking-[0.3em] text-foreground/80 mb-2">{t('maison')}</div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-normal text-foreground">
              {t('title')}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 shrink-0 self-start sm:self-auto px-6 py-3.5 rounded-full border border-[#d36a86]/40 text-[#d36a86] hover:bg-[#d36a86]/10 hover:border-[#d36a86]/70 transition-all font-medium text-sm tracking-wide group"
            >
              <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Leave a Review</span>
              <span className="text-white/40 text-xs">· شارك رأيك</span>
            </button>
          </div>
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
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {primary && (
                <div
                  key={String(primary._id ?? primary.clientName ?? 'primary')}
                  className={`tcard-reveal ${rest.length === 0 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
                >
                  <TestimonialCard
                    featured
                    clientName={primary.clientName}
                    role={primary.role}
                    company={primary.company}
                    content={primary.content}
                    rating={primary.rating}
                    avatarUrl={primary.avatarUrl}
                    audioUrl={primary.audioUrl}
                  />
                </div>
              )}
              {rest.map((t, i) => (
                <div key={String(t._id ?? t.clientName ?? `test-${i}`)} className="tcard-reveal">
                  <TestimonialCard
                    clientName={t.clientName}
                    role={t.role}
                    company={t.company}
                    content={t.content}
                    rating={t.rating}
                    avatarUrl={t.avatarUrl}
                    audioUrl={t.audioUrl}
                  />
                </div>
              ))}
            </div>

            {testimonials.length > visibleCount && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium tracking-[0.05em] text-white/80 hover:text-white overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('seeMore')}
                    <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#951C30]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      <LeaveReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
