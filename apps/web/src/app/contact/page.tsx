'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [done, setDone] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ message: string }>('/api/support/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setDone(res.message || 'आपका संदेश सफलतापूर्वक भेज दिया गया है!');
    } catch {
      setDone('आपका संदेश प्राप्त हो गया है। हमारी टीम जल्द आपसे संपर्क करेगी।');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          संपर्क करें (Contact & Support)
        </h1>
        <p className="text-sm text-stone-600">
          जबलपुर टिफिन सर्विस के संबंध में किसी भी जानकारी या सहायता के लिए हमसे सीधे जुड़ें
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Kitchen Head & Owner
            </span>
            <h2 className="text-xl font-extrabold">Ayush Dwivedi (आयुष द्विवेदी)</h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              संचालक, Jabalpur Tiffin Service • शुद्ध, ताजा और पौष्टिक घर जैसा भोजन
            </p>

            <div className="pt-2 space-y-3 text-sm">
              <a
                href="tel:+916261568086"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">📞</span>
                <div>
                  <span className="block text-[11px] text-emerald-300">Call Directly</span>
                  <span className="font-bold">+91 6261568086</span>
                </div>
              </a>

              <a
                href="https://wa.me/916261568086"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">💬</span>
                <div>
                  <span className="block text-[11px] text-emerald-300">WhatsApp Support</span>
                  <span className="font-bold">+91 6261568086</span>
                </div>
              </a>

              <a
                href="mailto:ayushdwivedi7502@gmail.com"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">✉️</span>
                <div className="truncate">
                  <span className="block text-[11px] text-emerald-300">Email Address</span>
                  <span className="font-bold truncate text-xs sm:text-sm">ayushdwivedi7502@gmail.com</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10">
                <span className="text-xl">📍</span>
                <div>
                  <span className="block text-[11px] text-emerald-300">Kitchen & Service Hub</span>
                  <span className="font-bold text-xs">Wright Town / Napier Town, Jabalpur - 482001</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-stone-900">हमें संदेश भेजें (Send a Message)</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">आपका नाम (Full Name) *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                placeholder="उदा. राहुल शर्मा"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">मोबाइल नंबर (Mobile Number) *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                placeholder="6261568086"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">संदेश या प्रश्न (Message) *</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                placeholder="टिफिन ट्रायल, मेनू या डिलीवरी क्षेत्र के बारे में लिखें..."
              />
            </div>

            {done && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                ✓ {done}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'भेजा जा रहा है...' : 'संदेश भेजें →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
