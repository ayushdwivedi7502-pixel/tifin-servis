import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRefund extends Document {
  paymentId: Types.ObjectId;
  userId: Types.ObjectId;
  amountPaise: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
}

const RefundSchema = new Schema<IRefund>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amountPaise: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

export const Refund = mongoose.model<IRefund>('Refund', RefundSchema);
