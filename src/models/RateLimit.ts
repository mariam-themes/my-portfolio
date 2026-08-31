import mongoose, { Schema, Document } from 'mongoose';

export interface IRateLimit extends Document {
  key: string;
  count: number;
  resetAt: number;
  createdAt: number;
  updatedAt: number;
}

const RateLimitSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    resetAt: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

RateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

export const RateLimit = mongoose.models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);