'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-zinc-950 to-zinc-950">
      <div className="w-full max-w-md space-y-6 text-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-8xl font-black bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The page you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
