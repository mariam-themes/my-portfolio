'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { resolveText, type LocalizedProject } from '@/lib/localizeProject';
import { ArrowUpRight, Star } from 'lucide-react';

type Variant = 'default' | 'overlay';

export default function FeaturedProjectCard({
  project,
  variant = 'default',
}: {
  project: LocalizedProject;
  index?: number;
  variant?: Variant;
}) {
  const locale = useLocale();
  const t = useTranslations('FeaturedProjects');

  const title = resolveText(project.title, project, 'title', locale);
  const description = resolveText(project.description, project, 'description', locale);
  const category = resolveText(project.category, project, 'category', locale);
  const sector = resolveText(project.sector, project, 'sector', locale);
  const type = sector || category || t('design');
  const services = Array.isArray(project.services)
    ? (project.services as string[]).slice(0, 2)
    : [];
  const media = (project.fullPageMockupUrl as string) || (project.heroMediaUrl as string);

  if (variant === 'overlay') {
    return (
      <div className="group relative flex h-full min-h-[500px] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0a0d] p-3 md:min-h-[520px]">
        {media ? (
          <Image
            src={media}
            alt={title || 'Featured project'}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="rounded-[1.6rem] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-3 rounded-[1.6rem] bg-[#1a0a14]" />
        )}
        <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <span className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#951C30] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
          <Star className="h-3 w-3 fill-white" />
          {t('badge')}
        </span>

        <div className="relative z-10 rounded-2xl border border-white/10 bg-[#0a0507]/85 p-5 backdrop-blur-md md:p-6">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="rounded-full bg-[#951C30] px-2.5 py-1 text-white">{type}</span>
            {(project.year as string | number | undefined) && (
              <>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-white/40">{project.year as string | number}</span>
              </>
            )}
          </div>

          <h3 className="line-clamp-2 font-serif text-xl font-normal leading-tight text-white md:text-2xl">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-white/60">
            {description}
          </p>

          {services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/50"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/work/${project.slug as string}`}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
          >
            <span className="h-px w-6 bg-[#951C30] transition-all duration-300 group-hover:w-10" />
            {t('viewProject')}
            <ArrowUpRight className="h-3.5 w-3.5 text-[#951C30]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111]/80 backdrop-blur-sm transition-all duration-500 hover:border-[#951C30]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      {/* Fixed-height image area — always fills regardless of source image size */}
      <div className="relative w-full shrink-0 overflow-hidden" style={{ height: '320px' }}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#951C30] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
          <Star className="h-3 w-3 fill-white" />
          {t('badge')}
        </span>
        {media ? (
          <Image
            src={media}
            alt={title || 'Featured project'}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a] text-sm text-white/20">
            {t('noImage')}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#951C30]">
          <span>{type}</span>
          {(project.year as string | number | undefined) && (
            <>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-white/30">{project.year as string | number}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2 font-serif text-xl font-normal leading-tight text-white md:text-2xl">
          {title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-white/45">
          {description}
        </p>

        {services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/40"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/work/${project.slug as string}`}
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-white"
        >
          <span className="h-px w-6 bg-[#951C30] transition-all duration-300 group-hover:w-10" />
          {t('viewProject')}
          <ArrowUpRight className="h-3.5 w-3.5 text-[#951C30] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
