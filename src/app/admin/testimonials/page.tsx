import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Plus, Star } from 'lucide-react';
import DeleteItemButton from '@/components/admin/DeleteItemButton';
import Image from 'next/image';

export const metadata = {
  title: 'Testimonials | Admin Dashboard',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const t = await getTranslations('Admin.testimonialsList');
  const dt = await getTranslations('Admin.deleteTestimonial');

  await connectToDatabase();
  const rawTestimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
  const testimonials = JSON.parse(JSON.stringify(rawTestimonials)).map((t: any) => ({
    ...t,
    _id: String(t._id),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-rose-200/60 mt-1">{t('subtitle')}</p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-900/20"
        >
          <Plus className="w-5 h-5" />
          {t('addNew')}
        </Link>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-12 text-center">
          <p className="text-rose-300">{t('noTestimonials')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial: any) => (
            <div
              key={testimonial._id}
              className="bg-black/40 border border-rose-900/30 rounded-xl p-5 flex flex-col transition-all hover:border-rose-700/50 hover:shadow-lg hover:shadow-rose-900/10"
            >
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{testimonial.clientName}</p>
                  <p className="text-xs text-rose-400">
                    {[testimonial.role, testimonial.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <DeleteItemButton
                  itemId={testimonial._id}
                  endpoint="/api/testimonials"
                  confirmText={dt('confirm', { name: testimonial.clientName })}
                  successText={dt('success')}
                  failedText={dt('failed')}
                  deleteText={dt('delete')}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
