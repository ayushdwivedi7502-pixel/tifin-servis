export type UserRole = 'customer' | 'admin' | 'worker';

export type MealSlot = 'lunch' | 'dinner';

export type SubscriptionStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'paused'
  | 'expired'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verified'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed_delivery';

export type HolidayRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type PlanMealType =
  | 'single_meal'
  | 'lunch_only'
  | 'dinner_only'
  | 'lunch_and_dinner';

export type PlanDurationType =
  | 'weekly'
  | 'monthly'
  | 'custom_days'
  | 'annual';

export interface ApiErrorBody {
  error: string;
  details?: Record<string, string[]>;
}
