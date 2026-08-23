'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../Apis/Auth/auth.api';
import { bookingApi } from '../../../Apis/Booking/booking.api';
import { paymentApi } from '../../../Apis/Payment/payment.api';
import { workAreaApi } from '../../../Apis/WorkArea/workArea.api';
import { conversationApi } from '../../../Apis/Conversation/conversation.api';

export default function DashboardPage() {
  const router = useRouter();
  const [trader, setTrader] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [workAreas, setWorkAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs for Schedule/Inbox
  const [activeRightTab, setActiveRightTab] = useState<'schedule' | 'inbox'>('schedule');

  // Inbox States
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Form states for WorkArea
  const [areaName, setAreaName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [date, setDate] = useState('');
  const [workAreaError, setWorkAreaError] = useState('');
  const [workAreaLoading, setWorkAreaLoading] = useState(false);

  // Stripe onboarding state
  const [stripeLoading, setStripeLoading] = useState(false);

  // Local Storage Synchronization Helpers
  const updateTraderDirectory = (traderData: any) => {
    if (!traderData || !traderData.id) return;
    try {
      const localData = localStorage.getItem('tradeslot_traders_directory');
      let directory = localData ? JSON.parse(localData) : [];
      if (!Array.isArray(directory)) directory = [];
      const index = directory.findIndex((t: any) => t.id === traderData.id);
      const item = {
        id: traderData.id,
        name: traderData.name,
        businessName: traderData.businessName || 'Independent Trader',
        email: traderData.email,
        phone: traderData.phone || '',
        stripeOnboarded: traderData.stripeOnboarded || false,
      };
      if (index > -1) {
        directory[index] = item;
      } else {
        directory.push(item);
      }
      localStorage.setItem('tradeslot_traders_directory', JSON.stringify(directory));
    } catch (err) {
      console.error('Failed to update trader directory', err);
    }
  };

  const updateWorkAreasLocal = (traderId: string, areas: any[]) => {
    if (!traderId) return;
    try {
      localStorage.setItem(`tradeslot_workareas_${traderId}`, JSON.stringify(areas));
    } catch (err) {
      console.error('Failed to sync work areas to local storage', err);
    }
  };

  const syncProfileStatus = async () => {
    setStripeLoading(true);
    try {
      const sessionRes = await authApi.getTraderSession();
      setTrader(sessionRes.data);
      updateTraderDirectory(sessionRes.data);
      alert('Stripe payout status synced successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to sync Stripe status.');
    } finally {
      setStripeLoading(false);
    }
  };

  // Fetch initial profile & configs
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const sessionRes = await authApi.getTraderSession();
        setTrader(sessionRes.data);
        updateTraderDirectory(sessionRes.data);

        const bookingsRes = await bookingApi.getAllBookings();
        setBookings(bookingsRes.data);

        const workAreasRes = await workAreaApi.getAllWorkAreas();
        setWorkAreas(workAreasRes.data);
        updateWorkAreasLocal(sessionRes.data.id, workAreasRes.data);
      } catch (err: any) {
        console.error('Session or data load failed:', err.message);
        localStorage.removeItem('authToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Fetch Conversations list when switching to Inbox tab
  useEffect(() => {
    if (activeRightTab !== 'inbox') return;

    const fetchConversations = async () => {
      try {
        const res = await conversationApi.getAllConversations();
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to load conversations list', err);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [activeRightTab]);

  // Fetch selected conversation message history
  useEffect(() => {
    if (!selectedConversationId || activeRightTab !== 'inbox') return;

    const fetchMessages = async () => {
      try {
        const res = await conversationApi.getConversationMessages(selectedConversationId);
        setChatMessages(res.data);
        // Write to localStorage for client to fetch
        localStorage.setItem(`tradeslot_chat_${selectedConversationId}`, JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversationId, activeRightTab]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const handleAddWorkArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkAreaError('');
    setWorkAreaLoading(true);

    try {
      const res = await workAreaApi.createWorkArea({
        areaName,
        postcode,
        date: new Date(date).toISOString(),
      });
      const updatedAreas = [...workAreas, res.data];
      setWorkAreas(updatedAreas);
      if (trader) {
        updateWorkAreasLocal(trader.id, updatedAreas);
      }
      setAreaName('');
      setPostcode('');
      setDate('');
    } catch (err: any) {
      setWorkAreaError(err.message || 'Failed to create work area');
    } finally {
      setWorkAreaLoading(false);
    }
  };

  const handleDeleteWorkArea = async (id: string) => {
    try {
      await workAreaApi.deleteWorkArea(id);
      const updatedAreas = workAreas.filter((wa) => wa.id !== id);
      setWorkAreas(updatedAreas);
      if (trader) {
        updateWorkAreasLocal(trader.id, updatedAreas);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete work area');
    }
  };

  const copyBookingLink = () => {
    if (!trader) return;
    const url = `${window.location.origin}/?traderId=${trader.id}`;
    navigator.clipboard.writeText(url);
    alert('Booking link copied to clipboard!');
  };

  const copyChatLink = () => {
    if (!trader) return;
    const url = `${window.location.origin}/chat?traderId=${trader.id}`;
    navigator.clipboard.writeText(url);
    alert('Customer Chat link copied to clipboard!');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedConversationId) return;

    const text = chatInputText;
    setChatInputText('');
    setChatLoading(true);

    try {
      await conversationApi.sendMessage(selectedConversationId, {
        direction: 'OUTBOUND',
        senderId: 'trader_dashboard',
        content: text,
      });

      // Update local message state and write to localStorage
      const res = await conversationApi.getConversationMessages(selectedConversationId);
      setChatMessages(res.data);
      localStorage.setItem(`tradeslot_chat_${selectedConversationId}`, JSON.stringify(res.data));
    } catch (err) {
      alert('Failed to send chat reply');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 text-white font-sans min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 w-full items-start">
      
      {/* Left Column - Profile & Configs (4 Cols) */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Merchant Profile</h2>
          <div className="space-y-2 text-sm text-zinc-300">
            <div><span className="text-zinc-500 text-xs font-semibold uppercase block">Business Name</span> {trader?.businessName || 'Tradesperson Business'}</div>
            <div><span className="text-zinc-500 text-xs font-semibold uppercase block">Email Contact</span> {trader?.email}</div>
            <div><span className="text-zinc-500 text-xs font-semibold uppercase block">Phone Number</span> {trader?.phone || 'N/A'}</div>
            <div>
              <span className="text-zinc-500 text-xs font-semibold uppercase block">Trader ID</span> 
              <span className="font-mono text-xs select-all text-violet-400 break-all">{trader?.id}</span>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={copyBookingLink}
              className="w-full rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 px-4 py-2 text-xs font-bold hover:bg-violet-600/20 transition cursor-pointer"
            >
              Copy Customer Booking Link
            </button>
            <button
              onClick={copyChatLink}
              className="w-full rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 text-xs font-bold hover:bg-emerald-600/20 transition cursor-pointer"
            >
              Copy Live Chat Room Link
            </button>
          </div>
        </div>

        {/* Stripe Connect Stepper Wizard */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-5 shadow-md">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Stripe Payout Stepper</h2>
          
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
            {/* Step 1: Profile */}
            <div className="relative">
              <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                ✓
              </span>
              <div className="text-xs font-bold text-white">1. Create TradeSlot Profile</div>
              <p className="text-[10px] text-zinc-500">Merchant account successfully registered on backend.</p>
            </div>

            {/* Step 2: Stripe Account Creation */}
            <div className="relative">
              {trader?.stripeAccountId ? (
                <>
                  <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <div className="text-xs font-bold text-white">2. Link Stripe Connect</div>
                  <p className="text-[10px] text-zinc-500 font-mono">Connected: {trader?.stripeAccountId}</p>
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

            {/* Step 3: Verify Onboarding */}
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

        {/* Daily Work Area Config */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Daily Work Area</h2>
          <form onSubmit={handleAddWorkArea} className="space-y-3">
            {workAreaError && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 p-2 rounded">
                {workAreaError}
              </div>
            )}
            <div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <input
                type="text"
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Area Name (e.g. West London)"
              />
            </div>
            <div>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-550 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Postcode sector (optional)"
              />
            </div>
            <button
              type="submit"
              disabled={workAreaLoading}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-xs font-bold hover:bg-zinc-700 transition"
            >
              {workAreaLoading ? 'Adding...' : 'Set Work Area'}
            </button>
          </form>

          {/* List Work Areas */}
          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Areas</h3>
            {workAreas.length === 0 ? (
              <p className="text-xs text-zinc-550">No work areas configured yet.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {workAreas.map((wa) => (
                  <div key={wa.id} className="flex justify-between items-center p-2.5 rounded bg-zinc-950 border border-zinc-850 text-xs">
                    <div>
                      <div className="font-semibold text-zinc-300">{wa.areaName}</div>
                      <div className="text-zinc-550">
                        {new Date(wa.date).toLocaleDateString()} {wa.postcode && `• ${wa.postcode}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkArea(wa.id)}
                      className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Visual Tabs (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Workspace Tab Switcher */}
        <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1">
          <button
            onClick={() => setActiveRightTab('schedule')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              activeRightTab === 'schedule'
                ? 'bg-zinc-850 text-white border border-zinc-750'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Calendar Schedule
          </button>
          <button
            onClick={() => setActiveRightTab('inbox')}
            className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
              activeRightTab === 'inbox'
                ? 'bg-zinc-850 text-white border border-zinc-750'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Live Customer Inbox
          </button>
        </div>

        {/* Tab 1: Calendar Schedule Timeline */}
        {activeRightTab === 'schedule' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Visual Schedule Timeline</h2>
                <p className="text-[10px] text-zinc-500 mt-0.5">Visualizing bookings and travel-time buffer limits to prevent overlaps.</p>
              </div>
              <span className="rounded-full bg-zinc-800 text-zinc-400 px-3 py-1 text-xs font-semibold">
                {bookings.length} Bookings
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
                <p className="text-zinc-550 text-sm">No client bookings scheduled yet.</p>
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
                        <div className="bg-[repeating-linear-gradient(45deg,#27272a,#27272a_6px,#18181b_6px,#18181b_12px)] border border-zinc-800/60 p-2 rounded-lg text-[10px] text-zinc-400 flex justify-between items-center">
                          <span className="font-semibold uppercase text-zinc-550">⚠ Travel Buffer block</span>
                          <span>
                            {bufferStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({bufferMin}m buffer)
                          </span>
                        </div>

                        {/* Main Job Appointment Box */}
                        <div className="bg-violet-950/30 border border-violet-900/60 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
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
                              Site Address: {booking.jobAddress || 'N/A'}
                            </div>
                            {booking.notes && (
                              <div className="text-[10px] text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-850 mt-1">
                                Notes: {booking.notes}
                              </div>
                            )}
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
                        <div className="bg-[repeating-linear-gradient(45deg,#27272a,#27272a_6px,#18181b_6px,#18181b_12px)] border border-zinc-800/60 p-2 rounded-lg text-[10px] text-zinc-400 flex justify-between items-center">
                          <span className="font-semibold uppercase text-zinc-550">⚠ Travel Buffer block</span>
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
        )}

        {/* Tab 2: Live Customer Inbox Panel */}
        {activeRightTab === 'inbox' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[500px]">
            
            {/* Inbox Sidebar List */}
            <div className="md:col-span-5 border-r border-zinc-800 flex flex-col h-full bg-zinc-950">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Active Conversations</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                  <p className="text-center text-[10px] text-zinc-550 pt-8">No chats active.</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`w-full text-left p-3 rounded-lg text-xs transition border ${
                        selectedConversationId === conv.id
                          ? 'bg-zinc-850 border-zinc-700 text-white font-semibold'
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="capitalize font-bold text-[10px]">Channel: {conv.channel.toLowerCase()}</span>
                      </div>
                      <p className="font-mono text-[9px] text-zinc-500 truncate">{conv.id}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Inbox Active Chat Screen */}
            <div className="md:col-span-7 flex flex-col h-full">
              {selectedConversationId ? (
                <>
                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/20">
                    {chatMessages.length === 0 ? (
                      <p className="text-center text-xs text-zinc-650 pt-8 italic">No messages sent in this conversation.</p>
                    ) : (
                      chatMessages.map((msg) => {
                        const isOutbound = msg.direction === 'OUTBOUND';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${isOutbound ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <div
                              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                isOutbound
                                  ? 'bg-violet-600 text-white rounded-br-none'
                                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-bl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[9px] text-zinc-550 mt-1 pl-1">
                              {isOutbound ? 'You' : msg.senderId || 'Guest'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatScrollRef}></div>
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="border-t border-zinc-800 p-3 bg-zinc-950 flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Type a reply response..."
                      className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-bold rounded text-white transition disabled:opacity-50"
                    >
                      {chatLoading ? 'Sending...' : 'Reply'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-zinc-500">
                  <div className="text-xl mb-1">✉</div>
                  <p className="text-[10px]">Select a conversation thread from the sidebar to view history and chat with clients.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
