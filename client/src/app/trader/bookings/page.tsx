'use client';

import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../../Apis/Booking/booking.api';

export default function BookingsRegistry() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getAllBookings();
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings list', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-550 text-xs">Loading bookings registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Bookings Registry</h2>
          <p className="text-[10px] text-zinc-550 mt-0.5">Comprehensive view of all customer scheduled jobs and payouts.</p>
        </div>
        <span className="rounded-full bg-zinc-850 text-zinc-400 px-3 py-1 text-xs font-semibold">
          {bookings.length} Total
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-xs">No customer bookings found in the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time Slot</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Booking Status</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Fee</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const start = new Date(b.scheduledStart);
                const end = new Date(b.scheduledEnd);
                
                // Determine channel
                let channelText = 'DIRECT_FORM';
                if (b.conversation) {
                  channelText = b.conversation.channel || 'WEB_CHAT';
                }

                // Payment Status
                const paymentStatus = b.payment ? b.payment.status : 'UNPAID';

                return (
                  <tr key={b.id} className="border-b border-zinc-850 hover:bg-zinc-950/40 text-zinc-300 transition">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div>{b.customerName || 'Guest Client'}</div>
                      <div className="text-[10px] text-zinc-550 font-normal mt-0.5">{b.customerEmail || b.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4">{start.toLocaleDateString()}</td>
                    <td className="py-4 px-4 font-mono">
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded bg-zinc-950 border border-zinc-800 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                        {channelText}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                            : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          paymentStatus === 'SUCCEEDED'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : paymentStatus === 'PENDING'
                            ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-violet-400 font-mono text-sm">
                      {Number(b.bookingFee).toLocaleString('en-GB', {
                        style: 'currency',
                        currency: b.currency || 'GBP',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
