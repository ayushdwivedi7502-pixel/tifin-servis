import mongoose, { Schema, Document, Types } from 'mongoose';
import type { PaymentStatus } from '@tiffin/shared';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  amountPaise: number;
  status: PaymentStatus;
  provider: 'mock' | 'razorpay';
  idempotencyKey: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  purpose: 'subscription_advance' | 'subscription_balance' | 'order' | 'addon';
  receiptNumber: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    amountPaise: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    provider: { type: String, enum: ['mock', 'razorpay'], required: true },
    idempotencyKey: { type: String, required: true, unique: true },
    providerPaymentId: String,
    providerOrderId: String,
    purpose: {
      type: String,
      enum: ['subscription_advance', 'subscription_balance', 'order', 'addon'],
      required: true,
    },
    receiptNumber: { type: String, required: true, unique: true },
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
