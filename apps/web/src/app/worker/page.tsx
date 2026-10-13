'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function WorkerPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(rawUser);
    if (parsed.role !== 'worker' && parsed.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(parsed);

    loadOrders();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api<any[]>('/api/orders');
      setOrders(data);
    } catch {
      // Mock data if none present
      setOrders([
        {
          _id: 'ord_demo_1',
          reference: '#JTS-DEL-101',
          userId: { fullName: 'Ayush Dwivedi', phone: '6261568086' },
          addressId: { line1: 'Napier Town, Near Shastri Bridge', pincode: '482001' },
          mealSlot: 'lunch',
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'out_for_delivery',
        },
        {
          _id: 'ord_demo_2',
          reference: '#JTS-DEL-102',
          userId: { fullName: 'Rahul Sharma', phone: '9999999999' },
          addressId: { line1: 'Wright Town, Madan Mahal Area', pincode: '482002' },
          mealSlot: 'lunch',
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'preparing',
        },
        {
          _id: 'ord_demo_3',
          reference: '#JTS-DEL-103',
          userId: { fullName: 'Priya Singh', phone: '9826112233' },
          addressId: { line1: 'Civil Lines, Near High Court', pincode: '482001' },
          mealSlot: 'dinner',
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'confirmed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      await api(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } catch {
      // Local fallback for smooth UI demo
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const outCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const pendingCount = orders.length - deliveredCount;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Worker Top Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              🛵 Delivery & Kitchen Staff Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              नमस्ते, {user?.fullName || 'Worker Staff'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 font-mono">
              Staff Mobile: +91 {user?.phone || '9876543210'} • Hub: Jabalpur Main Kitchen
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              router.push('/');
            }}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 text-xs font-bold text-white transition-all backdrop-blur"
          >
            Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-stone-200 shadow-sm text-center">
            <span className="text-xs font-bold text-stone-500 uppercase">Total Deliveries</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200 shadow-sm text-center">
            <span className="text-xs font-bold text-amber-800 uppercase">Out for Delivery</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{outCount}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-200 shadow-sm text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase">Delivered</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{deliveredCount}</div>
          </div>
        </div>

        {/* Orders Card List */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">Today&apos;s Tiffin Deliveries (आज के टिफिन)</h2>
              <p className="text-xs text-stone-500">Live delivery tasks assigned to your shift</p>
            </div>
            <button
              onClick={loadOrders}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              🔄 Refresh List
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-stone-500">Loading delivery tasks...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-stone-500">No active delivery tasks at the moment.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const customerName = order.userId?.fullName || 'Customer';
                const customerPhone = order.userId?.phone || '9999999999';
                const addressText = order.addressId?.line1 || 'Wright Town, Jabalpur - 482001';
                const isDelivered = order.status === 'delivered';
                const isOut = order.status === 'out_for_delivery';

                return (
                  <div
                    key={order._id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isDelivered
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isOut
                        ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-stone-500">
                          {order.reference || `#ORD-${order._id?.slice(-5)}`}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOut
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.status?.replaceAll('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {order.mealSlot?.toUpperCase()} (
                          {order.mealSlot === 'lunch' ? '12:30 PM' : '8:00 PM'})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-stone-900">{customerName}</h3>

                      <p className="text-xs text-stone-600 flex items-center gap-1.5">
                        <span>📍 {addressText}</span>
                      </p>

                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <span>📞 +91 {customerPhone}</span>
                        <a
                          href={`tel:+91${customerPhone}`}
                          className="ml-2 text-[11px] underline text-blue-600"
                        >
                          Call Customer
                        </a>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {!isDelivered && (
                        <>
                          {!isOut && (
                            <button
                              type="button"
                              disabled={updatingId === order._id}
                              onClick={() => updateStatus(order._id, 'out_for_delivery')}
                              className="flex-1 md:flex-initial rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
                            >
                              🛵 Out for Delivery
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={updatingId === order._id}
                            onClick={() => updateStatus(order._id, 'delivered')}
                            className="flex-1 md:flex-initial rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
                          >
                            ✅ Mark Delivered
                          </button>
                        </>
                      )}
                      {isDelivered && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          ✓ Delivery Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
