"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, User, LogIn, Sun, Moon } from "lucide-react";
import { SyncIndicator } from "../dashboard/sync-indicator";

interface TopNavProps {
  onOpenPrivacy: () => void;
  userEmail?: string | null;
}

export function TopNav({ onOpenPrivacy, userEmail }: TopNavProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(hasDarkClass);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("voicash_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("voicash_theme", "light");
    }
  };

  return (
    <nav className="hidden md:flex items-center gap-2">
      <Link
        href="/"
        className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
      >
        Beranda
      </Link>

      <a
        href="#fitur"
        className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
      >
        Fitur
      </a>

      <a
        href="#testing-suara"
        className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
      >
        Testing Suara
      </a>

      <button
        type="button"
        onClick={onOpenPrivacy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Privasi</span>
      </button>

      {/* Sync Badge */}
      <div className="px-1">
        <SyncIndicator />
      </div>

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
        className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition active:scale-95"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* User Login/Account Button */}
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white dark:bg-white/[0.08] dark:text-blue-300 border border-blue-600 dark:border-blue-500/25 dark:hover:bg-white/[0.12] transition active:scale-95 shadow-sm shadow-blue-600/20"
      >
        {userEmail ? (
          <>
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-400/40 flex items-center justify-center text-[10px] text-blue-700 dark:text-blue-300 font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[120px] truncate">{userEmail.split("@")[0]}</span>
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </>
        )}
      </Link>
    </nav>
  );
}
