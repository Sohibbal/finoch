"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, User, Moon, Sun, Home, LogIn } from "lucide-react";
import { SyncIndicator } from "../dashboard/sync-indicator";

interface TopNavProps {
  onOpenPrivacy: () => void;
  userEmail?: string | null;
}

export function TopNav({ onOpenPrivacy, userEmail }: TopNavProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or document class for theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
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
    <nav className="hidden md:flex items-center gap-3">
      <Link
        href="/"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <Home className="w-4 h-4" />
        <span>Beranda</span>
      </Link>

      <button
        type="button"
        onClick={onOpenPrivacy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Privasi</span>
      </button>

      {/* Sync Badge */}
      <div className="pl-1">
        <SyncIndicator />
      </div>

      {/* Theme Switcher */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle tema gelap/terang"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* User Login/Account */}
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 transition active:scale-95"
      >
        {userEmail ? (
          <>
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{userEmail.split("@")[0]}</span>
          </>
        ) : (
          <>
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </>
        )}
      </Link>
    </nav>
  );
}
