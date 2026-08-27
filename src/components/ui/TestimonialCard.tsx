"use client";

import { Star, Mic } from 'lucide-react';
import AudioPlayer from '@/components/ui/AudioPlayer';

interface TestimonialCardProps {
  clientName: string;
  role?: string;
  company?: string;
  content: string;
  avatarUrl?: string;
  audioUrl?: string;
  rating: number;
  featured?: boolean;
}

export default function TestimonialCard({
  clientName,
  role,
  company,
  content,
  avatarUrl,
  audioUrl,
  rating,
  featured = false,
}: TestimonialCardProps) {
  const quoteSize = featured
    ? 'text-2xl md:text-3xl lg:text-[2rem] leading-[1.4]'
    : 'text-xl md:text-2xl leading-relaxed';
  const pad = featured ? 'p-8 md:p-12' : 'p-7 md:p-8';
  const avatar = featured ? 'w-14 h-14' : 'w-12 h-12';

  return (
    <div
      className={`group relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d36a86]/40 hover:shadow-[0_30px_70px_-30px_rgba(149,28,48,0.55)] focus-within:-translate-y-1.5 focus-within:border-[#d36a86]/40 focus-within:shadow-[0_30px_70px_-30px_rgba(149,28,48,0.55)] ${pad}`}
    >
      {/* Subtle depth glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_28%_12%,rgba(149,28,48,0.18),transparent_55%)] opacity-50 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Stars */}
      <div className="relative flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={featured ? 18 : 16}
            className={
              i < rating
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.45)]"
                : "fill-yellow-400/20 text-yellow-400/20"
            }
          />
        ))}
      </div>

      {/* Content */}
      <blockquote dir="auto" className={`relative font-serif text-foreground/90 ${quoteSize} mb-2`}>
        "{content}"
      </blockquote>

      {/* Optional Audio Player */}
      {audioUrl && (
        <div className="relative pt-1 mt-1">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-[0.22em] text-[#d36a86]/80">
            <Mic className="w-3.5 h-3.5" /> Voice
          </div>
          <AudioPlayer url={audioUrl} />
        </div>
      )}

      {/* Client Info */}
      <div className="relative flex items-center gap-4 mt-auto pt-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={clientName}
            className={`${avatar} rounded-full object-cover border border-white/15`}
          />
        ) : (
          <div
            className={`${avatar} rounded-full border border-white/15 flex items-center justify-center text-accent font-serif text-sm tracking-widest bg-white/[0.03]`}
          >
            {clientName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}

        <div className="flex flex-col" dir="auto">
          <span className="font-sans text-sm font-medium text-foreground tracking-wide">
            {clientName}
          </span>
          {(role || company) && (
            <span className="text-xs text-foreground/60 tracking-wider uppercase mt-0.5">
              {role} {role && company && '· '} {company}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
