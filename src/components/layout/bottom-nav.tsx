"use client";

import React from "react";
import { Mic, User, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  onOpenVoice: () => void;
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

export function BottomNav({ onOpenVoice, userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLogin = pathname === "/login" || pathname === "/register";

  return (
    <div className="md:hidden fixed bottom-5 left-0 right-0 z-40 px-5 pointer-events-none flex justify-center">
      <nav
        aria-label="Navigasi Bawah Mobile (Beranda, Suara, Akun)"
        className="pointer-events-auto w-full max-w-[320px] h-15 bg-white/95 dark:bg-[#0e1526]/95 border border-slate-200/90 dark:border-blue-500/25 rounded-full shadow-2xl shadow-slate-900/15 dark:shadow-blue-950/60 px-3 py-1.5 flex items-center justify-between backdrop-blur-xl transition-all"
      >
        {/* 1. KIRI: Beranda */}
        <Link
          href="/"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
            isHome
              ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
          }`}
          aria-label="Halaman Beranda"
        >
          <Home className="w-4 h-4 stroke-[2.2]" />
          <span>Beranda</span>
        </Link>

        {/* 2. TENGAH: Icon Microphone Floating Trigger */}
        <div className="relative -mt-5">
          <button
            type="button"
            onClick={onOpenVoice}
            aria-label="Bicara untuk catat pengeluaran"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/40 border-2 border-white dark:border-[#0e1526] hover:scale-105 active:scale-95 transition-transform"
          >
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 3. KANAN: Akun */}
        <Link
          href={userEmail ? "/#akun" : "/login"}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
            isLogin
              ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
          }`}
          aria-label={userEmail ? "Profil Akun Mahasiswa" : "Masuk Akun"}
        >
          <User className="w-4 h-4 stroke-[2.2]" />
          <span>{userEmail ? "Akun" : "Masuk"}</span>
        </Link>
      </nav>
    </div>
  );
}
