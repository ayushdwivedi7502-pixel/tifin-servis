import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { Subscription } from '../models/Subscription';
import { HolidayRequest } from '../models/HolidayRequest';
import { BusinessSettings } from '../models/BusinessSettings';
import { applyApprovedHoliday, validateHolidayRequest } from '../services/holidayService';
import { notifyUser } from '../services/notifications';

export const holidaysRouter = Router();

holidaysRouter.use(requireAuth);

holidaysRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const list = await HolidayRequest.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

holidaysRouter.post('/', validateBody(z.object({
  subscriptionId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.enum(['lunch', 'dinner'])).min(1),
})), async (req: AuthedRequest, res, next) => {
  try {
    const sub = await Subscription.findOne({
      _id: req.body.subscriptionId,
      userId: req.user!._id,
    });
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    await validateHolidayRequest(sub, req.body.date, req.body.slots);
    const settings = await BusinessSettings.findOne();
    const autoApprove = true;
    const hr = await HolidayRequest.create({
      userId: req.user!._id,
      subscriptionId: sub._id,
      date: req.body.date,
      slots: req.body.slots,
      status: autoApprove ? 'approved' : 'pending',
      creditPaise: settings?.holidayIssuesMealCredit ? 0 : 0,
    });
    if (autoApprove) {
      applyApprovedHoliday(
        sub,
        req.body.date,
        req.body.slots,
        settings?.pausedDaysExtendSubscription ?? true
      );
      await sub.save();
      await notifyUser(req.user!._id, 'Holiday approved', `Meals skipped for ${req.body.date}`);
    }
    res.status(201).json(hr);
  } catch (e) {
    next(e);
  }
});

holidaysRouter.delete('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const hr = await HolidayRequest.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!hr) return res.status(404).json({ error: 'Request not found' });
    if (hr.status !== 'pending') return res.status(400).json({ error: 'Cannot cancel this request' });
    hr.status = 'cancelled';
    await hr.save();
    res.json(hr);
  } catch (e) {
    next(e);
  }
});
