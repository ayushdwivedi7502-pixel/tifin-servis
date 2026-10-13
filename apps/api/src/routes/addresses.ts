import { Router } from 'express';
import { z } from 'zod';
import { Address } from '../models/Address';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BusinessSettings } from '../models/BusinessSettings';

export const addressesRouter = Router();

addressesRouter.use(requireAuth);

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().default('Jabalpur'),
  state: z.string().default('Madhya Pradesh'),
  pincode: z.string().length(6),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

addressesRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const list = await Address.find({ userId: req.user!._id }).sort({ isDefault: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

addressesRouter.post('/', validateBody(addressSchema), async (req: AuthedRequest, res, next) => {
  try {
    const settings = await BusinessSettings.findOne();
    const allowed = settings?.servicePincodes ?? [];
    if (allowed.length && !allowed.includes(req.body.pincode)) {
      return res.status(400).json({ error: 'Pincode not in service area' });
    }
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user!._id }, { isDefault: false });
    }
    const addr = await Address.create({ ...req.body, userId: req.user!._id });
    res.status(201).json(addr);
  } catch (e) {
    next(e);
  }
});

addressesRouter.patch('/:id', validateBody(addressSchema.partial()), async (req: AuthedRequest, res, next) => {
  try {
    const addr = await Address.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    Object.assign(addr, req.body);
    await addr.save();
    res.json(addr);
  } catch (e) {
    next(e);
  }
});

addressesRouter.delete('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const result = await Address.deleteOne({ _id: req.params.id, userId: req.user!._id });
    if (!result.deletedCount) return res.status(404).json({ error: 'Address not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
