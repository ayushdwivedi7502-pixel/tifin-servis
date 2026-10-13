'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatINR, rupeesToPaise } from '@tiffin/shared';

type AdminTab =
  | 'dashboard'
  | 'plans'
  | 'customers'
  | 'workers'
  | 'subscriptions'
  | 'kitchen'
  | 'orders'
  | 'finance'
  | 'settings';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [kitchen, setKitchen] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals & Drawers state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    priceRupees: 2400,
    mealType: 'lunch_only',
    durationType: 'monthly',
    includedItems: '4 तवा रोटी, दाल, मौसमी सब्जी, चावल, सलाद',
    advanceRupees: 500,
    isActive: true,
  });

  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [addonForm, setAddonForm] = useState({
    name: '',
    description: '',
    priceRupees: 20,
    mealSlots: ['lunch', 'dinner'],
    isAvailable: true,
  });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userFormRole, setUserFormRole] = useState<'customer' | 'worker'>('customer');
  const [userForm, setUserForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    isDisabled: false,
  });

  const [userHistoryModalOpen, setUserHistoryModalOpen] = useState(false);
  const [historyUserData, setHistoryUserData] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [st, kt, pl, ad, cust, wrk, ord, sub] = await Promise.all([
        api('/api/admin/dashboard').catch((e) => {
          if (e.message.includes('Forbidden') || e.message.includes('Authentication')) {
            window.location.href = '/login';
          }
          return null;
        }),
        api('/api/admin/kitchen?slot=lunch').catch(() => null),
        api<any[]>('/api/admin/plans').catch(() => []),
        api<any[]>('/api/admin/addons').catch(() => []),
        api<any[]>('/api/admin/users?role=customer').catch(() => []),
        api<any[]>('/api/admin/users?role=worker').catch(() => []),
        api<any[]>('/api/admin/orders').catch(() => []),
        api<any[]>('/api/admin/subscriptions').catch(() => []),
      ]);

      setStats(st);
      setKitchen(kt);
      setPlans(pl);
      setAddons(ad);
      setCustomers(cust);
      setWorkers(wrk);
      setOrders(ord);
      setSubscriptions(sub);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  function showAlert(msg: string) {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  }

  // --- PLAN HANDLERS ---
  function openCreatePlan() {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      priceRupees: 2400,
      mealType: 'lunch_only',
      durationType: 'monthly',
      includedItems: '4 रोटी, दाल, सब्जी, चावल, सलाद',
      advanceRupees: 500,
      isActive: true,
    });
    setPlanModalOpen(true);
  }

  function openEditPlan(p: any) {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      description: p.description,
      priceRupees: Math.round(p.pricePaise / 100),
      mealType: p.mealType,
      durationType: p.durationType,
      includedItems: (p.includedItems || []).join(', '),
      advanceRupees: Math.round((p.advanceFixedPaise || 0) / 100),
      isActive: p.isActive !== false,
    });
    setPlanModalOpen(true);
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: planForm.name,
        description: planForm.description,
        pricePaise: rupeesToPaise(Number(planForm.priceRupees)),
        mealType: planForm.mealType,
        durationType: planForm.durationType,
        includedItems: planForm.includedItems
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        advanceFixedPaise: rupeesToPaise(Number(planForm.advanceRupees)),
        isActive: planForm.isActive,
      };

      if (editingPlan) {
        await api(`/api/admin/plans/${editingPlan._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showAlert(`✓ प्लान "${planForm.name}" सफलतापूर्वक अपडेट किया गया!`);
      } else {
        await api('/api/admin/plans', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAlert(`✓ नया प्लान "${planForm.name}" सफलतापूर्वक जोड़ा गया!`);
      }
      setPlanModalOpen(false);
      const updated = await api<any[]>('/api/admin/plans');
      setPlans(updated);
    } catch (err: any) {
      alert(err.message || 'Error saving plan');
    }
  }

  async function handleDeletePlan(id: string, name: string) {
    if (!confirm(`क्या आप प्लान "${name}" को डिलीट करना चाहते हैं?`)) return;
    try {
      await api(`/api/admin/plans/${id}`, { method: 'DELETE' });
      showAlert(`✓ प्लान "${name}" डिलीट कर दिया गया!`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting plan');
    }
  }

  // --- ADDON HANDLERS ---
  function openCreateAddon() {
    setEditingAddon(null);
    setAddonForm({
      name: '',
      description: '',
      priceRupees: 20,
      mealSlots: ['lunch', 'dinner'],
      isAvailable: true,
    });
    setAddonModalOpen(true);
  }

  function openEditAddon(a: any) {
    setEditingAddon(a);
    setAddonForm({
      name: a.name,
      description: a.description || '',
      priceRupees: Math.round(a.pricePaise / 100),
      mealSlots: a.mealSlots || ['lunch', 'dinner'],
      isAvailable: a.isAvailable !== false,
    });
    setAddonModalOpen(true);
  }

  async function handleSaveAddon(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: addonForm.name,
        description: addonForm.description,
        pricePaise: rupeesToPaise(Number(addonForm.priceRupees)),
        mealSlots: addonForm.mealSlots,
        isAvailable: addonForm.isAvailable,
      };

      if (editingAddon) {
        await api(`/api/admin/addons/${editingAddon._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showAlert(`✓ आइटम "${addonForm.name}" अपडेट किया गया!`);
      } else {
        await api('/api/admin/addons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAlert(`✓ नया आइटम "${addonForm.name}" जोड़ा गया!`);
      }
      setAddonModalOpen(false);
      const updated = await api<any[]>('/api/admin/addons');
      setAddons(updated);
    } catch (err: any) {
      alert(err.message || 'Error saving addon');
    }
  }

  async function handleDeleteAddon(id: string, name: string) {
    if (!confirm(`क्या आप आइटम "${name}" को हटाना चाहते हैं?`)) return;
    try {
      await api(`/api/admin/addons/${id}`, { method: 'DELETE' });
      showAlert(`✓ आइटम "${name}" हटा दिया गया!`);
      setAddons((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting addon');
    }
  }

  // --- USER (CUSTOMER & WORKER) HANDLERS ---
  function openCreateUser(targetRole: 'customer' | 'worker') {
    setEditingUser(null);
    setUserFormRole(targetRole);
    setUserForm({
      fullName: '',
      phone: '',
      email: '',
      password: targetRole === 'worker' ? 'Worker@123' : 'Customer@123',
      isDisabled: false,
    });
    setUserModalOpen(true);
  }

  function openEditUser(u: any) {
    setEditingUser(u);
    setUserFormRole(u.role);
    setUserForm({
      fullName: u.fullName,
      phone: u.phone,
      email: u.email || '',
      password: '', // blank unless resetting
      isDisabled: !!u.isDisabled,
    });
    setUserModalOpen(true);
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload: any = {
          fullName: userForm.fullName,
          phone: userForm.phone,
          email: userForm.email || undefined,
          role: userFormRole,
          isDisabled: userForm.isDisabled,
        };
        if (userForm.password && userForm.password.trim().length >= 6) {
          payload.password = userForm.password.trim();
        }

        await api(`/api/admin/users/${editingUser._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showAlert(`✓ ${userFormRole === 'worker' ? 'वर्कर' : 'कस्टमर'} "${userForm.fullName}" का विवरण अपडेट किया गया!`);
      } else {
        await api('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            fullName: userForm.fullName,
            phone: userForm.phone,
            email: userForm.email || undefined,
            role: userFormRole,
            password: userForm.password || 'ChangeMe123!',
          }),
        });
        showAlert(`✓ नया ${userFormRole === 'worker' ? 'वर्कर' : 'कस्टमर'} जोड़ा गया!`);
      }

      setUserModalOpen(false);
      // Reload lists
      const [cust, wrk] = await Promise.all([
        api<any[]>('/api/admin/users?role=customer'),
        api<any[]>('/api/admin/users?role=worker'),
      ]);
      setCustomers(cust);
      setWorkers(wrk);
    } catch (err: any) {
      alert(err.message || 'Error saving user');
    }
  }

  async function handleDeleteUser(id: string, name: string, userRole: string) {
    if (!confirm(`क्या आप ${userRole} "${name}" को डिलीट करना चाहते हैं?`)) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      showAlert(`✓ ${userRole} "${name}" डिलीट कर दिया गया!`);
      if (userRole === 'worker') {
        setWorkers((prev) => prev.filter((w) => w._id !== id));
      } else {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    }
  }

  async function viewUserHistory(userId: string) {
    setUserHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const data = await api<any>(`/api/admin/users/${userId}`);
      setHistoryUserData(data);
    } catch (err: any) {
      alert(err.message);
      setUserHistoryModalOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  }

  const adminNavItems = [
    { id: 'dashboard', label: 'डैशबोर्ड (Overview)', icon: '📊' },
    { id: 'plans', label: 'प्लान व फूड आइटम (Plans & Items)', icon: '🍛' },
    { id: 'customers', label: 'कस्टमर मैनेजमेंट (Customers)', icon: '👥' },
    { id: 'workers', label: 'डिलीवरी स्टाफ (Workers)', icon: '🛵' },
    { id: 'subscriptions', label: 'सब्सक्रिप्शन (Subscriptions)', icon: '📋' },
    { id: 'kitchen', label: 'किचन तैयारी (Kitchen)', icon: '🍳' },
    { id: 'orders', label: 'ऑर्डर लिस्ट (Orders)', icon: '📦' },
    { id: 'finance', label: 'रेवेन्यू (Finance)', icon: '💰' },
    { id: 'settings', label: 'सेटिंग्स (Settings)', icon: '⚙️' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Toast Alert Message */}
      {alertMsg && (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-800 text-white px-5 py-3 shadow-2xl text-xs font-bold animate-bounce flex items-center gap-2">
          <span>✓</span>
          <span>{alertMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Admin Left Sidebar */}
        <aside className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 sticky top-20 transition-colors">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 dark:bg-amber-400 text-amber-400 dark:text-stone-950 font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <span className="block text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                Admin Control Hub
              </span>
              <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Ayush Dwivedi (Admin)
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top Admin Header */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Jabalpur Tiffin Service • मास्टर एडमिन पैनल
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Owner & Director: Ayush Dwivedi (+91 6261568086) • ayushdwivedi7502@gmail.com
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadAllData}
                className="rounded-xl bg-stone-100 dark:bg-stone-800 px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                🔄 Refresh Data
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block uppercase">
                    👥 Total Customers
                  </span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-2 block">
                    {customers.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-xs font-bold text-amber-600 block uppercase">🛵 Active Workers</span>
                  <span className="text-3xl font-black text-amber-600 mt-2 block">{workers.length}</span>
                </div>
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-xs font-bold text-emerald-700 block uppercase">
                    📋 Active Subscriptions
                  </span>
                  <span className="text-3xl font-black text-emerald-700 mt-2 block">
                    {subscriptions.filter((s) => s.status === 'active').length || subscriptions.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm">
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block uppercase">
                    🍛 Live Plans
                  </span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-2 block">
                    {plans.length}
                  </span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold">त्वरित नियंत्रण (Quick Admin Actions)</h3>
                  <p className="text-xs text-emerald-200">नए प्लान, कस्टमर या डिलीवरी स्टाफ यहाँ से तुरंत जोड़ें</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreatePlan}
                    className="rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-4 py-2 text-xs transition-all shadow-sm"
                  >
                    + नया प्लान जोड़ें
                  </button>
                  <button
                    onClick={openCreateAddon}
                    className="rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 text-xs transition-all"
                  >
                    + नया फूड आइटम जोड़ें
                  </button>
                  <button
                    onClick={() => openCreateUser('customer')}
                    className="rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 text-xs transition-all"
                  >
                    + नया कस्टमर जोड़ें
                  </button>
                  <button
                    onClick={() => openCreateUser('worker')}
                    className="rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 text-xs transition-all"
                  >
                    + नया वर्कर जोड़ें
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">हालिया ऑर्डर्स (Recent Orders)</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-emerald-700 hover:underline">
                    सभी ऑर्डर्स देखें →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Meal Slot</th>
                        <th className="px-4 py-3">Delivery Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">{o.reference || `#ORD-${o._id?.slice(-5)}`}</td>
                          <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">{o.userId?.fullName || 'Customer'}</td>
                          <td className="px-4 py-3 uppercase">{o.mealSlot}</td>
                          <td className="px-4 py-3">{o.deliveryDate}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                              {o.status?.replaceAll('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS & FOOD ITEMS MANAGEMENT */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              {/* Top Bar for Plans */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                      🍛 टिफिन प्लान मैनेजमेंट (Tiffin Plans)
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      कोई भी नया प्लान बनाएँ, मौजूदा प्लान का नाम, थाली आइटम्स या कीमत बदलें
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreatePlan}
                    className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>➕</span>
                    <span>नया प्लान जोड़ें (Add Plan)</span>
                  </button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p._id}
                      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-5 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                              {p.durationType}
                            </span>
                            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                              {p.name}
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-emerald-800 dark:text-emerald-400">
                              {formatINR(p.pricePaise)}
                            </span>
                            <span className="block text-[10px] text-stone-500 uppercase">
                              {p.mealType?.replaceAll('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300">{p.description}</p>

                        <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs">
                          <strong className="text-stone-800 dark:text-stone-200 block text-[11px] mb-0.5">
                            थाली में शामिल:
                          </strong>
                          <span className="text-stone-600 dark:text-stone-400">
                            {p.includedItems?.join(' • ') || '4 रोटी, दाल, सब्जी, चावल, सलाद'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPlan(p)}
                          className="rounded-lg bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 text-white px-3 py-1.5 text-xs font-bold"
                        >
                          ✏️ Edit Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(p._id, p.name)}
                          className="rounded-lg border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 text-xs font-bold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food Items & Addons Section */}
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                      🥗 फूड आइटम्स व ऐड-ऑन (Extra Food Items)
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      अतिरिक्त रोटी, एक्स्ट्रा सब्जी, पनीर या मिठाई आइटम प्रबंधित करें
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateAddon}
                    className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>➕</span>
                    <span>नया आइटम जोड़ें (Add Item)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addons.map((a) => (
                    <div
                      key={a._id}
                      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-4 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{a.name}</strong>
                          <span className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                            {formatINR(a.pricePaise)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{a.description || 'Extra portion'}</p>
                        <span className="inline-block text-[10px] font-bold text-stone-500 bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 mt-2 uppercase">
                          Slots: {a.mealSlots?.join(', ')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAddon(a)}
                          className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:underline"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddon(a._id, a.name)}
                          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    👥 कस्टमर मैनेजमेंट (Customer Accounts)
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    कस्टमर ID, फोन नंबर, ईमेल, हिस्ट्री देखें और पासवर्ड या विवरण एडिट करें
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateUser('customer')}
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>➕</span>
                  <span>नया कस्टमर जोड़ें (Add Customer)</span>
                </button>
              </div>

              {/* Customers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Customer ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Mobile No.</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                          #CUST-{c._id?.slice(-5).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">{c.fullName}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                          +91 {c.phone}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{c.email || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                              c.isDisabled ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {c.isDisabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => viewUserHistory(c._id)}
                            className="rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 font-bold hover:bg-emerald-100"
                            title="View Orders and Subscriptions"
                          >
                            👁️ History
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditUser(c)}
                            className="rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2.5 py-1 font-bold hover:bg-stone-200"
                            title="Edit details or Reset Password"
                          >
                            ✏️ Edit / Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(c._id, c.fullName, 'कस्टमर')}
                            className="rounded-lg text-red-600 hover:bg-red-50 px-2 py-1 font-bold"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WORKERS / DELIVERY STAFF MANAGEMENT */}
          {activeTab === 'workers' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    🛵 डिलीवरी व किचन स्टाफ मैनेजमेंट (Workers)
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    डिलीवरी बॉय / स्टाफ का ID, फोन, ईमेल, पासवर्ड देखें व एडिट करें
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateUser('worker')}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>➕</span>
                  <span>नया वर्कर जोड़ें (Add Worker)</span>
                </button>
              </div>

              {/* Workers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold uppercase">
                    <tr>
                      <th className="px-4 py-3">Staff ID</th>
                      <th className="px-4 py-3">Staff Name</th>
                      <th className="px-4 py-3">Mobile No.</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {workers.map((w) => (
                      <tr key={w._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-amber-600">
                          #WRK-{w._id?.slice(-5).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">{w.fullName}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-stone-800 dark:text-stone-200">
                          +91 {w.phone}
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{w.email || 'worker@jabalpurtiffin.in'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                              w.isDisabled ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {w.isDisabled ? 'Disabled' : 'On-Duty (Active)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => viewUserHistory(w._id)}
                            className="rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 font-bold hover:bg-amber-100"
                            title="View Activity & Deliveries"
                          >
                            👁️ Activity
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditUser(w)}
                            className="rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2.5 py-1 font-bold hover:bg-stone-200"
                            title="Edit details or Reset Password"
                          >
                            ✏️ Edit / Pass
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(w._id, w.fullName, 'वर्कर')}
                            className="rounded-lg text-red-600 hover:bg-red-50 px-2 py-1 font-bold"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                📋 लाइव सब्सक्रिप्शन सूची (Active Subscriptions)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Sub ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Start Date</th>
                      <th className="px-4 py-3">End Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {subscriptions.map((s) => (
                      <tr key={s._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">#SUB-{s._id?.slice(-5)}</td>
                        <td className="px-4 py-3 font-bold">{s.userId?.fullName || 'Customer'}</td>
                        <td className="px-4 py-3">{s.planId?.name || 'Tiffin Plan'}</td>
                        <td className="px-4 py-3">{s.startDate}</td>
                        <td className="px-4 py-3">{s.endDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: KITCHEN PREP */}
          {activeTab === 'kitchen' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  🍳 आज की किचन तैयारी सूची (Kitchen Daily Prep)
                </h2>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-stone-900 text-white font-bold px-4 py-2 text-xs"
                >
                  🖨️ Print Sheet
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                  <span className="text-xs font-bold text-orange-800 dark:text-orange-300 block">ताजी रोटियाँ (Rotis)</span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-1 block">340 pcs</span>
                  <span className="text-[10px] text-stone-500 mt-1 block">4 प्रति टिफिन + एक्स्ट्रा</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">दाल तड़का (Dal)</span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-1 block">18.5 Litres</span>
                  <span className="text-[10px] text-stone-500 mt-1 block">देसी घी तड़का अरहर दाल</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">शाही पनीर / सब्जी</span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-1 block">85 Servings</span>
                  <span className="text-[10px] text-stone-500 mt-1 block">फ्रेश पनीर व मौसमी सब्जी</span>
                </div>
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block">जीरा राइस (Rice)</span>
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-100 mt-1 block">12 Kg</span>
                  <span className="text-[10px] text-stone-500 mt-1 block">बासमती स्टीम्ड राइस</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">📦 सभी डिलीवरी ऑर्डर्स (Orders)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 uppercase font-bold text-stone-600 dark:text-stone-300">
                    <tr>
                      <th className="px-4 py-3">Order Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Date & Slot</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">{o.reference || `#ORD-${o._id?.slice(-5)}`}</td>
                        <td className="px-4 py-3 font-bold">{o.userId?.fullName || 'Customer'}</td>
                        <td className="px-4 py-3 font-mono text-emerald-800 dark:text-emerald-400">+91 {o.userId?.phone || '—'}</td>
                        <td className="px-4 py-3">{o.deliveryDate} ({o.mealSlot?.toUpperCase()})</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                            {o.status?.replaceAll('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: FINANCE */}
          {activeTab === 'finance' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">💰 आय व भुगतान रिकॉर्ड (Revenue & Payments)</h2>
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">कुल एकत्रित आय (Total Revenue)</span>
                <div className="text-4xl font-black text-emerald-900 dark:text-emerald-200 mt-2">
                  {stats?.revenueDisplay || '₹ 1,45,600'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">⚙️ बिजनेस सेटिंग्स (Business Info)</h2>
              <div className="space-y-3 text-xs max-w-lg">
                <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                  <span className="text-stone-500 block">Director & Owner</span>
                  <strong className="text-sm">Ayush Dwivedi (+91 6261568086)</strong>
                </div>
                <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                  <span className="text-stone-500 block">Service Email</span>
                  <strong className="text-sm">ayushdwivedi7502@gmail.com</strong>
                </div>
                <div className="p-4 rounded-xl border bg-stone-50 dark:bg-stone-800">
                  <span className="text-stone-500 block">Kitchen Hub Address</span>
                  <strong className="text-sm">Wright Town / Napier Town, Jabalpur - 482001</strong>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: PLAN CREATE / EDIT DIALOG */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {editingPlan ? '✏️ प्लान एडिट करें (Edit Plan)' : '➕ नया प्लान जोड़ें (Add New Plan)'}
              </h3>
              <button onClick={() => setPlanModalOpen(false)} className="text-stone-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">प्लान का नाम (Plan Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Lunch Only"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">विवरण (Description) *</label>
                <textarea
                  required
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">कीमत (Price in ₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planForm.priceRupees}
                    onChange={(e) => setPlanForm({ ...planForm, priceRupees: Number(e.target.value) })}
                    className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">एडवांस (Advance ₹)</label>
                  <input
                    type="number"
                    value={planForm.advanceRupees}
                    onChange={(e) => setPlanForm({ ...planForm, advanceRupees: Number(e.target.value) })}
                    className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Meal Slot</label>
                  <select
                    value={planForm.mealType}
                    onChange={(e) => setPlanForm({ ...planForm, mealType: e.target.value })}
                    className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-bold"
                  >
                    <option value="lunch_only">Lunch Only</option>
                    <option value="dinner_only">Dinner Only</option>
                    <option value="lunch_and_dinner">Lunch + Dinner</option>
                    <option value="single_meal">Single Meal Trial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Duration Type</label>
                  <select
                    value={planForm.durationType}
                    onChange={(e) => setPlanForm({ ...planForm, durationType: e.target.value })}
                    className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-bold"
                  >
                    <option value="monthly">Monthly (30 Days)</option>
                    <option value="weekly">Weekly (7 Days)</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">थाली में शामिल आइटम्स (Comma separated items)</label>
                <input
                  type="text"
                  placeholder="4 रोटी, दाल, मौसमी सब्जी, चावल, सलाद"
                  value={planForm.includedItems}
                  onChange={(e) => setPlanForm({ ...planForm, includedItems: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-bold text-stone-600 hover:bg-stone-100"
                >
                  कैंसिल
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 shadow-md"
                >
                  सेव करें (Save Plan)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADDON ITEM CREATE / EDIT */}
      {addonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {editingAddon ? '✏️ फूड आइटम एडिट करें' : '➕ नया फूड आइटम जोड़ें'}
              </h3>
              <button onClick={() => setAddonModalOpen(false)} className="text-stone-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveAddon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">आइटम का नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Extra Roti (4 pcs), Special Paneer"
                  value={addonForm.name}
                  onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">विवरण (Description)</label>
                <input
                  type="text"
                  placeholder="उदा. 4 ताजा तवा रोटियाँ"
                  value={addonForm.description}
                  onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">कीमत (Price in ₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={addonForm.priceRupees}
                  onChange={(e) => setAddonForm({ ...addonForm, priceRupees: Number(e.target.value) })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddonModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-bold text-stone-600 hover:bg-stone-100"
                >
                  कैंसिल
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 shadow-md"
                >
                  सेव करें (Save Item)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: USER CREATE / EDIT / RESET PASSWORD */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {editingUser
                  ? `✏️ ${userFormRole === 'worker' ? 'वर्कर' : 'कस्टमर'} का विवरण व पासवर्ड बदलें`
                  : `➕ नया ${userFormRole === 'worker' ? 'वर्कर' : 'कस्टमर'} जोड़ें`}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-stone-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल शर्मा / रमेश कुमार"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">मोबाइल नंबर (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="6261568086"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ईमेल पता (Email Address)</label>
                <input
                  type="email"
                  placeholder="ayushdwivedi7502@gmail.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold">
                    {editingUser ? '🔑 नया पासवर्ड सेट करें (Reset Password)' : '🔑 पासवर्ड (Password) *'}
                  </label>
                  {editingUser && (
                    <span className="text-[10px] text-stone-500">बदलना हो तभी टाइप करें</span>
                  )}
                </div>
                <input
                  type="text"
                  required={!editingUser}
                  placeholder={editingUser ? 'नया पासवर्ड डालें या खाली छोड़ें' : 'e.g. Pass1234'}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-xl border p-2.5 bg-white dark:bg-stone-800 text-sm outline-none font-mono"
                />
              </div>

              {editingUser && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.isDisabled}
                      onChange={(e) => setUserForm({ ...userForm, isDisabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-bold text-red-600">खाता ब्लॉक / डिसेबल करें (Disable Account)</span>
                  </label>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-bold text-stone-600 hover:bg-stone-100"
                >
                  कैंसिल
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-2.5 shadow-md"
                >
                  सेव करें (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: USER HISTORY & ACTIVITY DRAWER */}
      {userHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                  👁️ यूज़र हिस्ट्री व गतिविधि (User Profile & History)
                </h3>
                <span className="text-xs text-stone-500">
                  {historyUserData?.user?.fullName} (+91 {historyUserData?.user?.phone}) • {historyUserData?.user?.role?.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setUserHistoryModalOpen(false)} className="text-stone-500 font-bold">✕</button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-xs text-stone-500">लोड हो रहा है...</div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* User Info Card */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-500 block text-[10px]">User ID</span>
                    <strong className="font-mono text-stone-900 dark:text-stone-100">{historyUserData?.user?._id}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Mobile</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">+91 {historyUserData?.user?.phone}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Email</span>
                    <strong className="text-stone-900 dark:text-stone-100">{historyUserData?.user?.email || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Role</span>
                    <strong className="uppercase">{historyUserData?.user?.role}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Status</span>
                    <strong className={historyUserData?.user?.isDisabled ? 'text-red-600' : 'text-emerald-700'}>
                      {historyUserData?.user?.isDisabled ? 'Disabled' : 'Active'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Joined</span>
                    <span>{new Date(historyUserData?.user?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Subscriptions */}
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-2">सब्सक्रिप्शन (Subscriptions)</h4>
                  {historyUserData?.subscriptions?.length > 0 ? (
                    <div className="space-y-2">
                      {historyUserData.subscriptions.map((s: any) => (
                        <div key={s._id} className="p-3 rounded-xl border flex justify-between items-center bg-white dark:bg-stone-800">
                          <div>
                            <strong>{s.planId?.name || 'Tiffin Plan'}</strong>
                            <span className="block text-[11px] text-stone-500">{s.startDate} to {s.endDate}</span>
                          </div>
                          <span className="font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 text-[11px]">कोई सक्रिय सब्सक्रिप्शन नहीं मिला।</p>
                  )}
                </div>

                {/* Orders History */}
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-2">ऑर्डर इतिहास (Orders)</h4>
                  {historyUserData?.orders?.length > 0 ? (
                    <div className="space-y-2">
                      {historyUserData.orders.map((o: any) => (
                        <div key={o._id} className="p-3 rounded-xl border flex justify-between items-center bg-white dark:bg-stone-800">
                          <div>
                            <span className="font-mono font-bold">{o.reference || `#ORD-${o._id?.slice(-5)}`}</span>
                            <span className="block text-[11px] text-stone-500">{o.deliveryDate} ({o.mealSlot?.toUpperCase()})</span>
                          </div>
                          <span className="font-bold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px]">
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 text-[11px]">कोई पुराना ऑर्डर नहीं मिला।</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
