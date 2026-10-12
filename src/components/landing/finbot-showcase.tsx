"use client";

import React from "react";
import { Bot, MessageSquare, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinbotShowcase() {
  return (
    <section id="finbot" className="scroll-mt-20 space-y-8">
      {/* Section Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Bot className="w-4 h-4" />
          <span>AI COPILOT FINANSIAL</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kenalan dengan FinBot. Copilot Cerdas Finansialmu.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          FinBot terhubung langsung ke konteks riwayat transaksi, saldo bersih, dan target jatah harianmu. Bertanya seputar keuangan jadi senatural ngobrol santai.
        </p>
      </div>

      {/* 2 Showcase Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Audit Keamanan Jatah Harian */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 group hover:border-blue-400 dark:hover:border-blue-500/60 transition-all">
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Audit Jatah Harian Real-Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              FinBot tidak berhalusinasi. Saat kamu bertanya apakah pengeluaran aman, FinBot membandingkannya langsung dengan target jatah harianmu.
            </p>
          </div>

          {/* Visual Simulation of Chat Audit */}
          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="rounded-xl rounded-tr-xs px-3.5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium max-w-[85%]">
                Aman pengeluaran hari ini?
              </div>
            </div>

            {/* FinBot message */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                F
              </div>
              <div className="rounded-xl rounded-tl-xs p-3 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 shadow-2xs max-w-[90%]">
                <p className="leading-relaxed">
                  Hari ini kamu sudah belanja <strong>Rp120.000</strong> - melebihi target jatah harianmu <strong>Rp100.000</strong> (boncos Rp20.000).
                </p>
                <div className="rounded-lg p-2 bg-blue-50/70 dark:bg-blue-950/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  Saldo bersih Rp24.333.500 kamu masih aman. Besok rem belanja dikit ya biar wishlist tetap on track!
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Evaluasi akurat berbasis data riil</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Bebas Halusinasi</span>
          </div>
        </div>

        {/* Card 2: Analisis Kebiasaan & Kategori Boros */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 group hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all">
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Tanya Kategori & Tren Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Minta ringkasan bulanan atau cari tahu ke mana saja uangmu terpakai tanpa repot memfilter tabel secara manual.
            </p>
          </div>

          {/* Visual Simulation of Chat Category */}
          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="rounded-xl rounded-tr-xs px-3.5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium max-w-[85%]">
                Kategori apa yang paling boros bulan ini?
              </div>
            </div>

            {/* FinBot message */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                F
              </div>
              <div className="rounded-xl rounded-tl-xs p-3 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 shadow-2xs max-w-[90%]">
                <p className="leading-relaxed">
                  Bulan ini kategori <strong>Makan & Minum</strong> menempati porsi terbesar dengan total <strong>Rp1.612.000</strong> (42% dari total pengeluaran).
                </p>
                <div className="rounded-lg p-2 bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  Saran: Kurangi jajan kopi Rp15.000/hari, target wishlist kamu bisa tercapai 5 hari lebih cepat.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Respons cepat dengan gaya bahasa santai</span>
            <Link
              href="/copilot"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Buka FinBot Copilot</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
