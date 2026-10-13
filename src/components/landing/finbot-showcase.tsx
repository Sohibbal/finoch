"use client";

import React from "react";
import { Bot, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

export function FinbotShowcase() {
  return (
    <section id="finbot" className="scroll-mt-28 space-y-12 sm:space-y-16">
      {/* Section Header with Cobalt typography feel */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
          <Bot className="w-4 h-4" />
          <span>AI COPILOT FINANSIAL</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Kenalan dengan FinBot. Copilot Cerdas Finansialmu.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          FinBot terhubung langsung ke riwayat transaksi, saldo bersih, dan batas jatah harianmu. Konsultasi keuangan harian jadi senatural ngobrol dengan teman satu kost.
        </p>
      </div>

      {/* 2 Showcase Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Card 1: Audit Keamanan Jatah Harian */}
        <div className="relative rounded-2xl p-6 sm:p-8 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-blue-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Audit Jatah Harian Real-Time
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              FinBot tidak berhalusinasi. Saat kamu bertanya apakah pengeluaran aman, FinBot membandingkannya langsung dengan plafon harian dan sisa hari dalam bulan berjalan.
            </p>
          </div>

          {/* Visual Simulation of Chat Audit */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-[#0C1427] border border-slate-800/80 space-y-3.5">
            {/* User message */}
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-xs px-4 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium max-w-[85%] shadow-md">
                Aman pengeluaran hari ini?
              </div>
            </div>

            {/* FinBot message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">
                F
              </div>
              <div className="rounded-2xl rounded-tl-xs p-4 bg-[#080D1A] border border-slate-800/80 text-xs sm:text-sm text-slate-200 space-y-2 shadow-xs max-w-[90%]">
                <p className="leading-relaxed">
                  Hari ini kamu belanja <strong className="text-white">Rp45.000</strong> dari plafon jatah harianmu <strong className="text-white">Rp150.000</strong>.
                </p>
                <div className="rounded-xl p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Sisa jatah Rp105.000 sangat aman untuk dialokasikan ke tabungan wishlist!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Evaluasi akurat berbasis data riil</span>
            <span className="font-semibold text-emerald-400">Bebas Halusinasi</span>
          </div>
        </div>

        {/* Card 2: Analisis Kebiasaan & Kategori Boros */}
        <div className="relative rounded-2xl p-6 sm:p-8 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-indigo-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Tanya Kategori & Tren Pengeluaran
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Minta ringkasan bulanan atau cari tahu ke mana saja uangmu terpakai tanpa repot memfilter dan menghitung tabel secara manual.
            </p>
          </div>

          {/* Visual Simulation of Chat Category */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-[#0C1427] border border-slate-800/80 space-y-3.5">
            {/* User message */}
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-xs px-4 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium max-w-[85%] shadow-md">
                Kategori apa yang paling boros bulan ini?
              </div>
            </div>

            {/* FinBot message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">
                F
              </div>
              <div className="rounded-2xl rounded-tl-xs p-4 bg-[#080D1A] border border-slate-800/80 text-xs sm:text-sm text-slate-200 space-y-2 shadow-xs max-w-[90%]">
                <p className="leading-relaxed">
                  Bulan ini kategori <strong className="text-white">Makan & Minum</strong> mendominasi dengan total <strong className="text-white">Rp1.612.000</strong> (42% dari seluruh pengeluaranmu).
                </p>
                <div className="rounded-xl p-2.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium text-xs flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Saran: Kurangi jajan kopi Rp15.000/hari, target keyboard mekanik bisa tercapai 5 hari lebih cepat.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Respons cepat dengan gaya bahasa santai</span>
            <Link
              href="/copilot"
              className="font-bold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Buka FinBot Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
