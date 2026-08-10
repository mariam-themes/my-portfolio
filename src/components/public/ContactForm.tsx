'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, Send, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const fieldClasses =
  'w-full rounded-lg border border-rose-200/15 bg-white/[0.03] px-4 py-3 text-sm text-rose-50 placeholder:text-rose-100/40 transition focus:border-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-400/30';

const errorClasses =
  'border-red-400/60 focus:border-red-400/70 focus:ring-red-400/40';

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

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-rose-200/15 bg-[#160308] p-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
        <p className="text-lg font-semibold text-white">{t('successTitle')}</p>
        <p className="mt-2 text-sm text-rose-100/70">{t('successMessage')}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 border-rose-200/20 bg-transparent text-rose-50 hover:bg-white/5"
          onClick={() => setStatus('idle')}
        >
          {t('sendAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 rounded-2xl border border-rose-200/15 bg-[#160308]/80 p-6 sm:p-10 backdrop-blur"
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
            {t('nameLabel')}
          </label>
          <input
            id="name"
            type="text"
            placeholder={t('namePlaceholder')}
            className={cn(fieldClasses, errors.name && errorClasses)}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
            {t('emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            className={cn(fieldClasses, errors.email && errorClasses)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
            {t('phoneLabel')}
          </label>
          <input
            id="phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            className={cn(fieldClasses)}
            {...register('phone')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="service" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
          {t('serviceLabel')}
        </label>
        <div className="relative">
          <select
            id="service"
            className={cn(
              fieldClasses,
              'appearance-none pr-10 rtl:pl-10 rtl:pr-4',
              errors.service && errorClasses
            )}
            defaultValue=""
            {...register('service')}
          >
            <option value="" disabled className="bg-[#160308] text-rose-100/60">
              {t('servicePlaceholder')}
            </option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#160308]">
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/50 rtl:left-3 rtl:right-auto" />
        </div>
        {errors.service && (
          <p className="text-xs text-red-400">{errors.service.message}</p>
        )}

        {watchedService === OTHER_SERVICE && (
          <div className="space-y-2 pt-2">
            <label htmlFor="serviceOther" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
              {t('serviceOtherLabel')}
            </label>
            <input
              id="serviceOther"
              type="text"
              placeholder={t('serviceOtherPlaceholder')}
              className={cn(fieldClasses, errors.serviceOther && errorClasses)}
              {...register('serviceOther')}
            />
            {errors.serviceOther && (
              <p className="text-xs text-red-400">{errors.serviceOther.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="budget" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
            {t('budgetLabel')}
          </label>
          <div className="relative">
            <select
              id="budget"
              className={cn(fieldClasses, 'appearance-none pr-10 rtl:pl-10 rtl:pr-4')}
              defaultValue=""
              {...register('budget')}
            >
              <option value="" className="bg-[#160308] text-rose-100/60">
                {t('budgetPlaceholder')}
              </option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#160308]">
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/50 rtl:left-3 rtl:right-auto" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="timeline" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
            {t('timelineLabel')}
          </label>
          <div className="relative">
            <select
              id="timeline"
              className={cn(fieldClasses, 'appearance-none pr-10 rtl:pl-10 rtl:pr-4')}
              defaultValue=""
              {...register('timeline')}
            >
              <option value="" className="bg-[#160308] text-rose-100/60">
                {t('timelinePlaceholder')}
              </option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#160308]">
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-100/50 rtl:left-3 rtl:right-auto" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-xs font-medium uppercase tracking-widest text-rose-100/70">
          {t('messageLabel')}
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          className={cn(fieldClasses, 'resize-none', errors.message && errorClasses)}
          {...register('message')}
        />
        {errors.message && (
          <p className="text-xs text-red-400">{errors.message.message}</p>
        )}
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{t('errorTitle')}</span>
          <span className="text-red-300/80">{t('errorMessage')}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full gap-2 bg-[#951C30] py-6 text-white hover:bg-[#b3223a] disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}