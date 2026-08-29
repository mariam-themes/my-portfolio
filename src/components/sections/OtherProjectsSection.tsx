'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useTranslations } from 'next-intl';

type GalleryImage = {
  url: string;
  rotate: number;
  offset: number;
  seed: number;
};

const ASPECTS = [
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[9/16]',
  'aspect-video',
];

// Deterministic pseudo-random so the scattered layout stays stable
// across re-renders (no reshuffle on every paint).
function pseudo(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export default function OtherProjectsSection() {
  const t = useTranslations('OtherProjects');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch('/api/section-layout');
        const json = await res.json();
        if (json.success) {
          const section = (json.data as Array<{ id: string; content?: { gallery?: unknown } }>).find(
            (s) => s.id === 'other-projects'
          );
          const gallery = (section?.content?.gallery as string[]) || [];
          const urls = gallery.filter(
            (u): u is string => typeof u === 'string' && u.trim().length > 0
          );

          const few = urls.length <= 2;
          const coarse =
            typeof window !== 'undefined' &&
            window.matchMedia('(hover: none), (pointer: coarse)').matches;
          setImages(
            urls.map((url, i) => ({
              url,
              // When there are only 1-2 images, keep them calm and centered
              // (minimal rotation, no vertical scatter). Otherwise scatter.
              // On touch devices, reduce scatter so the collage stays clean.
              rotate: few
                ? (pseudo(i + 1) - 0.5) * (coarse ? 2 : 4)
                : (pseudo(i + 1) - 0.5) * (coarse ? 4 : 8),
              offset: few ? 0 : coarse ? 0 : Math.round((pseudo(i + 7) - 0.5) * 48),
              seed: i,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  if (!loading && images.length === 0) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-transparent relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="max-w-4xl mb-10 md:mb-16 text-start">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] rtl:tracking-normal uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50" />
            {t('kicker')}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-normal text-foreground leading-tight">
            {t('title')}{' '}
            <span className="italic" style={{ color: '#951C30' }}>
              {t('titleAccent')}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : images.length <= 2 ? (
          // Few images (1-2): centered, larger, elegant — not scattered.
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {images.map((img, i) => (
              <div
                key={img.seed}
                className={
                  images.length === 1
                    ? 'w-full max-w-sm md:max-w-md'
                    : 'w-full max-w-xs sm:max-w-sm md:w-80'
                }
              >
                <GalleryTile
                  img={img}
                  aspect={ASPECTS[Math.floor(pseudo(i + 13) * ASPECTS.length)]}
                />
              </div>
            ))}
          </div>
        ) : (
          // Many images: masonry columns -> scattered, non-aligned collage.
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
            {images.map((img, i) => (
              <GalleryTile
                key={img.seed}
                img={img}
                aspect={ASPECTS[Math.floor(pseudo(i + 13) * ASPECTS.length)]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GalleryTile({ img, aspect }: { img: GalleryImage; aspect: string }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [9, -9]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), {
    stiffness: 150,
    damping: 18,
  });
  const sheenX = useTransform(mx, (v) => `${v * 100}%`);
  const sheenY = useTransform(my, (v) => `${v * 100}%`);
  const sheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(211,106,134,0.28), transparent 45%)`;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: img.rotate }}
      whileInView={{ opacity: 1, y: 0, rotate: img.rotate }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 break-inside-avoid"
      style={{ perspective: 1000, marginTop: img.offset }}
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-[#951C30]/40 ${aspect}`}
      >
        <Image
          src={img.url}
          alt=""
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          unoptimized
        />

        {/* Mouse-following sheen */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: sheenBg }}
        />

        {/* Subtle depth gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0507]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </motion.div>
  );
}
