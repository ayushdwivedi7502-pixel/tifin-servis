import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { Order } from '../models/Order';
import { config } from '../config';
import { confirmMockPayment, mockCheckoutLabel } from '../services/payment/mockProvider';
import { generateReceiptNumber } from '../services/subscriptionService';
import { notifyUser } from '../services/notifications';

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) {
    next(e);
  }
});

paymentsRouter.post('/initiate', validateBody(z.object({
  subscriptionId: z.string().optional(),
  orderId: z.string().optional(),
  purpose: z.enum(['subscription_advance', 'subscription_balance', 'order', 'addon']),
  amountPaise: z.number().int().positive(),
  idempotencyKey: z.string().min(8),
})), async (req: AuthedRequest, res, next) => {
  try {
    const existing = await Payment.findOne({ idempotencyKey: req.body.idempotencyKey });
    if (existing) {
      return res.json({ payment: existing, demoLabel: mockCheckoutLabel() });
    }
    if (req.body.subscriptionId) {
      const sub = await Subscription.findOne({
        _id: req.body.subscriptionId,
        userId: req.user!._id,
      });
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      if (req.body.purpose === 'subscription_advance' && req.body.amountPaise !== sub.advanceRequiredPaise) {
        return res.status(400).json({ error: 'Invalid advance amount' });
      }
    }
    if (req.body.orderId) {
      const order = await Order.findOne({ _id: req.body.orderId, userId: req.user!._id });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (req.body.amountPaise !== order.totalPaise) {
        return res.status(400).json({ error: 'Amount mismatch' });
      }
    }
    const payment = await Payment.create({
      userId: req.user!._id,
      subscriptionId: req.body.subscriptionId,
      orderId: req.body.orderId,
      amountPaise: req.body.amountPaise,
      status: 'pending',
      provider: config.paymentProvider,
      idempotencyKey: req.body.idempotencyKey,
      purpose: req.body.purpose,
      receiptNumber: generateReceiptNumber(),
    });
    res.status(201).json({
      payment,
      demoLabel: mockCheckoutLabel(),
      instructions: config.paymentProvider === 'mock'
        ? 'Use POST /api/payments/mock/confirm with simulateSuccess true/false'
        : 'Complete payment via Razorpay checkout',
    });
  } catch (e) {
    next(e);
  }
});

paymentsRouter.post('/mock/confirm', validateBody(z.object({
  paymentId: z.string(),
  simulateSuccess: z.boolean(),
})), async (req: AuthedRequest, res, next) => {
  try {
    if (config.paymentProvider !== 'mock') {
      return res.status(400).json({ error: 'Mock provider not active' });
    }
    const executePaymentConfirmation = async (session?: mongoose.ClientSession) => {
      const payment = await Payment.findOne({
        _id: req.body.paymentId,
        userId: req.user!._id,
      }).session(session ?? null);
      if (!payment) {
        return { error: 'Payment not found', status: 404 };
      }
      const result = await confirmMockPayment(payment, req.body.simulateSuccess);
      if (result.success) {
        if (payment.subscriptionId && payment.purpose === 'subscription_advance') {
          const sub = await Subscription.findById(payment.subscriptionId).session(session ?? null);
          if (sub && sub.status === 'pending_payment') {
            sub.paidPaise += payment.amountPaise;
            sub.outstandingPaise = Math.max(0, sub.totalPricePaise - sub.paidPaise);
            sub.status = 'active';
            await sub.save({ session });
          }
        }
        if (payment.orderId) {
          const order = await Order.findById(payment.orderId).session(session ?? null);
          if (order && order.status === 'pending_payment') {
            order.status = 'payment_verified';
            await order.save({ session });
          }
        }
        await notifyUser(req.user!._id, 'Payment verified (DEMO)', `Receipt ${payment.receiptNumber}`);
      }
      return { success: result.success, payment, demo: true, status: 200 };
    };

    let session: mongoose.ClientSession | undefined;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      const outcome = await executePaymentConfirmation(session);
      await session.commitTransaction();
      return res.status(outcome.status).json(outcome);
    } catch (err: any) {
      if (session) {
        await session.abortTransaction().catch(() => {});
        session.endSession();
        session = undefined;
      }
      if (err?.message?.includes('Transaction numbers are only allowed') || err?.code === 20) {
        // Fallback for standalone MongoDB
        const outcome = await executePaymentConfirmation(undefined);
        return res.status(outcome.status).json(outcome);
      }
      throw err;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  } catch (e) {
    next(e);
  }
});

paymentsRouter.get('/:id/receipt', async (req: AuthedRequest, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({
      receiptNumber: payment.receiptNumber,
      amountPaise: payment.amountPaise,
      status: payment.status,
      createdAt: payment.createdAt,
      provider: payment.provider,
      demo: payment.provider === 'mock',
    });
  } catch (e) {
    next(e);
  }
});
