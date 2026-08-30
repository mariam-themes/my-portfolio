import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  let locale: string;
  if (hasLocale(routing.locales, requested)) {
    // Normal [locale] route — use the route param
    locale = requested;
  } else {
    // Admin or other non-locale routes — fall back to cookie
    const cookieStore = await cookies();
    const adminLang = cookieStore.get('admin_lang')?.value;
    locale = hasLocale(routing.locales, adminLang) ? adminLang : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});