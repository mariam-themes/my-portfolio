'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

export default function FooterLocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <button
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-rose-100/70 backdrop-blur-md transition-all duration-300 hover:border-[#951C30] hover:bg-[#951C30] hover:text-white"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{t('label')}</span>
    </button>
  );
}
