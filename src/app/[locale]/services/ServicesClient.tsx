'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, Sparkles, Layers, ArrowLeft } from 'lucide-react';
import { formatPortfolioNumber } from '@/lib/formatters';

export interface LocalizedServiceItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  order: number;
}

interface ServicesClientProps {
  services: LocalizedServiceItem[];
  categories: { name: string; label: string }[];
}

export default function ServicesClient({ services, categories }: ServicesClientProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Filter services by active category
  const filteredServices = useMemo(() => {
    if (!activeFilter) return services;
    return services.filter(
      (s) => (s.category || '').trim().toLowerCase() === activeFilter.trim().toLowerCase()
    );
  }, [services, activeFilter]);

  return (
    <div className="relative z-10 text-white min-h-screen pt-32 pb-24 sm:pt-36 sm:pb-32 px-6 sm:px-10 lg:px-20">

      {/* ── Subtly Animated Ambient Background Glow (GPU-friendly) ── */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#951C30]/10 blur-[140px] transform-gpu will-change-transform"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-40 w-[500px] h-[400px] rounded-full bg-[#951C30]/08 blur-[160px] transform-gpu will-change-transform"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-7xl">

        {/* ── Back to Home Link ── */}
        <motion.div
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-rose-200/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
            <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </Link>
        </motion.div>

        {/* ── Hero Section with Blur & Fade Up Animation ── */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs sm:text-sm font-semibold tracking-wide mb-6"
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'حلول رقمية متكاملة' : 'Integrated Digital Solutions'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]"
          >
            {isAr ? 'خدمات مصممة لصناعة الفارق' : 'Services Crafted for Impact'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-rose-100/70 leading-relaxed font-light"
          >
            {isAr
              ? 'من بناء الهوية البصرية وتصميم تجربة المستخدم المبتكرة، حتى تطوير المتاجر الإلكترونية المتكاملة — حلول مخصصة ترتقي بعلامتك التجارية إلى مستويات استثنائية.'
              : 'From brand identity systems and UI/UX to tailored e-commerce architectures — comprehensive solutions that scale and elevate your presence.'}
          </motion.p>
        </div>

        {/* ── Category Filter Pills ── */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-14 sm:mb-16"
          >
            {/* "All" button */}
            <button
              onClick={() => setActiveFilter('')}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 ${
                activeFilter === ''
                  ? 'bg-[#951C30] text-white shadow-lg shadow-rose-950/50 scale-105'
                  : 'bg-white/[0.03] text-rose-100/60 border border-white/10 hover:border-rose-500/40 hover:text-white'
              }`}
            >
              {isAr ? 'جميع الخدمات' : 'All Services'}
              <span className="ml-2 rtl:ml-0 rtl:mr-2 text-[11px] opacity-70">
                ({services.length})
              </span>
            </button>

            {/* Dynamic Category Buttons */}
            {categories.map((cat) => {
              const isActive = activeFilter.toLowerCase() === cat.name.toLowerCase();
              const count = services.filter(
                (s) => (s.category || '').toLowerCase() === cat.name.toLowerCase()
              ).length;

              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveFilter(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-[#951C30] text-white shadow-lg shadow-rose-950/50 scale-105'
                      : 'bg-white/[0.03] text-rose-100/60 border border-white/10 hover:border-rose-500/40 hover:text-white'
                  }`}
                >
                  {cat.label}
                  <span className="ml-2 rtl:ml-0 rtl:mr-2 text-[11px] opacity-70">
                    ({count})
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* ── Creative Gallery / Editorial Grid ── */}
        <AnimatePresence mode="wait">
          {filteredServices.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20 px-6 rounded-3xl bg-black/40 border border-rose-900/30 max-w-md mx-auto"
            >
              <Layers className="w-12 h-12 text-rose-500/40 mx-auto mb-4" />
              <p className="text-rose-200/70 text-base">
                {isAr ? 'لا توجد خدمات متاحة في هذا التصنيف حالياً.' : 'No services found in this category.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter || 'all'}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
            >
              {filteredServices.map((service, index) => {
                const num = formatPortfolioNumber(index + 1, locale);

                return (
                  <motion.div
                    key={service._id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    className="group relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 hover:border-[#951C30]/70 p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(149,28,48,0.35)] backdrop-blur-xl"
                  >
                    {/* Top Row: Category Pill & Index Number */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      {service.category ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-300 bg-rose-950/50 border border-rose-800/50">
                          {service.category}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium text-rose-300/60 bg-white/[0.03] border border-white/10">
                          {isAr ? 'خدمة متخصصة' : 'Specialized Service'}
                        </span>
                      )}

                      <span className="font-mono text-xs sm:text-sm text-rose-500/50 tracking-widest font-semibold">
                        {num}
                      </span>
                    </div>

                    {/* Image Container — Aspect-square edge-to-edge: Zero empty space, zero cropping */}
                    {service.image ? (
                      <div className="w-full aspect-square relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#951C30]/50 my-4 shadow-xl shadow-black/50">
                        <img
                          src={service.image}
                          alt={service.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square rounded-2xl bg-black/30 border border-rose-900/20 flex items-center justify-center text-rose-300/30 text-sm my-4">
                        {isAr ? 'لا توجد صورة' : 'No Preview'}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col pt-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-rose-100 transition-colors tracking-tight leading-snug mb-3">
                        {service.title}
                      </h3>

                      <p className="text-rose-100/70 text-sm leading-relaxed font-light mb-6 line-clamp-3">
                        {service.description}
                      </p>

                      {/* Tags */}
                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                          {service.tags.map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase text-rose-300/80 bg-rose-950/30 border border-rose-900/40"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action Link */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-300 hover:text-white transition-colors group/btn"
                        >
                          <span>{isAr ? 'طلب الخدمة' : 'Request Service'}</span>
                          <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Section: Custom Project CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mt-20 sm:mt-28 p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-r from-rose-950/40 via-black/60 to-rose-950/30 border border-rose-900/40 backdrop-blur-xl text-center relative overflow-hidden"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(149,28,48,0.2),transparent_70%)]"
            aria-hidden="true"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">
            {isAr ? 'هل لديك مشروع خاص بمواصفات محددة؟' : 'Have a custom project in mind?'}
          </h2>
          <p className="text-rose-100/70 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light relative z-10">
            {isAr
              ? 'يسعدني مناقشة تفاصيل فكرتك وتصميم حل رقمي مخصص يناسب أهدافك ويلبي تطلعاتك بأعلى معايير الجودة.'
              : 'Let’s discuss your vision and build a bespoke solution tailored precisely to your brand and business goals.'}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full bg-[#951C30] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] rtl:tracking-normal text-white shadow-lg shadow-rose-900/40 transition-all duration-300 hover:bg-[#b8223b] hover:shadow-rose-800/50 hover:-translate-y-0.5 relative z-10"
          >
            <span>{isAr ? 'تواصل معي الآن' : 'Get in Touch'}</span>
            <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
