"use client";

import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Bot,
  Flame,
  Calendar,
  Mic,
} from "lucide-react";

export function HeroDashboardMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto group">
      {/* Background Ambient Glow (Spotlight beam like Cobalt reference) */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-sky-500/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Container mirroring the capture card */}
      <div className="relative rounded-2xl bg-[#080D1A] border border-slate-800/90 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 overflow-hidden transition-all duration-500">
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* ROW 1: FinBot Daily Insight Banner */}
        <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-5 h-5 text-sky-200" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                  FINBOT INSIGHT
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Jatah Harian Aman
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                Hari ini pengeluaranmu Rp45.000 dari plafon Rp150.000. Sisa Rp105.000 bisa kamu alokasikan ke wishlist!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#261E0E] text-amber-400 border border-amber-500/20 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Streak 4 Hari</span>
            </div>
          </div>
        </div>

        {/* ROW 2: 4 Key Metric Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: Saldo Bersih */}
          <div className="rounded-2xl p-5 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3 min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Saldo Bersih</span>
              <Wallet className="w-4 h-4 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight money">
                Rp24.333.500
              </h3>
              <p className="text-xs font-semibold text-emerald-400">
                +12.4% vs bulan lalu
              </p>
            </div>
          </div>

          {/* CARD 2: Jatah Hari Ini */}
          <div className="rounded-2xl p-5 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3 min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Jatah Hari Ini</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight money">
                Rp150.000
              </h3>
              <p className="text-xs font-semibold text-emerald-400">
                Sisa Rp105.000 (Aman)
              </p>
            </div>
          </div>

          {/* CARD 3: Pemasukan */}
          <div className="rounded-2xl p-5 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3 min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Pemasukan</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-[26px] font-extrabold text-emerald-400 tracking-tight money">
                +Rp8.500.000
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                Uang saku & freelance
              </p>
            </div>
          </div>

          {/* CARD 4: Pengeluaran */}
          <div className="rounded-2xl p-5 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3 min-h-[135px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Pengeluaran</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-[26px] font-extrabold text-rose-500 tracking-tight money">
                -Rp3.840.000
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                38 transaksi dicatat
              </p>
            </div>
          </div>
        </div>

        {/* ROW 3: 2-Column Split (Chart Kiri & Alokasi Kategori Kanan) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* SISI KIRI (lg:col-span-8): Tren Keuangan 6 Bulan Terakhir */}
          <div className="lg:col-span-8 rounded-2xl p-5 sm:p-6 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Tren Keuangan 6 Bulan Terakhir
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Perbandingan arus pemasukan vs pengeluaran
                </p>
              </div>
              <div className="flex items-center gap-3.5 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Pemasukan
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Pengeluaran
                </span>
              </div>
            </div>

            {/* Glowing SVG Multi-Line Chart with interactive highlight tooltip */}
            <div className="relative h-56 w-full pt-4 flex flex-col justify-end">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-44 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="mockupBlueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="mockupRoseGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#1e293b" strokeDasharray="3 3" opacity="0.6" />

                {/* Income Area & Line */}
                <path
                  d="M0,150 C120,135 240,85 360,65 C440,55 520,48 600,42 L600,200 L0,200 Z"
                  fill="url(#mockupBlueGlow)"
                />
                <path
                  d="M0,150 C120,135 240,85 360,65 C440,55 520,48 600,42"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Expense Area & Line */}
                <path
                  d="M0,175 C120,160 240,128 360,118 C440,115 520,112 600,95 L600,200 L0,200 Z"
                  fill="url(#mockupRoseGlow)"
                />
                <path
                  d="M0,175 C120,160 240,128 360,118 C440,115 520,112 600,95"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Glowing Dot marker at 12 Oktober on the expense curve */}
                <circle
                  cx="410"
                  cy="116"
                  r="6"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
              </svg>

              {/* Floating Tooltip Box matching capture card (hidden on small mobile to prevent overlap) */}
              <div className="hidden sm:block absolute top-2 left-[68%] -translate-x-1/2 bg-white text-slate-900 rounded-xl px-3 py-2 shadow-2xl pointer-events-none space-y-0.5 border border-slate-100 min-w-[130px] z-20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>12 Oktober</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Pengeluaran: Rp45.000
                </p>
                <p className="text-[11px] font-bold text-emerald-600">
                  Sisa Jatah: Rp105.000
                </p>
              </div>

              {/* Months X-axis */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <span>Mei</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Agu</span>
                <span>Sep</span>
                <span>Okt</span>
              </div>
            </div>
          </div>

          {/* SISI KANAN (lg:col-span-4): Alokasi Kategori */}
          <div className="lg:col-span-4 rounded-2xl p-5 sm:p-6 bg-[#0C1427] border border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="text-center space-y-0.5">
              <h4 className="text-sm sm:text-base font-bold text-white">
                Alokasi Kategori
              </h4>
              <p className="text-xs text-slate-400">
                Pemilahan otomatis via AI NLP
              </p>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-3.5 my-auto">
              {/* Makan & Minum */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Makan & Minum</span>
                  <span className="font-bold text-white">42%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[42%]" />
                </div>
              </div>

              {/* Transportasi */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Transportasi</span>
                  <span className="font-bold text-white">24%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[24%]" />
                </div>
              </div>

              {/* Kebutuhan Kost */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Kebutuhan Kost</span>
                  <span className="font-bold text-white">18%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-[18%]" />
                </div>
              </div>

              {/* Belanja & Hiburan */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Belanja & Hiburan</span>
                  <span className="font-bold text-white">16%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[16%]" />
                </div>
              </div>
            </div>

            {/* Footer Row (Ayam Geprek log from voice/chat) */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Mic className="w-3.5 h-3.5" />
                <span className="text-slate-300 font-medium">Ayam Geprek</span>
              </div>
              <span className="font-bold text-rose-500">-Rp18.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
