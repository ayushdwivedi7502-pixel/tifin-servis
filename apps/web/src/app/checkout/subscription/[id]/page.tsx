'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatINR } from '@tiffin/shared';

export default function SubscriptionCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api(`/api/subscriptions/${id}`).then(setSub).catch(() => (window.location.href = '/login'));
  }, [id]);

  async function pay(simulateSuccess: boolean) {
    const key = `web-${id}-${Date.now()}`;
    const init = await api<any>('/api/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        subscriptionId: id,
        purpose: 'subscription_advance',
        amountPaise: sub.advanceRequiredPaise,
        idempotencyKey: key,
      }),
    });
    const result = await api<any>('/api/payments/mock/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId: init.payment._id, simulateSuccess }),
    });
    setMsg(result.success ? 'Payment verified (DEMO). Subscription activated.' : 'Payment failed (DEMO). Subscription not activated.');
    const updated = await api(`/api/subscriptions/${id}`);
    setSub(updated);
  }

  if (!sub) return <div className="p-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-3 text-sm font-medium text-amber-900">
        DEMO — Mock Payment (not real money)
      </div>
      <h1 className="mt-6 text-2xl font-bold">Checkout</h1>
      <p className="mt-2 text-sm">Reference: {sub.reference}</p>
      <p className="mt-4">Advance due: {formatINR(sub.advanceRequiredPaise)}</p>
      <p>Outstanding balance: {formatINR(sub.outstandingPaise)}</p>
      <p className="mt-2 text-sm text-stone-600">Status: {sub.status}</p>
      <div className="mt-6 flex gap-3">
        <button type="button" className="rounded bg-green-600 px-4 py-2 text-white" onClick={() => pay(true)}>
          Simulate success
        </button>
        <button type="button" className="rounded bg-red-600 px-4 py-2 text-white" onClick={() => pay(false)}>
          Simulate failure
        </button>
      </div>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
