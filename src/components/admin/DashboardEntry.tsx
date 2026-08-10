'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DashboardEntry({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show the splash animation only on the first visit per session;
    // later visits skip straight to the dashboard.
    const alreadyShown = sessionStorage.getItem('admin-entry-shown');
    const timer = setTimeout(
      () => {
        sessionStorage.setItem('admin-entry-shown', '1');
        setLoading(false);
      },
      alreadyShown ? 150 : 1200
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* The 3D Preloader Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#110307]"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              rotateX: 90, // 3D Flip away
              scale: 1.1,
              transformPerspective: 1000
            }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{ transformOrigin: "top" }}
          >
            <motion.div 
              className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-rose-900/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]"
              initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <Image 
                src="/portfolio-logo.jpeg" 
                alt="Mariam Logo" 
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Actual Dashboard underneath, sliding in */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: loading ? 0 : 1, y: loading ? 100 : 0, scale: loading ? 0.95 : 1 }}
        transition={{ duration: 1, delay: loading ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
