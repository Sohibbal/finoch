"use client";

import React from "react";
import { ArrowRight, Bot, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function FinbotShowcase() {
  return (
    <section id="finbot" className="scroll-mt-28">
      {/* 2-Column Responsive Layout: Left Sticky Header & Highlights, Right Scrolling Cards Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Sticky Title & Description */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6 self-start">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Kenalan dengan FinBot. Copilot Cerdas Finansialmu.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              FinBot terhubung langsung ke riwayat transaksi, saldo bersih, dan batas jatah harianmu. Konsultasi keuangan harian jadi senatural ngobrol dengan teman satu kost.
            </p>
          </div>

          <div>
            <Link
              href="/copilot"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 active:scale-98 transition-all shadow-xs"
            >
              <span>Coba Tanya FinBot di Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: 2 Showcase Cards matching Dashboard and Copilot styles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: FinBot Daily Insight (Matches GenZInsightCard from Dashboard) */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon */}
            <Bot
              className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/5 dark:text-emerald-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  FinBot Daily Insight di Dashboard
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Kondisi Aman
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Setiap hari dan setelah transaksi baru, FinBot memberikan evaluasi langsung di dashboard dengan gaya bahasa santai khas anak muda.
            </p>

            {/* Exact GenZInsightCard from Dashboard */}
            <div className="relative overflow-hidden rounded-2xl border shadow-xs glass-sheen min-h-[150px] flex flex-row items-stretch bg-emerald-500/[0.04] dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/60 relative z-10">
              {/* SISI KIRI: FinBot Logo Emblem */}
              <div className="w-24 sm:w-28 shrink-0 self-stretch flex items-center justify-center border-r border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-slate-800/30 relative z-10 p-3">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center finbot-fade-loop select-none">
                  <div className="absolute inset-0 rounded-2xl blur-lg opacity-40 dark:opacity-50 transition-colors bg-[#059669]" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center justify-center">
                    <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-[#059669]" strokeWidth={2} />
                  </div>
                </div>
              </div>

              {/* SISI KANAN: Konten Insight */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0 relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FinBot Daily Insight</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Aman Terkendali
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  &ldquo;Gokil, pengeluaran hari ini masih terkendali banget sob! Sisa jatah Rp105.000 aman buat ditabung ke Wishlist Mechanical Keyboard.&rdquo;
                </p>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                  Dihitung otomatis dari database transaksi kamu
                </div>
              </div>
            </div>

            {/* Context Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span>Posisi di App:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Tampil di bagian paling atas Dashboard
              </span>
            </div>
          </div>

          {/* Card 2: Simulasi Konsultasi Chat (Matches /copilot Interface) */}
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
            {/* Watermark Icon */}
            <Bot
              className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
              strokeWidth={1.5}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konsultasi Finansial Interaktif
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                FinBot Copilot
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
              Tanya apa saja seputar uang saku, evaluasi kategori paling boros, atau estimasi kapan barang impian bisa terbeli.
            </p>

            {/* Exact Chat Bubble & Avatar styles from /copilot */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800 space-y-3.5 relative z-10">
              {/* User message */}
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-xs space-y-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    Bulan ini gue paling boros di kategori apa?
                  </div>
                  <div className="text-[10px] opacity-60 flex items-center gap-2 justify-end">
                    <span>14:30</span>
                  </div>
                </div>
              </div>

              {/* FinBot message */}
              <div className="flex items-start gap-3 flex-row">
                {/* Real FinBot Avatar from Copilot */}
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs finbot-fade-loop">
                  <Bot className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </div>

                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs space-y-2 bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-white">
                  <div className="text-xs sm:text-sm leading-relaxed space-y-2">
                    <p>
                      Berdasarkan riwayatmu, kategori <strong className="font-bold text-slate-900 dark:text-white">Makanan & Minuman</strong> mendominasi dengan total <strong className="font-bold text-slate-900 dark:text-white">Rp1.612.000</strong> (42% dari seluruh pengeluaran).
                    </p>
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Saran: Kurangi jajan kopi Rp15.000/hari, target keyboard impian bisa kebeli 5 hari lebih cepat!</span>
                    </div>
                  </div>
                  <div className="text-[10px] opacity-60 flex items-center gap-2 justify-start pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <span>14:31</span>
                    <span>• AI Gen-Z</span>
                    <span>• Database Facts</span>
                  </div>
                </div>
              </div>

              {/* Quick Prompts Strip from /copilot */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Pusat Tanya Cepat:</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                  Sisa uang jajan masih aman gak?
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                  Kapan wishlist gue bisa kebeli?
                </span>
              </div>
            </div>

            {/* Context Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs relative z-10">
              <span className="text-[11px] text-slate-400">Tersinkron dengan riwayat transaksi</span>
              <Link
                href="/copilot"
                className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>Buka Copilot Penuh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

