import { Schema, model, Document } from 'mongoose';

export interface IOTP extends Document {
  identifier: string; // Email or Mobile number
  otp: string;
  purpose: 'verification' | 'login' | 'reset';
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    identifier: { type: String, required: true, trim: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['verification', 'login', 'reset'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Auto-delete expired OTP records
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ identifier: 1, purpose: 1 });

export const OTP = model<IOTP>('OTP', OTPSchema);
