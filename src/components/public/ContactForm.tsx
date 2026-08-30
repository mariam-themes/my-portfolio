'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SERVICE_OPTIONS = [
  { value: 'Branding & Identity', labelKey: 'serviceBranding' },
  { value: 'Logo Design', labelKey: 'serviceLogo' },
  { value: 'Website & UI Design', labelKey: 'serviceWeb' },
  { value: 'Packaging Design', labelKey: 'servicePackaging' },
  { value: 'Other', labelKey: 'serviceOther' },
];

const OTHER_SERVICE = SERVICE_OPTIONS[SERVICE_OPTIONS.length - 1].value;

const BUDGET_OPTIONS = [
  { value: 'Under $1,000', labelKey: 'budgetOption1' },
  { value: '$1,000 – $3,000', labelKey: 'budgetOption2' },
  { value: '$3,000 – $5,000', labelKey: 'budgetOption3' },
  { value: '$5,000+', labelKey: 'budgetOption4' },
  { value: 'Flexible', labelKey: 'budgetOption5' },
];

const TIMELINE_OPTIONS = [
  { value: 'Flexible', labelKey: 'timelineOption1' },
  { value: '1–2 weeks', labelKey: 'timelineOption2' },
  { value: '2–4 weeks', labelKey: 'timelineOption3' },
  { value: '1–2 months', labelKey: 'timelineOption4' },
  { value: '3+ months', labelKey: 'timelineOption5' },
];

const EMAIL_REGEX = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

// ── Floating-label field wrapper ──────────────────────────────────────────── //
function FieldWrap({
  id,
  label,
  error,
  children,
  optional,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="group/field relative flex flex-col gap-2 transition-shadow duration-300">
      <label
        htmlFor={id}
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.2em] rtl:tracking-normal transition-colors duration-200',
          error ? 'text-red-400' : 'text-rose-100/70 group-focus-within/field:text-rose-200/90'
        )}
      >
        {label}
        {optional && (
          <span className="ml-1 rtl:mr-1 rtl:ml-0 normal-case tracking-normal font-normal text-rose-100/50">
            (opt.)
          </span>
        )}
      </label>
      <div className="relative">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-px w-0 bg-[#951C30] transition-all duration-500 ease-out group-focus-within/field:w-full"
        />
        <span
          aria-hidden
          className="absolute -bottom-1 left-1/2 h-4 w-0 -translate-x-1/2 rounded-full bg-[#951C30]/15 blur-md transition-all duration-500 ease-out group-focus-within/field:w-full"
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputBase =
  'w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm text-rose-50 placeholder:text-rose-100/45 transition-all duration-300 outline-none focus:outline-none';

const inputNormal = 'border-rose-100/30 focus:border-[#951C30]';
const inputError = 'border-red-400/60 focus:border-red-400';

export default function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const contactSchema = z
    .object({
      name: z.string().trim().min(1, t('nameError')),
      email: z.string().trim().regex(EMAIL_REGEX, t('emailInvalid')),
      phone: z.string().trim().optional(),
      service: z.string().trim().min(1, t('serviceError')),
      serviceOther: z.string().trim().optional(),
      budget: z.string().trim().optional(),
      timeline: z.string().trim().optional(),
      message: z.string().trim().min(10, t('messageShort')),
    })
    .superRefine((values, ctx) => {
      if (values.service === OTHER_SERVICE && !values.serviceOther) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['serviceOther'],
          message: t('serviceOtherShort'),
        });
      }
    });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      serviceOther: '',
      budget: '',
      timeline: '',
      message: '',
    },
  });

  const watchedService = watch('service');

  const onSubmit = async () => {
    void handleSubmit(async (values) => {
      setStatus('submitting');
      try {
        const service =
          values.service === OTHER_SERVICE
            ? (values.serviceOther || '').trim() || OTHER_SERVICE
            : values.service;

        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            service,
            budget: values.budget || undefined,
            timeline: values.timeline || undefined,
            message: values.message,
          }),
        });

        if (!response.ok) {
          setStatus('error');
          return;
        }

        reset();
        setStatus('success');
      } catch {
        setStatus('error');
      }
    })();
  };

  // ── Success state ─────────────────────────────────────────────────────── //
  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-6 min-h-[420px] text-center px-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl scale-150" />
          <CheckCircle2 className="relative h-16 w-16 text-emerald-400" />
        </motion.div>
        <div>
          <p className="text-2xl font-serif font-normal text-white">{t('successTitle')}</p>
          <p className="mt-2 text-sm text-rose-100/60 max-w-xs mx-auto">{t('successMessage')}</p>
        </div>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100/40 hover:text-rose-100/80 transition-colors duration-300 underline underline-offset-4"
        >
          {t('sendAnother')}
        </button>
      </motion.div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────── //
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-10"
    >
      {/* Row 1: Name · Email · Phone */}
      <div className="grid gap-10 sm:grid-cols-3">
        <FieldWrap id="name" label={t('nameLabel')} error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder={t('namePlaceholder')}
            className={cn(inputBase, errors.name ? inputError : inputNormal)}
            {...register('name')}
          />
        </FieldWrap>

        <FieldWrap id="email" label={t('emailLabel')} error={errors.email?.message}>
          <input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            className={cn(inputBase, errors.email ? inputError : inputNormal)}
            {...register('email')}
          />
        </FieldWrap>

        <FieldWrap id="phone" label={t('phoneLabel')} optional>
          <input
            id="phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            className={cn(inputBase, inputNormal)}
            {...register('phone')}
          />
        </FieldWrap>
      </div>

      {/* Service */}
      <FieldWrap id="service" label={t('serviceLabel')} error={errors.service?.message}>
        <div className="relative">
          <select
            id="service"
            className={cn(
              inputBase,
              'appearance-none cursor-pointer pe-8',
              errors.service ? inputError : inputNormal,
              // dim the placeholder option
              watchedService === '' ? 'text-rose-100/25' : 'text-rose-50'
            )}
            defaultValue=""
            {...register('service')}
          >
            <option value="" disabled className="bg-[#160308] text-rose-100/40">
              {t('servicePlaceholder')}
            </option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#160308] text-rose-50">
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/60 transition-colors group-focus-within/field:text-rose-200/90" />
        </div>

        <AnimatePresence>
          {watchedService === OTHER_SERVICE && (
            <motion.div
              key="serviceOther"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden pt-4"
            >
              <FieldWrap
                id="serviceOther"
                label={t('serviceOtherLabel')}
                error={errors.serviceOther?.message}
              >
                <input
                  id="serviceOther"
                  type="text"
                  placeholder={t('serviceOtherPlaceholder')}
                  className={cn(inputBase, errors.serviceOther ? inputError : inputNormal)}
                  {...register('serviceOther')}
                />
              </FieldWrap>
            </motion.div>
          )}
        </AnimatePresence>
      </FieldWrap>

      {/* Budget · Timeline */}
      <div className="grid gap-10 sm:grid-cols-2">
        <FieldWrap id="budget" label={t('budgetLabel')} optional>
          <div className="relative">
            <select
              id="budget"
              className={cn(
                inputBase,
                inputNormal,
                'appearance-none cursor-pointer pe-8',
                watch('budget') === '' ? 'text-rose-100/25' : 'text-rose-50'
              )}
              defaultValue=""
              {...register('budget')}
            >
              <option value="" className="bg-[#160308] text-rose-100/40">
                {t('budgetPlaceholder')}
              </option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#160308] text-rose-50">
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/60" />
          </div>
        </FieldWrap>

        <FieldWrap id="timeline" label={t('timelineLabel')} optional>
          <div className="relative">
            <select
              id="timeline"
              className={cn(
                inputBase,
                inputNormal,
                'appearance-none cursor-pointer pe-8',
                watch('timeline') === '' ? 'text-rose-100/25' : 'text-rose-50'
              )}
              defaultValue=""
              {...register('timeline')}
            >
              <option value="" className="bg-[#160308] text-rose-100/40">
                {t('timelinePlaceholder')}
              </option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#160308] text-rose-50">
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/60" />
          </div>
        </FieldWrap>
      </div>

      {/* Message */}
      <FieldWrap id="message" label={t('messageLabel')} error={errors.message?.message}>
        <textarea
          id="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          className={cn(inputBase, 'resize-none', errors.message ? inputError : inputNormal)}
          {...register('message')}
        />
      </FieldWrap>

      {/* Error banner */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t('errorTitle')}</span>
            <span className="text-red-300/70">{t('errorMessage')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="h-px w-full bg-rose-100/10" />

      {/* Submit CTA */}
      <motion.button
        type="submit"
        disabled={status === 'submitting'}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'group/btn relative flex w-full items-center justify-between gap-4 overflow-hidden',
          'rounded-full border border-[#951C30]/60 bg-[#951C30]/15 px-7 py-5',
          'text-sm font-semibold tracking-wider rtl:tracking-normal text-white',
          'hover:bg-[#951C30] hover:border-[#951C30] hover:shadow-[0_0_28px_rgba(149,28,48,0.25)]',
          'transition-all duration-500 ease-out',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#951C30]/60'
        )}
      >
        {/* Glow sweep on hover */}
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 ease-out"
        />

        <span>
          {status === 'submitting' ? t('submitting') : t('submit')}
        </span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 group-hover/btn:bg-white/20 transition-colors duration-300">
          {status === 'submitting' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          )}
        </span>
      </motion.button>
    </form>
  );
}