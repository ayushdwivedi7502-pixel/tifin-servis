import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true, default: 'Jabalpur' },
    state: { type: String, required: true, default: 'Madhya Pradesh' },
    pincode: { type: String, required: true },
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
