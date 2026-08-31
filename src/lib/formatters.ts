export function formatPortfolioNumber(num: number, locale: string): string {
  if (locale === 'ar') {
    return num.toLocaleString('ar-EG');
  }
  return String(num).padStart(2, '0');
}
