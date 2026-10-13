import { addDaysIST, compareDateStrings, isWeekdayIST, parseISTDate, toISTDateString } from './dates';
import type { MealSlot, PlanMealType } from './types';

export interface PlanDurationConfig {
  durationType: 'weekly' | 'monthly' | 'custom_days' | 'annual';
  durationDays?: number;
  deliverOnWeekdaysOnly?: boolean;
}

export interface MealScheduleEntry {
  date: string;
  slots: MealSlot[];
  status: 'scheduled' | 'delivered' | 'skipped' | 'holiday' | 'pending';
}

export function mealSlotsForPlan(mealType: PlanMealType): MealSlot[] {
  switch (mealType) {
    case 'single_meal':
    case 'lunch_only':
      return ['lunch'];
    case 'dinner_only':
      return ['dinner'];
    case 'lunch_and_dinner':
      return ['lunch', 'dinner'];
    default:
      return ['lunch'];
  }
}

export function computeEndDate(
  startDate: string,
  config: PlanDurationConfig
): string {
  let days: number;
  switch (config.durationType) {
    case 'weekly':
      days = 7;
      break;
    case 'monthly':
      days = 30;
      break;
    case 'annual':
      days = 365;
      break;
    case 'custom_days':
      days = config.durationDays ?? 30;
      break;
    default:
      days = 30;
  }
  return addDaysIST(startDate, days - 1);
}

export function generateMealSchedule(
  startDate: string,
  endDate: string,
  mealType: PlanMealType,
  deliverOnWeekdaysOnly = true
): MealScheduleEntry[] {
  const slots = mealSlotsForPlan(mealType);
  const entries: MealScheduleEntry[] = [];
  let current = startDate;
  while (compareDateStrings(current, endDate) <= 0) {
    if (!deliverOnWeekdaysOnly || isWeekdayIST(current)) {
      entries.push({ date: current, slots: [...slots], status: 'scheduled' });
    }
    current = addDaysIST(current, 1);
  }
  return entries;
}

export function countScheduledMeals(schedule: MealScheduleEntry[]): number {
  return schedule.reduce((sum, e) => {
    if (e.status === 'skipped' || e.status === 'holiday') return sum;
    return sum + e.slots.length;
  }, 0);
}

export function validateStartDate(startDate: string, minLeadDays = 1): void {
  const today = toISTDateString(new Date());
  const minStart = addDaysIST(today, minLeadDays);
  if (compareDateStrings(startDate, minStart) < 0) {
    throw new Error(`Start date must be on or after ${minStart} (IST)`);
  }
}

export { parseISTDate, toISTDateString };
