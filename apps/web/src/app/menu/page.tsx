'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MenuItem {
  id: string;
  nameHindi: string;
  nameEng: string;
  category: string;
  portion: string;
  price: number;
  image: string;
  description: string;
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['All', 'North Indian', 'Roti', 'Sabzi', 'Dal', 'Rice', 'Salad'];

  const menuItems: MenuItem[] = [
    {
      id: 'roti_2',
      nameHindi: 'रोटी (2 pcs)',
      nameEng: 'Fresh Tawa Phulka',
      category: 'Roti',
      portion: '2 pcs with Ghee',
      price: 10,
      image: '/images/roti.jpg',
      description: 'गरमा-गरम शुद्ध गेहूं की फूली हुई तवा रोटी',
    },
    {
      id: 'rice_1',
      nameHindi: 'चावल (1 bowl)',
      nameEng: 'Steamed Basmati Rice',
      category: 'Rice',
      portion: '1 bowl (200g)',
      price: 20,
      image: '/images/rice.jpg',
      description: 'ताजा स्टीम्ड खुशबूदार जीरा बासमती चावल',
    },
    {
      id: 'dal_1',
      nameHindi: 'दाल (1 bowl)',
      nameEng: 'Arhar Dal Tadka',
      category: 'Dal',
      portion: '1 bowl',
      price: 30,
      image: '/images/dal.jpg',
      description: 'देसी घी और जीरा-लहसुन तड़के वाली अरहर दाल',
    },
    {
      id: 'sabzi_1',
      nameHindi: 'सब्जी (1 bowl)',
      nameEng: 'Seasonal Sabzi',
      category: 'Sabzi',
      portion: '1 bowl',
      price: 40,
      image: '/images/kitchen_banner.jpg',
      description: 'आज की ताजी मौसमी हरी सब्जी',
    },
    {
      id: 'mix_veg',
      nameHindi: 'मिक्स सब्जी',
      nameEng: 'Mixed Vegetable Curry',
      category: 'North Indian',
      portion: '1 full portion',
      price: 50,
      image: '/images/deluxe_thali.jpg',
      description: 'गोभी, गाजर, मटर और पनीर का पौष्टिक मेल',
    },
    {
      id: 'chana_masala',
      nameHindi: 'चना मसाला',
      nameEng: 'Amritsari Chole',
      category: 'North Indian',
      portion: '1 full portion',
      price: 50,
      image: '/images/deluxe_thali.jpg',
      description: 'स्वादिष्ट मसालेदार पंजाबी काबुली चना',
    },
    {
      id: 'rajma',
      nameHindi: 'राजमा',
      nameEng: 'Punjabi Rajma Masala',
      category: 'North Indian',
      portion: '1 full portion',
      price: 60,
      image: '/images/dal.jpg',
      description: 'धीमी आंच पर पका गाढ़ा और स्वादिष्ट राजमा',
    },
    {
      id: 'paneer_sabzi',
      nameHindi: 'पनीर सब्जी',
      nameEng: 'Shahi Paneer Butter Masala',
      category: 'North Indian',
      portion: '1 full portion',
      price: 70,
      image: '/images/paneer.jpg',
      description: 'ताजे सॉफ्ट पनीर और रिच रिच ग्रेवी का स्पेशल स्वाद',
    },
  ];

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter((i) => i.category === activeCategory || (activeCategory === 'Sabzi' && i.category === 'North Indian'));

  const addToCart = (item: MenuItem) => {
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    setToastMessage(`Added ${item.nameHindi} (₹${item.price}) to Extra Order!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCartPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const it = menuItems.find((m) => m.id === id);
    return sum + (it ? it.price * qty : 0);
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          हमारा मेन्यू
        </h1>
        <p className="text-base text-stone-600">
          ताजा, पौष्टिक और स्वादिष्ट भोजन — अलग से एक्स्ट्रा ऑर्डर करने की सुविधा के साथ
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Grid (Matches Panel 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.nameHindi}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                  {item.portion}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 leading-tight">
                    {item.nameHindi}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{item.nameEng}</p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-stone-900">₹ {item.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    + Add {qty > 0 && `(${qty})`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Bar if Items Added */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-6 border border-stone-700 animate-bounce">
          <div>
            <span className="text-xs text-stone-400 block">Extra Add-on Cart</span>
            <span className="text-base font-bold text-amber-400">
              {totalCartCount} items • ₹{totalCartPrice}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            Go to Checkout →
          </Link>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 text-sm font-semibold animate-fade-in">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}
