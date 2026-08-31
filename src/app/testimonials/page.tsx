import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/models/Testimonial';
import TestimonialCard from '@/components/ui/TestimonialCard';

export const metadata: Metadata = {
  title: 'Kind Words | Mariam Portfolio',
  description: 'Testimonials from clients who valued precision and partners who stayed.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TestimonialsPage() {
  await connectToDatabase();
  const rawTestimonials = await Testimonial.find().sort({ createdAt: -1 }).lean();
  const testimonials = JSON.parse(JSON.stringify(rawTestimonials)).map((t: any) => ({
    ...t,
    _id: String(t._id),
  }));

  const featured = testimonials.filter((t: any) => t.isFeatured);
  const display = featured.length > 0 ? featured : testimonials;

  return (
    <div className="min-h-screen pb-32 text-white overflow-hidden relative"
         style={{
           background:
             'radial-gradient(circle at 88% 4%, rgba(125,15,46,0.32), transparent 26rem),' +
             'radial-gradient(circle at 8% 38%, rgba(81,8,29,0.24), transparent 32rem),' +
             '#0a0507',
         }}>
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="lg:w-1/2">
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-normal tracking-tight leading-[0.95] mb-6">
              Words from
              <span className="block mt-2 italic" style={{ color: '#d36a86' }}>the people</span>
              <span className="block" style={{ color: '#e8a3b6' }}>behind the brands.</span>
            </h1>
          </div>
          <div className="lg:w-1/2">
            <p className="max-w-md text-white/55 font-sans text-lg leading-relaxed lg:ml-auto">
              Testimonials from clients and partners who value detail,
              balance, and enduring elegance.
            </p>
          </div>
        </div>

        {display.length === 0 ? (
          <div className="text-center py-40 text-white/30 font-light text-xl">
            No testimonials yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">
            {display.map((t: any, i: number) => (
              <div key={String(t._id ?? t.clientName ?? `test-${i}`)} className={i % 2 !== 0 && i >= 1 && i % 3 !== 0 ? 'md:mt-16' : ''}>
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
    </div>
  );
}