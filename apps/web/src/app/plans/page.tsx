'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatINR } from '@tiffin/shared';

interface Plan {
  _id: string;
  name: string;
  description: string;
  pricePaise: number;
  mealType: string;
  durationType: string;
  includedItems: string[];
  advanceFixedPaise?: number;
  advancePercent?: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Plan[]>('/api/plans')
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          हमारे टिफिन प्लान
        </h1>
        <p className="text-base text-stone-600">
          शुद्ध, स्वच्छ और घर का बना खाना — आपकी पसंद, समय और बजट के अनुसार
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-sm text-red-700 text-center">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((p) => {
            const advanceDisplay = p.advanceFixedPaise
              ? `₹${(p.advanceFixedPaise / 100).toFixed(0)} advance`
              : p.advancePercent
              ? `${p.advancePercent}% advance`
              : 'Full advance';

            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-2xl transition-all flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <Image
                    src="/images/deluxe_thali.jpg"
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-900/90 backdrop-blur text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {p.durationType.toUpperCase()}
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-2xl font-bold text-stone-900 leading-tight">
                        {p.name}
                      </h2>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-emerald-800">
                        {formatINR(p.pricePaise)}
                      </span>
                      <span className="text-xs font-bold text-stone-500">
                        / {p.durationType === 'monthly' ? 'माह' : p.durationType === 'weekly' ? 'सप्ताह' : 'अवधि'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Included Items Pill Box */}
                    <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 text-xs">
                      <span className="font-bold text-amber-900 block mb-1">थाली में शामिल:</span>
                      <span className="text-stone-700 font-medium">
                        {p.includedItems?.length > 0 ? p.includedItems.join(' • ') : '4 रोटी • दाल • मौसमी सब्जी • चावल • सलाद'}
                      </span>
                    </div>

                    {/* Features & Policies */}
                    <div className="text-xs space-y-1.5 text-stone-600">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>Meal Type: <strong>{p.mealType.replaceAll('_', ' ').toUpperCase()}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>Advance Policy: <strong>{advanceDisplay}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>Holiday / Pause Allowed</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                    <Link
                      href={`/plans/${p._id}`}
                      className="w-full text-center rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/20"
                    >
                      Subscribe & Select Date →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
