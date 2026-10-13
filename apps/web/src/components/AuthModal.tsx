'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, setSession } from '@/lib/api';

type RoleTab = 'customer' | 'admin' | 'worker';
type CustomerMode = 'password_login' | 'otp_login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: RoleTab;
  alertBanner?: string;
}

export function AuthModal({ isOpen, onClose, defaultRole = 'customer', alertBanner }: AuthModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<RoleTab>(defaultRole);
  const [customerMode, setCustomerMode] = useState<CustomerMode>('password_login');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // OTP State
  const [otpRequested, setOtpRequested] = useState(false);
  const [incomingSms, setIncomingSms] = useState<{ code: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update defaults when switching tabs
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setOtpRequested(false);
    setIncomingSms(null);
    setOtp('');

    if (role === 'admin') {
      setPhone('6261568086');
      setPassword('ChangeMeAdmin123!');
      setEmail('ayushdwivedi7502@gmail.com');
    } else if (role === 'worker') {
      setPhone('3333333333');
      setPassword('om@123');
      setEmail('om@tiffin.local');
    } else {
      setPhone('2222222222');
      setPassword('rahul@123');
      setEmail('rahul@tiffin.local');
      setFullName('Rahul');
    }
  }, [role]);

  if (!isOpen) return null;

  async function handleSendOtp(purpose: 'login' | 'register') {
    setError('');
    setSuccessMsg('');
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile number)');
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ message: string; otp?: string }>('/api/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone, purpose }),
      });

      setOtpRequested(true);
      const generatedOtp = res.otp || '123456';
      setIncomingSms({ code: generatedOtp, phone });
      setSuccessMsg(`✓ OTP आपके मोबाइल नंबर (+91 ${phone}) पर भेज दिया गया है!`);
    } catch (err: any) {
      setError(err.message || 'OTP भेजने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (role === 'customer' && customerMode === 'register') {
        // Register with OTP
        if (!otp || otp.length !== 6) {
          setError('कृपया 6-अंकों का सही OTP दर्ज करें');
          setLoading(false);
          return;
        }
        const data = await api<any>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ fullName, phone, email: email || undefined, password, otp }),
        });
        setSession(data.accessToken, data.user);
        onClose();
        router.push('/dashboard');
      } else if ((role === 'customer' && customerMode === 'otp_login') || (otpRequested && otp)) {
        // OTP Login for customer, admin, or worker
        if (!otp || otp.length !== 6) {
          setError('कृपया 6-अंकों का सही OTP दर्ज करें');
          setLoading(false);
          return;
        }
        const data = await api<any>('/api/auth/login/otp', {
          method: 'POST',
          body: JSON.stringify({ phone, otp }),
        });
        setSession(data.accessToken, data.user);
        onClose();
        if (data.user.role === 'admin') router.push('/admin');
        else if (data.user.role === 'worker') router.push('/worker');
        else router.push('/dashboard');
      } else {
        // Password Login
        const data = await api<any>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone, password }),
        });
        setSession(data.accessToken, data.user);
        onClose();
        if (data.user.role === 'admin') router.push('/admin');
        else if (data.user.role === 'worker') router.push('/worker');
        else router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'लॉगिन असफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type: 'customer' | 'admin' | 'worker') {
    setError('');
    if (type === 'customer') {
      setRole('customer');
      setCustomerMode('password_login');
      setPhone('2222222222');
      setPassword('rahul@123');
      setEmail('rahul@tiffin.local');
    } else if (type === 'admin') {
      setRole('admin');
      setPhone('6261568086');
      setPassword('ChangeMeAdmin123!');
      setEmail('ayushdwivedi7502@gmail.com');
    } else if (type === 'worker') {
      setRole('worker');
      setPhone('3333333333');
      setPassword('om@123');
      setEmail('om@tiffin.local');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 dark:bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* SIMULATED INCOMING SMS TOAST BANNER */}
      {incomingSms && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 w-full max-w-md bg-stone-900 border-2 border-emerald-500 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 animate-bounce duration-1000">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-lg">
                💬
              </span>
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Real-time SMS (+91 {incomingSms.phone})
                </div>
                <div className="text-sm font-semibold text-stone-100 mt-0.5">
                  Your Jabalpur Tiffin verification OTP is{' '}
                  <span className="text-amber-400 font-black text-base tracking-widest">
                    {incomingSms.code}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingSms(null)}
              className="text-stone-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">Valid for 10 minutes</span>
            <button
              type="button"
              onClick={() => {
                setOtp(incomingSms.code);
                setIncomingSms(null);
              }}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1"
            >
              📋 Auto-Fill OTP ({incomingSms.code})
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8 transition-colors">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950 text-white p-6 sm:p-7 relative border-b border-emerald-700/50">
          {/* Cancel / Cut Cross Button (कट / कैंसिल का निशान) */}
          <button
            type="button"
            onClick={onClose}
            title="कैंसिल करें और वेबसाइट देखें (Close & Explore Website)"
            aria-label="Cancel and Close"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-red-600 text-white border border-white/20 hover:border-red-400 text-lg font-black transition-all shadow-md hover:scale-110 active:scale-95"
          >
            ✕
          </button>

          {/* Title Header */}
          <div className="flex items-center gap-3 pr-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 font-black text-xl shadow-lg shrink-0">
              🍛
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Jabalpur Tiffin <span className="text-amber-400">Portal</span>
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                घर जैसा स्वाद • शुद्ध, स्वच्छ और समय पर डिलीवरी
              </p>
            </div>
          </div>

          {/* 3 ROLE SELECTOR TABS */}
          <div className="mt-5 grid grid-cols-3 gap-2 bg-emerald-950/50 p-1.5 rounded-2xl backdrop-blur-sm border border-emerald-600/30">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                role === 'customer'
                  ? 'bg-white text-emerald-900 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>👤</span>
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                role === 'admin'
                  ? 'bg-stone-900 text-amber-400 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⚡</span>
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                role === 'worker'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🛵</span>
              <span>Worker</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Alert Banner (if triggered by selecting a plan) */}
          {alertBanner && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3.5 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 shadow-sm animate-pulse">
              <span className="text-base shrink-0">🔔</span>
              <span>{alertBanner}</span>
            </div>
          )}

          {/* Role Description Badge */}
          <div className="flex items-center justify-between text-xs">
            {role === 'customer' && (
              <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                🟢 Customer: Rahul (+91 2222222222)
              </span>
            )}
            {role === 'admin' && (
              <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                ⚡ Admin: Ayush Dwivedi (+91 6261568086)
              </span>
            )}
            {role === 'worker' && (
              <span className="font-bold text-orange-900 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                🛵 Staff: Om (+91 3333333333)
              </span>
            )}

            {/* Quick Demo Fill Buttons */}
            <button
              type="button"
              onClick={() => fillDemo(role)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              ⚡ Fill Demo Data
            </button>
          </div>

          {/* Customer Sub-mode Switches */}
          {role === 'customer' && (
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCustomerMode('password_login')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  customerMode === 'password_login'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('otp_login')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  customerMode === 'otp_login'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                📲 Login with OTP
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('register')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  customerMode === 'register'
                    ? 'bg-amber-500 text-stone-900'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                ✨ New Register
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 p-3 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* MAIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If Registering, show Full Name */}
            {role === 'customer' && customerMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Ayush"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* Mobile Number Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Mobile Number (मोबाइल नंबर) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-stone-500 dark:text-stone-400">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="6261568086"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 pl-11 pr-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Email Field (Optional for registration or shown for admin) */}
            {((role === 'customer' && customerMode === 'register') || role === 'admin') && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Email Address (ईमेल) {role === 'admin' ? '(Admin Owner)' : '(वैकल्पिक)'}
                </label>
                <input
                  type="email"
                  placeholder="ayushdwivedi7502@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* Password Field (for Password login or Register) */}
            {(customerMode === 'password_login' || customerMode === 'register' || role !== 'customer') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Password (पासवर्ड) *
                  </label>
                  {role === 'admin' && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      Pass: ChangeMeAdmin123!
                    </span>
                  )}
                  {role === 'worker' && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      Pass: om@123
                    </span>
                  )}
                  {role === 'customer' && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      Pass: rahul@123
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required={customerMode !== 'otp_login'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* OTP Section (If registering or OTP Login) */}
            {(customerMode === 'otp_login' || customerMode === 'register' || otpRequested) && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900 dark:text-stone-200">
                    Verification OTP (सत्यापन कोड) *
                  </label>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleSendOtp(customerMode === 'register' ? 'register' : 'login')
                    }
                    className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 underline disabled:opacity-50"
                  >
                    {otpRequested ? '🔄 Resend OTP' : '📲 Send OTP on Phone'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-3.5 py-2.5 text-center text-lg font-black tracking-widest outline-none focus:border-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  ⚠️ मोबाइल पर प्राप्त 6-अंकों का मान्य OTP दर्ज करें। गलत OTP स्वीकार नहीं किया जाएगा।
                </p>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                role === 'admin'
                  ? 'bg-stone-900 hover:bg-stone-800'
                  : role === 'worker'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-800/20'
              }`}
            >
              {loading
                ? 'Processing...'
                : role === 'admin'
                ? '⚡ Enter Admin Panel'
                : role === 'worker'
                ? '🛵 Open Worker Portal'
                : customerMode === 'register'
                ? '✨ Create Customer Account'
                : '🚀 Login to Customer Dashboard'}
            </button>
          </form>

          {/* Quick 1-Click Demo Buttons Row */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Demo Fill & Test:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('customer')}
                className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 p-2 text-center text-xs font-bold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                👤 Customer Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 p-2 text-center text-xs font-bold text-stone-900 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                ⚡ Ayush (Admin)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('worker')}
                className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2 text-center text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
              >
                🛵 Worker Demo
              </button>
            </div>
          </div>

          {/* Cancel & View Demo Button */}
          <div className="text-center pt-1 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white underline transition-colors"
            >
              ✕ कैंसिल करें और बिना लॉगिन वेबसाइट डेमो देखें (Explore Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
