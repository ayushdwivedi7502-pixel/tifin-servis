import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { Plan } from '../models/Plan';
import { Address } from '../models/Address';
import { Subscription } from '../models/Subscription';
import { buildSubscriptionDraft, calculateSubscriptionPricing } from '../services/subscriptionService';
import { countScheduledMeals, formatINR } from '@tiffin/shared';

export const subscriptionsRouter = Router();

subscriptionsRouter.use(requireAuth);

subscriptionsRouter.post('/quote', validateBody(z.object({
  planId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})), async (req: AuthedRequest, res, next) => {
  try {
    const plan = await Plan.findById(req.body.planId);
    if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found' });
    const draft = await buildSubscriptionDraft(plan, req.body.startDate);
    const mealCount = countScheduledMeals(
      draft.mealSchedule.map((m) => ({
        date: m.date,
        slots: [m.slot],
        status: m.status,
      }))
    );
    res.json({
      startDate: draft.startDate,
      endDate: draft.endDate,
      scheduledMeals: mealCount,
      pricing: {
        ...draft.pricing,
        display: {
          total: formatINR(draft.pricing.totalPricePaise),
          advance: formatINR(draft.pricing.advanceRequiredPaise),
          outstanding: formatINR(draft.pricing.outstandingPaise),
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

subscriptionsRouter.post('/', validateBody(z.object({
  planId: z.string(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  addressId: z.string(),
})), async (req: AuthedRequest, res, next) => {
  try {
    const plan = await Plan.findById(req.body.planId);
    if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found' });
    const address = await Address.findOne({ _id: req.body.addressId, userId: req.user!._id });
    if (!address) return res.status(404).json({ error: 'Address not found' });
    const draft = await buildSubscriptionDraft(plan, req.body.startDate);
    const sub = await Subscription.create({
      userId: req.user!._id,
      planId: plan._id,
      addressId: address._id,
      status: 'pending_payment',
      startDate: draft.startDate,
      endDate: draft.endDate,
      totalPricePaise: draft.pricing.totalPricePaise,
      discountPaise: draft.pricing.discountPaise,
      advanceRequiredPaise: draft.pricing.advanceRequiredPaise,
      paidPaise: 0,
      outstandingPaise: draft.pricing.outstandingPaise,
      mealSchedule: draft.mealSchedule,
      reference: draft.reference,
    });
    res.status(201).json(sub);
  } catch (e) {
    next(e);
  }
});

subscriptionsRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const list = await Subscription.find({ userId: req.user!._id })
      .populate('planId')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

subscriptionsRouter.get('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user!._id }).populate('planId');
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json(sub);
  } catch (e) {
    next(e);
  }
});
