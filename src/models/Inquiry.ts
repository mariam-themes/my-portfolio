import mongoose, { Schema, Document } from 'mongoose';

export type InquiryStatus = 'new' | 'contacted' | 'closed';
export type InquiryType = 'contact' | 'purchase';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  timeline?: string;
  message: string;
  status: InquiryStatus;
  type?: InquiryType;
  projectRef?: string;
  projectPrice?: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[\w.+-]+@[\w-]+\.[\w.-]+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: String,
      trim: true,
    },
    timeline: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
    type: {
      type: String,
      enum: ['contact', 'purchase'],
      default: 'contact',
    },
    projectRef: {
      type: String,
      trim: true,
    },
    projectPrice: {
      type: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Inquiry =
  mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);