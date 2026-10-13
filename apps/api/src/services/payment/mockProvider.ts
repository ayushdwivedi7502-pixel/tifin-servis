import { Payment, IPayment } from '../../models/Payment';

export interface MockConfirmResult {
  success: boolean;
  providerPaymentId?: string;
}

/** DEMO mock payment — not a real payment. */
export async function confirmMockPayment(
  payment: IPayment,
  simulateSuccess: boolean
): Promise<MockConfirmResult> {
  if (payment.provider !== 'mock') {
    throw new Error('Invalid provider');
  }
  if (payment.status === 'success') {
    return { success: true, providerPaymentId: payment.providerPaymentId };
  }
  if (!simulateSuccess) {
    payment.status = 'failed';
    await payment.save();
    return { success: false };
  }
  payment.status = 'success';
  payment.providerPaymentId = `mock_pay_${payment._id.toString()}`;
  await payment.save();
  return { success: true, providerPaymentId: payment.providerPaymentId };
}

export function mockCheckoutLabel(): string {
  return 'DEMO — Mock Payment (not real money)';
}
