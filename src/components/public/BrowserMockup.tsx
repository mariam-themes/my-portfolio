'use client';

export default function BrowserMockup({ imageUrl, onInteraction }: { imageUrl: string; onInteraction?: () => void }) {
  return (
    <section
      className="w-full max-w-6xl mx-auto overflow-hidden border border-rose-200/15 bg-[#160308] shadow-[0_2rem_6rem_rgba(0,0,0,0.5)]"
      onPointerDown={onInteraction}
      onFocusCapture={onInteraction}
      onWheel={onInteraction}
    >
      {/* Browser Header */}
      <div className="flex items-center gap-4 border-b border-rose-200/10 bg-[#310a17] px-4 py-3 sm:px-5">
        <div className="flex gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400/85" />
          <div className="h-2.5 w-2.5 rounded-full bg-rose-300/55" />
          <div className="h-2.5 w-2.5 rounded-full bg-rose-100/35" />
        </div>
        <div className="min-w-0 flex-1 border border-rose-100/10 bg-black/20 px-4 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-rose-100/50 truncate">
          Project preview / Cloudinary
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
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Full Page Mockup" 
          className="block h-auto w-full"
        />
      </div>
    </section>
  );
}
