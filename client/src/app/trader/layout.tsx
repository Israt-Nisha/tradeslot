'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../Apis/Auth/auth.api';

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    authApi.getTraderSession()
      .then((res) => {
        setEmail(res.data.email);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        router.push('/login');
      });
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            TradeSlot Trader Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden sm:inline text-sm text-zinc-400">
              {email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <Link
              href="/trader/dashboard"
              className={`flex-1 md:flex-initial rounded-lg px-4 py-2.5 text-sm font-semibold text-center md:text-left transition ${
                pathname === '/trader/dashboard'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              href="/trader/work-area"
              className={`flex-1 md:flex-initial rounded-lg px-4 py-2.5 text-sm font-semibold text-center md:text-left transition ${
                pathname === '/trader/work-area'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Work Area Planner
            </Link>
            <Link
              href="/trader/bookings"
              className={`flex-1 md:flex-initial rounded-lg px-4 py-2.5 text-sm font-semibold text-center md:text-left transition ${
                pathname === '/trader/bookings'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Bookings Registry
            </Link>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 bg-zinc-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
