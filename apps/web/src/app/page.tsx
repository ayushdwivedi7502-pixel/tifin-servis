'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
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
}

export default function HomePage() {
  const router = useRouter();
  // Show login modal upfront on page load, can be closed via cross '✕'
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authBanner, setAuthBanner] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    // Fetch live plans from API
    api<Plan[]>('/api/plans')
      .then(setPlans)
      .catch(() => {
        // Fallback plans
        setPlans([
          {
            _id: 'plan_1',
            name: 'Single Meal Trial Plan',
            description: '1 समय का ताजा भोजन (लंच या डिनर)। स्टूडेंट्स और नए कस्टमर्स के लिए बेस्ट।',
            pricePaise: 8000,
            mealType: 'single_meal',
            durationType: 'trial',
            includedItems: ['4 तवा रोटी', '1 मौसमी सब्जी', 'दाल फ्राई', 'चावल', 'सलाद'],
          },
          {
            _id: 'plan_2',
            name: 'Weekly Lunch Only Plan',
            description: '7-दिन दोपहर का पौष्टिक टिफिन। कॉलेज छात्र और ऑफिस के लिए किफायती।',
            pricePaise: 70000,
            mealType: 'lunch_only',
            durationType: 'weekly',
            includedItems: ['4 रोटी', 'दाल तड़का', 'सब्जी', 'जीरा राइस', 'सलाद'],
          },
          {
            _id: 'plan_3',
            name: 'Monthly Lunch Only',
            description: '30 दिन दोपहर 12:30 बजे घर जैसा पौष्टिक टिफिन समय पर डिलीवरी।',
            pricePaise: 240000,
            mealType: 'lunch_only',
            durationType: 'monthly',
            includedItems: ['4 तवा रोटी', 'दाल फ्राई', 'सब्जी', 'चावल', 'सलाद', 'पापड़'],
          },
          {
            _id: 'plan_4',
            name: 'Monthly Dinner Only',
            description: '30 दिन रात 8:00 बजे शुद्ध, हल्का और सुपाच्य भोजन सीधे आपके कमरे/घर पर।',
            pricePaise: 240000,
            mealType: 'dinner_only',
            durationType: 'monthly',
            includedItems: ['4 ताजी रोटी', 'दाल तड़का', 'पनीर/सब्जी', 'चावल', 'सलाद'],
          },
          {
            _id: 'plan_5',
            name: 'Monthly Lunch + Dinner Combo Deluxe',
            description: 'दोनों समय का संपूर्ण स्वादिष्ट और पौष्टिक भोजन। सबसे ज्यादा बचत और पसंद किया जाने वाला।',
            pricePaise: 450000,
            mealType: 'lunch_and_dinner',
            durationType: 'monthly',
            includedItems: ['4 रोटी (प्रत्येक मील)', '2 तरह की सब्जी', 'दाल तड़का', 'बासमती राइस', 'संडे स्पेशल स्वीट', 'सलाद'],
          },
        ]);
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  // Intercept selection if not logged in
  function handleSelectPlan(planId: string, planName: string) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAuthBanner(`🔔 आपने "${planName}" चुना है! आगे बढ़ने और सब्सक्राइब करने के लिए कृपया पहले लॉगिन करें।`);
      setShowAuthModal(true);
    } else {
      router.push(`/plans/${planId}`);
    }
  }

  const targetAudiences = [
    { icon: '🎓', title: 'College Students', hindi: '(छात्र)', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300' },
    { icon: '🏠', title: 'Hostel / PG Residents', hindi: '(हॉस्टल/पीजी)', bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300' },
    { icon: '💼', title: 'Working Professionals', hindi: '(कामकाजी लोग)', bg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300' },
    { icon: '👨‍👩‍👧‍👦', title: 'Families', hindi: '(परिवार)', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300' },
    { icon: '✨', title: '& More', hindi: '(और भी बहुत कुछ)', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300' },
  ];

  return (
    <div className="relative space-y-16 pb-16 transition-colors">
      {/* 1. LOGIN MODAL (Opens on page load, can be cancelled with '✕' button) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthBanner('');
        }}
        alertBanner={authBanner}
      />

      {/* Floating Re-open Login Button (Visible when modal is closed) */}
      {!showAuthModal && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={() => {
              setAuthBanner('');
              setShowAuthModal(true);
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-800 to-teal-800 dark:from-emerald-700 dark:to-teal-700 px-5 py-3 text-sm font-extrabold text-white shadow-2xl hover:scale-105 transition-all border-2 border-amber-400"
          >
            <span>🔐</span>
            <span>लॉगिन / साइन-अप करें</span>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/80 px-4 py-1.5 border border-emerald-400/40 text-xs font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Jabalpur Tiffin Service • Director: Ayush Dwivedi (+91 6261568086)
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                घर जैसा स्वाद, <br />
                <span className="text-amber-400">हर दिन</span>
              </h1>

              <p className="text-lg sm:text-xl text-emerald-100/90 font-medium">
                हमारी टिफिन सेवा अब आपके शहर <span className="font-bold text-white underline decoration-amber-400">जबलपुर</span> में — शुद्ध, पौष्टिक और समय पर डिलीवरी
              </p>

              {/* Checkpoints */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-emerald-50">
                <li className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-900 text-xs font-bold">✓</span>
                  Fresh & Hygienic Home Food
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-900 text-xs font-bold">✓</span>
                  Daily On-Time Delivery in Jabalpur
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-900 text-xs font-bold">✓</span>
                  Affordable Daily, Weekly & Monthly Plans
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-900 text-xs font-bold">✓</span>
                  Customer, Admin & Worker Portals
                </li>
              </ul>

              {/* Hero Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                      setAuthBanner('🔔 कृपया प्लान सब्सक्राइब करने के लिए पहले लॉगिन करें।');
                      setShowAuthModal(true);
                    } else {
                      router.push('/plans');
                    }
                  }}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/30 hover:from-amber-600 hover:to-orange-700 transition-all hover:scale-105 active:scale-100 flex items-center gap-2"
                >
                  <span>🍛</span>
                  <span>आज ही Subscribe करें</span>
                </button>
                <Link
                  href="/plans"
                  className="rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white hover:text-stone-900 transition-all backdrop-blur"
                >
                  हमारे प्लान देखें
                </Link>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-md w-full aspect-[4/3] group">
                <Image
                  src="/images/hero_tiffin.jpg"
                  alt="Jabalpur Tiffin Service Fresh Meal"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute top-4 right-4 bg-emerald-900/90 border-2 border-amber-400 text-amber-300 rounded-full h-20 w-20 flex flex-col items-center justify-center text-center p-2 shadow-xl backdrop-blur">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Fresh &</span>
                  <span className="text-xs font-extrabold text-white">Homemade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Highlights Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-xl border border-stone-100 dark:border-stone-800 transition-colors">
          <div className="flex items-center gap-4 p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-2xl shadow-inner">
              🥗
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">Fresh & Healthy</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">घर जैसा स्वाद</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 text-2xl shadow-inner">
              🛵
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">Timely Delivery</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">समय पर डिलीवरी</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-2xl shadow-inner">
              🏷️
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">Affordable Plans</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">किफायती कीमत</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-2xl shadow-inner">
              💬
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">Direct Support</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">+91 6261568086</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR & DYNAMIC PLANS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              ✨ लाइव टिफिन प्लान (Live Plans)
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              हमारे लोकप्रिय टिफिन प्लान
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              अपनी पसंद और सुविधानुसार सबसे बेहतर टिफिन प्लान चुनें — शुद्ध, स्वादिष्ट और किफायती
            </p>
          </div>
          <Link
            href="/plans"
            className="text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:underline flex items-center gap-1 group"
          >
            सभी विस्तृत प्लान देखें
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loadingPlans ? (
          <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-sm">लोड हो रहा है...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-2xl transition-all flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      {plan.durationType}
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                      {plan.mealType?.replaceAll('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {plan.name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-800 dark:text-emerald-400">
                      {formatINR(plan.pricePaise)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      / {plan.durationType === 'monthly' ? 'माह' : plan.durationType === 'weekly' ? 'सप्ताह' : 'ट्रायल'}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Included Items */}
                  {plan.includedItems && plan.includedItems.length > 0 && (
                    <div className="mt-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-100 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-200">
                      <strong className="block text-emerald-900 dark:text-emerald-300 font-bold mb-1">थाली में शामिल:</strong>
                      <p className="leading-snug">{plan.includedItems.join(' • ')}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan._id, plan.name)}
                    className="w-full text-center rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white py-3 text-sm font-bold transition-all shadow-sm active:scale-95"
                  >
                    चुनें व सब्सक्राइब करें →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Target Audiences ("हमारी सेवा किसके लिए?") */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            हमारी सेवा किसके लिए?
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            जबलपुर में हर उस व्यक्ति के लिए जो घर का स्वादिष्ट खाना मिस करता है
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {targetAudiences.map((aud) => (
            <div
              key={aud.title}
              className="bg-white dark:bg-stone-900 rounded-2xl p-6 text-center border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-center group"
            >
              <div className={`h-16 w-16 rounded-2xl ${aud.bg} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-inner`}>
                {aud.icon}
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">{aud.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">{aud.hindi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Banner: Clean Kitchen & Hygiene */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 rounded-3xl p-6 sm:p-10 border border-amber-200 dark:border-stone-700 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border-2 border-amber-200 dark:border-stone-700">
              <Image
                src="/images/kitchen_banner.jpg"
                alt="Clean Hygienic Kitchen Jabalpur Tiffin Service"
                fill
                className="object-cover"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-bold tracking-widest text-emerald-800 dark:text-emerald-400 uppercase">
                स्वच्छ भोजन | शुद्ध रसोई | संचालक: आयुष द्विवेदी
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                Jabalpur Tiffin Service <br />
                <span className="text-emerald-700 dark:text-emerald-400">आपके भरोसे के साथ</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                हम आपके लिए वही खाना बनाते हैं जो हम अपने परिवार के लिए बनाते हैं — 100% शुद्ध तेल, ताजी सब्जियाँ और आरओ पानी से तैयार किया गया संपूर्ण पौष्टिक भोजन।
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthBanner('');
                    setShowAuthModal(true);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-all shadow-md"
                >
                  लॉगिन / रजिस्टर करें
                </button>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-6 py-3 text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-sm"
                >
                  हमारे बारे में जानें
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
