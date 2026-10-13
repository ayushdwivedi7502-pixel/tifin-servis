import mongoose, { Schema, Document, Types } from 'mongoose';
import type { MealSlot, SubscriptionStatus } from '@tiffin/shared';

export interface IMealScheduleItem {
  date: string;
  slot: MealSlot;
  status: 'scheduled' | 'delivered' | 'skipped' | 'holiday' | 'pending';
}

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  addressId: Types.ObjectId;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  totalPricePaise: number;
  discountPaise: number;
  advanceRequiredPaise: number;
  paidPaise: number;
  outstandingPaise: number;
  mealSchedule: IMealScheduleItem[];
  reference: string;
}

const MealScheduleItemSchema = new Schema<IMealScheduleItem>(
  {
    date: { type: String, required: true },
    slot: { type: String, enum: ['lunch', 'dinner'], required: true },
    status: {
      type: String,
      enum: ['scheduled', 'delivered', 'skipped', 'holiday', 'pending'],
      default: 'scheduled',
    },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    status: {
      type: String,
      enum: ['draft', 'pending_payment', 'active', 'paused', 'expired', 'cancelled'],
      default: 'draft',
      index: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    totalPricePaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    advanceRequiredPaise: { type: Number, required: true },
    paidPaise: { type: Number, default: 0 },
    outstandingPaise: { type: Number, required: true },
    mealSchedule: { type: [MealScheduleItemSchema], default: [] },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
