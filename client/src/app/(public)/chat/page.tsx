'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { chatApi } from '../../../Apis/Chat/chat.api';

type Message = {
  id: string;
  sender: 'client' | 'bot';
  content: string;
  timestamp: Date;
  checkoutUrl?: string | null;
  isActionable?: boolean;
};

function ChatbotInterface() {
  const searchParams = useSearchParams();
  const [traderId, setTraderId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Parse state (current step info for helper suggestions)
  const [step, setStep] = useState(0); 

  useEffect(() => {
    const tid = searchParams.get('traderId');
    if (tid) {
      setTraderId(tid);
    } else {
      // Fallback: check if we have any registered trader ID in the directory
      try {
        const localData = localStorage.getItem('tradeslot_traders_directory');
        const directory = localData ? JSON.parse(localData) : [];
        if (directory.length > 0) {
          setTraderId(directory[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (traderId) {
      setMessages([
        {
          id: 'init',
          sender: 'bot',
          content: 'Hello! Welcome to the TradeSlot Booking Assistant. I can help you schedule a booking. When would you like to book? Please enter date & time (e.g. 2026-08-24 10:00).',
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([
        {
          id: 'error-no-trader',
          sender: 'bot',
          content: '⚠️ No trader configuration specified. Please open the booking chat using a valid trader link (e.g. /chat?traderId=YOUR_TRADER_ID).',
          timestamp: new Date(),
        },
      ]);
    }
  }, [traderId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (textToSend: string) => {
    if (!textToSend.trim() || !traderId) return;
    setError('');

    const newMsg: Message = {
      id: `client-${Date.now()}`,
      sender: 'client',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Consume backend chat API
      const res = await chatApi.sendMessage({
        traderId,
        message: textToSend,
        conversationId: conversationId || undefined,
      });

      const { conversationId: newConvId, reply, isActionable, checkoutUrl } = res.data;
      setConversationId(newConvId);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          content: reply,
          timestamp: new Date(),
          isActionable,
          checkoutUrl,
        },
      ]);

      // Move step forward
      setStep((prev) => prev + 1);
    } catch (err: any) {
      setError('Unable to process message. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          content: '⚠️ ' + (err.message || 'There was an issue contacting the booking server. Please verify availability/slots.'),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppLink = () => {
    // Simulate opening the configured WhatsApp link
    window.open('https://wa.me/15550000000', '_blank');
  };

  return (
    <div className="flex flex-col h-[600px] max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Chat header */}
      <div className="bg-zinc-850 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <div className="font-bold text-sm text-white">TradeSlot Assistant</div>
            <div className="text-zinc-400 text-[10px]">Web Booking widget</div>
          </div>
        </div>
        
        <button
          onClick={openWhatsAppLink}
          className="rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1.5"
        >
          <span>💬</span> Book via WhatsApp
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'client' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'client'
                  ? 'bg-violet-600 text-white rounded-br-none shadow'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none shadow'
              }`}
            >
              {msg.content}
            </div>
            
            {msg.checkoutUrl && (
              <div className="mt-3 w-full">
                <a
                  href={msg.checkoutUrl}
                  className="block text-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-bold transition shadow"
                >
                  💳 Continue to Stripe Payment (£50.00 Flat Fee)
                </a>
              </div>
            )}

            {msg.isActionable && !msg.checkoutUrl && (
              <div className="mt-3 flex gap-2 w-full">
                <button
                  onClick={() => handleSendText('YES')}
                  className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold transition shadow"
                >
                  Yes, Confirm
                </button>
                <button
                  onClick={() => handleSendText('NO')}
                  className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white py-2 text-xs font-bold transition"
                >
                  No, Cancel
                </button>
              </div>
            )}

            <span className="text-[9px] text-zinc-550 mt-1 pl-1">
              {msg.sender === 'bot' ? 'Assistant' : 'You'} •{' '}
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex mr-auto items-start max-w-[85%]">
            <div className="p-3 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-500 italic animate-pulse">
              thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input controls */}
      {traderId && (
        <div className="border-t border-zinc-800 bg-zinc-950 p-4 space-y-3">
          {error && <div className="text-zinc-400 text-[10px] font-semibold">{error}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText(inputText);
            }}
            className="flex gap-2"
          >
            {step === 1 ? (
              <input
                type="datetime-local"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            ) : (
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  step === 0
                    ? 'Enter date & time (e.g. 2026-08-24 10:00)...'
                    : step === 2
                    ? 'Enter your full name...'
                    : step === 3
                    ? 'Enter your email address...'
                    : step === 4
                    ? 'Enter your phone number...'
                    : step === 5
                    ? 'Enter your job site address...'
                    : 'Type YES to confirm booking...'
                }
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <Suspense
        fallback={
          <div className="text-zinc-500 text-xs">Initializing chatbot session...</div>
        }
      >
        <ChatbotInterface />
      </Suspense>
    </div>
  );
}
