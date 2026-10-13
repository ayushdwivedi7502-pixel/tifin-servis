'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface BusinessSettings {
  businessName: string;
  tagline?: string;
  phone: string;
  whatsapp: string;
  address: string;
  deliveryHoursLunch: string;
  deliveryHoursDinner: string;
  serviceAreas: string[];
}

export function BusinessBanner() {
  const [b, setB] = useState<BusinessSettings | null>(null);
  useEffect(() => {
    api<BusinessSettings>('/api/settings/business').then(setB).catch(console.error);
  }, []);
  if (!b) return null;
  return (
    <section className="rounded-2xl bg-gradient-to-br from-brand-100 to-orange-50 p-6 md:p-10">
      <p className="text-xs uppercase tracking-wide text-brand-700">Configurable demo</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-900 md:text-4xl">{b.businessName}</h1>
      <p className="mt-2 max-w-2xl text-stone-700">{b.tagline}</p>
      <div className="mt-6 grid gap-2 text-sm text-stone-700 md:grid-cols-2">
        <p>📍 {b.address}</p>
        <p>📞 {b.phone} · WhatsApp {b.whatsapp}</p>
        <p>Lunch: {b.deliveryHoursLunch}</p>
        <p>Dinner: {b.deliveryHoursDinner}</p>
        <p className="md:col-span-2">Areas: {b.serviceAreas.join(', ')}</p>
      </div>
    </section>
  );
}
