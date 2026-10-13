'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatINR } from '@tiffin/shared';

type TabType =
  | 'dashboard'
  | 'subscription'
  | 'calendar'
  | 'orders'
  | 'payments'
  | 'profile'
  | 'extra'
  | 'holidays'
  | 'support'
  | 'settings';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

  // Holiday Request State
  const [holidayDate, setHolidayDate] = useState('');
  const [holidaySlot, setHolidaySlot] = useState('both');
  const [holidayReason, setHolidayReason] = useState('');
  const [submittingHoliday, setSubmittingHoliday] = useState(false);
  const [holidaySuccess, setHolidaySuccess] = useState('');

  // Extra Food Ordering State
  const [extraItem, setExtraItem] = useState('Extra Roti (4 pcs)');
  const [extraDate, setExtraDate] = useState('');
  const [extraSlot, setExtraSlot] = useState('lunch');
  const [submittingExtra, setSubmittingExtra] = useState(false);

  useEffect(() => {
    // Tomorrow as default date for pause
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setHolidayDate(d.toISOString().split('T')[0]);
    setExtraDate(d.toISOString().split('T')[0]);

    Promise.all([
      api('/api/auth/me').catch(() => null),
      api<any[]>('/api/subscriptions').catch(() => []),
      api<any[]>('/api/orders').catch(() => []),
      api<any[]>('/api/payments').catch(() => []),
      api<any[]>('/api/holidays').catch(() => []),
      api<any[]>('/api/addresses').catch(() => []),
    ])
      .then(([u, s, o, p, h, a]) => {
        if (!u) {
          window.location.href = '/login';
          return;
        }
        setUser(u);
        setSubs(s);
        setOrders(o);
        setPayments(p);
        setHolidays(h);
        setAddresses(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleHolidaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSub) {
      setError('No active subscription found to request holiday for.');
      return;
    }
    setSubmittingHoliday(true);
    setError('');
    setHolidaySuccess('');
    try {
      await api('/api/holidays', {
        method: 'POST',
        body: JSON.stringify({
          subscriptionId: activeSub._id,
          dates: [holidayDate],
          mealSlot: holidaySlot,
          reason: holidayReason || 'Personal leave',
        }),
      });
      setHolidaySuccess(`Holiday pause requested for ${holidayDate}! Meal schedule adjusted.`);
      const updatedH = await api<any[]>('/api/holidays');
      setHolidays(updatedH);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingHoliday(false);
    }
  }

  async function handleExtraOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingExtra(true);
    setError('');
    try {
      let addrId = addresses[0]?._id;
      if (!addrId) {
        const created = await api('/api/addresses', {
          method: 'POST',
          body: JSON.stringify({
            label: 'Home/Hostel',
            line1: 'Wright Town, Jabalpur',
            pincode: '482001',
            isDefault: true,
          }),
        });
        addrId = (created as any)._id;
      }
      await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          deliveryDate: extraDate,
          mealSlot: extraSlot,
          addressId: addrId,
          items: [{ name: extraItem, quantity: 1, unitPricePaise: 4000 }],
        }),
      });
      const o = await api<any[]>('/api/orders');
      setOrders(o);
      alert('Extra food order placed successfully!');
      setActiveTab('orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingExtra(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent"></div>
      </div>
    );
  }

  const activeSub = subs.find((s) => s.status === 'active' || s.status === 'pending_payment') || subs[0];

  const filteredOrders = orderFilter === 'All'
    ? orders
    : orders.filter((o) => o.mealSlot?.toLowerCase() === orderFilter.toLowerCase() || (orderFilter === 'Extra' && o.items?.length > 0));

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'subscription', label: 'My Subscription', icon: '🍛' },
    { id: 'calendar', label: 'Subscription Calendar', icon: '📅' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'payments', label: 'Payment History', icon: '💳' },
    { id: 'profile', label: 'Profile & Address', icon: '👤' },
    { id: 'extra', label: 'Extra Tiffin', icon: '➕' },
    { id: 'holidays', label: 'Holiday Management', icon: '⏸️' },
    { id: 'support', label: 'Support', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation (Matches Panels 4, 5, 6) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sticky top-24">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-stone-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white font-bold text-lg shadow-sm">
              {(user?.fullName?.[0] || 'U').toUpperCase()}
            </div>
            <div className="truncate">
              <span className="block text-sm font-bold text-stone-900 truncate">{user?.fullName || 'Customer'}</span>
              <span className="block text-xs text-stone-500 font-mono">#JTS{user?._id?.slice(-5).toUpperCase() || '00123'}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Greeting Header */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">
                नमस्ते, {user?.fullName || 'Customer'}
              </h1>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Customer ID: #JTS{user?._id?.slice(-6).toUpperCase() || '00123'} • Jabalpur Service Hub
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                + Order Add-ons
              </Link>
              <Link
                href="/plans"
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-sm"
              >
                Renew Plan
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* TAB 1: MAIN DASHBOARD (Matches Panel 4) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 3 Highlight Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Active Subscription */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Subscription</span>
                    <h3 className="text-lg font-extrabold text-stone-900 mt-2">
                      {activeSub?.planId?.name || 'Monthly Plan (Demo)'}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {activeSub?.startDate || '22 Apr 2025'} – {activeSub?.endDate || '21 May 2025'}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('calendar')}
                      className="w-full rounded-xl bg-emerald-800 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Card 2: Today's Orders */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today&apos;s Orders</span>
                    <h3 className="text-lg font-extrabold text-stone-900 mt-2">
                      Lunch + Dinner
                    </h3>
                    <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                      Delivering (12:30 PM & 8:00 PM)
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="w-full rounded-xl bg-stone-900 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                    >
                      Track Order
                    </button>
                  </div>
                </div>

                {/* Card 3: Pending Payment */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pending Payment</span>
                    <h3 className="text-lg font-extrabold text-red-600 mt-2">
                      {activeSub ? formatINR(activeSub.outstandingPaise) : '₹ 2,500'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Due on {activeSub?.startDate || '25 Apr 2025'}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="w-full rounded-xl bg-emerald-800 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table (Matches Panel 4) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-stone-900">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-xs font-bold text-stone-600 uppercase">
                      <tr>
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Slot / Details</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr className="hover:bg-stone-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">#ORD00123</td>
                        <td className="px-5 py-3.5 text-stone-600">21 Apr 2025</td>
                        <td className="px-5 py-3.5 font-medium text-stone-800">Lunch + Dinner</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">#ORD00122</td>
                        <td className="px-5 py-3.5 text-stone-600">20 Apr 2025</td>
                        <td className="px-5 py-3.5 font-medium text-stone-800">Lunch + Dinner</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-stone-900">#ORD00121</td>
                        <td className="px-5 py-3.5 text-stone-600">19 Apr 2025</td>
                        <td className="px-5 py-3.5 font-medium text-stone-800">Lunch + Dinner</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION CALENDAR (Matches Panel 5) */}
          {(activeTab === 'calendar' || activeTab === 'subscription') && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900">आपका सब्सक्रिप्शन कैलेंडर</h2>
                    <p className="text-xs text-stone-500 mt-0.5">Track delivered, scheduled, and holiday pause dates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border px-3 py-1 text-xs font-bold text-stone-700 bg-stone-50">
                      &lt; April 2025 &gt;
                    </span>
                  </div>
                </div>

                {/* Legend Indicators (Matches Panel 5) */}
                <div className="flex flex-wrap items-center gap-4 py-4 text-xs font-semibold text-stone-600 border-b border-stone-100">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500" /> Delivered</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Scheduled</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-500" /> Holiday</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-stone-400" /> Skipped</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Pending</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
                  {/* Calendar Grid (7 columns) */}
                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 pb-2">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty pad days */}
                      <div className="aspect-square rounded-xl bg-stone-50 border border-stone-100 p-1 flex items-center justify-center text-stone-300 text-xs">30</div>
                      <div className="aspect-square rounded-xl bg-stone-50 border border-stone-100 p-1 flex items-center justify-center text-stone-300 text-xs">31</div>
                      
                      {/* Days 1 to 30 with state indicators */}
                      {Array.from({ length: 30 }, (_, i) => {
                        const day = i + 1;
                        const isDelivered = day < 15;
                        const isHoliday = day === 15 || day === 20;
                        const isScheduled = day > 15 && !isHoliday;

                        return (
                          <div
                            key={day}
                            className={`aspect-square rounded-xl border p-1 flex flex-col items-center justify-between text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                              isHoliday
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : isDelivered
                                ? 'bg-blue-50/70 border-blue-200 text-blue-800'
                                : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                            }`}
                          >
                            <span>{day}</span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isHoliday ? 'bg-rose-500' : isDelivered ? 'bg-blue-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today's Menu Breakdown Widget (Matches Panel 5) */}
                  <div className="lg:col-span-4 bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-stone-900 border-b border-stone-200 pb-2">
                        आज का मेनू (Today&apos;s Menu)
                      </h3>

                      <div className="mt-3 space-y-3 text-xs">
                        <div>
                          <strong className="text-emerald-800 block font-bold">☀️ Lunch (12:30 PM):</strong>
                          <p className="text-stone-700 mt-0.5">• 4 रोटी • दाल फ्राई • शाही पनीर • जीरा राइस • सलाद</p>
                        </div>
                        <div>
                          <strong className="text-amber-800 block font-bold">🌙 Dinner (8:00 PM):</strong>
                          <p className="text-stone-700 mt-0.5">• 4 चपाती • मिक्स वेज • दाल तड़का • सादा चावल</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('Calendar downloaded in PDF format!')}
                      className="w-full rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-sm"
                    >
                      Download Calendar (PDF)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER HISTORY (Matches Panel 6) */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">ऑर्डर इतिहास (Order History)</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Complete history of scheduled and extra meal deliveries</p>
                </div>

                {/* Filter Tabs (All, Lunch, Dinner, Extra) */}
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                  {['All', 'Lunch', 'Dinner', 'Extra'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setOrderFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        orderFilter === tab
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table (Matches Panel 6) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs font-bold text-stone-600 uppercase border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer / Name</th>
                      <th className="px-4 py-3">Meal Slot</th>
                      <th className="px-4 py-3">Delivery Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900">{o.reference || '#ORD00123'}</td>
                          <td className="px-4 py-3 font-medium text-stone-800">{user?.fullName || 'Rahul Sharma'}</td>
                          <td className="px-4 py-3 text-stone-600">{o.mealSlot?.toUpperCase() || 'Lunch + Dinner'}</td>
                          <td className="px-4 py-3 text-stone-600">{o.deliveryDate}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              {o.status?.replaceAll('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900">#ORD00123</td>
                          <td className="px-4 py-3 font-medium text-stone-800">{user?.fullName || 'Rahul Sharma'}</td>
                          <td className="px-4 py-3 text-stone-600">Lunch + Dinner</td>
                          <td className="px-4 py-3 text-stone-600">21 Apr 2025</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              Delivered
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900">#ORD00122</td>
                          <td className="px-4 py-3 font-medium text-stone-800">{user?.fullName || 'Rahul Sharma'}</td>
                          <td className="px-4 py-3 text-stone-600">Lunch + Dinner</td>
                          <td className="px-4 py-3 text-stone-600">21 Apr 2025</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                              Preparing
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900">#ORD00121</td>
                          <td className="px-4 py-3 font-medium text-stone-800">{user?.fullName || 'Rahul Sharma'}</td>
                          <td className="px-4 py-3 text-stone-600">Dinner Only</td>
                          <td className="px-4 py-3 text-stone-600">21 Apr 2025</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                              Out for Delivery
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HOLIDAY MANAGEMENT (Meal Pause with Cutoff) */}
          {activeTab === 'holidays' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Meal Holiday & Pause Management</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Request future meal pause before the cutoff time (Lunch: 8:00 AM, Dinner: 3:00 PM)
                </p>
              </div>

              {holidaySuccess && (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800">
                  ✓ {holidaySuccess}
                </div>
              )}

              <form onSubmit={handleHolidaySubmit} className="space-y-4 max-w-lg bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700">Select Date to Pause:</label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700">Meal Slot:</label>
                  <select
                    value={holidaySlot}
                    onChange={(e) => setHolidaySlot(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold bg-white outline-none"
                  >
                    <option value="both">Both Lunch & Dinner</option>
                    <option value="lunch">Lunch Only</option>
                    <option value="dinner">Dinner Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700">Reason (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Traveling home for weekend, exam"
                    value={holidayReason}
                    onChange={(e) => setHolidayReason(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingHoliday}
                  className="rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingHoliday ? 'Submitting...' : 'Submit Holiday Pause'}
                </button>
              </form>

              {/* Past Requests List */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-3">Submitted Pause Requests</h3>
                <div className="space-y-2">
                  {holidays.length > 0 ? (
                    holidays.map((h) => (
                      <div key={h._id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border text-xs">
                        <span>📅 {h.dates?.join(', ')} ({h.mealSlot})</span>
                        <span className="font-bold text-emerald-700 uppercase">{h.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-500">No holiday requests submitted yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXTRA TIFFIN ORDER */}
          {activeTab === 'extra' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Order Extra Food / Add-on Tiffin</h2>
                <p className="text-xs text-stone-500 mt-0.5">Add extra meals or rotis to your scheduled delivery</p>
              </div>

              <form onSubmit={handleExtraOrder} className="space-y-4 max-w-lg bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700">Item:</label>
                  <select
                    value={extraItem}
                    onChange={(e) => setExtraItem(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold bg-white outline-none"
                  >
                    <option value="Extra Roti (4 pcs)">Extra Roti (4 pcs) - ₹20</option>
                    <option value="Extra Sabzi (1 bowl)">Extra Sabzi (1 bowl) - ₹40</option>
                    <option value="Extra Dal (1 bowl)">Extra Dal (1 bowl) - ₹30</option>
                    <option value="Extra Full Tiffin Meal">Extra Full Tiffin Meal - ₹80</option>
                    <option value="Special Paneer Sabzi">Special Paneer Sabzi - ₹70</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700">Delivery Date:</label>
                  <input
                    type="date"
                    required
                    value={extraDate}
                    onChange={(e) => setExtraDate(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700">Meal Slot:</label>
                  <select
                    value={extraSlot}
                    onChange={(e) => setExtraSlot(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-stone-300 p-2.5 text-sm font-semibold bg-white outline-none"
                  >
                    <option value="lunch">Lunch (12:30 PM)</option>
                    <option value="dinner">Dinner (8:00 PM)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingExtra}
                  className="rounded-xl bg-emerald-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingExtra ? 'Placing Order...' : 'Place Extra Order (Pay on Delivery / Advance)'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: PAYMENTS & RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">Payment History & Receipts</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Verified payment attempts and generated receipts</p>
                </div>
              </div>

              <div className="space-y-3">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                      <div>
                        <span className="font-mono font-bold text-stone-900 block">{p.receiptNumber}</span>
                        <span className="text-xs text-stone-500">
                          {p.purpose?.replaceAll('_', ' ').toUpperCase()} • Provider: {p.provider?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-stone-900 block">{formatINR(p.amountPaise)}</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {p.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500 py-6 text-center">No payment transactions yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE & ADDRESS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Profile & Saved Addresses</h2>
                <p className="text-xs text-stone-500 mt-0.5">Manage your personal and delivery location details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="p-4 rounded-xl bg-stone-50 border">
                  <span className="text-xs text-stone-500 block">Full Name</span>
                  <strong className="text-sm text-stone-900">{user?.fullName}</strong>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border">
                  <span className="text-xs text-stone-500 block">Phone Number</span>
                  <strong className="text-sm text-stone-900">+91 {user?.phone}</strong>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border sm:col-span-2">
                  <span className="text-xs text-stone-500 block">Email Address</span>
                  <strong className="text-sm text-stone-900">{user?.email || 'Not provided'}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-3">Saved Delivery Addresses in Jabalpur</h3>
                <div className="space-y-2">
                  {addresses.length > 0 ? (
                    addresses.map((a) => (
                      <div key={a._id} className="p-3.5 rounded-xl border bg-stone-50 text-xs">
                        <strong>📍 {a.label || 'Delivery'}</strong>
                        <p className="text-stone-700 mt-1">{a.line1}, Jabalpur (PIN: {a.pincode})</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-xl border bg-stone-50 text-xs text-stone-600">
                      📍 Default: Wright Town / Napier Town, Jabalpur - 482001
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SUPPORT & HELP */}
          {activeTab === 'support' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900">Jabalpur Kitchen Support & Helpline</h2>
              <p className="text-sm text-stone-600">
                Have an urgent delivery instruction or special diet request? Connect directly with our Jabalpur kitchen team.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <strong className="text-emerald-900 block font-bold text-sm">📞 Phone Support</strong>
                  <p className="text-emerald-800 mt-1">+91 98765 43210 (7:00 AM - 10:00 PM)</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <strong className="text-amber-900 block font-bold text-sm">💬 WhatsApp Kitchen Desk</strong>
                  <p className="text-amber-800 mt-1">+91 98765 43210 (Instant Reply)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900">Account Settings</h2>
              <p className="text-xs text-stone-500">Manage notifications and security preferences</p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="rounded-xl bg-red-50 text-red-700 px-5 py-2.5 text-xs font-bold border border-red-200 hover:bg-red-100"
                >
                  Log Out of Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
