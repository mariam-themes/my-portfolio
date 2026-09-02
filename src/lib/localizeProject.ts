/**
 * Locale-aware accessors for projects that support the auto-translation
 * feature (sourceLang + translations). Works in both server and client code.
 */

export type LocalizedProject = {
  title?: unknown;
  description?: unknown;
  sector?: unknown;
  platform?: unknown;
  category?: unknown;
  services?: unknown;
  tools?: unknown;
  sourceLang?: 'en' | 'ar';
  translations?: {
    en?: Record<string, unknown>;
    ar?: Record<string, unknown>;
  };
  [key: string]: unknown;
};

export type TextFieldName = 'description' | 'sector' | 'category' | 'metaTitle' | 'metaDescription' | 'title' | 'platform';
export type ListFieldName = 'services' | 'tools';

export function resolveBaseText(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as { en?: string; ar?: string };
    return obj.en || obj.ar || '';
  }
  return typeof value === 'string' ? value : '';
}

export function sourceLangOf(project: LocalizedProject): 'en' | 'ar' {
  if (project.sourceLang === 'en' || project.sourceLang === 'ar') return project.sourceLang;
  const probe = typeof project.description === 'string' ? project.description : '';
  const arabic = (probe.match(/[\u0600-\u06FF]/g) || []).length;
  return arabic > probe.length * 0.3 ? 'ar' : 'en';
}

const COMMON_CATEGORIES: Record<string, { en: string; ar: string }> = {
  'wordpress': { en: 'WordPress', ar: 'ووردبريس' },
  'web design': { en: 'Web Design', ar: 'تصميم مواقع' },
  'تصميم مواقع': { en: 'Web Design', ar: 'تصميم مواقع' },
  'landing pages': { en: 'Landing Pages', ar: 'صفحات هبوط' },
  'صفحات هبوط': { en: 'Landing Pages', ar: 'صفحات هبوط' },
  'ui/ux': { en: 'UI/UX Design', ar: 'تصميم واجهات' },
  'تصميم واجهات': { en: 'UI/UX Design', ar: 'تصميم واجهات' },
};

/**
 * Resolves a single-language text field for the current locale.
 * - Legacy { en, ar } objects are handled directly.
 * - Plain strings come straight from the source field when the locale matches
 *   the project's source language, otherwise from the stored translation.
 */
export function resolveText(
  value: unknown,
  project: LocalizedProject,
  field: TextFieldName,
  locale: string
): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as { en?: string; ar?: string };
    return obj[locale as 'en' | 'ar'] || obj.en || '';
  }
  if (typeof value === 'string') {
    // DO NOT translate title, platform, client, etc.
    if (field === 'title' || field === 'platform') return value;

    // Check common category mappings first to fix duplicate/untranslated DB entries
    if (field === 'category' || field === 'sector') {
      const normalized = value.trim().toLowerCase();
      if (COMMON_CATEGORIES[normalized]) {
        return COMMON_CATEGORIES[normalized][locale as 'en' | 'ar'];
      }
    }

    if (locale === sourceLangOf(project)) return value;
    const translated = project.translations?.[locale as 'en' | 'ar'];
    const hit = translated?.[field];
    return typeof hit === 'string' ? hit : value;
  }
  return '';
}

/**
 * Resolves a list field (services/tools) for the current locale.
 */
export function resolveList(
  value: unknown,
  project: LocalizedProject,
  field: ListFieldName,
  locale: string
): string[] {
  if (Array.isArray(value)) {
    if (locale === sourceLangOf(project)) return value;
    const hit = project.translations?.[locale as 'en' | 'ar']?.[field];
    return Array.isArray(hit) && hit.some(Boolean) ? (hit as string[]) : (value as string[]);
  }
  if (value && typeof value === 'object') {
    const obj = value as { en?: string[]; ar?: string[] };
    return obj[locale as 'en' | 'ar'] || obj.en || [];
  }
  return [];
}