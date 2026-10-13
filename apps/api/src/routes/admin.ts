import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { AddOn } from '../models/AddOn';
import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { BusinessSettings } from '../models/BusinessSettings';
import { SupportTicket } from '../models/SupportTicket';
import { HolidayRequest } from '../models/HolidayRequest';
import { logAudit } from '../services/audit';
import { buildKitchenList, todayIST } from '../services/kitchenService';
import { formatINR } from '@tiffin/shared';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const today = todayIST();
    const [
      customers,
      activeSubs,
      lunchOrders,
      dinnerOrders,
      pendingOrders,
      deliveredToday,
      pendingPayments,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Subscription.countDocuments({ status: 'active' }),
      Order.countDocuments({ deliveryDate: today, mealSlot: 'lunch', status: { $ne: 'cancelled' } }),
      Order.countDocuments({ deliveryDate: today, mealSlot: 'dinner', status: { $ne: 'cancelled' } }),
      Order.countDocuments({ status: { $in: ['pending_payment', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ deliveryDate: today, status: 'delivered' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } },
      ]),
    ]);
    res.json({
      customers,
      activeSubscriptions: activeSubs,
      todayLunchOrders: lunchOrders,
      todayDinnerOrders: dinnerOrders,
      pendingOrders,
      deliveredToday,
      pendingPayments,
      revenuePaise: revenueAgg[0]?.total ?? 0,
      revenueDisplay: formatINR(revenueAgg[0]?.total ?? 0),
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/customers', async (req, res, next) => {
  try {
    const q = (req.query.q as string)?.trim();
    const filter = q
      ? { role: 'customer', $or: [{ fullName: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }] }
      : { role: 'customer' };
    const customers = await User.find(filter).limit(100).sort({ createdAt: -1 });
    res.json(customers);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/customers/:id/disable', async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    user.isDisabled = true;
    await user.save();
    await logAudit(req.user!._id, 'disable_customer', 'User', user._id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Full User Management (Customers & Workers)
adminRouter.get('/users', async (req, res, next) => {
  try {
    const role = req.query.role as string;
    const q = (req.query.q as string)?.trim();
    const filter: any = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { fullName: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(users);
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [orders, subscriptions] = await Promise.all([
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(30),
      Subscription.find({ userId: user._id }).populate('planId').sort({ createdAt: -1 }),
    ]);
    res.json({ user, orders, subscriptions });
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/users', validateBody(z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  role: z.enum(['customer', 'worker', 'admin']),
  password: z.string().min(6),
})), async (req: AuthedRequest, res, next) => {
  try {
    const existing = await User.findOne({ phone: req.body.phone });
    if (existing) return res.status(409).json({ error: 'Mobile number already registered' });
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email || undefined,
      role: req.body.role,
      passwordHash,
    });
    await logAudit(req.user!._id, 'create_user', 'User', user._id);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/users/:id', validateBody(z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  role: z.enum(['customer', 'worker', 'admin']).optional(),
  isDisabled: z.boolean().optional(),
  password: z.string().min(6).optional(),
})), async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isDisabled !== undefined) user.isDisabled = req.body.isDisabled;
    if (req.body.password) {
      user.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    await user.save();
    await logAudit(req.user!._id, 'update_user', 'User', user._id);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

adminRouter.delete('/users/:id', async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await logAudit(req.user!._id, 'delete_user', 'User', user._id);
    res.json({ ok: true, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
});

const planSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  includedItems: z.array(z.string()).optional(),
  mealType: z.enum(['single_meal', 'lunch_only', 'dinner_only', 'lunch_and_dinner']),
  pricePaise: z.number().int().positive(),
  durationType: z.enum(['weekly', 'monthly', 'custom_days', 'annual']),
  durationDays: z.number().int().optional(),
  deliverOnWeekdaysOnly: z.boolean().optional(),
  servicePincodes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isTrial: z.boolean().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  advanceFixedPaise: z.number().int().optional(),
  advancePercent: z.number().min(0).max(100).optional(),
});

adminRouter.get('/plans', async (_req, res, next) => {
  try {
    res.json(await Plan.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/plans', validateBody(planSchema), async (req: AuthedRequest, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    await logAudit(req.user!._id, 'create_plan', 'Plan', plan._id);
    res.status(201).json(plan);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/plans/:id', validateBody(planSchema.partial()), async (req: AuthedRequest, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await logAudit(req.user!._id, 'update_plan', 'Plan', plan._id);
    res.json(plan);
  } catch (e) {
    next(e);
  }
});

adminRouter.delete('/plans/:id', async (req: AuthedRequest, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    await logAudit(req.user!._id, 'delete_plan', 'Plan', plan._id);
    res.json({ ok: true, message: 'Plan deleted' });
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/addons', async (_req, res, next) => {
  try {
    res.json(await AddOn.find());
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/addons', validateBody(z.object({
  name: z.string(),
  description: z.string().optional(),
  pricePaise: z.number().int().positive(),
  mealSlots: z.array(z.enum(['lunch', 'dinner'])).optional(),
  maxQuantityPerOrder: z.number().int().optional(),
})), async (req: AuthedRequest, res, next) => {
  try {
    const addon = await AddOn.create(req.body);
    await logAudit(req.user!._id, 'create_addon', 'AddOn', addon._id);
    res.status(201).json(addon);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/addons/:id', async (req: AuthedRequest, res, next) => {
  try {
    const addon = await AddOn.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!addon) return res.status(404).json({ error: 'Addon not found' });
    await logAudit(req.user!._id, 'update_addon', 'AddOn', addon._id);
    res.json(addon);
  } catch (e) {
    next(e);
  }
});

adminRouter.delete('/addons/:id', async (req: AuthedRequest, res, next) => {
  try {
    const addon = await AddOn.findByIdAndDelete(req.params.id);
    if (!addon) return res.status(404).json({ error: 'Addon not found' });
    await logAudit(req.user!._id, 'delete_addon', 'AddOn', addon._id);
    res.json({ ok: true, message: 'Addon deleted' });
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/subscriptions', async (_req, res, next) => {
  try {
    const subs = await Subscription.find().populate('userId planId').sort({ createdAt: -1 }).limit(200);
    res.json(subs);
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/orders', async (_req, res, next) => {
  try {
    res.json(await Order.find().populate('userId').sort({ createdAt: -1 }).limit(200));
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/orders/:id/status', validateBody(z.object({
  status: z.enum([
    'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'failed_delivery',
  ]),
})), async (req: AuthedRequest, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = req.body.status;
    await order.save();
    await logAudit(req.user!._id, 'update_order_status', 'Order', order._id, { status: req.body.status });
    res.json(order);
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/payments', async (_req, res, next) => {
  try {
    res.json(await Payment.find().sort({ createdAt: -1 }).limit(500));
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/kitchen', async (req, res, next) => {
  try {
    const date = (req.query.date as string) || todayIST();
    const slot = (req.query.slot as 'lunch' | 'dinner') || 'lunch';
    const lines = await buildKitchenList(date, slot);
    res.json({ date, slot, lines, totalItems: lines.reduce((s, l) => s + l.quantity, 0) });
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/holidays', async (_req, res, next) => {
  try {
    res.json(await HolidayRequest.find().populate('userId subscriptionId').sort({ createdAt: -1 }).limit(200));
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/support', async (_req, res, next) => {
  try {
    res.json(await SupportTicket.find().populate('userId').sort({ updatedAt: -1 }));
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/support/:id/reply', validateBody(z.object({ message: z.string().min(1) })), async (req: AuthedRequest, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.messages.push({ from: 'admin', body: req.body.message, at: new Date() });
    ticket.status = 'in_progress';
    await ticket.save();
    res.json(ticket);
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/settings', async (_req, res, next) => {
  try {
    let s = await BusinessSettings.findOne();
    if (!s) s = await BusinessSettings.create({});
    res.json(s);
  } catch (e) {
    next(e);
  }
});

adminRouter.patch('/settings', validateBody(z.object({
  businessName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  servicePincodes: z.array(z.string()).optional(),
  holidayCutoffTime: z.string().optional(),
  pausedDaysExtendSubscription: z.boolean().optional(),
}).passthrough()), async (req: AuthedRequest, res, next) => {
  try {
    let s = await BusinessSettings.findOne();
    if (!s) s = await BusinessSettings.create({});
    Object.assign(s, req.body);
    await s.save();
    await logAudit(req.user!._id, 'update_settings', 'BusinessSettings', s._id);
    res.json(s);
  } catch (e) {
    next(e);
  }
});
