'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * Sets `lang`/`dir` on the document element for locale-aware segments.
 * The root layout owns <html>, so the locale (which is only known inside
 * nested layouts) is applied here on the client. The initial SSR value is
 * "en"/"ltr"; this corrects it after hydration for Arabic (RTL) without
 * rendering a second <html> element.
 */
export default function HtmlLangDir({ locale }: { locale?: string }) {
  const localeFromCtx = useLocale();
  const loc = locale || localeFromCtx;

  useEffect(() => {
    document.documentElement.lang = loc;
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
  }, [loc]);

  return null;
}
