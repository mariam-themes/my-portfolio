import mongoose, { Schema, Document } from 'mongoose';

// ─── TypeScript interfaces ─────────────────────────────────────────────────

export interface IBlogTranslationSet {
  title?: string;
  excerpt?: string;
  content?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  seoTitle?: { en?: string; ar?: string };
  seoDescription?: { en?: string; ar?: string };
  sourceLang?: 'en' | 'ar';
  translations?: {
    en?: IBlogTranslationSet;
    ar?: IBlogTranslationSet;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const TranslationSetSchema = new Schema<IBlogTranslationSet>(
  { title: String, excerpt: String, content: String },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    coverImage: String,
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    seoTitle: {
      type: new Schema<{ en?: string; ar?: string }>(
        { en: { type: String, trim: true }, ar: { type: String, trim: true } },
        { _id: false }
      ),
      default: undefined,
    },
    seoDescription: {
      type: new Schema<{ en?: string; ar?: string }>(
        { en: { type: String, trim: true }, ar: { type: String, trim: true } },
        { _id: false }
      ),
      default: undefined,
    },
    sourceLang: { type: String, enum: ['en', 'ar'] },
    translations: {
      type: new Schema<{ en?: IBlogTranslationSet; ar?: IBlogTranslationSet }>(
        { en: { type: TranslationSetSchema }, ar: { type: TranslationSetSchema } },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { timestamps: true }
);

// ─── Avoid stale schema in dev hot-reload ────────────────────────────────────

if (process.env.NODE_ENV === 'development' && mongoose.models.Blog) {
  delete mongoose.models['Blog'];
}

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
