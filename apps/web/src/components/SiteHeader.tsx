'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const u = localStorage.getItem('user');
    setLoggedIn(!!localStorage.getItem('accessToken'));
    if (u) {
      try {
        setRole(JSON.parse(u).role);
      } catch {}
    }
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Menu', href: '/menu' },
    { name: 'Plans', href: '/plans' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur shadow-sm border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8 3 4 5 4 8v8c0 3 4 5 8 5s8-2 8-5V8c0-3-4-5-8-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12c0 3 4 5 8 5s8-2 8-5" />
            </svg>
          </div>
          <div>
            <span className="block text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
              Jabalpur Tiffin <span className="text-emerald-700 dark:text-emerald-400">Service</span>
            </span>
            <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
              Healthy Food • Happy Life
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-stone-700 dark:text-stone-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors hover:text-emerald-700 dark:hover:text-emerald-400 ${
                pathname === link.href ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Mode Switcher */}
          <ThemeToggle />

          {/* Desktop Auth Links */}
          <div className="hidden lg:flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                >
                  👤 Dashboard
                </Link>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    className="rounded-full bg-stone-900 dark:bg-amber-500 px-4 py-2 text-sm font-semibold text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors shadow-xs"
                  >
                    ⚡ Admin Panel
                  </Link>
                )}
                {role === 'worker' && (
                  <Link
                    href="/worker"
                    className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                  >
                    🛵 Worker Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="rounded-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-5 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-700 hover:border-stone-400 bg-white dark:bg-stone-800 transition-all shadow-xs"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-emerald-800 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-emerald-50 dark:bg-emerald-950 py-2.5 font-semibold text-emerald-800 dark:text-emerald-300"
                >
                  Dashboard
                </Link>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-lg bg-stone-900 dark:bg-amber-500 py-2.5 font-semibold text-white dark:text-stone-950"
                  >
                    Admin Panel
                  </Link>
                )}
                {role === 'worker' && (
                  <Link
                    href="/worker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-lg bg-amber-600 py-2.5 font-semibold text-white"
                  >
                    Worker Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="w-full text-center py-2 text-red-600 dark:text-red-400 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg border border-stone-300 dark:border-stone-700 py-2.5 font-semibold text-stone-700 dark:text-stone-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-lg bg-emerald-800 py-2.5 font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
