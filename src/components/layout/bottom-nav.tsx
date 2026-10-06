"use client";

import React, { useState } from "react";
import {
  Mic,
  User,
  Home,
  LayoutGrid,
  Bot,
  X,
  CreditCard,
  Zap,
  Wallet,
  Flame,
  Handshake,
  CalendarClock,
  Receipt,
  Hourglass,
  Utensils,
  GraduationCap,
  FileSpreadsheet,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";

interface BottomNavProps {
  onOpenVoice: () => void;
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

const ALL_STUDENT_MODULES = [
  { href: "/wallets", label: "Dompet Akun", desc: "Tunai, Bank, E-Wallet", icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10" },
  { href: "/streak", label: "Streak Hemat", desc: "No-spend day & kalender", icon: Zap, color: "text-amber-500 bg-amber-500/10" },
  { href: "/budget", label: "Amplop Pos", desc: "Alokasi pos makan & kos", icon: Wallet, color: "text-teal-500 bg-teal-500/10" },
  { href: "/audit", label: "Bocor Halus", desc: "Detektor jajan siluman", icon: Flame, color: "text-rose-500 bg-rose-500/10" },
  { href: "/debts", label: "Buku Kasbon", desc: "Hutang & piutang teman", icon: Handshake, color: "text-blue-500 bg-blue-500/10" },
  { href: "/bills", label: "Tagihan Kost", desc: "Sewa kamar, WiFi, listrik", icon: CalendarClock, color: "text-indigo-500 bg-indigo-500/10" },
  { href: "/split-bill", label: "Split Bill", desc: "Bagi bill resto & teks WA", icon: Receipt, color: "text-emerald-600 bg-emerald-600/10" },
  { href: "/wishlist", label: "Wishlist Tunda", desc: "Aturan tunda 7 hari", icon: Hourglass, color: "text-purple-500 bg-purple-500/10" },
  { href: "/meal-calc", label: "Masak vs Warteg", desc: "Kalkulator hemat & hybrid", icon: Utensils, color: "text-orange-500 bg-orange-500/10" },
  { href: "/ukt-savings", label: "Tabungan UKT", desc: "Sinking fund semesteran", icon: GraduationCap, color: "text-cyan-500 bg-cyan-500/10" },
  { href: "/reports", label: "Laporan & LPJ", desc: "Rekap bulanan & Excel", icon: FileSpreadsheet, color: "text-blue-600 bg-blue-600/10" },
  { href: "/simulator", label: "Simulator Kas", desc: "Skenario jatah harian", icon: Compass, color: "text-amber-600 bg-amber-600/10" },
];

export function BottomNav({ onOpenVoice, userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isGuest = userEmail === null || (userEmail === undefined && pathname === "/");
  const homeHref = isGuest ? "/" : "/dashboard";
  const profileHref = isGuest ? "/login" : "/profile";

  const isHome = isGuest ? pathname === "/" : (pathname === "/" || pathname === "/dashboard");
  const isCopilot = pathname === "/copilot";
  const isProfile = isGuest
    ? pathname === "/login" || pathname === "/register"
    : pathname === "/profile" || pathname === "/goals";

  const isSubFeatureActive = ALL_STUDENT_MODULES.some((m) => m.href === pathname);

  return (
    <>
      {/* Mobile Features Drawer Sheet */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col justify-end">
          <div className="w-full bg-white dark:bg-[#070E1A] rounded-t-3xl border-t border-cream-200 dark:border-navy-800 p-5 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
              <div className="flex items-center gap-2.5">
                <BrandLogo variant="symbol" className="h-6 w-auto shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-navy-950 dark:text-cream-50">
                    Semua Fitur Mahasiswa &amp; Anak Kost
                  </h3>
                  <p className="text-[11px] text-navy-500 dark:text-cream-400">
                    Pilih modul finansial yang ingin Anda buka
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-200 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 12-Module Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {ALL_STUDENT_MODULES.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all active:scale-[0.98] ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                        : "border-cream-200 dark:border-navy-800 bg-cream-50/40 dark:bg-navy-900/50 hover:bg-cream-100"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-navy-950 dark:text-cream-50 block truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-navy-500 dark:text-cream-400 block truncate">
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Feature Drawer Pill on Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-900 dark:bg-cream-100 text-white dark:text-navy-950 text-xs font-bold shadow-lg border border-white/20 active:scale-95 transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>Menu Fitur</span>
        </button>
      </div>

      {/* Main Bottom Bar */}
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
              pathname === "/simulator"
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
    </>
  );
}
