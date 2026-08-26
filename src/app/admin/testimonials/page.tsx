'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Star, CheckCircle, Clock } from 'lucide-react';
import DeleteItemButton from '@/components/admin/DeleteItemButton';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Testimonial {
  _id: string;
  clientName: string;
  role?: string;
  company?: string;
  email?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'approved' | 'pending'>('approved');

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials');
      const json = await res.json();
      if (json.success) {
        setTestimonials(json.data.map((t: Testimonial & { _id: string }) => ({
          ...t,
          _id: String(t._id),
        })));
      }
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleApprove = async (id: string) => {
    const toastId = toast.loading('Approving...');
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      toast.success('Testimonial approved!', { id: toastId });
      setTestimonials((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isApproved: true } : t))
      );
    } catch {
      toast.error('Failed to approve testimonial', { id: toastId });
    }
  };

  const approved = testimonials.filter((t) => t.isApproved);
  const pending = testimonials.filter((t) => !t.isApproved);
  const displayed = tab === 'approved' ? approved : pending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Testimonials</h1>
          <p className="text-rose-200/60 mt-1">Manage client testimonials.</p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-black/30 border border-rose-900/30 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('approved')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'approved'
              ? 'bg-gradient-to-r from-rose-600 to-rose-900 text-white shadow'
              : 'text-rose-300/70 hover:text-rose-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Approved
          <span className="ml-1 text-xs bg-black/30 px-2 py-0.5 rounded-full">{approved.length}</span>
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'pending'
              ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow'
              : 'text-rose-300/70 hover:text-rose-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Review
          {pending.length > 0 && (
            <span className="ml-1 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-pulse flex gap-2">
            <div className="w-3 h-3 bg-rose-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">
            {tab === 'pending'
              ? 'No pending testimonials.'
              : 'No approved testimonials yet. Add some from the dashboard!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayed.map((testimonial) => (
            <div
              key={testimonial._id}
              className={`bg-black/40 border rounded-xl p-5 flex flex-col transition-all ${
                testimonial.isApproved
                  ? 'border-rose-900/30 hover:border-rose-700/50'
                  : 'border-amber-800/40 hover:border-amber-600/50'
              }`}
            >
              {/* Status Badge */}
              {!testimonial.isApproved && (
                <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Approval
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-rose-900'}`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm text-rose-100/80 leading-relaxed line-clamp-3 mb-4">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-auto flex items-center gap-3 pt-4 border-t border-rose-900/30">
                {testimonial.avatarUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatarUrl}
                      alt={testimonial.clientName || 'Client avatar'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-950/50 border border-rose-900/50 flex items-center justify-center text-rose-300 text-sm font-bold">
                    {(testimonial.clientName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{testimonial.clientName}</p>
                  <p className="text-xs text-rose-400 truncate">
                    {[testimonial.role, testimonial.company].filter(Boolean).join(' · ')}
                  </p>
                  {testimonial.email && (
                    <p className="text-xs text-rose-500/50 truncate">{testimonial.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!testimonial.isApproved && (
                    <button
                      onClick={() => handleApprove(testimonial._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-800/40 text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                  <DeleteItemButton
                    itemId={testimonial._id}
                    endpoint="/api/testimonials"
                    confirmText={`Are you sure you want to delete the testimonial from "${testimonial.clientName}"? This cannot be undone.`}
                    successText="Testimonial deleted successfully"
                    failedText="Failed to delete testimonial"
                    deleteText="Delete"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
