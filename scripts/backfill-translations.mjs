/**
 * Backfills `sourceLang` + `translations` for projects that were saved before
 * the auto-translation feature existed. Run:
 *   node scripts/backfill-translations.mjs
 */
import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const raw = readFileSync(envPath, 'utf8');
const match = raw.match(/^MONGODB_URI=(.*)$/m);
const uri = match ? match[1].trim().replace(/^"|"$/g, '') : '';
if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

await mongoose.connect(uri, { bufferCommands: false });

const Project =
  (mongoose.models && mongoose.models.Project) ||
  mongoose.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');

// Minimal re-implementation so the script stays self-contained.
const isArabic = (text) => {
  const matches = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return matches > text.length * 0.3;
};
const AR = /[\u0600-\u06FF]/;
const LATIN = /[A-Za-z0-9]/;

async function translateOne(text, pair) {
  if (!text) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;
    const data = await res.json();
    const out = data?.responseData?.translatedText;
    if (!out || String(out).toLowerCase().includes('mymemory warning')) return text;
    return String(out)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'");
  } catch {
    return text;
  }
}

async function autoTranslate(text) {
  if (isArabic(text)) {
    const en = await translateOne(text, 'ar|en');
    return { en, ar: text };
  }
  const ar = await translateOne(text, 'en|ar');
  return { en: text, ar };
}

async function translateTargetOf(value, target, strict = false) {
  const hasArabic = AR.test(value);
  const hasLatin = LATIN.test(value);
  if (strict && hasArabic && hasLatin) return undefined; // brand-like → keep as-is
  const t = await autoTranslate(value);
  const candidate = t[target];
  return candidate && candidate !== value ? candidate : undefined;
}

const TEXT_FIELDS = ['title', 'description', 'sector', 'platform', 'category'];
const LIST_FIELDS = ['services', 'tools'];

const projects = await Project.find({});
console.log(`Found ${projects.length} projects`);

for (const project of projects) {
  if (project.sourceLang && project.translations) {
    console.log(`- skip "${project.title}" (already has translations)`);
    continue;
  }
  const doc = project.toObject();
  const probe = (doc.description || doc.title || '').trim();
  const sourceLang = isArabic(probe) ? 'ar' : 'en';
  const target = sourceLang === 'ar' ? 'en' : 'ar';

  const set = {};
  for (const field of TEXT_FIELDS) {
    const value = doc[field];
    if (typeof value === 'string' && value.trim()) {
      const strict = field !== 'description';
      const translated = await translateTargetOf(value, target, strict);
      if (translated) set[field] = translated;
    }
  }
  for (const field of LIST_FIELDS) {
    const values = Array.isArray(doc[field]) ? doc[field].filter(Boolean) : [];
    if (values.length) {
      const translated = (await Promise.all(values.map((v) => translateTargetOf(v, target, false)))).filter(Boolean);
      if (translated.length) set[field] = translated;
    }
  }

  const update = { $set: { sourceLang } };
  if (Object.keys(set).length) update.$set.translations = { [target]: set };
  else update.$set.translations = undefined;

  const res = await Project.updateOne({ _id: project._id }, update);
  console.log(`- OK "${doc.title}" → source:${sourceLang} target:${target} fields:${Object.keys(set).join(',') || 'none'} (matched:${res.matchedCount})`);
}

await mongoose.disconnect();
console.log('Done');