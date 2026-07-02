import { Schema, model, Document } from 'mongoose';

export interface IUserPreference extends Document {
  user: Schema.Types.ObjectId;
  favoriteCategories: string[];
  favoriteBrands: string[];
  priceSensitivity: 'low' | 'medium' | 'high'; // low = buys expensive items, high = buys cheap items
  recentViews: string[]; // List of product IDs
  lastUpdated: Date;
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    favoriteCategories: [{ type: String }],
    favoriteBrands: [{ type: String }],
    priceSensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    recentViews: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UserPreferenceSchema.index({ user: 1 });

export const UserPreference = model<IUserPreference>('UserPreference', UserPreferenceSchema);
export default UserPreference;
