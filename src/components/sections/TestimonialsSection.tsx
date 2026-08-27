"use client";

import { useEffect, useState, useRef } from 'react';
import TestimonialCard from '@/components/ui/TestimonialCard';
import LeaveReviewModal from '@/components/ui/LeaveReviewModal';
import { useTranslations } from 'next-intl';
import { MessageSquarePlus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
      }
    }

    fetchTestimonials();
  }, []);

  // Reveal the cards on scroll (wrapper element, so it never fights the card's
  // own hover transform). Reduced-motion safe.
  useGSAP(
    () => {
      if (loading || testimonials.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.tcard-reveal', {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [loading, testimonials] }
  );

  const primary = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-transparent relative z-10">
      {/* Subtle depth glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[32rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(149,28,48,0.10),transparent_60%)] blur-3xl"
      />

      <div className="container mx-auto px-6 lg:px-12 relative">
        
        <div className="max-w-4xl mx-auto mb-16 md:mb-20 text-start">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50"></span>
            {t('kicker')}
          </div>
          <div className="font-serif text-lg tracking-[0.3em] text-foreground/80 mb-2">{t('maison')}</div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h2 className="text-5xl md:text-7xl font-serif font-normal text-foreground">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {primary && (
              <div
                key={primary._id}
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
            {rest.map((t) => (
              <div key={t._id} className="tcard-reveal">
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
        )}

      </div>

      <LeaveReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
