'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectSlug: string;
  price: number;
  currency: string;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  projectTitle,
  projectSlug,
  price,
  currency,
}: PurchaseModalProps) {
  const t = useTranslations('PurchaseModal');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const nameRef = useRef<HTMLInputElement>(null);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => nameRef.current?.focus(), 200);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus('submitting');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          service: `${t('project')}: ${projectTitle}`,
          message: message.trim() || `Purchase request for: ${projectTitle}`,
          type: 'purchase',
          projectRef: projectSlug,
          projectPrice: price,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status === 'submitting') return;
    onClose();
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setStatus('idle');
    }, 300);
  };

  const formattedPrice = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="pointer-events-auto relative w-full max-w-lg rounded-2xl border border-rose-900/40 bg-[#0d0508] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#951C30] to-transparent" />

              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
                  <p className="mt-1 text-sm text-white/50">{t('subtitle')}</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={status === 'submitting'}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Project info pill */}
              <div className="mx-6 mb-5 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/70 mb-0.5">
                    {t('project')}
                  </p>
                  <p className="text-sm font-medium text-white line-clamp-1">{projectTitle}</p>
                </div>
                <div className="text-right rtl:text-left shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/70 mb-0.5">
                    {t('priceLabel')}
                  </p>
                  <p className="text-lg font-bold text-amber-400">
                    {formattedPrice} <span className="text-sm font-normal">{currency}</span>
                  </p>
                </div>
              </div>

              {/* Form / States */}
              <div className="px-6 pb-6">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-base font-medium text-white">{t('success')}</p>
                    <button
                      onClick={handleClose}
                      className="mt-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {t('close')}
                    </button>
                  </motion.div>
                ) : status === 'error' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="text-sm text-white/60">{t('error')}</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-2 px-6 py-2.5 rounded-full bg-[#951C30] text-sm text-white hover:bg-[#b8223b] transition-colors"
                    >
                      {t('prev')}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">
                        {t('nameLabel')} <span className="text-[#951C30]">*</span>
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        required
                        disabled={status === 'submitting'}
                        className="w-full rounded-lg border border-rose-900/30 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#951C30]/60 focus:ring-1 focus:ring-[#951C30]/30 transition-colors disabled:opacity-50"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">
                        {t('emailLabel')} <span className="text-[#951C30]">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        disabled={status === 'submitting'}
                        className="w-full rounded-lg border border-rose-900/30 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#951C30]/60 focus:ring-1 focus:ring-[#951C30]/30 transition-colors disabled:opacity-50"
                        dir="ltr"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">
                        {t('messageLabel')}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('messagePlaceholder')}
                        rows={3}
                        disabled={status === 'submitting'}
                        className="w-full resize-none rounded-lg border border-rose-900/30 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#951C30]/60 focus:ring-1 focus:ring-[#951C30]/30 transition-colors disabled:opacity-50"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === 'submitting' || !name.trim() || !email.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#951C30] to-[#7a1628] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-rose-900/30 transition-all duration-300 hover:from-[#b8223b] hover:to-[#951C30] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('submitting')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('submit')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom accent line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#951C30]/30 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
