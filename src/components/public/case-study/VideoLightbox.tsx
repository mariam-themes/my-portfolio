'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface VideoLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoLightbox({ src, alt, onClose }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekRef  = useRef<HTMLInputElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [playing,       setPlaying]       = useState(false);
  const [muted,         setMuted]         = useState(false);
  const [volume,        setVolume]        = useState(1);
  const [current,       setCurrent]       = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [speed,         setSpeed]         = useState(1);
  const [showControls,  setShowControls]  = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [buffered,      setBuffered]      = useState(0);

  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused) setShowControls(false);
    }, 3000);
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onKey = (e: KeyboardEvent) => {
      revealControls();
      if (e.key === 'Escape')                     { onClose(); return; }
      if (e.key === ' ' || e.key === 'k')         { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      if (e.key === 'ArrowRight')                 { e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 5); }
      if (e.key === 'ArrowLeft')                  { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); }
      if (e.key === 'm')                          { v.muted = !v.muted; setMuted(v.muted); }
      if (e.key === 'f')                          { v.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, revealControls]);

  /* video event listeners */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay   = () => { setPlaying(true);  revealControls(); };
    const onPause  = () => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); };
    const onTime   = () => {
      setCurrent(v.currentTime);
      if (seekRef.current) seekRef.current.value = String(v.currentTime);
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onLoad   = () => { setDuration(v.duration); if (seekRef.current) seekRef.current.max = String(v.duration); };
    const onEnded  = () => { setPlaying(false); setShowControls(true); };
    v.addEventListener('play',           onPlay);
    v.addEventListener('pause',          onPause);
    v.addEventListener('timeupdate',     onTime);
    v.addEventListener('loadedmetadata', onLoad);
    v.addEventListener('ended',          onEnded);
    v.addEventListener('progress',       onTime);
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
    return () => {
      v.removeEventListener('play',           onPlay);
      v.removeEventListener('pause',          onPause);
      v.removeEventListener('timeupdate',     onTime);
      v.removeEventListener('loadedmetadata', onLoad);
      v.removeEventListener('ended',          onEnded);
      v.removeEventListener('progress',       onTime);
      clearTimeout(hideTimer.current);
    };
  }, [revealControls]);

  /* lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const toggle = () => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); };
  const seek   = (val: number) => { const v = videoRef.current; if (!v) return; v.currentTime = val; setCurrent(val); };
  const skip   = (d: number)   => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + d)); };

  const changeVolume = (val: number) => {
    const v = videoRef.current; if (!v) return;
    v.volume = val; setVolume(val);
    v.muted = val === 0; setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };

  const changeSpeed = (s: number) => {
    const v = videoRef.current; if (!v) return;
    v.playbackRate = s; setSpeed(s); setShowSpeedMenu(false);
  };

  const requestFS = () => { videoRef.current?.requestFullscreen?.(); };

  const progress = duration > 0 ? (current  / duration) * 100 : 0;
  const buffPct  = duration > 0 ? (buffered / duration) * 100 : 0;

  const lightboxContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      onMouseMove={revealControls}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:bg-white/25 hover:scale-110"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Video */}
      <div
        className="relative w-full max-w-6xl mx-4 rounded-xl overflow-hidden shadow-2xl"
        onClick={toggle}
      >
        <video
          ref={videoRef}
          src={src}
          aria-label={alt}
          playsInline
          className="w-full max-h-[80vh] object-contain bg-black"
        />

        {/* Big pause icon overlay */}
        {!playing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
              <Play className="h-9 w-9 text-white fill-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className="absolute bottom-0 inset-x-0 transition-all duration-300"
          style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          <div className="relative px-4 pb-4 pt-10 space-y-2">

            {/* Seek bar */}
            <div
              className="relative h-1 rounded-full bg-white/20 cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/30" style={{ width: `${buffPct}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress}%`, background: '#951C30' }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
              <input
                ref={seekRef}
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                defaultValue={0}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek"
              />
            </div>

            {/* Bottom row */}
            <div className="flex items-center gap-3">
              <button onClick={() => skip(-10)} title="Rewind 10s" className="text-white/70 hover:text-white transition-colors">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="text-white hover:text-white/80 transition-colors">
                {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white translate-x-0.5" />}
              </button>
              <button onClick={() => skip(10)} title="Forward 10s" className="text-white/70 hover:text-white transition-colors">
                <RotateCw className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono text-white/60 tabular-nums">
                {fmt(current)} / {fmt(duration)}
              </span>

              <div className="flex-1" />

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="text-white/70 hover:text-white transition-colors">
                  {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="w-full h-1 accent-[#951C30] cursor-pointer"
                    aria-label="Volume"
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((p) => !p)}
                  className="text-[11px] font-mono font-bold text-white/70 hover:text-white px-1.5 py-0.5 rounded border border-white/20 hover:border-white/50 transition-colors"
                >
                  {speed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-8 right-0 z-10 rounded-lg border border-white/10 bg-black/90 backdrop-blur-md py-1 shadow-2xl min-w-[80px]">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`block w-full px-4 py-1.5 text-left text-xs font-mono hover:bg-white/10 transition-colors ${s === speed ? 'text-[#951C30] font-bold' : 'text-white/80'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={requestFS} aria-label="Fullscreen" className="text-white/70 hover:text-white transition-colors">
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(lightboxContent, document.body);
}
