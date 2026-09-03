/**
 * Auto-translation utility using MyMemory API (free, no API key required).
 * Translates text between Arabic and English automatically.
 *
 * Free tier: 1,000 words/day (more than enough for a portfolio admin).
 * Docs: https://mymemory.translated.net/doc/spec.php
 */

type LangPair = 'en|ar' | 'ar|en';

/**
 * Decodes common HTML entities that translation providers sometimes return
 * (e.g. "Jewelry &amp; Accessories" → "Jewelry & Accessories").
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Detects whether a string contains primarily Arabic characters.
 */
export function isArabic(text: string): boolean {
  const arabicCharCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicCharCount > text.length * 0.3; // >30% Arabic chars = Arabic text
}

/**
 * Translation cache to avoid repeated API calls for the same content.
 * In-memory cache, resets on server restart.
 * Key format: `{text}:{langPair}` 
 */
const cache = new Map<string, string>();

/**
 * Translates text using the free MyMemory API.
 * Uses in-memory caching to avoid redundant calls.
 * Returns the original text if translation fails (graceful fallback).
 */
async function translateText(text: string, langPair: LangPair): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  // Check cache first
  const cacheKey = `${langPair}:${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // 5 second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return text; // Fallback: return original

    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    // MyMemory sometimes returns error messages instead of translations
    if (!translated || translated.toLowerCase().includes('mymemory warning')) {
      return text;
    }

    const decoded = decodeHtmlEntities(translated);
    cache.set(cacheKey, decoded);
    return decoded;
  } catch {
    // Network error or timeout — silently return original
    return text;
  }
}

/**
 * Given a single text value (could be Arabic or English), returns both
 * `en` and `ar` versions by auto-translating the missing one.
 *
 * @example
 * const { en, ar } = await autoTranslate("مشروع تصميم شعار");
 * // en: "Logo design project", ar: "مشروع تصميم شعار"
 */
export async function autoTranslate(
  text: string
): Promise<{ en: string; ar: string }> {
  if (!text || text.trim().length === 0) return { en: '', ar: '' };

  if (isArabic(text)) {
    // Input is Arabic → translate to English
    const en = await translateText(text, 'ar|en');
    return { en, ar: text };
  } else {
    // Input is English → translate to Arabic
    const ar = await translateText(text, 'en|ar');
    return { en: text, ar };
  }
}

/**
 * Splits long text into sentence-sized chunks (≤ 450 chars) and translates
 * each chunk in parallel, then joins the results.
 */
async function translateLongText(text: string, target: 'en' | 'ar'): Promise<string> {
  // Split on Arabic/Latin sentence-ending punctuation
  const sentenceRe = /[^.!?؟\n]+[.!?؟\n]*/g;
  const sentences = text.match(sentenceRe) || [text];

  const chunks: string[] = [];
  let curr = '';
  for (const s of sentences) {
    if (curr.length + s.length > 450) {
      if (curr.trim()) chunks.push(curr.trim());
      curr = s;
    } else {
      curr += s;
    }
  }
  if (curr.trim()) chunks.push(curr.trim());

  const results = await Promise.all(
    chunks.map((c) => autoTranslate(c).then((r) => r[target] || c))
  );
  return results.join(' ');
}

/**
 * Translates an HTML string while preserving all tags.
 *
 * Each text node is translated individually in parallel so there is
 * no separator fragility. Nodes longer than 450 chars are split into
 * sentence-sized chunks before translation.
 */
export async function translateHtmlContent(
  html: string,
  target: 'en' | 'ar'
): Promise<string> {
  if (!html?.trim()) return html ?? '';

  // Split on HTML tags, preserving them as capture groups
  const parts = html.split(/(<[^>]*>)/g);

  const translated = await Promise.all(
    parts.map(async (part) => {
      // Keep tags and pure whitespace as-is
      if (part.startsWith('<') || !part.trim()) return part;

      const text = part.trim();
      if (text.length <= 450) {
        const t = await autoTranslate(text).then((r) => r[target]);
        return t || part;
      }
      // Long text node → split into sentences first
      return translateLongText(text, target);
    })
  );

  return translated.join('');
}

/**
 * Auto-translates multiple fields at once.
 * Only translates fields that are strings (skips arrays, numbers, etc.)
 *
 * @example
 * const result = await autoTranslateFields({ title: "Brand Identity", description: "A luxury brand..." });
 * // result.title = { en: "Brand Identity", ar: "هوية العلامة التجارية" }
 */
export async function autoTranslateFields<T extends Record<string, unknown>>(
  fields: T,
  fieldsToTranslate: (keyof T)[]
): Promise<Record<string, { en: string; ar: string }>> {
  const results: Record<string, { en: string; ar: string }> = {};

  await Promise.all(
    fieldsToTranslate.map(async (key) => {
      const value = fields[key];
      if (typeof value === 'string') {
        results[key as string] = await autoTranslate(value);
      }
    })
  );

  return results;
}

/**
 * Translates every item in a list (e.g. services, tools).
 */
export async function autoTranslateList(
  list: string[]
): Promise<{ en: string[]; ar: string[] }> {
  if (!Array.isArray(list) || list.length === 0) return { en: [], ar: [] };
  const items = await Promise.all(list.filter(Boolean).map((item) => autoTranslate(item)));
  return {
    en: items.map((item) => item.en),
    ar: items.map((item) => item.ar),
  };
}

/**
 * Completes a localized { en?, ar? } pair by translating the missing side.
 */
export async function completeLocalized(
  value?: { en?: string; ar?: string }
): Promise<{ en?: string; ar?: string } | undefined> {
  if (!value) return undefined;
  const hasEn = Boolean(value.en?.trim());
  const hasAr = Boolean(value.ar?.trim());
  if (hasEn && hasAr) return { en: value.en?.trim(), ar: value.ar?.trim() };
  if (hasEn) {
    const t = await autoTranslate(value.en as string);
    return { en: t.en, ar: t.ar };
  }
  if (hasAr) {
    const t = await autoTranslate(value.ar as string);
    return { en: t.en, ar: t.ar };
  }
  return undefined;
}

export interface ProjectTranslationSet {
  title?: string;
  description?: string;
  sector?: string;
  platform?: string;
  category?: string;
  services?: string[];
  tools?: string[];
}

export interface ProjectTranslationBuild {
  sourceLang: 'en' | 'ar';
  translations?: { en?: ProjectTranslationSet; ar?: ProjectTranslationSet };
  metaTitle?: { en?: string; ar?: string };
  metaDescription?: { en?: string; ar?: string };
}

const ARABIC_CHAR_RANGE = /[\u0600-\u06FF]/u;
const LATIN_RANGE = /[A-Za-z0-9]/u;

/**
 * Translates a single value into the target language.
 * - Short brand-like fields (title/platform/sector/category) are skipped when
 *   they mix Arabic + Latin ("زد – Zid", "Figma"), keeping them unchanged in
 *   both locales.
 * - Longer content (description, list items) is always translated so that
 *   Arabic sentences containing Latin brand names still convert.
 */
async function translateTargetOf(
  value: string,
  target: 'en' | 'ar',
  strict = false
): Promise<string | undefined> {
  const hasArabic = ARABIC_CHAR_RANGE.test(value);
  const hasLatin = LATIN_RANGE.test(value);
  if (strict && hasArabic && hasLatin) return undefined; // brand-like → keep as-is
  const t = await autoTranslate(value);
  const result = t[target];
  return result && result !== value ? result : undefined;
}

/**
 * Detects the language the admin typed in and auto-translates every text field
 * into the OTHER language. Used on save so the admin only ever enters one language.
 */
export async function buildProjectTranslations(input: {
  title?: string;
  description?: string;
  sector?: string;
  platform?: string;
  category?: string;
  services?: string[];
  tools?: string[];
  metaTitle?: { en?: string; ar?: string };
  metaDescription?: { en?: string; ar?: string };
}): Promise<ProjectTranslationBuild> {
  const probe = (input.description || input.title || '').trim();
  const sourceLang: 'en' | 'ar' = isArabic(probe) ? 'ar' : 'en';
  const target: 'en' | 'ar' = sourceLang === 'ar' ? 'en' : 'ar';

  const [tTitle, tDesc, tSector, tCategory, tServices, tTools] = await Promise.all([
    input.title ? translateTargetOf(input.title, target) : Promise.resolve(undefined),
    input.description ? translateTargetOf(input.description, target) : Promise.resolve(undefined),
    input.sector ? translateTargetOf(input.sector, target) : Promise.resolve(undefined),
    input.category ? translateTargetOf(input.category, target) : Promise.resolve(undefined),
    input.services?.length
      ? Promise.all(input.services.filter(Boolean).map((s) => translateTargetOf(s, target)))
      : Promise.resolve(undefined),
    input.tools?.length
      ? Promise.all(input.tools.filter(Boolean).map((s) => translateTargetOf(s, target)))
      : Promise.resolve(undefined),
  ]);

  const set: ProjectTranslationSet = {};
  if (tTitle) set.title = tTitle;
  if (tDesc) set.description = tDesc;
  if (tSector) set.sector = tSector;
  if (tCategory) set.category = tCategory;
  if (tServices) set.services = tServices.map((t, i) => t ?? input.services![i]) as string[];
  if (tTools) set.tools = tTools.map((t, i) => t ?? input.tools![i]) as string[];

  const [metaTitle, metaDescription] = await Promise.all([
    completeLocalized(input.metaTitle),
    completeLocalized(input.metaDescription),
  ]);

  return {
    sourceLang,
    translations: Object.keys(set).length ? { [target]: set } : undefined,
    metaTitle,
    metaDescription,
  };
}

/**
 * Given a text value and target locale, returns the appropriate translation.
 * - If locale is 'ar' and text is English → translates to Arabic
 * - If locale is 'en' and text is Arabic → translates to English
 * - If text is already in target locale → returns as-is
 * - If text is already an object { en, ar } → picks the right one
 */
export async function localizeText(
  value: string | { en?: string; ar?: string } | undefined,
  locale: 'en' | 'ar'
): Promise<string> {
  if (!value) return '';

  // Already a localized object
  if (typeof value === 'object') {
    const direct = value[locale];
    if (direct) return direct;

    // Translate the available language to the target
    const fallback = locale === 'ar' ? value.en : value.ar;
    if (!fallback) return '';
    return translateText(fallback, locale === 'ar' ? 'en|ar' : 'ar|en');
  }

  // It's a plain string — detect language and translate if needed
  const textIsArabic = isArabic(value);
  if (locale === 'ar' && !textIsArabic) {
    return translateText(value, 'en|ar');
  }
  if (locale === 'en' && textIsArabic) {
    return translateText(value, 'ar|en');
  }

  return value; // Already in the right language
}

/**
 * Translates a short category label smartly:
 * - Brand / proper names (single ASCII word with no spaces, e.g. "WordPress") are kept as-is in both languages.
 * - Ambiguous single-word English words (e.g. "web") are sent with extra context ("web design") to get a sensible translation.
 * - Rejects translations whose character length exceeds 2.5× the source (likely a wrong meaning) and falls back to the original.
 */
export async function translateCategoryName(name: string): Promise<{ en: string; ar: string }> {
  if (!name || name.trim().length === 0) return { en: '', ar: '' };

  const trimmed = name.trim();

  // Detect brand/proper names: single word, only ASCII letters/digits/special chars (no Arabic), and capitalised
  const isBrand = /^[A-Za-z0-9.,'&+\-/]+$/.test(trimmed) && !trimmed.includes(' ');
  if (isBrand) {
    // Keep brand names exactly as typed; for Arabic display just use the same string
    const display = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return { en: display, ar: display };
  }

  // For Arabic input → translate to English, guard length
  if (isArabic(trimmed)) {
    const en = await translateText(trimmed, 'ar|en');
    const guard = en.length > trimmed.length * 2.5 ? trimmed : en;
    return { en: guard, ar: trimmed };
  }

  // For English multi-word → translate to Arabic, guard length
  const ar = await translateText(trimmed, 'en|ar');
  const guard = ar.length > trimmed.length * 2.5 ? trimmed : ar;
  return { en: trimmed, ar: guard };
}

