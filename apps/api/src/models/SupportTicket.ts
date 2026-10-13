import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketMessage {
  from: 'customer' | 'admin';
  body: string;
  at: Date;
}

export interface ISupportTicket extends Document {
  userId: Types.ObjectId;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: ITicketMessage[];
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    from: { type: String, enum: ['customer', 'admin'], required: true },
    body: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: { type: [TicketMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
