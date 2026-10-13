import {
  calculateAdvancePaise,
  computeEndDate,
  generateMealSchedule,
  validateStartDate,
} from '@tiffin/shared';
import type { IPlan } from '../models/Plan';
import type { IMealScheduleItem } from '../models/Subscription';
import { BusinessSettings } from '../models/BusinessSettings';
import { v4 as uuidv4 } from 'uuid';

export function planToDurationConfig(plan: IPlan) {
  return {
    durationType: plan.durationType,
    durationDays: plan.durationDays,
    deliverOnWeekdaysOnly: plan.deliverOnWeekdaysOnly,
  };
}

export function calculateSubscriptionPricing(plan: IPlan) {
  const discountPaise = Math.round((plan.pricePaise * plan.discountPercent) / 100);
  const totalPricePaise = plan.pricePaise - discountPaise;
  const advanceRequiredPaise = calculateAdvancePaise(
    totalPricePaise,
    plan.advanceFixedPaise ?? null,
    plan.advancePercent ?? null
  );
  const outstandingPaise = totalPricePaise - advanceRequiredPaise;
  return { totalPricePaise, discountPaise, advanceRequiredPaise, outstandingPaise };
}

export async function buildSubscriptionDraft(
  plan: IPlan,
  startDate: string
): Promise<{
  startDate: string;
  endDate: string;
  mealSchedule: IMealScheduleItem[];
  reference: string;
  pricing: ReturnType<typeof calculateSubscriptionPricing>;
}> {
  const settings = await BusinessSettings.findOne();
  const leadDays = settings?.minSubscriptionLeadDays ?? 1;
  validateStartDate(startDate, leadDays);
  const endDate = computeEndDate(startDate, planToDurationConfig(plan));
  const scheduleEntries = generateMealSchedule(
    startDate,
    endDate,
    plan.mealType,
    plan.deliverOnWeekdaysOnly
  );
  const mealSchedule: IMealScheduleItem[] = [];
  for (const entry of scheduleEntries) {
    for (const slot of entry.slots) {
      mealSchedule.push({ date: entry.date, slot, status: 'scheduled' });
    }
  }
  return {
    startDate,
    endDate,
    mealSchedule,
    reference: `SUB-${uuidv4().slice(0, 8).toUpperCase()}`,
    pricing: calculateSubscriptionPricing(plan),
  };
}

export function generateReceiptNumber(): string {
  return `RCP-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
}
