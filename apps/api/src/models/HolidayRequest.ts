import mongoose, { Schema, Document, Types } from 'mongoose';
import type { HolidayRequestStatus, MealSlot } from '@tiffin/shared';

export interface IHolidayRequest extends Document {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  date: string;
  slots: MealSlot[];
  status: HolidayRequestStatus;
  adminNote?: string;
  creditPaise: number;
}

const HolidayRequestSchema = new Schema<IHolidayRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    date: { type: String, required: true },
    slots: { type: [String], enum: ['lunch', 'dinner'], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    adminNote: String,
    creditPaise: { type: Number, default: 0 },
  },
  { timestamps: true }
);

HolidayRequestSchema.index({ subscriptionId: 1, date: 1 });

export const HolidayRequest = mongoose.model<IHolidayRequest>('HolidayRequest', HolidayRequestSchema);
