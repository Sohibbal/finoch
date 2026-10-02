"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

interface TopNavProps {
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

export function TopNav({ onOpenPrivacy, userEmail }: TopNavProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("finra_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("finra_theme", "light");
    }
  };

  return (
    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700 dark:text-slate-300">
      <Link
        href="/dashboard"
        className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        Dashboard
      </Link>

      <Link
        href="/simulator"
        className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        What-If Simulator
      </Link>

      <a
        href="#fitur-capture"
        className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        Fitur Capture
      </a>

      <a
        href="#faq"
        className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        FAQ
      </a>

      {onOpenPrivacy && (
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          Privasi
        </button>
      )}

      <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {userEmail ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[100px] truncate">{userEmail.split("@")[0]}</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl bg-[#0f274a] hover:bg-[#1a3a6b] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Mulai Digital Twin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
