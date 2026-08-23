'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { bookingApi } from '../../../Apis/Booking/booking.api';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) {
      setError('Missing bookingId query parameter.');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getPublicBookingById(bookingId);
        setBooking(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve booking confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-550 text-xs">Fetching booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-red-950/30 border border-red-900 rounded-xl p-6 text-center space-y-4 max-w-sm">
        <h1 className="text-red-400 font-bold text-lg">⚠️ Error</h1>
        <p className="text-xs text-red-200">{error || 'Booking confirmation details could not be found.'}</p>
        <Link
          href="/chat"
          className="inline-block rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition"
        >
          Return to Chat
        </Link>
      </div>
    );
  }

  const start = new Date(booking.scheduledStart);
  const end = new Date(booking.scheduledEnd);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
      <div className="space-y-2">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payment Successful!</h1>
        <p className="text-xs text-zinc-400">Your TradeSlot booking has been confirmed and locked in.</p>
      </div>

      <div className="border-t border-b border-zinc-800 py-4 text-left text-xs space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-550 uppercase font-bold tracking-wide text-[10px]">Booking Reference</span>
          <span className="font-mono text-zinc-300 select-all font-semibold">{booking.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-550 uppercase font-bold tracking-wide text-[10px]">Date</span>
          <span className="text-zinc-300 font-semibold">{start.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-550 uppercase font-bold tracking-wide text-[10px]">Time Slot</span>
          <span className="text-zinc-300 font-semibold font-mono">
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-550 uppercase font-bold tracking-wide text-[10px]">Trader Profile</span>
          <span className="text-zinc-300 font-semibold">{booking.traderName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-550 uppercase font-bold tracking-wide text-[10px]">Status</span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-[9px] font-bold uppercase">
            {booking.status}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-zinc-550 leading-relaxed">
        A confirmation receipt has been logged. The merchant will arrive at the site address during the selected slot.
      </p>

      <div className="pt-2">
        <Link
          href={`/chat?traderId=${searchParams.get('traderId') || ''}`}
          className="block text-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-bold transition shadow-lg"
        >
          Book Another Service
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <Suspense fallback={<div className="text-zinc-500 text-xs">Loading payment success screen...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
