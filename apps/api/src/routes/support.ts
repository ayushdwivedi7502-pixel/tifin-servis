import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { SupportTicket } from '../models/SupportTicket';

export const supportRouter = Router();

supportRouter.post('/contact', validateBody(z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  message: z.string().min(5),
})), async (req, res) => {
  console.log('[CONTACT FORM]', req.body);
  res.json({ message: 'Thank you. We will respond shortly (demo: logged on server).' });
});

supportRouter.use(requireAuth);

supportRouter.get('/tickets', async (req: AuthedRequest, res, next) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user!._id }).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (e) {
    next(e);
  }
});

supportRouter.post('/tickets', validateBody(z.object({
  subject: z.string().min(3),
  message: z.string().min(5),
})), async (req: AuthedRequest, res, next) => {
  try {
    const ticket = await SupportTicket.create({
      userId: req.user!._id,
      subject: req.body.subject,
      messages: [{ from: 'customer', body: req.body.message, at: new Date() }],
    });
    res.status(201).json(ticket);
  } catch (e) {
    next(e);
  }
});
