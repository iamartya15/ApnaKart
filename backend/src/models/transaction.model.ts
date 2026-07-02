import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
  orderId: string;
  paymentProvider: 'stripe' | 'razorpay' | 'cod';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  providerPaymentId?: string;
  webhookPayload?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    orderId: { type: String, required: true },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay', 'cod'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    providerPaymentId: { type: String },
    webhookPayload: { type: String },
  },
  { timestamps: true },
);

TransactionSchema.index({ orderId: 1 });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
