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
    <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-normal text-navy-800/80 dark:text-cream-200/80">
      <a
        href="#fitur"
        className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
      >
        Fitur
      </a>
      <a
        href="#cara-kerja"
        className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
      >
        Cara kerja
      </a>
      <a
        href="#paket"
        className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
      >
        Paket
      </a>
      <a
        href="#faq"
        className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
      >
        FAQ
      </a>

      {onOpenPrivacy && (
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
        >
          Privasi
        </button>
      )}

      <div className="flex items-center gap-4 pl-4 border-l border-cream-300 dark:border-navy-800">
        {/* Minimal Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className="p-1.5 rounded-lg text-navy-700 hover:text-navy-950 dark:text-cream-300 dark:hover:text-cream-50 hover:bg-cream-200/60 dark:hover:bg-navy-800 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-cream-200" />
          ) : (
            <Moon className="w-4 h-4 text-navy-900" />
          )}
        </button>

        {userEmail ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold shadow-sm transition-all"
          >
            <div className="w-4 h-4 rounded-full bg-white/20 dark:bg-navy-900/20 text-current flex items-center justify-center text-[10px] font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span>Dashboard</span>
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-navy-900 dark:text-cream-200 hover:text-navy-950 dark:hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              Mulai gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
