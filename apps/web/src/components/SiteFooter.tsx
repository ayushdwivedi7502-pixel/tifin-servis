import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-[#064e3b] text-white pt-14 pb-8 border-t border-emerald-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-800/60">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8 3 4 5 4 8v8c0 3 4 5 8 5s8-2 8-5V8c0-3-4-5-8-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12c0 3 4 5 8 5s8-2 8-5" />
                </svg>
              </div>
              <div>
                <span className="block text-lg font-bold text-white leading-tight">
                  Jabalpur Tiffin <span className="text-amber-400">Service</span>
                </span>
                <span className="block text-xs text-emerald-300 font-medium">
                  Healthy Food • Happy Life
                </span>
              </div>
            </div>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              जबलपुर का सबसे विश्वसनीय होममेड टिफिन सर्विस। कॉलेज छात्रों, हॉस्टल, पीजी और कामकाजी लोगों के लिए शुद्ध, ताजा और पौष्टिक भोजन।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/menu" className="hover:text-amber-400 transition-colors">Menu</Link></li>
              <li><Link href="/plans" className="hover:text-amber-400 transition-colors">Plans</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">Support</h3>
            <ul className="space-y-2.5 text-sm text-emerald-100/80">
              <li><Link href="/faq" className="hover:text-amber-400 transition-colors">Help & FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-400 transition-colors">Cancellation & Refund Policy</Link></li>
              <li><Link href="/service-areas" className="hover:text-amber-400 transition-colors">Service Areas in Jabalpur</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-base font-bold text-white mb-4 tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm text-emerald-100/90">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 text-lg">📍</span>
                <span>Wright Town / Napier Town, Jabalpur, Madhya Pradesh - 482001</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-amber-400 text-lg">📞</span>
                <span>+91 6261568086</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg">💬</span>
                <span>+91 6261568086 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-amber-400 text-lg">✉️</span>
                <span>ayushdwivedi7502@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
          <p>© 2025 Jabalpur Tiffin Service. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Jabalpur Tiffin Service</span>
            <span>•</span>
            <span>Healthy Food</span>
            <span>•</span>
            <span>Happy Life</span>
            <span>•</span>
            <span>Built with ❤️ for Jabalpur</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
