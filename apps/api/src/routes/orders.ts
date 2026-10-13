import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AddOn } from '../models/AddOn';
import { Address } from '../models/Address';
import { Order } from '../models/Order';
import { compareDateStrings, toISTDateString } from '@tiffin/shared';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const filter = (req.user!.role === 'admin' || req.user!.role === 'worker') ? {} : { userId: req.user!._id };
    const orders = await Order.find(filter).populate('userId addressId').sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

ordersRouter.patch('/:id/status', async (req: AuthedRequest, res, next) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'worker') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (e) {
    next(e);
  }
});

ordersRouter.post('/addon', validateBody(z.object({
  addressId: z.string(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealSlot: z.enum(['lunch', 'dinner']),
  items: z.array(z.object({ addOnId: z.string(), quantity: z.number().int().min(1) })).min(1),
})), async (req: AuthedRequest, res, next) => {
  try {
    const today = toISTDateString(new Date());
    if (compareDateStrings(req.body.deliveryDate, today) < 0) {
      return res.status(400).json({ error: 'Delivery date must be today or later' });
    }
    const address = await Address.findOne({ _id: req.body.addressId, userId: req.user!._id });
    if (!address) return res.status(404).json({ error: 'Address not found' });
    let totalPaise = 0;
    const orderItems = [];
    for (const line of req.body.items) {
      const addon = await AddOn.findById(line.addOnId);
      if (!addon || !addon.isAvailable) return res.status(400).json({ error: 'Add-on unavailable' });
      if (!addon.mealSlots.includes(req.body.mealSlot)) {
        return res.status(400).json({ error: `${addon.name} not available for ${req.body.mealSlot}` });
      }
      if (line.quantity > addon.maxQuantityPerOrder) {
        return res.status(400).json({ error: 'Quantity exceeds limit' });
      }
      totalPaise += addon.pricePaise * line.quantity;
      orderItems.push({
        addOnId: addon._id,
        name: addon.name,
        quantity: line.quantity,
        unitPricePaise: addon.pricePaise,
        mealSlot: req.body.mealSlot,
      });
    }
    const order = await Order.create({
      userId: req.user!._id,
      addressId: address._id,
      deliveryDate: req.body.deliveryDate,
      mealSlot: req.body.mealSlot,
      items: orderItems,
      totalPaise,
      status: 'pending_payment',
      reference: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
    });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

ordersRouter.get('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e) {
    next(e);
  }
});
