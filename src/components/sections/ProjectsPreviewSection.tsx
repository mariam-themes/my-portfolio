'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';

export default function ProjectsPreviewSection() {
  const locale = useLocale();
  const t = useTranslations('ProjectsPreview');
  const [projects, setProjects] = useState<LocalizedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (json.success) {
          // Take the 4 most recent projects
          setProjects(json.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <section className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-4xl text-left">
            <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
              <span className="w-12 h-[1px] bg-accent/50"></span>
              {t('kicker')}
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-normal text-foreground leading-tight">
              {t('title')} <span className="italic" style={{ color: '#951C30' }}>{t('titleAccent')}</span>
            </h2>
          </div>
          
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-sm font-semibold tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all duration-300 shrink-0"
          >
            {t('seeAll')}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-white/10 rounded-xl">
            {t('noProjects')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {projects.map((project, index) => {
              // Retrieve localized title and category if needed
              const title = resolveText(project.title, project, 'title', locale);
              const category = resolveText(project.category, project, 'category', locale);
              const sector = resolveText(project.sector, project, 'sector', locale);

              return (
                <Link
                  key={project._id}
                  href={`/work/${project.slug}`}
                  className={`group block relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 transition-all duration-500 hover:border-[#951C30]/30 hover:bg-white/[0.04] ${index % 2 !== 0 ? 'md:mt-16' : ''}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111]">
                    {project.heroMediaUrl ? (
                      <Image
                        src={project.heroMediaUrl}
                        alt={title || 'Project preview'}
                        fill
                        className={`object-cover transition-transform duration-1000 ease-out ${hoveredIndex === index ? 'scale-105' : 'scale-100'}`}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-light">
                        {t('noImage')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col gap-2">
                    <h3 className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] rtl:text-xs font-bold uppercase tracking-[0.2em] rtl:tracking-normal text-white/50">
                      <span>{category || sector || t('design')}</span>
                      <span className="w-1 h-1 rounded-full bg-[#951C30]/80" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
