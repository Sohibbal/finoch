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
  const isHome = pathname === "/" || pathname === "/dashboard";
  const isLogin = pathname === "/login" || pathname === "/register";

  return (
    <div className="md:hidden fixed bottom-5 left-0 right-0 z-40 px-5 pointer-events-none flex justify-center">
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="pointer-events-auto w-full max-w-[300px] h-14 bg-white/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 rounded-full shadow-xl px-3 py-1.5 flex items-center justify-between backdrop-blur-xl transition-all"
      >
        {/* 1. KIRI: Beranda / Dashboard */}
        <Link
          href={userEmail ? "/dashboard" : "/"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
            isHome
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-700 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label="Halaman Beranda"
        >
          <Home className="w-4 h-4 stroke-[2]" />
          <span>{userEmail ? "Dashboard" : "Beranda"}</span>
        </Link>

        {/* 2. TENGAH: Icon Microphone Floating Trigger */}
        <div className="relative -mt-4">
          <button
            type="button"
            onClick={onOpenVoice}
            aria-label="Bicara untuk catat pengeluaran"
            className="w-12 h-12 rounded-full bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#070E1A] hover:scale-105 active:scale-95 transition-transform"
          >
            <Mic className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 3. KANAN: Akun */}
        <Link
          href={userEmail ? "/profile" : "/login"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
            isLogin || pathname === "/profile"
              ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 shadow-sm"
              : "text-navy-700 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50"
          }`}
          aria-label={userEmail ? "Profil Akun" : "Masuk Akun"}
        >
          <User className="w-4 h-4 stroke-[2]" />
          <span>{userEmail ? "Profil" : "Masuk"}</span>
        </Link>
      </nav>
    </div>
  );
}
