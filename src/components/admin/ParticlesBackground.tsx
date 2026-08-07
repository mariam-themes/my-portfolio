'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number[];
  y: number[];
  size: number;
  duration: number;
  delay: number;
}

export default function ParticlesBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on the client to avoid hydration mismatch
    const generated = Array.from({ length: 40 }).map((_, i) => {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      return {
        id: i,
        // Create a seamless loop of 4 random points across the whole screen
        x: [startX, Math.random() * 100, Math.random() * 100, startX],
        y: [startY, Math.random() * 100, Math.random() * 100, startY],
        size: Math.random() * 5 + 2, // 2px to 7px (Subtle and elegant)
        duration: Math.random() * 40 + 20, // 20s to 60s (Very slow drifting)
        delay: Math.random() * 5,
      };
    });
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-rose-300 blur-[1px] shadow-[0_0_12px_rgba(251,113,133,0.9)]"
          style={{ width: p.size, height: p.size }}
          animate={{
            x: p.x.map((val) => `${val}vw`),
            y: p.y.map((val) => `${val}vh`),
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
