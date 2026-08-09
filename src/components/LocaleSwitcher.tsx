'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <button
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="inline-flex items-center gap-2 rounded-full border border-rose-900/50 bg-rose-50 px-4 py-2 text-sm font-bold tracking-widest text-rose-900 transition-colors hover:border-rose-500 hover:bg-rose-100 dark:bg-slate-900 dark:text-rose-200"
    >
      {t('label')}
    </button>
  );
}