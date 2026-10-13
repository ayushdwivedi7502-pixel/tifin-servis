import mongoose, { Schema, Document } from 'mongoose';
import type { MealSlot } from '@tiffin/shared';

export interface IAddOn extends Document {
  name: string;
  description: string;
  pricePaise: number;
  isAvailable: boolean;
  mealSlots: MealSlot[];
  maxQuantityPerOrder: number;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    pricePaise: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    mealSlots: { type: [String], enum: ['lunch', 'dinner'], default: ['lunch', 'dinner'] },
    maxQuantityPerOrder: { type: Number, default: 10, min: 1 },
  },
  { timestamps: true }
);

export const AddOn = mongoose.model<IAddOn>('AddOn', AddOnSchema);
