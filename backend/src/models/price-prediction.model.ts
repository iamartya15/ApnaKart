import { Schema, model, Document } from 'mongoose';

export interface IPricePrediction extends Document {
  productId: string;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
  predictedDirection: 'up' | 'down' | 'stable';
  predictedPercentage: number;
  recommendation: 'buy' | 'wait';
  nextUpdateAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricePredictionSchema = new Schema<IPricePrediction>(
  {
    productId: { type: String, required: true, unique: true },
    averagePrice: { type: Number, required: true },
    highestPrice: { type: Number, required: true },
    lowestPrice: { type: Number, required: true },
    predictedDirection: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    predictedPercentage: { type: Number, default: 0 },
    recommendation: { type: String, enum: ['buy', 'wait'], default: 'buy' },
    nextUpdateAt: { type: Date, required: true },
  },
  { timestamps: true },
);

PricePredictionSchema.index({ productId: 1 });

export const PricePrediction = model<IPricePrediction>('PricePrediction', PricePredictionSchema);
export default PricePrediction;
