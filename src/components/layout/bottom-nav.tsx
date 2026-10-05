"use client";

import React from "react";
import { Mic, User, Home, Compass, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  onOpenVoice: () => void;
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

export function BottomNav({ onOpenVoice, userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const isGuest = userEmail === null || (userEmail === undefined && pathname === "/");
  const homeHref = isGuest ? "/" : "/dashboard";
  const profileHref = isGuest ? "/login" : "/profile";

  const isHome = isGuest ? pathname === "/" : (pathname === "/" || pathname === "/dashboard");
  const isSimulator = pathname === "/simulator";
  const isCopilot = pathname === "/copilot";
  const isProfile = isGuest
    ? pathname === "/login" || pathname === "/register"
    : pathname === "/profile" || pathname === "/goals";

  return (
    <div className="md:hidden fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none flex justify-center pb-[env(safe-area-inset-bottom)]">
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="pointer-events-auto w-full max-w-md h-16 bg-white/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 rounded-2xl shadow-xl px-2 sm:px-3 py-1.5 flex items-center justify-between backdrop-blur-xl transition-all"
      >
        {/* 1. Beranda / Dashboard */}
        <Link
          href={homeHref}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            isHome
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-600 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label={isGuest ? "Halaman Beranda" : "Halaman Dashboard"}
        >
          <Home className="w-4 h-4 stroke-[2]" />
          <span className="mt-0.5 leading-tight">Beranda</span>
        </Link>

        {/* 2. Simulasi & Jatah Harian */}
        <Link
          href="/simulator"
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            isSimulator
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-600 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label="Simulasi dan Jatah Harian"
        >
          <Compass className="w-4 h-4 stroke-[2]" />
          <span className="mt-0.5 leading-tight">Simulasi</span>
        </Link>

        {/* 3. Center Floating Voice Trigger */}
        <div className="relative -mt-6 flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-navy-900/20 dark:bg-cream-100/20 animate-pulse pointer-events-none" />
          <button
            type="button"
            onClick={onOpenVoice}
            aria-label="Bicara untuk catat pengeluaran"
            className="relative w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 flex items-center justify-center shadow-xl border-2 border-white dark:border-[#070E1A] hover:scale-105 active:scale-95 transition-transform"
          >
            <Mic className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 4. AI Copilot */}
        <Link
          href="/copilot"
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            isCopilot
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-600 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label="AI Copilot Keuangan"
        >
          <Bot className="w-4 h-4 stroke-[2]" />
          <span className="mt-0.5 leading-tight">Copilot</span>
        </Link>

        {/* 5. Profil & Target Keuangan */}
        <Link
          href={profileHref}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            isProfile
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-600 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label={isGuest ? "Masuk Akun" : "Profil dan Target Keuangan"}
        >
          <User className="w-4 h-4 stroke-[2]" />
          <span className="mt-0.5 leading-tight">{isGuest ? "Masuk" : "Profil"}</span>
        </Link>
      </nav>
    </div>
  );
}
