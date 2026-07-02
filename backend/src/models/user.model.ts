import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  label: string; // e.g. Home, Office
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ITransaction {
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  role: 'user' | 'admin';
  adminRole?:
    'super_admin' | 'admin' | 'moderator' | 'support' | 'marketing' | 'finance' | 'viewer' | 'user';
  isSuspended: boolean;
  isBanned: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  githubId?: string;
  addresses: IAddress[];
  wallet: {
    balance: number;
    history: ITransaction[];
  };
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const TransactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, sparse: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    adminRole: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'moderator',
        'support',
        'marketing',
        'finance',
        'viewer',
        'user',
      ],
      default: 'user',
    },
    isSuspended: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },
    addresses: [AddressSchema],
    wallet: {
      balance: { type: Number, default: 0 },
      history: [TransactionSchema],
    },
    twoFactorSecret: { type: String, select: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Password hashing middleware before saving user
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method helper
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);
