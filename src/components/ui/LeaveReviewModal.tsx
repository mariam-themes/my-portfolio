'use client';

import { useState, useEffect } from 'react';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaveReviewModal({ isOpen, onClose }: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [clientName, setClientName] = useState('');
  const [roleCompany, setRoleCompany] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Lock the page scroll while the modal is open so the page itself never
  // scrolls; the modal handles its own overflow internally.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setError('Please write at least 10 characters in your review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          role: roleCompany.trim() || undefined,
          email: email.trim() || undefined,
          content: content.trim(),
          rating,
          isApproved: false,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to submit review');
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setClientName('');
    setRoleCompany('');
    setEmail('');
    setContent('');
    setError('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full bg-black/60 border border-rose-900/30 rounded-lg px-4 py-3 text-white placeholder-rose-200/30 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg my-4 bg-gradient-to-b from-[#1A050C] to-[#0D0208] border border-rose-900/40 rounded-2xl shadow-2xl shadow-rose-950/50 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-rose-300/60 hover:text-rose-200 hover:bg-white/5 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto">
          {isSuccess ? (
            // Success State
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-emerald-900/30 border border-emerald-700/40">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">شكراً لك!</h3>
                <p className="text-rose-200/70 leading-relaxed">
                  تم إرسال رأيك بنجاح وسيظهر بعد المراجعة.
                  <br />
                  <span className="text-sm">Thank you! Your review has been submitted and will appear after approval.</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-900 text-white font-semibold hover:from-rose-500 hover:to-rose-800 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            // Form State
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Leave a Review</h2>
                <p className="text-rose-200/60 text-sm">شارك رأيك وتجربتك معنا</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-3">
                    Star Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-rose-900 fill-rose-950'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-rose-300/60">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe / محمد"
                    dir="auto"
                    lang="ar"
                    required
                  />
                </div>

                {/* Role & Company */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">
                    Role & Company <span className="text-rose-300/40">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={roleCompany}
                    onChange={(e) => setRoleCompany(e.target.value)}
                    placeholder="e.g. Product Manager at Meta / مدير منتج"
                    dir="auto"
                    lang="ar"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">
                    Email Address <span className="text-rose-300/40">(Optional — won&apos;t be shown)</span>
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-rose-300/70 mb-2">
                    Your Review <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[120px] resize-none`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your experience working together... / شارك تجربتك معنا"
                    dir="auto"
                    lang="ar"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-red-400 text-sm bg-red-950/30 border border-red-700/30 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 rounded-xl border border-rose-900/40 text-rose-200/70 hover:bg-white/5 hover:text-rose-200 transition-all font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-900 hover:from-rose-500 hover:to-rose-800 text-white font-semibold transition-all disabled:opacity-60 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
