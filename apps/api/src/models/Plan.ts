import mongoose, { Schema, Document } from 'mongoose';
import type { PlanDurationType, PlanMealType } from '@tiffin/shared';

export interface IPlan extends Document {
  name: string;
  description: string;
  includedItems: string[];
  mealType: PlanMealType;
  pricePaise: number;
  durationType: PlanDurationType;
  durationDays?: number;
  deliverOnWeekdaysOnly: boolean;
  servicePincodes: string[];
  isActive: boolean;
  isTrial: boolean;
  discountPercent: number;
  advanceFixedPaise?: number;
  advancePercent?: number;
  cancellationPolicy: string;
  holidayPolicy: string;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    includedItems: { type: [String], default: [] },
    mealType: {
      type: String,
      enum: ['single_meal', 'lunch_only', 'dinner_only', 'lunch_and_dinner'],
      required: true,
    },
    pricePaise: { type: Number, required: true, min: 0 },
    durationType: {
      type: String,
      enum: ['weekly', 'monthly', 'custom_days', 'annual'],
      required: true,
    },
    durationDays: Number,
    deliverOnWeekdaysOnly: { type: Boolean, default: true },
    servicePincodes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isTrial: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    advanceFixedPaise: Number,
    advancePercent: Number,
    cancellationPolicy: { type: String, default: 'See cancellation policy page.' },
    holidayPolicy: { type: String, default: 'Holiday requests must be submitted before cutoff.' },
  },
  { timestamps: true }
);

PlanSchema.index({ isActive: 1 });

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
