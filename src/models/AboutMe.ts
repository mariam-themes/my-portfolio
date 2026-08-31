import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IExperience {
  role: string;
  company: string;
  duration: string;
  description?: string;
}

export interface IAboutMeTranslationSet {
  bio?: string;
  skills?: string[];
  experience?: IExperience[];
}

export interface IAboutMe extends Document {
  bio: string;
  photo: string;
  skills: string[];
  experience: IExperience[];
  cvLink: string;
  sourceLang?: 'en' | 'ar';
  translations?: {
    en?: IAboutMeTranslationSet;
    ar?: IAboutMeTranslationSet;
  };
}

const ExperienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const AboutMeTranslationSetSchema = new Schema<IAboutMeTranslationSet>(
  {
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
  },
  { _id: false }
);

const AboutMeSchema = new Schema<IAboutMe>(
  {
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    cvLink: { type: String, default: '' },
    sourceLang: { type: String, enum: ['en', 'ar'] },
    translations: {
      en: { type: AboutMeTranslationSetSchema },
      ar: { type: AboutMeTranslationSetSchema },
    },
  },
  { timestamps: true }
);

export const DEFAULT_ABOUT_ME = {
  bio: '',
  photo: '',
  skills: [] as string[],
  experience: [] as IExperience[],
  cvLink: '',
};

if (process.env.NODE_ENV === 'development' && mongoose.models.AboutMe) {
  delete mongoose.models['AboutMe'];
}

const AboutMe: Model<IAboutMe> =
  mongoose.models.AboutMe || mongoose.model<IAboutMe>('AboutMe', AboutMeSchema);

export default AboutMe;
