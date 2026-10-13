import { Router } from 'express';
import { BusinessSettings } from '../models/BusinessSettings';

export const settingsRouter = Router();

settingsRouter.get('/business', async (_req, res, next) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }
    res.json(settings);
  } catch (e) {
    next(e);
  }
});
