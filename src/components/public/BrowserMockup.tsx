'use client';

import Image from 'next/image';
export default function BrowserMockup({ url, imageUrl, onInteraction }: { url?: string; imageUrl: string; onInteraction?: () => void }) {
  return (
    <section
      className="w-full max-w-6xl mx-auto overflow-hidden rounded-2xl border border-rose-500/20 bg-[#160308] shadow-[0_2rem_6rem_rgba(0,0,0,0.8),0_0_4rem_rgba(149,28,48,0.2)] ring-1 ring-white/5"
      onPointerDown={onInteraction}
      onFocusCapture={onInteraction}
      onWheel={onInteraction}
    >
      {/* Browser Header */}
      <div className="flex items-center gap-4 border-b border-rose-200/10 bg-gradient-to-r from-[#2a0814] to-[#1c040c] px-5 py-4">
        <div className="flex gap-2.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm shadow-black/50" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm shadow-black/50" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm shadow-black/50" />
        </div>
        <div className="min-w-0 flex-1 flex justify-center">
          <div className="max-w-md w-full border border-white/5 bg-black/40 rounded-md px-4 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 truncate shadow-inner">
            {url ?? 'Project preview / Full Page'}
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <p id="browser-preview-instructions" className="sr-only">
        This project preview scrolls independently from the case study page. Focus this region and use the arrow keys, Page Up, Page Down, or a mouse wheel to explore the full screenshot.
      </p>
      <div
        className="browser-mockup-viewport relative w-full overflow-y-auto"
        style={{ height: '70vh', maxHeight: '800px', overscrollBehaviorY: 'contain' }}
        tabIndex={0}
        role="region"
        aria-label="Scrollable full-page project preview"
        aria-describedby="browser-preview-instructions"
        data-lenis-prevent
      >
        <Image
          src={imageUrl}
          alt="Full Page Mockup"
          width={1920}
          height={10800}
          quality={100}
          unoptimized
          className="block h-auto w-full"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </section>
  );
}
