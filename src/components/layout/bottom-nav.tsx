"use client";

import React from "react";
import { Mic, ShieldCheck, User, Home } from "lucide-react";
import Link from "next/link";

interface BottomNavProps {
  onOpenVoice: () => void;
  onOpenPrivacy: () => void;
  userEmail?: string | null;
}

export function BottomNav({ onOpenVoice, onOpenPrivacy, userEmail }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around max-w-md mx-auto sm:rounded-t-3xl">
      <Link
        href="/"
        className="flex flex-col items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
      >
        <Home className="w-5 h-5" />
        <span>Beranda</span>
      </Link>

      {/* Floating Center Voice Button */}
      <div className="-mt-7">
        <button
          type="button"
          onClick={onOpenVoice}
          aria-label="Catat pengeluaran dengan suara"
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform active:scale-95"
        >
          <Mic className="w-7 h-7" />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenPrivacy}
        className="flex flex-col items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
      >
        <ShieldCheck className="w-5 h-5" />
        <span>Privasi</span>
      </button>

      <Link
        href={userEmail ? "/login" : "/login"}
        className="flex flex-col items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
      >
        <User className="w-5 h-5" />
        <span>{userEmail ? "Akun" : "Masuk"}</span>
      </Link>
    </nav>
  );
}
