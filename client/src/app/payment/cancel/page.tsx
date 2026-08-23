'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentCancelContent() {
  const searchParams = useSearchParams();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
      <div className="space-y-2">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
          !
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Payment Cancelled</h1>
        <p className="text-xs text-zinc-400">The Stripe Checkout transaction was not finalized.</p>
      </div>

      <p className="text-xs text-zinc-550 leading-relaxed">
        Your booking slot remains pending and has not been confirmed. Please complete checkout to lock in your booking slot.
      </p>

      <div className="pt-2">
        <Link
          href={`/chat?traderId=${searchParams.get('traderId') || ''}`}
          className="block text-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 text-xs font-bold transition border border-zinc-700 shadow"
        >
          Return to Booking Assistant
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <Suspense fallback={<div className="text-zinc-500 text-xs">Loading payment cancel screen...</div>}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}
