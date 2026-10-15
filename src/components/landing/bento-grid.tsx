"use client";

import React from "react";
import {
  Mic,
  Coins,
  Gift,
  Smartphone,
  ArrowUpRight,
  CheckCircle2,
  Database,
} from "lucide-react";

interface BentoGridProps {
  onOpenVoice: () => void;
  onOpenScan: () => void;
}

export function BentoGrid({ onOpenVoice, onOpenScan }: BentoGridProps) {
  return (
    <section id="fitur" className="scroll-mt-28">
      {/* 2-Column Responsive Layout: Left Sticky Header & Highlights, Right Scrolling Cards Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Sticky Title & Description */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 self-start">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Semua yang Kamu Butuhkan. Tanpa Fitur Basa-Basi.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Dirancang untuk kecepatan operasional harian. Bebas friksi pencatatan manual, dengan kontrol keuangan yang bekerja di latar belakang.
            </p>
          </div>
        </div>

        {/* Right Column: Cards Stack matching the Dashboard Card Style */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Input Suara & Scan Struk */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon matching Dashboard Cards */}
            <Mic
              className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Input Cepat: Suara & Scan Struk
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Web Speech & OCR
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Ucapkan belanjaanmu secara santai atau foto struk kasir. Sistem mengekstrak nama item, nominal rupiah, dan kategorinya secara otomatis tanpa ketik manual.
            </p>

            {/* Real Interactive Preview: Speech bubble + Exact Dashboard Transaction row */}
            <div className="space-y-2.5 relative z-10">
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-rose-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Audio Terdeteksi
                  </span>
                  <span>Web Speech Native</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  &ldquo;Makan siang ayam geprek sama es teh 22 ribu&rdquo;
                </p>
              </div>

              {/* Exact Dashboard Transaction Row Style */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3.5 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      Ayam Geprek + Es Teh
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                      Hari Ini · Input Suara
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Makanan & Minuman</span>
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold money text-rose-600 dark:text-rose-400">
                    -Rp22.000
                  </span>
                </div>
              </div>
            </div>

            {/* Context Footer with interactive action triggers */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-3 font-semibold">
                <button
                  type="button"
                  onClick={onOpenVoice}
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <span>Tes Bicara</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={onOpenScan}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <span>Tes Scan Struk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Tersimpan ke database</span>
            </div>
          </div>

          {/* Card 2: Disiplin Jatah Harian (Matches DailyAllowanceRing) */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon */}
            <Coins
              className="absolute -right-3 -bottom-3 w-28 h-28 text-teal-500/5 dark:text-teal-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Status Jatah Harian
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                70% Aman
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Tetapkan batas aman belanja per hari. Sistem memisahkan secara tegas uang jajan harian dari simpanan masa depan agar tidak boncos.
            </p>

            {/* Real SVG Donut Ring matching DailyAllowanceRing in Dashboard */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-around gap-4 relative z-10">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="11"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#14B8A6"
                    strokeWidth="11"
                    strokeDasharray="402.12"
                    strokeDashoffset="120.6"
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight money text-slate-900 dark:text-white">
                    Rp105.000
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Sisa Jatah</span>
                </div>
              </div>

              <div className="space-y-2 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Plafon Harian:</span>
                  <span className="font-bold text-slate-900 dark:text-white money">Rp150.000</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Terpakai Hari Ini:</span>
                  <span className="font-bold text-rose-500 money">Rp45.000</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Status Keamanan:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aman Terkendali
                  </span>
                </div>
              </div>
            </div>

            {/* Context Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span>Metode:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Dihitung dinamis dari sisa hari & anggaran bulanan
              </span>
            </div>
          </div>

          {/* Card 3: Top Wishlist Impian (Matches Dashboard Top Wishlist) */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon */}
            <Gift
              className="absolute -right-3 -bottom-3 w-28 h-28 text-amber-500/5 dark:text-amber-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Wishlist Impian Berdasar Kemampuan
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Alokasi 20% Jatah
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Cegah belanja impulsif. Finoch menghitung estimasi tanggal ketercapaian barang impian dari sisa uang jajan yang kamu sisihkan tiap hari.
            </p>

            {/* Exact Dashboard Top Wishlist Item Style */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                    #1
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Mechanical Keyboard
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  ~9 hari lagi
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="money font-semibold text-slate-700 dark:text-slate-300">
                  Rp450.000
                </span>
                <span className="text-[10px]">
                  Rp315.000 (70%)
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-500"
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            {/* Context Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span>Proyeksi Otomatis:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                +Rp30.000/hari saat disiplin jatah
              </span>
            </div>
          </div>

          {/* Card 4: Tersedia di Mode PWA */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon */}
            <Smartphone
              className="absolute -right-3 -bottom-3 w-28 h-28 text-teal-500/5 dark:text-teal-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tersedia di Mode PWA
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                PWA Standalone
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Dapat dipasang langsung di HP Android, iPhone, maupun Laptop/PC tanpa lewat app store. Tampil layar penuh layaknya aplikasi native, ringan, dan tetap aktif mencatat transaksi meski tanpa koneksi internet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Instalasi Layar Penuh</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Bebas bilah peramban & instan</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Lokal &amp; Sinkronisasi</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">IndexedDB offline + auto-sync</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span>Dukungan Perangkat:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Android, iOS, macOS, Windows
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

