import { Schema, model, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: string;
  stockLevel: number;
  reservedStock: number;
  lowStockThreshold: number;
  status: 'instock' | 'outofstock';
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: String, required: true, unique: true },
    stockLevel: { type: Number, required: true, default: 0 },
    reservedStock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ['instock', 'outofstock'], default: 'instock' },
    warehouseId: { type: String, required: true },
  },
  { timestamps: true },
);

export const Inventory = model<IInventory>('Inventory', InventorySchema);
export default Inventory;
