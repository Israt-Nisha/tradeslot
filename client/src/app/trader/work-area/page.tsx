'use client';

import React, { useState, useEffect } from 'react';
import { workAreaApi } from '../../../Apis/WorkArea/workArea.api';
import { authApi } from '../../../Apis/Auth/auth.api';

export default function WorkAreaPage() {
  const [trader, setTrader] = useState<any>(null);
  const [workAreas, setWorkAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [areaName, setAreaName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [date, setDate] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkAreas = async () => {
    try {
      const sessionRes = await authApi.getTraderSession();
      setTrader(sessionRes.data);

      const res = await workAreaApi.getAllWorkAreas();
      setWorkAreas(res.data);
    } catch (err) {
      console.error('Failed to load work areas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkAreas();
  }, []);

  const handleSaveWorkArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    setSubmitting(true);

    try {
      // Direct call to POST /api/v1/trader/work-area via workAreaApi client mapping
      const res = await workAreaApi.createWorkArea({
        areaName,
        postcode,
        date: new Date(date).toISOString(),
      });

      setWorkAreas((prev) => [...prev, res.data]);
      
      // Update local storage sync for scheduling chatbot widgets
      if (trader) {
        localStorage.setItem(
          `tradeslot_workareas_${trader.id}`,
          JSON.stringify([...workAreas, res.data])
        );
      }

      setStatusMessage('Work area saved successfully.');
      setAreaName('');
      setPostcode('');
      setDate('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save daily work zone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkArea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this daily work area?')) return;
    try {
      await workAreaApi.deleteWorkArea(id);
      const updated = workAreas.filter((wa) => wa.id !== id);
      setWorkAreas(updated);
      if (trader) {
        localStorage.setItem(`tradeslot_workareas_${trader.id}`, JSON.stringify(updated));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete work area');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-550 text-xs">Loading daily work zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Set Work Area Form (5 cols) */}
      <form onSubmit={handleSaveWorkArea} className="md:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Set Daily Work Area</h2>
        <p className="text-[10px] text-zinc-550">Specify the location where you will be working for a given date.</p>

        {statusMessage && (
          <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900 p-3 rounded-lg font-semibold">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-900 p-3 rounded-lg font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1">Target Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1">Work Zone Location</label>
            <input
              type="text"
              required
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500"
              placeholder="e.g. West London"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider mb-1">Postcode sector (optional)</label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500"
              placeholder="e.g. SW1A"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Work Area'}
        </button>
      </form>

      {/* Active Work Zones List (7 cols) */}
      <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Daily Work Zones</h2>
        
        {workAreas.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-xs">No active daily work zones configured.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workAreas.map((wa) => (
              <div
                key={wa.id}
                className="flex justify-between items-center p-4 rounded-lg bg-zinc-950 border border-zinc-850"
              >
                <div>
                  <div className="text-sm font-bold text-white">{wa.areaName}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Date: {new Date(wa.date).toLocaleDateString()} {wa.postcode && `• Postcode: ${wa.postcode}`}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWorkArea(wa.id)}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-zinc-850 px-3 py-1.5 text-xs font-bold transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
