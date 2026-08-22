'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: string[];
  y: string[];
  size: number;
  duration: number;
  delay: number;
}

export default function ParticlesBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Use window innerWidth/Height in pixels to avoid any RTL vw/vh calculation issues
    const W = window.innerWidth;
    const H = window.innerHeight;

    const generated = Array.from({ length: 40 }).map((_, i) => {
      const startX = Math.random() * W;
      const startY = Math.random() * H;
      return {
        id: i,
        x: [
          `${startX}px`,
          `${Math.random() * W}px`,
          `${Math.random() * W}px`,
          `${startX}px`,
        ],
        y: [
          `${startY}px`,
          `${Math.random() * H}px`,
          `${Math.random() * H}px`,
          `${startY}px`,
        ],
        size: Math.random() * 5 + 2,
        duration: Math.random() * 40 + 20,
        delay: Math.random() * 5,
      };
    });
    setParticles(generated);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      // Force LTR so RTL page direction doesn't affect x-axis positioning
      dir="ltr"
      style={{ direction: 'ltr', overflow: 'hidden' }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-rose-300 blur-[1px] shadow-[0_0_12px_rgba(251,113,133,0.9)]"
          style={{
            width: p.size,
            height: p.size,
            top: 0,
            left: 0,
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 0.8, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
