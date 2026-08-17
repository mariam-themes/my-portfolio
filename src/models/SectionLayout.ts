import mongoose, { Schema, Document } from 'mongoose';

export interface ISectionConfig {
  id: string; // matches a code registry section id (home-sections.tsx)
  isVisible: boolean;
  content?: Record<string, unknown>; // future: per-section content overrides
}

export interface ISectionLayout extends Document {
  key: string; // e.g. 'home' — one layout doc per page
  sections: ISectionConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const SectionConfigSchema: Schema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    isVisible: { type: Boolean, default: true },
    content: { type: Schema.Types.Mixed }, // flexible — sections may change without schema changes
  },
  { _id: false }
);

const SectionLayoutSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'home' },
    sections: { type: [SectionConfigSchema], default: [] },
  },
  { timestamps: true }
);

export const SectionLayout =
  mongoose.models.SectionLayout ||
  mongoose.model<ISectionLayout>('SectionLayout', SectionLayoutSchema);
