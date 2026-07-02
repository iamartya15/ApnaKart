import { Schema, model, Document } from 'mongoose';

export interface IRedirectLog extends Document {
  user?: Schema.Types.ObjectId;
  productId: string;
  marketplace: string;
  affiliateLink: string;
  clickRevenue: number; // Simulated referral click value (INR)
  createdAt: Date;
}

const RedirectLogSchema = new Schema<IRedirectLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    productId: { type: String, required: true },
    marketplace: { type: String, required: true },
    affiliateLink: { type: String, required: true },
    clickRevenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

RedirectLogSchema.index({ createdAt: -1 });
RedirectLogSchema.index({ user: 1 });

export const RedirectLog = model<IRedirectLog>('RedirectLog', RedirectLogSchema);
export default RedirectLog;
