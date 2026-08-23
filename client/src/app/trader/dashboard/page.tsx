'use client';

import React, { useState, useEffect } from 'react';
import { authApi } from '../../../Apis/Auth/auth.api';
import { bookingApi } from '../../../Apis/Booking/booking.api';
import { paymentApi } from '../../../Apis/Payment/payment.api';

export default function TraderDashboard() {
  const [trader, setTrader] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const sessionRes = await authApi.getTraderSession();
      setTrader(sessionRes.data);

      const bookingsRes = await bookingApi.getAllBookings();
      setBookings(bookingsRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    try {
      const res = await paymentApi.connectSetup();
      if (res && res.data && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate Stripe onboarding.');
    } finally {
      setStripeLoading(false);
    }
  };

  const syncProfileStatus = async () => {
    setStripeLoading(true);
    try {
      const sessionRes = await authApi.getTraderSession();
      setTrader(sessionRes.data);
      alert('Stripe payout status synced successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to sync Stripe status.');
    } finally {
      setStripeLoading(false);
    }
  };

  const copyBookingLink = () => {
    if (!trader) return;
    const url = `${window.location.origin}/chat?traderId=${trader.id}`;
    navigator.clipboard.writeText(url);
    alert('Customer Booking chat widget link copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-500 text-xs">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Profile & Stepper (5 columns) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Merchant profile */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4 shadow">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Merchant Profile</h2>
          <div className="space-y-3 text-sm text-zinc-300">
            <div>
              <span className="text-zinc-500 text-[10px] font-bold uppercase block tracking-wider">Business Name</span>
              {trader?.businessName || 'Tradesperson Business'}
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] font-bold uppercase block tracking-wider">Email Contact</span>
              {trader?.email}
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] font-bold uppercase block tracking-wider">Phone Number</span>
              {trader?.phone || 'N/A'}
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] font-bold uppercase block tracking-wider">Booking Link</span>
              <button
                onClick={copyBookingLink}
                className="mt-1 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 px-3 py-1.5 text-xs font-bold hover:bg-violet-600/20 transition cursor-pointer"
              >
                Copy Customer Chat Booking Link
              </button>
            </div>
          </div>
        </div>

        {/* Stripe Connect Stepper */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-5 shadow">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stripe Payout Stepper</h2>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
            <div className="relative">
              <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                ✓
              </span>
              <div className="text-xs font-bold text-white">1. Create TradeSlot Profile</div>
              <p className="text-[10px] text-zinc-500">Merchant account successfully registered on backend.</p>
            </div>

            <div className="relative">
              {trader?.stripeAccountId ? (
                <>
                  <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-white">2. Link Stripe Connect</div>
                  <p className="text-[10px] text-zinc-500 font-mono">Connected ID: {trader?.stripeAccountId}</p>
                </>
              ) : (
                <>
                  <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-bold">
                    2
                  </span>
                  <div className="text-xs font-bold text-zinc-400">2. Link Stripe Connect</div>
                  <p className="text-[10px] text-zinc-500 mb-2">Create a connected Stripe merchant account to collect payments.</p>
                  <button
                    onClick={handleConnectStripe}
                    disabled={stripeLoading}
                    className="rounded bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 text-[10px] font-bold transition disabled:opacity-50"
                  >
                    {stripeLoading ? 'Linking...' : 'Connect Stripe'}
                  </button>
                </>
              )}
            </div>

            <div className="relative">
              {trader?.stripeOnboarded ? (
                <>
                  <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-white">3. Onboarding Verification</div>
                  <p className="text-[10px] text-zinc-500">Stripe payout capabilities verified and ready for live checkout payments.</p>
                </>
              ) : (
                <>
                  <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-bold">
                    3
                  </span>
                  <div className="text-xs font-bold text-zinc-400">3. Onboarding Verification</div>
                  <p className="text-[10px] text-zinc-500 mb-2">Stripe verification checklist must be fully completed to activate checkout.</p>
                  {trader?.stripeAccountId && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleConnectStripe}
                        disabled={stripeLoading}
                        className="rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 px-3 py-1.5 text-[10px] font-bold transition"
                      >
                        Verify Onboarding Info
                      </button>
                      <button
                        onClick={syncProfileStatus}
                        disabled={stripeLoading}
                        className="rounded bg-violet-650/20 hover:bg-violet-650/30 text-violet-300 border border-violet-700/30 px-3 py-1.5 text-[10px] font-bold transition cursor-pointer"
                      >
                        Sync Stripe Status
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Schedule Timeline (7 columns) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6 shadow">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Visual Schedule Timeline</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5">Visualizing bookings and travel-time buffer limits to prevent overlaps.</p>
            </div>
            <span className="rounded-full bg-zinc-850 text-zinc-400 px-3 py-1 text-xs font-semibold">
              {bookings.length} Bookings
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-xs">No client bookings scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const startTime = new Date(booking.scheduledStart);
                const endTime = new Date(booking.scheduledEnd);
                const bufferMin = booking.travelBufferMinutes || 30;

                const bufferStart = new Date(startTime.getTime() - bufferMin * 60 * 1000);
                const bufferEnd = new Date(endTime.getTime() + bufferMin * 60 * 1000);

                return (
                  <div key={booking.id} className="relative pl-4 border-l border-zinc-800 space-y-2">
                    <div className="flex flex-col space-y-1">
                      
                      {/* Top Travel Buffer Box */}
                      <div className="bg-[repeating-linear-gradient(45deg,#27272a,#27272a_6px,#18181b_6px,#18181b_12px)] border border-zinc-850 p-2 rounded-lg text-[10px] text-zinc-400 flex justify-between items-center">
                        <span className="font-semibold uppercase text-zinc-600">⚠ Travel Buffer block</span>
                        <span>
                          {bufferStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({bufferMin}m buffer)
                        </span>
                      </div>

                      {/* Main Job Appointment Box */}
                      <div className="bg-violet-950/20 border border-violet-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-white">
                              {booking.customerName || 'Pending Client'}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                  : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            {booking.customerEmail} • {booking.customerPhone}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Address: {booking.jobAddress || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start sm:items-end gap-1 font-mono text-xs">
                          <span className="text-white font-bold">
                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-zinc-500 text-[10px] font-sans">
                            Job Duration: {booking.jobDurationMinutes} mins
                          </span>
                          <span className="text-violet-400 font-bold mt-1 text-sm">
                            {Number(booking.bookingFee).toLocaleString('en-GB', {
                              style: 'currency',
                              currency: booking.currency || 'GBP',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Travel Buffer Box */}
                      <div className="bg-[repeating-linear-gradient(45deg,#27272a,#27272a_6px,#18181b_6px,#18181b_12px)] border border-zinc-850 p-2 rounded-lg text-[10px] text-zinc-400 flex justify-between items-center">
                        <span className="font-semibold uppercase text-zinc-600">⚠ Travel Buffer block</span>
                        <span>
                          {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {bufferEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({bufferMin}m buffer)
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
