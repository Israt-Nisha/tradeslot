'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between">
      {/* Navbar */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
          TradeSlot
        </Link>
        <div className="flex gap-4 text-sm font-medium text-zinc-400">
          <Link href="/login" className="hover:text-white transition">Trader Login</Link>
          <Link href="/register" className="hover:text-white transition">Trader Register</Link>
          <Link href="/book" className="hidden">Book Trader</Link>
          <Link href="/" className="hover:text-white transition">Book Trader</Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-zinc-950 to-zinc-950">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/50 py-4 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} TradeSlot platform. All rights reserved.
      </footer>
    </div>
  );
}
