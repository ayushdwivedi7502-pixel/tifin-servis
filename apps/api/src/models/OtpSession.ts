import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpSession extends Document {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  purpose: 'login' | 'register' | 'reset';
}

const OtpSessionSchema = new Schema<IOtpSession>(
  {
    phone: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    purpose: { type: String, enum: ['login', 'register', 'reset'], required: true },
  },
  { timestamps: true }
);

export const OtpSession = mongoose.model<IOtpSession>('OtpSession', OtpSessionSchema);
