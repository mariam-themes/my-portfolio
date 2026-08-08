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
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            size={18} 
            className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"} 
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed italic">
        "{content}"
      </blockquote>

      {/* Optional Audio Player */}
      {audioUrl && (
        <div className="pt-2">
          <AudioPlayer url={audioUrl} />
        </div>
      )}

      {/* Client Info */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={clientName} 
            className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg border border-rose-200 dark:border-rose-800">
            {clientName.charAt(0)}
          </div>
        )}
        
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {clientName}
          </span>
          {(role || company) && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {role} {role && company && 'at '} {company}
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
}
