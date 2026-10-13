import { Subscription } from '../models/Subscription';
import { Order } from '../models/Order';
import { toISTDateString } from '@tiffin/shared';
import type { MealSlot } from '@tiffin/shared';

export interface KitchenLine {
  customerName?: string;
  item: string;
  quantity: number;
  type: 'subscription' | 'addon';
  reference?: string;
}

export async function buildKitchenList(date: string, slot: MealSlot): Promise<KitchenLine[]> {
  const lines: KitchenLine[] = [];
  const subs = await Subscription.find({ status: 'active' }).populate('userId', 'fullName').populate('planId', 'name');
  for (const sub of subs) {
    const meal = sub.mealSchedule.find((m) => m.date === date && m.slot === slot);
    if (meal && (meal.status === 'scheduled' || meal.status === 'pending')) {
      const planName = (sub.planId as { name?: string })?.name ?? 'Tiffin';
      lines.push({
        customerName: (sub.userId as { fullName?: string })?.fullName,
        item: planName,
        quantity: 1,
        type: 'subscription',
        reference: sub.reference,
      });
    }
  }
  const orders = await Order.find({
    deliveryDate: date,
    mealSlot: slot,
    status: { $in: ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'payment_verified'] },
  });
  for (const order of orders) {
    for (const item of order.items) {
      lines.push({
        item: item.name,
        quantity: item.quantity,
        type: 'addon',
        reference: order.reference,
      });
    }
  }
  return lines;
}

export function todayIST(): string {
  return toISTDateString(new Date());
}
