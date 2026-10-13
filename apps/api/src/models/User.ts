import mongoose, { Schema, Document, Types } from 'mongoose';
import type { UserRole } from '@tiffin/shared';

export interface IUser extends Document {
  _id: Types.ObjectId;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  isDisabled: boolean;
  collegeOrHostel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: { type: String, enum: ['customer', 'admin', 'worker'], required: true, default: 'customer' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    passwordHash: { type: String },
    isDisabled: { type: Boolean, default: false },
    collegeOrHostel: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
