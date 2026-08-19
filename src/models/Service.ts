import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  image: string;
  tags: string[];
  order: number;
  sourceLang?: 'en' | 'ar';
  translations?: {
    en?: {
      title?: string;
      description?: string;
    };
    ar?: {
      title?: string;
      description?: string;
    };
  };
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Service image is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    sourceLang: {
      type: String,
      enum: ['en', 'ar'],
    },
    translations: {
      en: {
        title: String,
        description: String,
      },
      ar: {
        title: String,
        description: String,
      },
    },
  },
  { timestamps: true }
);

// Delete cached model in development to avoid stale schema after HMR
if (process.env.NODE_ENV === 'development' && mongoose.models.Service) {
  delete mongoose.models['Service'];
}

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
