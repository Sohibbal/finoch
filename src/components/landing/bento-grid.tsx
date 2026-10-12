"use client";

import React from "react";
import {
  Mic,
  ScanLine,
  Coins,
  Gift,
  Smartphone,
  Search,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Cloud,
  Command,
} from "lucide-react";

interface BentoGridProps {
  onOpenVoice: () => void;
  onOpenScan: () => void;
}

export function BentoGrid({ onOpenVoice, onOpenScan }: BentoGridProps) {
  return (
    <section id="fitur" className="scroll-mt-20 space-y-8">
      {/* Section Header */}
      <div className="max-w-2xl space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Semua yang Kamu Butuhkan. Tanpa Fitur Basa-Basi.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Dirancang untuk kecepatan dan kendali penuh. Selesaikan pencatatan dalam hitungan detik tanpa membuka spreadsheet manual.
        </p>
      </div>

      {/* Grid Bento: Row 1 (3 Cards) & Row 2 (2 Wide Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Input Suara & Scan Struk */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-blue-400 dark:hover:border-blue-500/60 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Catat Secepat Bicara
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Ucapkan belanjaanmu secara natural. AI memilah nama item, harga, dan kategori secara presisi.
              </p>
            </div>
          </div>

          {/* Mini Interactive Preview */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Audio terdeteksi
              </span>
              <span>Barusan</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-[11px]">
              &ldquo;Makan siang ayam geprek 18 ribu sama es teh 4 ribu&rdquo;
            </p>
            <div className="flex gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                Ayam Geprek Rp18.000
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                Es Teh Rp4.000
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold">
            <button
              type="button"
              onClick={onOpenVoice}
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Tes Suara</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={onOpenScan}
              className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Tes Scan Struk</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Jatah Harian Dinamis */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-emerald-400 dark:hover:border-emerald-500/60 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Disiplin Jatah Harian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tetapkan batas belanja harian yang realistis. Ketahui seketika apakah pengeluaran hari ini aman atau over budget.
              </p>
            </div>
          </div>

          {/* Mini Ring Meter Preview */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Harian:</span>
              <span className="font-bold text-slate-900 dark:text-white money">Rp120.000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> On Track (Sisa Rp42.000)
              </span>
              <span className="text-slate-400">65% Terpakai</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            Dihitung dari saldo riil atau nominal kustom yang kamu atur.
          </p>
        </div>

        {/* Card 3: Wishlist Planner */}
        <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-purple-400 dark:hover:border-purple-500/60 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-400/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Wishlist & Target Nyata
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kunci barang impianmu. Finoch menghitung estimasi tanggal ketercapaian secara otomatis dari alokasi tabunganmu.
              </p>
            </div>
          </div>

          {/* Mini Wishlist Preview */}
          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Mechanical Keyboard</span>
              <span className="font-extrabold text-purple-600 dark:text-purple-400 money">Rp450.000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: "70%" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Terkumpul Rp315.000</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">~9 hari lagi</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            Alokasi otomatis dari sisa jatah harian yang dihemat.
          </p>
        </div>
      </div>

      {/* Row 2: 2 Wider Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 4: PWA Offline-First */}
        <div className="md:col-span-7 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-blue-400 dark:hover:border-blue-500/60 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                PWA Offline-First & Sinkronisasi Cerdas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
                Bisa dipasang langsung di Android, iOS, maupun Desktop seperti aplikasi native. Tetap berfungsi tanpa koneksi internet; transaksi disimpan lokal dan disinkronkan otomatis begitu online kembali.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Lokal IndexedDB</p>
                <p className="text-[10px] text-slate-400">Instan & tanpa jeda</p>
              </div>
            </div>

            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Cloud Backup</p>
                <p className="text-[10px] text-slate-400">Auto-sync saat online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Pintasan Cepat & Privasi Penuh */}
        <div className="md:col-span-5 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 group hover:border-slate-400 dark:hover:border-slate-600 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Pencarian Cepat & Privasi Penuh
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Akses semua histori dengan pintasan keyboard. Tanpa pelacak iklan pihak ketiga, data finansialmu terjaga aman.
              </p>
            </div>
          </div>

          <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Global Search
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                Ctrl + K
              </kbd>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Enkripsi Akun
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
