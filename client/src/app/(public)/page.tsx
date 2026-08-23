'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingApi } from '../../Apis/Booking/booking.api';
import { paymentApi } from '../../Apis/Payment/payment.api';
import { conversationApi } from '../../Apis/Conversation/conversation.api';
import { authApi } from '../../Apis/Auth/auth.api';

function DirectBookingForm({ traderId, addLog }: { traderId: string; addLog: (event: string, type: string, payload: any) => void }) {
  const [scheduledStart, setScheduledStart] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [jobDurationMinutes, setJobDurationMinutes] = useState(60);
  const [travelBufferMinutes, setTravelBufferMinutes] = useState(30);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [workAreas, setWorkAreas] = useState<any[]>([]);
  const [selectedWorkAreaId, setSelectedWorkAreaId] = useState<string>('');

  useEffect(() => {
    try {
      const localAreas = localStorage.getItem(`tradeslot_workareas_${traderId}`);
      if (localAreas) {
        setWorkAreas(JSON.parse(localAreas));
      }
    } catch (err) {
      console.error('Failed to load work areas', err);
    }
  }, [traderId]);

  const handleWorkAreaChange = (waId: string) => {
    setSelectedWorkAreaId(waId);
    if (waId) {
      const selectedArea = workAreas.find((wa) => wa.id === waId);
      if (selectedArea) {
        const areaDate = new Date(selectedArea.date);
        const year = areaDate.getFullYear();
        const month = String(areaDate.getMonth() + 1).padStart(2, '0');
        const day = String(areaDate.getDate()).padStart(2, '0');
        // Default time to 09:00 AM on that day
        setScheduledStart(`${year}-${month}-${day}T09:00`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    addLog('Booking Request Initiated', 'CLIENT_SUBMIT', { customerName, scheduledStart, workAreaId: selectedWorkAreaId || null });

    try {
      const bookingRes = await bookingApi.createBooking({
        traderId,
        scheduledStart,
        customerName,
        customerEmail,
        customerPhone,
        jobAddress,
        notes,
        jobDurationMinutes,
        travelBufferMinutes,
        workAreaId: selectedWorkAreaId || undefined,
      });

      if (!bookingRes || !bookingRes.data || !bookingRes.data.id) {
        throw new Error('Failed to create booking schedule');
      }

      const bookingId = bookingRes.data.id;
      addLog('Booking Created in DB', 'DB_SUCCESS', { bookingId, status: bookingRes.data.status, bookingFee: bookingRes.data.bookingFee });

      addLog('Generating Stripe Session', 'STRIPE_INIT', { bookingId, amount: bookingRes.data.bookingFee });
      const paymentRes = await paymentApi.createCheckoutSession(bookingId);

      if (paymentRes && paymentRes.data && paymentRes.data.url) {
        setSuccess(true);
        addLog('Checkout Session Ready', 'STRIPE_SUCCESS', { redirectUrl: paymentRes.data.url });
        window.location.href = paymentRes.data.url;
      } else {
        throw new Error('Failed to generate Stripe Checkout URL');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout initialization.');
      addLog('Booking / Checkout Failed', 'ERROR', { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-950/50 p-3.5 border border-red-900 text-xs text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-950/50 p-3.5 border border-green-900 text-xs text-green-200 text-center font-medium">
          Booking created! Redirecting to Stripe checkout...
        </div>
      )}

      <div className="space-y-3">
        {/* Work Area Selector */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Select Work Area / Target Date (Daily Setup)
          </label>
          {workAreas.length === 0 ? (
            <div className="text-zinc-550 text-[11px] bg-zinc-950 p-2 rounded border border-zinc-900">
              ⚠️ Trader has no active work zones set for today. You can select date & time manually.
            </div>
          ) : (
            <select
              value={selectedWorkAreaId}
              onChange={(e) => handleWorkAreaChange(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            >
              <option value="">-- Choose an active work zone --</option>
              {workAreas.map((wa) => (
                <option key={wa.id} value={wa.id}>
                  {wa.areaName} {wa.postcode ? `(${wa.postcode})` : ''} - {new Date(wa.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Booking Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
              placeholder="Full Name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Job Site Address
          </label>
          <input
            type="text"
            required
            value={jobAddress}
            onChange={(e) => setJobAddress(e.target.value)}
            className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            placeholder="Address where job takes place"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Job Duration (Minutes)
            </label>
            <input
              type="number"
              min="10"
              value={jobDurationMinutes}
              onChange={(e) => setJobDurationMinutes(parseInt(e.target.value) || 0)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Travel Buffer (Minutes)
            </label>
            <input
              type="number"
              min="0"
              value={travelBufferMinutes}
              onChange={(e) => setTravelBufferMinutes(parseInt(e.target.value) || 0)}
              className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Extra Notes / Description
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="relative block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            placeholder="What needs to be done?"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading || success}
          className="group relative flex w-full justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Book & Pay flat fee'}
        </button>
      </div>
    </form>
  );
}

type Message = {
  id: string;
  sender: 'client' | 'bot';
  content: string;
  timestamp: Date;
  isActionable?: boolean;
};

// Conversational Chatbot Simulator Component
function ChatbotSimulator({ traderId, addLog }: { traderId: string; addLog: (event: string, type: string, payload: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Booking payload state
  const [scheduledStart, setScheduledStart] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobAddress, setJobAddress] = useState('');

  useEffect(() => {
    let zonesText = '';
    try {
      const localAreas = localStorage.getItem(`tradeslot_workareas_${traderId}`);
      if (localAreas) {
        const areas = JSON.parse(localAreas);
        if (areas.length > 0) {
          zonesText = ' Active zones: ' + areas.map((a: any) => `${a.areaName} (${new Date(a.date).toLocaleDateString()})`).join(', ') + '.';
        }
      }
    } catch (err) {}

    setMessages([
      {
        id: 'init',
        sender: 'bot',
        content: `Hello! Welcome to the TradeSlot Booking Assistant. I can help you schedule a booking.${zonesText} When would you like to book?`,
        timestamp: new Date(),
      },
    ]);
  }, [traderId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;
    addLog('Intake Session Start', 'API_REQUEST', { channel: 'WEB_CHAT', traderId });
    const res = await conversationApi.createConversation({
      channel: 'WEB_CHAT',
      traderId,
    });
    setConversationId(res.data.id);
    addLog('Intake Session Created in DB', 'DB_SUCCESS', { conversationId: res.data.id });
    return res.data.id;
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      const convId = await startConversation();
      addLog('Client Message Inbound', 'API_REQUEST', { conversationId: convId, senderId: 'customer_web_chat', content: textToSend });
      const msgRes = await conversationApi.sendMessage(convId, {
        direction: 'INBOUND',
        senderId: 'customer_web_chat',
        content: textToSend,
      });
      addLog('Inbound Message Normalized', 'DB_SUCCESS', { messageId: msgRes.data.id, normalizedPayload: msgRes.data });

      setTimeout(async () => {
        let botReply = '';
        let nextStep = step;

        if (step === 0) {
          setScheduledStart(textToSend);
          botReply = 'Got the date and time! Now, please enter your full name.';
          nextStep = 1;
        } else if (step === 1) {
          setCustomerName(textToSend);
          botReply = 'Thank you! What is your email address?';
          nextStep = 2;
        } else if (step === 2) {
          setCustomerEmail(textToSend);
          botReply = 'Awesome! Can you also share your phone number?';
          nextStep = 3;
        } else if (step === 3) {
          setCustomerPhone(textToSend);
          botReply = 'Almost done! What is the job site address?';
          nextStep = 4;
        } else if (step === 4) {
          setJobAddress(textToSend);
          botReply = 'Perfect! I have all details. Would you like to confirm booking & redirect to Stripe Checkout?';
          nextStep = 5;
        }

        setStep(nextStep);

        addLog('Bot Response Outbound', 'API_REQUEST', { conversationId: convId, senderId: 'chatbot_system', content: botReply });
        const replyRes = await conversationApi.sendMessage(convId, {
          direction: 'OUTBOUND',
          senderId: 'chatbot_system',
          content: botReply,
        });
        addLog('Outbound Message Normalized', 'DB_SUCCESS', { messageId: replyRes.data.id, normalizedPayload: replyRes.data });

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            content: botReply,
            timestamp: new Date(),
            isActionable: nextStep === 5,
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      addLog('Message Delivery Failed', 'ERROR', { message: err.message });
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    addLog('Booking Confirmation via Chatbot', 'CLIENT_SUBMIT', { customerName, scheduledStart });
    try {
      const bookingRes = await bookingApi.createBooking({
        traderId,
        scheduledStart,
        customerName,
        customerEmail,
        customerPhone,
        jobAddress,
        jobDurationMinutes: 60,
        travelBufferMinutes: 30,
      });

      const bookingId = bookingRes.data.id;
      addLog('Booking Created in DB', 'DB_SUCCESS', { bookingId, status: bookingRes.data.status });

      const convId = conversationId!;
      await conversationApi.sendMessage(convId, {
        direction: 'INBOUND',
        senderId: 'customer_web_chat',
        content: 'Confirmed booking',
      });

      addLog('Generating Stripe Session', 'STRIPE_INIT', { bookingId, amount: bookingRes.data.bookingFee });
      const paymentRes = await paymentApi.createCheckoutSession(bookingId);
      addLog('Checkout Session Ready', 'STRIPE_SUCCESS', { redirectUrl: paymentRes.data.url });
      window.location.href = paymentRes.data.url;
    } catch (err: any) {
      addLog('Booking / Checkout Failed', 'ERROR', { message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Bot Chat Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <div>
          <div className="font-semibold text-xs text-white">TradeSlot Assistant</div>
          <div className="text-zinc-500 text-[10px]">Web Chatbot Widget</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'client' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'client'
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[9px] text-zinc-650 mt-0.5">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {msg.isActionable && (
              <div className="mt-2 flex gap-1.5 w-full">
                <button
                  onClick={handleConfirmBooking}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex-1"
                >
                  Confirm & Pay
                </button>
                <button
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `bot-${Date.now()}`,
                        sender: 'bot',
                        content: 'Cancelled. Let me know when you want to book.',
                        timestamp: new Date(),
                      },
                    ]);
                    setStep(0);
                  }}
                  className="bg-zinc-850 hover:bg-zinc-850 text-zinc-400 px-3 py-1.5 rounded-lg text-[10px] border border-zinc-800 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex mr-auto items-start max-w-[85%]">
            <div className="p-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-550 italic">
              typing...
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input controls */}
      {step !== 5 && (
        <form
          className="border-t border-zinc-850 p-2.5 flex gap-1.5 bg-zinc-900/30"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText(inputText);
          }}
        >
          {step === 0 ? (
            <input
              type="datetime-local"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
            />
          ) : (
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 text-xs"
              placeholder={
                step === 1
                  ? 'Enter name...'
                  : step === 2
                  ? 'Enter email...'
                  : step === 3
                  ? 'Enter phone...'
                  : 'Enter address...'
              }
            />
          )}
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

// WhatsApp Simulator Component
function WhatsAppSimulator({ traderId, addLog }: { traderId: string; addLog: (event: string, type: string, payload: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Booking payload state
  const [scheduledStart, setScheduledStart] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobAddress, setJobAddress] = useState('');

  useEffect(() => {
    let zonesText = '';
    try {
      const localAreas = localStorage.getItem(`tradeslot_workareas_${traderId}`);
      if (localAreas) {
        const areas = JSON.parse(localAreas);
        if (areas.length > 0) {
          zonesText = ' Active zones: ' + areas.map((a: any) => `${a.areaName} (${new Date(a.date).toLocaleDateString()})`).join(', ') + '.';
        }
      }
    } catch (err) {}

    setMessages([
      {
        id: 'init',
        sender: 'bot',
        content: `Hi! Thank you for contacting TradeSlot.${zonesText} When would you like to schedule your booking?`,
        timestamp: new Date(),
      },
    ]);
  }, [traderId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async (): Promise<string> => {
    if (conversationId) return conversationId;
    addLog('WhatsApp Session Start', 'API_REQUEST', { channel: 'WHATSAPP', externalId: 'whatsapp_number_123' });
    const res = await conversationApi.createConversation({
      channel: 'WHATSAPP',
      traderId,
      externalId: 'whatsapp_number_123',
    });
    setConversationId(res.data.id);
    addLog('WhatsApp Session Link', 'DB_SUCCESS', { conversationId: res.data.id });
    return res.data.id;
  };

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      id: `wa-${Date.now()}`,
      sender: 'client',
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      const convId = await startConversation();
      addLog('WhatsApp Client Message', 'API_REQUEST', { conversationId: convId, senderId: 'whatsapp_number_123', content: textToSend });
      const msgRes = await conversationApi.sendMessage(convId, {
        direction: 'INBOUND',
        senderId: 'whatsapp_number_123',
        content: textToSend,
        externalId: `wa_msg_${Date.now()}`,
      });
      addLog('WhatsApp Message Normalized', 'DB_SUCCESS', { messageId: msgRes.data.id, normalizedPayload: msgRes.data });

      setTimeout(async () => {
        let botReply = '';
        let nextStep = step;

        if (step === 0) {
          setScheduledStart(textToSend);
          botReply = 'Please reply with your Full Name.';
          nextStep = 1;
        } else if (step === 1) {
          setCustomerName(textToSend);
          botReply = 'Got it! What is your email address?';
          nextStep = 2;
        } else if (step === 2) {
          setCustomerEmail(textToSend);
          botReply = 'Thanks! Enter your phone number.';
          nextStep = 3;
        } else if (step === 3) {
          setCustomerPhone(textToSend);
          botReply = 'Perfect. Send your job address.';
          nextStep = 4;
        } else if (step === 4) {
          setJobAddress(textToSend);
          botReply = 'Confirm booking and checkout? Reply "YES" or "NO".';
          nextStep = 5;
        } else if (step === 5) {
          if (textToSend.toUpperCase() === 'YES') {
            botReply = 'Processing checkout...';
            nextStep = 6;
          } else {
            botReply = 'Cancelled. Start over by typing date & time.';
            nextStep = 0;
          }
        }

        setStep(nextStep);

        addLog('WhatsApp Bot Outbound Reply', 'API_REQUEST', { conversationId: convId, senderId: 'whatsapp_agent_bot', content: botReply });
        const replyRes = await conversationApi.sendMessage(convId, {
          direction: 'OUTBOUND',
          senderId: 'whatsapp_agent_bot',
          content: botReply,
          externalId: `wa_reply_${Date.now()}`,
        });
        addLog('WhatsApp Outbound Message Normalized', 'DB_SUCCESS', { messageId: replyRes.data.id, normalizedPayload: replyRes.data });

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            content: botReply,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);

        if (nextStep === 6) {
          setTimeout(async () => {
            try {
              addLog('Booking Ingestion via WhatsApp', 'CLIENT_SUBMIT', { customerName, scheduledStart });
              const bookingRes = await bookingApi.createBooking({
                traderId,
                scheduledStart,
                customerName,
                customerEmail,
                customerPhone,
                jobAddress,
                jobDurationMinutes: 60,
                travelBufferMinutes: 30,
              });
              addLog('Booking Created in DB', 'DB_SUCCESS', { bookingId: bookingRes.data.id });

              addLog('Generating Stripe Session', 'STRIPE_INIT', { bookingId: bookingRes.data.id });
              const paymentRes = await paymentApi.createCheckoutSession(bookingRes.data.id);
              addLog('Checkout Session Ready', 'STRIPE_SUCCESS', { redirectUrl: paymentRes.data.url });
              window.location.href = paymentRes.data.url;
            } catch (err: any) {
              addLog('Booking / Checkout Failed', 'ERROR', { message: err.message });
            }
          }, 1000);
        }
      }, 1000);
    } catch (err: any) {
      addLog('WhatsApp Delivery Failed', 'ERROR', { message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* WhatsApp Chat Header */}
      <div className="bg-emerald-950 border-b border-emerald-900 px-4 py-3 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
          WA
        </div>
        <div>
          <div className="font-semibold text-xs text-white">WhatsApp Agent</div>
          <div className="text-emerald-500 text-[10px]">WhatsApp Intake Simulator</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'client' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'client'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-850 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[9px] text-zinc-550 mt-0.5">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex mr-auto items-start max-w-[85%]">
            <div className="p-2 rounded-lg text-xs bg-zinc-900 border border-zinc-850 text-zinc-550 italic">
              typing...
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input controls */}
      <form
        className="border-t border-zinc-850 p-2.5 flex gap-1.5 bg-zinc-900/30"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendText(inputText);
        }}
      >
        <input
          type="text"
          required
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
          placeholder={
            step === 0
              ? 'Send date & time (e.g. Mon 10am)...'
              : step === 1
              ? 'Reply with name...'
              : step === 2
              ? 'Reply with email...'
              : step === 3
              ? 'Reply with phone...'
              : step === 4
              ? 'Reply with address...'
              : 'Reply YES to confirm checkout...'
          }
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// MultiChannelBookingHub containing booking layout
function MultiChannelBookingHub({ traderId, onBack }: { traderId: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'form' | 'chatbot' | 'whatsapp'>('form');
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; time: string; event: string; type: string; payload: any }[]>([]);

  const addLog = (event: string, type: string, payload: any) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      event,
      type,
      payload,
    };
    setConsoleLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      
      {/* Back button to return to Trader List */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
        >
          ← Back to Trader Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Tab Switcher & Simulated Device Block (Left Side) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tab Controls */}
          <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
                activeTab === 'form'
                  ? 'bg-zinc-800 text-white border border-zinc-750'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Online Form
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
                activeTab === 'chatbot'
                  ? 'bg-zinc-800 text-white border border-zinc-750'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Web Chatbot
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${
                activeTab === 'whatsapp'
                  ? 'bg-zinc-800 text-white border border-zinc-750'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              WhatsApp Chat
            </button>
          </div>

          {/* Device Bezel Simulator Wrapper */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-xl flex justify-center">
            {activeTab === 'form' ? (
              <div className="w-full">
                <h2 className="text-lg font-bold text-white mb-2">Direct Online Booking</h2>
                <p className="text-zinc-400 text-xs mb-4">Complete the online details form to confirm slot scheduling.</p>
                <DirectBookingForm traderId={traderId} addLog={addLog} />
              </div>
            ) : (
              /* Premium Phone Device Frame Mockup */
              <div className="relative border-zinc-800 bg-zinc-950 border-[10px] rounded-[2.2rem] h-[520px] w-[310px] shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[16px] w-[100px] bg-zinc-800 rounded-b-xl z-20"></div>
                {/* Device Screen Area */}
                <div className="w-full h-full pt-4">
                  {activeTab === 'chatbot' && <ChatbotSimulator traderId={traderId} addLog={addLog} />}
                  {activeTab === 'whatsapp' && <WhatsAppSimulator traderId={traderId} addLog={addLog} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Developer Live Normalization Console (Right Side) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[600px] shadow-xl font-mono">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider pl-2">Live Normalization Console</span>
            </div>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-750 text-zinc-400 border border-zinc-700 px-2 py-1 rounded transition"
            >
              Clear logs
            </button>
          </div>

          {/* Log messages scrollbox */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs leading-relaxed">
            {consoleLogs.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-zinc-550 space-y-2">
                <div className="text-xl">🖳</div>
                <p className="text-[10px]">No API transactions captured yet. Select a chat tab and send messages to inspect normalization payloads.</p>
              </div>
            ) : (
              consoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${
                    log.type === 'ERROR'
                      ? 'bg-red-950/20 border-red-900 text-red-300'
                      : log.type.includes('SUCCESS')
                      ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-zinc-555 mb-1 border-b border-zinc-900 pb-1">
                    <span className="font-bold">[{log.type}] {log.event}</span>
                    <span>{log.time}</span>
                  </div>
                  <pre className="overflow-x-auto text-[10px] whitespace-pre-wrap">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Marketplace Catalog Hub
function MarketplaceCatalogHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [traderId, setTraderId] = useState<string | null>(null);
  const [tradersList, setTradersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal popup for a selected trader
  const [detailedTrader, setDetailedTrader] = useState<any | null>(null);

  // Initialize selected traderId from searchParams if present
  useEffect(() => {
    const tid = searchParams.get('traderId');
    if (tid) {
      setTraderId(tid);
    }
  }, [searchParams]);

  // Fetch all registered traders on mount
  useEffect(() => {
    const loadTraders = async () => {
      try {
        const res = await authApi.getAllTraders();
        if (res && res.data && res.data.length > 0) {
          setTradersList(res.data);
        } else {
          // Empty or invalid, try fallback
          const localData = localStorage.getItem('tradeslot_traders_directory');
          if (localData) {
            setTradersList(JSON.parse(localData));
          }
        }
      } catch (err) {
        console.error('Failed to load traders list, using local storage fallback', err);
        const localData = localStorage.getItem('tradeslot_traders_directory');
        if (localData) {
          setTradersList(JSON.parse(localData));
        }
      } finally {
        setLoading(false);
      }
    };
    loadTraders();
  }, []);

  const handleOpenDetails = (trader: any) => {
    setDetailedTrader(trader);
  };

  const handleCloseDetails = () => {
    setDetailedTrader(null);
  };

  const handleStartChat = (trader: any) => {
    router.push(`/chat?traderId=${trader.id}`);
  };

  const handleSelectTraderForBooking = (tid: string) => {
    setTraderId(tid);
    setDetailedTrader(null);
  };

  if (traderId) {
    return (
      <MultiChannelBookingHub
        traderId={traderId}
        onBack={() => {
          setTraderId(null);
          // Remove query param
          router.replace('/');
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-500 font-mono text-xs">Loading Trader Directory...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Find & Book Local Tradespeople
        </h1>
        <p className="text-sm text-zinc-400">
          Book appointments instantly, make payments securely, or chat live with certified local trades professionals.
        </p>
      </div>

      {/* Directory Grid */}
      {tradersList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-550 text-sm">No registered tradespeople found in directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradersList.map((trader) => (
            <div
              key={trader.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base truncate">
                      {trader.businessName || 'Independent Trader'}
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold">{trader.name}</p>
                  </div>
                  {trader.stripeOnboarded ? (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                      Payout Active
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-800 border border-zinc-750 text-zinc-500 px-2 py-0.5 text-[10px] font-bold">
                      Cash Only
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-zinc-500">
                  <div>Email: {trader.email}</div>
                  {trader.phone && <div>Phone: {trader.phone}</div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleOpenDetails(trader)}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleStartChat(trader)}
                  className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trader Details & Chat Drawer/Modal Popup */}
      {detailedTrader && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {detailedTrader.businessName || 'Independent Trader'}
                </h3>
                <p className="text-xs text-zinc-400">Merchant Profile Information</p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-550 text-[10px] font-bold uppercase block">Certified Trader</span>
                {detailedTrader.name}
              </div>
              <div>
                <span className="text-zinc-555 text-[10px] font-bold uppercase block">Email Address</span>
                {detailedTrader.email}
              </div>
              {detailedTrader.phone && (
                <div>
                  <span className="text-zinc-555 text-[10px] font-bold uppercase block">Phone Number</span>
                  {detailedTrader.phone}
                </div>
              )}
              <div>
                <span className="text-zinc-555 text-[10px] font-bold uppercase block">Profile UID</span>
                <span className="font-mono text-xs text-violet-400 select-all">{detailedTrader.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleStartChat(detailedTrader)}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Chat Live Now
              </button>
              <button
                onClick={() => handleSelectTraderForBooking(detailedTrader.id)}
                className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="text-white font-mono text-xs">Loading directory catalog...</div>}>
      <MarketplaceCatalogHub />
    </Suspense>
  );
}
