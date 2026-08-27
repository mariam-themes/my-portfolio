'use client';

/* ─── Platform definitions ─────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    name: 'Shopify',
    icon: `<svg viewBox="0 0 109.5 124.5" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:34px;height:34px"><path fill="currentColor" d="M74.7 14.8c-.1-.7-.7-1.1-1.2-1.2-.5-.1-10.3-.2-10.3-.2s-8.2-8-9-8.9c-.9-.8-2.5-.6-3.2-.4l-4.4 1.4C44.9 3.5 43.2 3 41.4 3 27 3 19.9 19.4 17.7 27.7L6.5 31.2C3.1 32.2 3 32.3 2.6 35.5L0 110.3l74.4 13.9L109.5 117 74.7 14.8z"/><path fill="currentColor" opacity="0.5" d="M73.5 13.6c-.5-.1-10.3-.2-10.3-.2s-8.2-8-9-8.9c-.3-.3-.7-.5-1.1-.5V124.2L109.5 117 74.7 14.8c-.1-.7-.7-1.1-1.2-1.2z"/></svg>`,
  },
  {
    name: 'Figma',
    icon: `<svg viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:34px"><path fill="currentColor" opacity="0.9" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="currentColor" opacity="0.55" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"/><path fill="currentColor" opacity="0.75" d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z"/><path fill="currentColor" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="currentColor" opacity="0.65" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>`,
  },
  {
    name: 'Webflow',
    icon: `<svg viewBox="0 0 128 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:44px;height:28px"><path fill="currentColor" d="M95.4 0C79.8 0 68 11 63.9 25.7 59.4 11 48.3 1.1 32.3 1.1L19.5 38c4.5-1.6 9.3-2.5 13.3-2.5 8.9 0 15.4 4.6 18.5 12.3L32.1 80l13.1-.2 11.2-31.4C60 61.8 70.9 80 86.4 80l13.4-38.6a37 37 0 0 1-13.7 2.4c-8.7 0-14.5-4.2-17.6-11.4l3.7-10.7c3.1-8.8 9.8-12.5 18-12.5 3.5 0 7 .7 10 2L128 0H95.4z"/></svg>`,
  },
  {
    name: 'WordPress',
    icon: `<svg viewBox="0 0 122.5 122.5" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:34px;height:34px"><path fill="currentColor" d="M61.25 0a61.25 61.25 0 1 0 0 122.5A61.25 61.25 0 0 0 61.25 0zM8.7 61.25a52.55 52.55 0 0 1 4.3-20.7L34.2 100a52.58 52.58 0 0 1-25.5-38.75zm52.55 52.55a52.45 52.45 0 0 1-14.1-1.95l15-43.6 15.35 42.1c.1.25.22.48.35.7a52.45 52.45 0 0 1-16.6 2.75zm7.25-78.3c3.15-.17 6-.5 6-.5 2.82-.35 2.49-4.47-.34-4.3 0 0-8.5.67-14 .67-5.16 0-13.84-.67-13.84-.67-2.83-.17-3.17 4.12-.34 4.3 0 0 2.68.33 5.5.5l8.17 22.4-11.5 34.4-19.12-56.8c3.16-.17 6-.5 6-.5 2.82-.35 2.48-4.47-.35-4.3 0 0-8.5.67-13.98.67a73.55 73.55 0 0 1-1.85-.03 52.56 52.56 0 0 1 79.3-8.14c-.3-.02-.6-.05-.9-.05-5.16 0-8.82 4.48-8.82 9.3 0 4.3 2.5 7.96 5.15 12.28 2 3.5 4.32 7.96 4.32 14.43 0 4.47-1.72 9.65-3.98 16.87l-5.22 17.45-18.9-56.3.78.03zm17.7 74.44L102.4 56.1c2.45-6.16 3.27-11.08 3.27-15.46 0-1.58-.1-3.07-.3-4.44a52.6 52.6 0 0 1-19.57 79.38l-.1-.29z"/></svg>`,
  },
  {
    name: 'Zid',
    icon: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:34px;height:34px"><path fill="currentColor" d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 78C28.5 83 17 71.5 17 50S28.5 17 50 17s33 11.5 33 33-11.5 33-33 33z"/><circle cx="50" cy="50" r="12" fill="currentColor"/><path fill="currentColor" d="M50 20c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6s6-2.7 6-6v-8c0-3.3-2.7-6-6-6zm0 40c-3.3 0-6 2.7-6 6v8c0 3.3 2.7 6 6 6s6-2.7 6-6v-8c0-3.3-2.7-6-6-6zM20 44c-3.3 0-6 2.7-6 6s2.7 6 6 6h8c3.3 0 6-2.7 6-6s-2.7-6-6-6h-8zm52 0c-3.3 0-6 2.7-6 6s2.7 6 6 6h8c3.3 0 6-2.7 6-6s-2.7-6-6-6h-8z"/></svg>`,
  },
  {
    name: 'Next.js',
    icon: `<svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:34px;height:34px"><circle cx="90" cy="90" r="90" fill="rgba(255,255,255,0.06)"/><path d="M149.508 157.52L69.142 54H54V125.97H66.1v-56.31L139.27 165.07a90.221 90.221 0 0 0 10.238-7.55z" fill="currentColor"/><rect x="115" y="54" width="12" height="72" fill="currentColor"/></svg>`,
  },
  {
    name: 'React',
    icon: `<svg viewBox="-10 -10 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:38px;height:34px"><circle cx="100" cy="100" r="18" fill="currentColor"/><ellipse cx="100" cy="100" rx="95" ry="36" stroke="currentColor" stroke-width="7" fill="none"/><ellipse cx="100" cy="100" rx="95" ry="36" stroke="currentColor" stroke-width="7" fill="none" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="95" ry="36" stroke="currentColor" stroke-width="7" fill="none" transform="rotate(120 100 100)"/></svg>`,
  },
  {
    name: 'Framer',
    icon: `<svg viewBox="0 0 14 21" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:34px"><path fill="currentColor" d="M0 0h14v7H7L0 0zM0 7h7l7 7H0V7zM0 14h7l-7 7v-7z"/></svg>`,
  },
];

/* ─── Shawkaten brand separator ─────────────────────────────────────────────── */
function Separator() {
  return (
    <div className="flex items-center gap-4 shrink-0 px-6 select-none">
      <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#951C30]/40 to-transparent" />
      <div className="flex flex-col items-center leading-none gap-1">
        <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#951C30]/50">by</span>
        <span className="text-lg font-extrabold tracking-[0.18em] uppercase text-white/50 whitespace-nowrap">
          Shawkaten
        </span>
      </div>
      <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#951C30]/40 to-transparent" />
    </div>
  );
}

/* ─── Build infinite track ──────────────────────────────────────────────────── */
type TrackItem =
  | { type: 'platform'; data: (typeof PLATFORMS)[0] }
  | { type: 'sep'; id: number };

function buildTrack(): TrackItem[] {
  const half: TrackItem[] = [];
  PLATFORMS.forEach((p) => half.push({ type: 'platform', data: p }));
  half.push({ type: 'sep', id: 0 });
  // Double for seamless loop
  const doubled: TrackItem[] = [
    ...half,
    ...half.map((item) =>
      item.type === 'sep' ? { type: 'sep' as const, id: 1 } : item
    ),
  ];
  return doubled;
}

const TRACK = buildTrack();

/* ════════════════════════════════════════════════════════════════════════════ */
export default function PlatformsTicker() {
  return (
    <div className="relative overflow-hidden py-8 border-y border-white/[0.06]" dir="ltr">
      {/* Left fade */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10"
        style={{ background: 'linear-gradient(to right, #0a0507 0%, transparent 100%)' }}
      />
      {/* Right fade */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10"
        style={{ background: 'linear-gradient(to left, #0a0507 0%, transparent 100%)' }}
      />

      {/* Scrolling track — forced ltr so Arabic behaves same as English */}
      <div
        className="flex gap-5 items-center platforms-ticker-track"
        style={{ width: 'max-content' }}
        dir="ltr"
      >
        {TRACK.map((item, i) =>
          item.type === 'sep' ? (
            <Separator key={`sep-${item.id}-${i}`} />
          ) : (
            <div
              key={`${item.data.name}-${i}`}
              className="flex items-center gap-5 px-9 py-5 rounded-2xl border border-white/[0.07] shrink-0 group cursor-default select-none transition-all duration-500 hover:border-[#951C30]/50 hover:bg-[#951C30]/[0.05]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Icon — site palette only */}
              <span
                className="flex-shrink-0 flex items-center justify-center text-white/45 transition-all duration-300 group-hover:text-[#951C30]"
                dangerouslySetInnerHTML={{ __html: item.data.icon }}
                style={{ lineHeight: 0 }}
              />
              {/* Platform name */}
              <span className="text-lg font-semibold tracking-wide whitespace-nowrap text-white/60 group-hover:text-white/90 transition-colors duration-300">
                {item.data.name}
              </span>
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes platforms-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .platforms-ticker-track {
          animation: platforms-scroll 32s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .platforms-ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
