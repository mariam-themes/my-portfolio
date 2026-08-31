import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

ActivityLogSchema.index({ adminId: 1, timestamp: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);