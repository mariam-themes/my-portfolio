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

export type TextFieldName = 'title' | 'description' | 'sector' | 'platform' | 'category';
export type ListFieldName = 'services' | 'tools';

export function sourceLangOf(project: LocalizedProject): 'en' | 'ar' {
  if (project.sourceLang === 'en' || project.sourceLang === 'ar') return project.sourceLang;
  const probe = typeof project.description === 'string' ? project.description : '';
  const arabic = (probe.match(/[\u0600-\u06FF]/g) || []).length;
  return arabic > probe.length * 0.3 ? 'ar' : 'en';
}

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
    return Array.isArray(hit) ? (hit as string[]) : (value as string[]);
  }
  if (value && typeof value === 'object') {
    const obj = value as { en?: string[]; ar?: string[] };
    return obj[locale as 'en' | 'ar'] || obj.en || [];
  }
  return [];
}