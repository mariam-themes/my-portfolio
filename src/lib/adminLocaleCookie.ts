export function setAdminLocaleCookie(locale: 'en' | 'ar') {
  document.cookie = `admin_lang=${locale}; path=/; max-age=31536000; samesite=lax`;
}