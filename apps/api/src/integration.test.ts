import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app';
import { connectDb, disconnectDb } from './db';
import { User } from './models/User';
import { Plan } from './models/Plan';
import { Subscription } from './models/Subscription';
import bcrypt from 'bcryptjs';
import { createOtp } from './services/otp';
import { config } from './config';
import { addDaysIST, toISTDateString } from '@tiffin/shared';

const app = createApp();

describe('API integration', () => {
  let customerToken = '';
  let adminToken = '';
  let customerId = '';
  let otherToken = '';
  let planId = '';
  let addressId = '';
  let subscriptionId = '';
  let paymentId = '';
  const phone = '9876543210';
  const phone2 = '9876543211';

  beforeAll(async () => {
    await connectDb();
    await User.deleteMany({ phone: { $in: [phone, phone2, config.seed.adminPhone.replace(/\D/g, '').slice(-10)] } });
    await createOtp(phone, 'register');
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        phone,
        password: 'TestPass123!',
        otp: config.devOtpStatic,
      });
    expect(reg.status).toBe(201);
    customerToken = reg.body.accessToken;
    customerId = reg.body.user.id;

    await createOtp(phone2, 'register');
    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Other User',
        phone: phone2,
        password: 'TestPass123!',
        otp: config.devOtpStatic,
      });
    otherToken = reg2.body.accessToken;

    const adminPhone = config.seed.adminPhone.replace(/\D/g, '').slice(-10);
    let admin = await User.findOne({ role: 'admin', phone: adminPhone });
    if (!admin) {
      admin = await User.create({
        role: 'admin',
        fullName: 'Test Admin',
        phone: adminPhone,
        email: 'admin-test@demo.local',
        passwordHash: await bcrypt.hash(config.seed.adminPassword, 12),
      });
    }
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ phone: adminPhone, password: config.seed.adminPassword });
    adminToken = adminLogin.body.accessToken;

    const plan = await Plan.findOne({ isActive: true });
    planId = plan?._id.toString() ?? '';
    if (!planId) {
      const p = await Plan.create({
        name: 'Test Plan',
        description: 'Test',
        mealType: 'lunch_only',
        pricePaise: 300000,
        durationType: 'monthly',
        advanceFixedPaise: 50000,
        isActive: true,
      });
      planId = p._id.toString();
    }
  }, 60000);

  afterAll(async () => {
    await disconnectDb();
  });

  it('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('connected');
  });

  it('rejects invalid login', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('customer cannot access another profile via subscriptions', async () => {
    const addr = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        label: 'Home',
        line1: '123 Test Street',
        pincode: '482001',
      });
    addressId = addr.body._id;

    const sub = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        planId,
        startDate: addDaysIST(toISTDateString(new Date()), 3),
        addressId,
      });
    expect(sub.status).toBe(201);
    subscriptionId = sub.body._id;

    const peek = await request(app)
      .get(`/api/subscriptions/${subscriptionId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(peek.status).toBe(404);
  });

  it('quote calculates advance and end date', async () => {
    const start = addDaysIST(toISTDateString(new Date()), 4);
    const quote = await request(app)
      .post('/api/subscriptions/quote')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ planId, startDate: start });
    expect(quote.status).toBe(200);
    expect(quote.body.endDate).toBeTruthy();
    expect(quote.body.scheduledMeals).toBeGreaterThan(0);
    expect(quote.body.pricing.advanceRequiredPaise).toBeGreaterThan(0);
  });

  it('failed mock payment does not activate subscription', async () => {
    const sub = await Subscription.findById(subscriptionId);
    sub!.status = 'pending_payment';
    sub!.paidPaise = 0;
    await sub!.save();

    const pay = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subscriptionId,
        purpose: 'subscription_advance',
        amountPaise: sub!.advanceRequiredPaise,
        idempotencyKey: `test-fail-${Date.now()}`,
      });
    paymentId = pay.body.payment._id;
    const confirm = await request(app)
      .post('/api/payments/mock/confirm')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentId, simulateSuccess: false });
    expect(confirm.body.success).toBe(false);
    const updated = await Subscription.findById(subscriptionId);
    expect(updated!.status).toBe('pending_payment');
  });

  it('successful mock payment activates subscription', async () => {
    const sub = await Subscription.findById(subscriptionId);
    const pay = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subscriptionId,
        purpose: 'subscription_advance',
        amountPaise: sub!.advanceRequiredPaise,
        idempotencyKey: `test-ok-${Date.now()}`,
      });
    const confirm = await request(app)
      .post('/api/payments/mock/confirm')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentId: pay.body.payment._id, simulateSuccess: true });
    expect(confirm.body.success).toBe(true);
    const updated = await Subscription.findById(subscriptionId);
    expect(updated!.status).toBe('active');
  });

  it('duplicate idempotency returns same payment', async () => {
    const key = `dup-${Date.now()}`;
    const sub = await Subscription.findById(subscriptionId);
    const p1 = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subscriptionId,
        purpose: 'subscription_balance',
        amountPaise: 100,
        idempotencyKey: key,
      });
    const p2 = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subscriptionId,
        purpose: 'subscription_balance',
        amountPaise: 100,
        idempotencyKey: key,
      });
    expect(p1.body.payment._id).toBe(p2.body.payment._id);
  });

  it('admin only routes', async () => {
    const denied = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(denied.status).toBe(403);
    const ok = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(ok.status).toBe(200);
  });
});
