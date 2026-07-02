import { Schema, model, Document } from 'mongoose';
import { ICartItem } from './cart.model';

export interface ITimelineStep {
  status: string;
  timestamp: Date;
  description: string;
}

export interface IAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  items: ICartItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  deliverySlot: string;
  couponCode?: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  paymentProvider: 'stripe' | 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  orderStatus:
    'pending' | 'reserved' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  timeline: ITimelineStep[];
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const TimelineStepSchema = new Schema<ITimelineStep>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },
        marketplace: { type: String, required: true },
      },
    ],
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: true },
    deliverySlot: { type: String, required: true },
    couponCode: { type: String },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingCharges: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'wallet', 'cod'], required: true },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    orderStatus: {
      type: String,
      enum: ['pending', 'reserved', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    timeline: [TimelineStepSchema],
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1 });

export const Order = model<IOrder>('Order', OrderSchema);
export default Order;
