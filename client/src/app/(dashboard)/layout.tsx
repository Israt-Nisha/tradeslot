'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../Apis/Auth/auth.api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    authApi.getTraderSession()
      .then((res) => {
        setEmail(res.data.email);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            TradeSlot Dashboard
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
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
