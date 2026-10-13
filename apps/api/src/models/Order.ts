import mongoose, { Schema, Document, Types } from 'mongoose';
import type { MealSlot, OrderStatus } from '@tiffin/shared';

export interface IOrderItem {
  addOnId?: Types.ObjectId;
  name: string;
  quantity: number;
  unitPricePaise: number;
  mealSlot?: MealSlot;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  addressId: Types.ObjectId;
  deliveryDate: string;
  mealSlot: MealSlot;
  items: IOrderItem[];
  totalPaise: number;
  status: OrderStatus;
  reference: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    addOnId: { type: Schema.Types.ObjectId, ref: 'AddOn' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPricePaise: { type: Number, required: true },
    mealSlot: { type: String, enum: ['lunch', 'dinner'] },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    deliveryDate: { type: String, required: true, index: true },
    mealSlot: { type: String, enum: ['lunch', 'dinner'], required: true },
    items: { type: [OrderItemSchema], required: true },
    totalPaise: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'pending_payment',
        'payment_verified',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'failed_delivery',
      ],
      default: 'pending_payment',
      index: true,
    },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
