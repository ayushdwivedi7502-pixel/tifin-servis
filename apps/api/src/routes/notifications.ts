import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const list = await Notification.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50);
    res.json(list);
  } catch (e) {
    next(e);
  }
});

notificationsRouter.patch('/:id/read', async (req: AuthedRequest, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json(n);
  } catch (e) {
    next(e);
  }
});
