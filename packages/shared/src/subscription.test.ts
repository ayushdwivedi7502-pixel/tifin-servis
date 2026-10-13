import { describe, it, expect } from 'vitest';
import {
  computeEndDate,
  generateMealSchedule,
  countScheduledMeals,
  calculateAdvancePaise,
  paiseToRupees,
  rupeesToPaise,
  formatINR,
  addDaysIST,
  toISTDateString,
} from './index';

describe('subscription calculations & date handling', () => {
  it('computes weekly end date (7 days)', () => {
    expect(computeEndDate('2026-02-01', { durationType: 'weekly' })).toBe('2026-02-07');
  });

  it('computes monthly end date (30 days)', () => {
    expect(computeEndDate('2026-01-01', { durationType: 'monthly' })).toBe('2026-01-30');
  });

  it('computes custom duration end date', () => {
    expect(computeEndDate('2026-03-01', { durationType: 'custom_days', durationDays: 14 })).toBe('2026-03-14');
  });

  it('generates weekday meals and excludes sundays when deliverOnWeekdaysOnly is true', () => {
    // 2026-01-05 is Monday, 2026-01-11 is Sunday
    const schedule = generateMealSchedule('2026-01-05', '2026-01-11', 'lunch_and_dinner', true);
    // Monday to Saturday = 6 active days, Sunday excluded
    expect(schedule.length).toBe(6);
    const totalMeals = countScheduledMeals(schedule);
    expect(totalMeals).toBe(12); // 6 days * 2 meals (lunch + dinner)
  });

  it('handles single meal schedule (lunch only)', () => {
    const schedule = generateMealSchedule('2026-01-05', '2026-01-05', 'lunch_only', false);
    expect(schedule.length).toBe(1);
    expect(schedule[0].slots).toEqual(['lunch']);
    expect(countScheduledMeals(schedule)).toBe(1);
  });
});

describe('money & advance calculations', () => {
  it('calculates advance with fixed paise amount', () => {
    expect(calculateAdvancePaise(300000, 50000, null)).toBe(50000);
  });

  it('calculates advance with percentage', () => {
    // 20% of 3000.00 (300000 paise) = 600.00 (60000 paise)
    expect(calculateAdvancePaise(300000, null, 20)).toBe(60000);
  });

  it('defaults to 100% advance when neither fixed nor percent is provided', () => {
    expect(calculateAdvancePaise(250000, null, null)).toBe(250000);
  });

  it('converts rupees to paise safely without floating-point errors', () => {
    expect(rupeesToPaise(120.5)).toBe(12050);
    expect(rupeesToPaise(49.99)).toBe(4999);
  });

  it('converts paise to formatted INR string', () => {
    expect(paiseToRupees(300000)).toBe(3000);
    expect(paiseToRupees(300050)).toBe(3000.5);
    expect(formatINR(300000)).toMatch(/₹\s*3,000/);
  });

  it('handles IST date arithmetic correctly', () => {
    expect(addDaysIST('2026-01-10', 5)).toBe('2026-01-15');
    const d = new Date('2026-06-15T00:00:00.000Z');
    expect(toISTDateString(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

