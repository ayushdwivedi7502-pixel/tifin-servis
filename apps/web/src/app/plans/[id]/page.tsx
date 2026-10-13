'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatINR } from '@tiffin/shared';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // default start date = tomorrow + 1 day
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dateStr = d.toISOString().split('T')[0];
    setStartDate(dateStr);

    api<any>(`/api/plans/${id}`).then((p: any) => {
      setPlan(p);
      loadQuoteForDate(dateStr, p._id);
    }).catch((e) => setError(e.message));
  }, [id]);

  async function loadQuoteForDate(dt: string, planIdVal: string) {
    if (!dt || !planIdVal) return;
    setCalculating(true);
    setError('');
    try {
      const q = await api('/api/subscriptions/quote', {
        method: 'POST',
        body: JSON.stringify({ planId: planIdVal, startDate: dt }),
      });
      setQuote(q);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCalculating(false);
    }
  }

  async function subscribe() {
    setSubscribing(true);
    setError('');
    try {
      const addresses = await api<any[]>('/api/addresses');
      let addressId = addresses[0]?._id;
      if (!addressId) {
        const created = await api('/api/addresses', {
          method: 'POST',
          body: JSON.stringify({
            label: 'Home/Hostel',
            line1: 'Wright Town, Jabalpur',
            pincode: '482001',
            isDefault: true,
          }),
        });
        addressId = (created as any)._id;
      }
      const sub = await api('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId: id, startDate, addressId }),
      });
      router.push(`/checkout/subscription/${(sub as any)._id}`);
    } catch (e: any) {
      setError(e.message);
      setSubscribing(false);
    }
  }

  if (!plan) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent"></div>
      </div>
    );
  }

  const foodItemsDisplay = plan.includedItems?.length > 0
    ? plan.includedItems.join(' + ')
    : '2 रोटी + सब्जी + दाल + चावल + सलाद + अचार';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumbs (Matches Panel 3) */}
      <nav className="flex items-center gap-2 text-sm text-stone-500 font-medium">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span>&gt;</span>
        <Link href="/plans" className="hover:text-emerald-700">Plans</Link>
        <span>&gt;</span>
        <span className="text-stone-900 font-bold">{plan.name}</span>
      </nav>

      {/* Main Split Card (Matches Panel 3) */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Food Thali Image */}
        <div className="lg:col-span-6 relative aspect-square lg:aspect-auto min-h-[340px] bg-stone-100">
          <Image
            src="/images/deluxe_thali.jpg"
            alt={plan.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
            🔥 Freshly Cooked Everyday
          </div>
        </div>

        {/* Right: Plan Info & Subscribe Flow */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {plan.name}
              </h1>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-800">
                  {formatINR(plan.pricePaise)}
                </span>
                <span className="text-sm font-semibold text-stone-500">
                  / {plan.durationType === 'monthly' ? 'माह' : plan.durationType === 'weekly' ? 'सप्ताह' : 'अवधि'}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                🍛 {plan.mealType?.replaceAll('_', ' ').toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                📅 30 Days Cycle
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                🚚 Mon - Sat (6 days/week)
              </span>
            </div>

            {/* Included Food Items Box */}
            <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80">
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                इसमें शामिल है:
              </h3>
              <p className="mt-1 text-sm font-bold text-stone-800">
                {foodItemsDisplay}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-stone-900">विशेषताएँ:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> घर जैसा स्वाद
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> ताजा और पौष्टिक भोजन
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> समय पर डिलीवरी
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">✓</span> जबलपुर शहर में उपलब्ध
                </li>
              </ul>
            </div>

            {/* Start Date & Advance Breakdown */}
            <div className="pt-2 space-y-3 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700">
                Select Subscription Start Date (जबलपुर कैलेंडर):
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    loadQuoteForDate(e.target.value, plan._id);
                  }}
                  className="mt-1 block w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm font-semibold text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none shadow-xs"
                />
              </label>

              {calculating ? (
                <div className="text-xs text-stone-500 animate-pulse">Calculating schedule...</div>
              ) : quote ? (
                <div className="rounded-xl bg-stone-50 p-3 text-xs space-y-1 border border-stone-200">
                  <div className="flex justify-between font-medium text-stone-600">
                    <span>End Date: <strong className="text-stone-900">{quote.endDate}</strong></span>
                    <span>Scheduled Meals: <strong className="text-stone-900">{quote.scheduledMeals}</strong></span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-stone-200">
                    <span>Advance Payable (Demo):</span>
                    <span>{quote.pricing?.display?.advance}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Action Button (Matches Panel 3) */}
          <div>
            {error && <p className="mb-3 text-xs font-semibold text-red-600">⚠️ {error}</p>}
            <button
              type="button"
              onClick={subscribe}
              disabled={subscribing}
              className="w-full rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white py-4 text-base font-extrabold shadow-lg shadow-emerald-800/30 transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50"
            >
              {subscribing ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
