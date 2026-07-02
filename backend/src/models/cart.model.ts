import { Schema, model, Document } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string;
  marketplace: string;
}

export interface ICart extends Document {
  user?: Schema.Types.ObjectId; // Optional for guests
  guestId?: string; // Identifier for guests
  items: ICartItem[];
  savedForLater: ICartItem[];
  status: 'active' | 'ordered';
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  marketplace: { type: String, required: true },
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String },
    items: [CartItemSchema],
    savedForLater: [CartItemSchema],
    status: { type: String, enum: ['active', 'ordered'], default: 'active' },
  },
  { timestamps: true },
);

CartSchema.index({ user: 1 });
CartSchema.index({ guestId: 1 });

export const Cart = model<ICart>('Cart', CartSchema);
export default Cart;
