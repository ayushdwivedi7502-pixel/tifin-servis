import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessSettings extends Document {
  businessName: string;
  tagline?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email?: string;
  logoUrl?: string;
  serviceAreas: string[];
  servicePincodes: string[];
  deliveryHoursLunch: string;
  deliveryHoursDinner: string;
  holidayCutoffTime: string;
  holidayMaxAdvanceDays: number;
  pausedDaysExtendSubscription: boolean;
  holidayIssuesMealCredit: boolean;
  minSubscriptionLeadDays: number;
  termsHtml?: string;
  privacyHtml?: string;
  refundPolicyHtml?: string;
}

const BusinessSettingsSchema = new Schema<IBusinessSettings>(
  {
    businessName: { type: String, default: 'Jabalpur Tiffin Service (Demo)' },
    tagline: { type: String, default: 'Homemade meals, delivered fresh in Jabalpur' },
    address: { type: String, default: 'Demo Address — configure in Admin Settings, Jabalpur, MP' },
    phone: { type: String, default: '+91-00000-00000' },
    whatsapp: { type: String, default: '+91-00000-00000' },
    email: { type: String, default: 'demo@jabalpurtiffin.local' },
    logoUrl: String,
    serviceAreas: {
      type: [String],
      default: ['Napier Town', 'Wright Town', 'Garha', 'Adhartal', 'Gwarighat'],
    },
    servicePincodes: { type: [String], default: ['482001', '482002', '482003'] },
    deliveryHoursLunch: { type: String, default: '12:00 PM – 2:00 PM IST' },
    deliveryHoursDinner: { type: String, default: '7:00 PM – 9:00 PM IST' },
    holidayCutoffTime: { type: String, default: '20:00' },
    holidayMaxAdvanceDays: { type: Number, default: 30 },
    pausedDaysExtendSubscription: { type: Boolean, default: true },
    holidayIssuesMealCredit: { type: Boolean, default: false },
    minSubscriptionLeadDays: { type: Number, default: 1 },
    termsHtml: String,
    privacyHtml: String,
    refundPolicyHtml: String,
  },
  { timestamps: true }
);

export const BusinessSettings = mongoose.model<IBusinessSettings>(
  'BusinessSettings',
  BusinessSettingsSchema
);
