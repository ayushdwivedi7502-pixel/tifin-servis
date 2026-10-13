import { Router } from 'express';
import { Plan } from '../models/Plan';
import { AddOn } from '../models/AddOn';

export const plansRouter = Router();

plansRouter.get('/', async (_req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ pricePaise: 1 });
    res.json(plans);
  } catch (e) {
    next(e);
  }
});

plansRouter.get('/addons', async (_req, res, next) => {
  try {
    const addons = await AddOn.find({ isAvailable: true });
    res.json(addons);
  } catch (e) {
    next(e);
  }
});

plansRouter.get('/:id', async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (e) {
    next(e);
  }
});
