"use client";

import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";

export function HeroDashboardMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 group">
      {/* Background Ambient Glow (Spotlight effect like Cobalt) */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-sky-500/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Main Container */}
      <div className="relative rounded-2xl bg-[#f8faff] dark:bg-[#0B101D] border border-blue-200/80 dark:border-slate-800/90 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6 overflow-hidden">
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] dark:opacity-[0.08] pointer-events-none" />

        {/* Mockup Header Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-slate-800/80 gap-3">
          {/* Left: Window controls & breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Finoch Workspace / Dashboard
            </span>
          </div>

          {/* Right: Mock Search & Quick icons */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-400 shadow-2xs">
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cari transaksi...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">Ctrl K</kbd>
            </div>
            <div className="w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center text-slate-400">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              F
            </div>
          </div>
        </div>

        {/* Row 1: 4 Key Metric Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1: Saldo Bersih */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Saldo Bersih</span>
              <Wallet className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white money">
              Rp24.333.500
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span>+12.4%</span>
              <span className="text-slate-400 dark:text-slate-500">bulan ini</span>
            </p>
          </div>

          {/* Metric 2: Jatah Hari Ini */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Jatah Hari Ini</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white money">
              Rp150.000
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Aman · Terpakai Rp45.000
            </p>
          </div>

          {/* Metric 3: Pemasukan Bulan Ini */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pemasukan</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 money">
              +Rp8.500.000
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              4 transaksi masuk
            </p>
          </div>

          {/* Metric 4: Pengeluaran Bulan Ini */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pengeluaran</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400 money">
              -Rp3.840.000
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              38 transaksi keluar
            </p>
          </div>
        </div>

        {/* Row 2: Visual Chart & Category Preview */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Financial Curve Chart (6 Months Trend) */}
          <div className="lg:col-span-8 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tren Keuangan 6 Bulan Terakhir</h4>
                <p className="text-[11px] text-slate-400">Perbandingan pemasukan stabil vs pengeluaran terkendali</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Pemasukan
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Pengeluaran
                </span>
              </div>
            </div>

            {/* Glowing SVG Multi-Line Chart (inspired by Cobalt's curve visual) */}
            <div className="relative h-44 w-full flex items-end">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="roseGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/60" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/60" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/60" strokeDasharray="3 3" />

                {/* Income Area & Line */}
                <path
                  d="M0,110 C80,95 160,50 250,45 C340,40 420,30 500,20 L500,150 L0,150 Z"
                  fill="url(#blueGlow)"
                />
                <path
                  d="M0,110 C80,95 160,50 250,45 C340,40 420,30 500,20"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Expense Area & Line */}
                <path
                  d="M0,135 C80,120 160,105 250,90 C340,75 420,85 500,70 L500,150 L0,150 Z"
                  fill="url(#roseGlow)"
                />
                <path
                  d="M0,135 C80,120 160,105 250,90 C340,75 420,85 500,70"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Floating Tooltip Pin (like Cobalt's tooltip point) */}
                <circle cx="340" cy="75" r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
              </svg>

              {/* Floating Tooltip Box */}
              <div className="absolute top-2 left-[62%] -translate-x-1/2 rounded-xl p-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[10px] shadow-lg pointer-events-none space-y-0.5">
                <p className="font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>12 Oktober</span>
                </p>
                <p className="text-slate-300 dark:text-slate-600">Pengeluaran: Rp120.000</p>
                <p className="text-emerald-400 dark:text-emerald-600 font-semibold">Sisa Jatah: Rp30.000</p>
              </div>
            </div>

            {/* Months labels */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Mei</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Agu</span>
              <span>Sep</span>
              <span>Okt</span>
            </div>
          </div>

          {/* Right: Category Distribution & Live Feeds */}
          <div className="lg:col-span-4 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Alokasi Pengeluaran</h4>
              <p className="text-[11px] text-slate-400">Distribusi otomatis per kategori</p>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Makan & Minum</span>
                  <span className="font-bold text-slate-900 dark:text-white">42%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Transportasi</span>
                  <span className="font-bold text-slate-900 dark:text-white">24%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Tagihan & Kos</span>
                  <span className="font-bold text-slate-900 dark:text-white">18%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Belanja & Hiburan</span>
                  <span className="font-bold text-slate-900 dark:text-white">16%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "16%" }} />
                </div>
              </div>
            </div>

            {/* Quick snippet recent row */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Terakhir: Nasi Goreng</span>
              <span className="font-bold text-slate-900 dark:text-white">-Rp18.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
