import mongoose from 'mongoose';
import { config } from './config';

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongodbUri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}

export function dbReadyState(): number {
  return mongoose.connection.readyState;
}
