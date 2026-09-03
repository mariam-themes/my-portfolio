import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;         // original name as entered by admin (source of truth)
  nameEn?: string;      // auto-translated English version
  nameAr?: string;      // auto-translated Arabic version
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    nameEn: { type: String, trim: true },
    nameAr: { type: String, trim: true },
  },
  { timestamps: true }
);

// Delete cached model in development to avoid stale schema after HMR
if (process.env.NODE_ENV === 'development' && mongoose.models.Category) {
  delete mongoose.models['Category'];
}

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
