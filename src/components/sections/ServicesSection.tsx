'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default
  const locale = useLocale();
  const t = useTranslations('Services');

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error('Failed to fetch services:', err));
  }, []);

  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-24 md:py-32 text-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-[1px] bg-rose-900/50" />
            <h2 className="text-sm tracking-[0.3em] uppercase text-rose-100/60 font-medium">
              {t('title') || 'Services'}
            </h2>
          </div>
          <p className="max-w-md text-rose-100/50 text-sm md:text-base leading-relaxed md:text-right">
            {t('description') || 'Five disciplines, one continuous system — from the first mark to the shipped storefront.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="border-t border-rose-900/30">
          {services.map((service, index) => {
            const isExpanded = expandedIndex === index;
            
            // Handle translations
            const title = locale === 'ar' ? (service.translations?.ar?.title || service.title) : (service.translations?.en?.title || service.title);
            const description = locale === 'ar' ? (service.translations?.ar?.description || service.description) : (service.translations?.en?.description || service.description);
            const num = (index + 1).toString().padStart(2, '0');

            return (
              <div 
                key={service._id} 
                className="border-b border-rose-900/30 group"
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full py-8 md:py-12 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-8 md:gap-16 w-full">
                    <span className="text-sm font-mono text-rose-500/50 w-8">
                      {num}
                    </span>
                    <h3 className={`text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tight transition-colors duration-500 ${isExpanded ? 'text-white' : 'text-rose-100/30 group-hover:text-rose-100/70'}`}>
                      {title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {isExpanded ? (
                      <X className="w-6 h-6 text-rose-500" />
                    ) : (
                      <Plus className="w-6 h-6 text-rose-500/50 group-hover:text-rose-500 transition-colors" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-12 md:pb-16 flex flex-col md:flex-row gap-10 md:gap-20 md:pl-24 lg:pl-32">
                        {/* Text & Tags */}
                        <div className="flex-1 space-y-8">
                          <p className="text-lg md:text-xl text-rose-100/70 leading-relaxed font-light">
                            {description}
                          </p>
                          
                          {service.tags && service.tags.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {service.tags.map((tag: string, i: number) => (
                                <span 
                                  key={i}
                                  className="px-4 py-1.5 rounded-full border border-rose-900/50 text-xs font-medium tracking-wider uppercase text-rose-300 bg-rose-950/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        {service.image && (
                          <div className="flex-1 w-full max-w-lg aspect-[4/3] relative overflow-hidden rounded-lg">
                            <img 
                              src={service.image} 
                              alt={title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0507]/80 to-transparent" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
