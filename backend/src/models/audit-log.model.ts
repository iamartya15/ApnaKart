import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminEmail: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ adminEmail: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
