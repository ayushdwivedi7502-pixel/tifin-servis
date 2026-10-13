import { Notification } from '../models/Notification';
import { Types } from 'mongoose';

export async function notifyUser(
  userId: Types.ObjectId,
  title: string,
  body: string
): Promise<void> {
  await Notification.create({
    userId,
    channel: 'in_app',
    title,
    body,
    delivered: true,
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV NOTIFICATION] user=${userId.toString()} | ${title}: ${body}`);
  }
}
