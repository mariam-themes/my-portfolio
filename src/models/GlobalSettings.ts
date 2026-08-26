import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface IUsefulLink {
  label: string;
  url: string;
}

export interface IGlobalSettings extends Document {
  siteName: string;
  logoUrl: string;
  email: string;
  whatsapp: string;
  copyright: string;
  socials: ISocialLink[];
  usefulLinks: IUsefulLink[];
  seoTitle?: string;
  seoDescription?: string;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const UsefulLinkSchema = new Schema<IUsefulLink>(
  {
    label: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const GlobalSettingsSchema = new Schema<IGlobalSettings>(
  {
    siteName: { type: String, default: 'Mariam Aljumaiah' },
    logoUrl: { type: String, default: '/portfolio-logo.jpeg' },
    email: { type: String, default: 'studio@mariamaljumaiah.com' },
    whatsapp: { type: String, default: '' },
    copyright: {
      type: String,
      default: `© ${new Date().getFullYear()} Mariam Aljumaiah. All rights reserved.`,
    },
    socials: { type: [SocialLinkSchema], default: [] },
    usefulLinks: { type: [UsefulLinkSchema], default: [] },
    seoTitle: { type: String, default: '', trim: true },
    seoDescription: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export const DEFAULT_GLOBAL_SETTINGS = {
  siteName: 'Mariam Aljumaiah',
  logoUrl: '/portfolio-logo.jpeg',
  email: 'studio@mariamaljumaiah.com',
  whatsapp: '',
  copyright: `© ${new Date().getFullYear()} Mariam Aljumaiah. All rights reserved.`,
  socials: [] as ISocialLink[],
  usefulLinks: [] as IUsefulLink[],
  seoTitle: '',
  seoDescription: '',
};

// Delete cached model in development to avoid stale schema after HMR.
if (process.env.NODE_ENV === 'development' && mongoose.models.GlobalSettings) {
  delete mongoose.models['GlobalSettings'];
}

const GlobalSettings: Model<IGlobalSettings> =
  mongoose.models.GlobalSettings ||
  mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;
