import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'flat' | 'percentage';
  value: number;
  minOrderAmount: number;
  expiresAt: Date;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
