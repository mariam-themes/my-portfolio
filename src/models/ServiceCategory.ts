import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceCategory extends Document {
  name: string;         // original name as entered by admin (source of truth)
  nameEn?: string;      // auto-translated English version
  nameAr?: string;      // auto-translated Arabic version
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    name: {
      type: String,
      required: [true, 'Service category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Service category name must be at least 2 characters'],
      maxlength: [50, 'Service category name cannot exceed 50 characters'],
    },
    nameEn: { type: String, trim: true },
    nameAr: { type: String, trim: true },
  },
  { timestamps: true }
);

// Delete cached model in development to avoid stale schema after HMR
if (process.env.NODE_ENV === 'development' && mongoose.models.ServiceCategory) {
  delete mongoose.models['ServiceCategory'];
}

const ServiceCategory: Model<IServiceCategory> =
  mongoose.models.ServiceCategory ||
  mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);

export default ServiceCategory;

