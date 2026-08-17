import mongoose, { Schema, Document, Model } from 'mongoose';
import slugify from 'slugify';

export interface IGalleryItem {
  url: string;
  type: 'desktop' | 'mobile' | 'mockup' | 'video' | 'gif';
}

export interface IBeforeAfter {
  before: string;
  after: string;
}

export interface ILocalizedText {
  en?: string;
  ar?: string;
}

export interface IVisualDirection {
  colors?: string[];
  fonts?: string[];
  identity?: string[];
  imageStyle?: string[];
}

export type ProjectSectionId =
  | 'gallery'
  | 'transform'
  | 'visual'
  | 'deliverables'
  | 'tools'
  | 'mockup'
  | 'closing';

export interface IProject extends Document {
  title: string;
  slug: string;
  category?: string;
  sector?: string;
  description: string;
  services: string[];
  tools?: string[];
  platform: string;
  year: number;
  heroMediaUrl: string;
  fullPageMockupUrl?: string;
  gallery?: IGalleryItem[];
  beforeAfter?: IBeforeAfter[];
  closingImageUrl?: string;
  closingImages?: string[];
  liveUrl?: string;
  isFeatured?: boolean;
  metaTitle?: ILocalizedText;
  metaDescription?: ILocalizedText;
  visualDirection?: IVisualDirection;
  sectionOrder?: ProjectSectionId[];
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'mockup', 'video', 'gif'],
      default: 'desktop',
    },
  },
  { _id: false }
);

const BeforeAfterSchema = new Schema<IBeforeAfter>(
  {
    before: { type: String, required: true },
    after: { type: String, required: true },
  },
  { _id: false }
);

const VisualDirectionSchema = new Schema<IVisualDirection>(
  {
    colors: { type: [String], default: [] },
    fonts: { type: [String], default: [] },
    identity: { type: [String], default: [] },
    imageStyle: { type: [String], default: [] },
  },
  { _id: false }
);

export const DEFAULT_SECTION_ORDER: ProjectSectionId[] = [
  'gallery',
  'transform',
  'visual',
  'deliverables',
  'tools',
  'mockup',
  'closing',
];

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: String, default: 'Uncategorized' },
    sector: { type: String, default: '' },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    services: { type: [String], required: [true, 'At least one service is required'] },
    tools: { type: [String], default: [] },
    platform: { type: String, required: [true, 'Platform is required'] },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      validate: {
        validator: (v: number) => /^\d{4}$/.test(v.toString()),
        message: 'Year must be a valid 4-digit year',
      },
    },
    heroMediaUrl: {
      type: String,
      required: [true, 'Hero media URL is required'],
    },
    fullPageMockupUrl: { type: String, default: '' },
    gallery: { type: [GalleryItemSchema], default: [] },
    beforeAfter: { type: [BeforeAfterSchema], default: [] },
    closingImageUrl: { type: String, default: '' },
    closingImages: { type: [String], default: [] },
    liveUrl: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Please enter a valid URL',
      ],
    },
    isFeatured: { type: Boolean, default: false },
    metaTitle: {
      type: new Schema<ILocalizedText>(
        {
          en: { type: String, default: undefined, trim: true },
          ar: { type: String, default: undefined, trim: true },
        },
        { _id: false }
      ),
      default: undefined,
    },
    metaDescription: {
      type: new Schema<ILocalizedText>(
        {
          en: { type: String, default: undefined, trim: true },
          ar: { type: String, default: undefined, trim: true },
        },
        { _id: false }
      ),
      default: undefined,
    },
    visualDirection: { type: VisualDirectionSchema, default: undefined },
    sectionOrder: {
      type: [String],
      enum: ['gallery', 'transform', 'visual', 'deliverables', 'tools', 'mockup', 'closing'],
      default: [],
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title (Mongoose v8+ async style)
ProjectSchema.pre('validate', async function () {
  if (this.isModified('title') && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

// Delete cached model in development to avoid stale schema after HMR
if (process.env.NODE_ENV === 'development' && mongoose.models.Project) {
  delete mongoose.models['Project'];
}

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
