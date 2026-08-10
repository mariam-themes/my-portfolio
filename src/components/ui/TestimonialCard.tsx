"use client";

import { Star } from 'lucide-react';
import AudioPlayer from '@/components/ui/AudioPlayer';

interface TestimonialCardProps {
  clientName: string;
  role?: string;
  company?: string;
  content: string;
  avatarUrl?: string;
  audioUrl?: string;
  rating: number;
}

export default function TestimonialCard({
  clientName,
  role,
  company,
  content,
  avatarUrl,
  audioUrl,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col gap-6 p-8 rounded-2xl glass-card transition-shadow h-full">
      
      {/* Stars */}
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "fill-accent text-accent" : "fill-accent/20 text-accent/20"} 
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-xl md:text-2xl font-serif text-foreground/90 leading-relaxed mb-4">
        "{content}"
      </blockquote>

      {/* Optional Audio Player */}
      {audioUrl && (
        <div className="pt-2">
          <AudioPlayer url={audioUrl} />
        </div>
      )}

      {/* Client Info */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-none">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={clientName} 
            className="w-12 h-12 rounded-full object-cover border border-card-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border border-card-border flex items-center justify-center text-accent font-serif text-sm tracking-widest bg-transparent">
            {clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
        
        <div className="flex flex-col">
          <span className="font-sans text-sm font-medium text-foreground tracking-wide">
            {clientName}
          </span>
          {(role || company) && (
            <span className="text-xs text-foreground/60 tracking-wider uppercase mt-1">
              {role} {role && company && '· '} {company}
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
}
