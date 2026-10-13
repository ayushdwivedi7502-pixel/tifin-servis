import { compareDateStrings, toISTDateString } from '@tiffin/shared';
import type { MealSlot } from '@tiffin/shared';
import { BusinessSettings } from '../models/BusinessSettings';
import type { ISubscription } from '../models/Subscription';

function istTimeHHMM(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export async function validateHolidayRequest(
  subscription: ISubscription,
  date: string,
  slots: MealSlot[]
): Promise<void> {
  if (subscription.status !== 'active' && subscription.status !== 'pending_payment') {
    throw new Error('Subscription is not eligible for holiday requests');
  }
  if (compareDateStrings(date, subscription.startDate) < 0 || compareDateStrings(date, subscription.endDate) > 0) {
    throw new Error('Date is outside subscription period');
  }
  const today = toISTDateString(new Date());
  if (compareDateStrings(date, today) <= 0) {
    throw new Error('Holiday must be for a future date');
  }
  const settings = await BusinessSettings.findOne();
  const maxAdvance = settings?.holidayMaxAdvanceDays ?? 30;
  const cutoff = settings?.holidayCutoffTime ?? '20:00';
  const maxDate = toISTDateString(new Date(Date.now() + maxAdvance * 86400000));
  if (compareDateStrings(date, maxDate) > 0) {
    throw new Error(`Holiday cannot be more than ${maxAdvance} days ahead`);
  }
  const nowTime = istTimeHHMM();
  if (date === today && nowTime >= cutoff) {
    throw new Error(`Holiday cutoff (${cutoff} IST) has passed for today`);
  }
  for (const slot of slots) {
    const meal = subscription.mealSchedule.find((m) => m.date === date && m.slot === slot);
    if (!meal) throw new Error(`No scheduled meal for ${date} ${slot}`);
    if (meal.status !== 'scheduled' && meal.status !== 'pending') {
      throw new Error(`Meal already ${meal.status} for ${date} ${slot}`);
    }
  }
}

export function applyApprovedHoliday(
  subscription: ISubscription,
  date: string,
  slots: MealSlot[],
  extendSubscription: boolean
): void {
  for (const slot of slots) {
    const meal = subscription.mealSchedule.find((m) => m.date === date && m.slot === slot);
    if (meal) meal.status = 'holiday';
  }
  if (extendSubscription) {
    const lastDate = subscription.endDate;
    subscription.endDate = addOneDay(lastDate);
    for (const slot of slots) {
      subscription.mealSchedule.push({ date: subscription.endDate, slot, status: 'scheduled' });
    }
  }
}

function addOneDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  d.setUTCDate(d.getUTCDate() + 1);
  return toISTDateString(d);
}
