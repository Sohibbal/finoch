"use client";

import React from "react";
import {
  Mic,
  Coins,
  Gift,
  Smartphone,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Cloud,
  Command,
  Search,
  Sparkles,
} from "lucide-react";

interface BentoGridProps {
  onOpenVoice: () => void;
  onOpenScan: () => void;
}

export function BentoGrid({ onOpenVoice, onOpenScan }: BentoGridProps) {
  return (
    <section id="fitur" className="scroll-mt-28 space-y-12 sm:space-y-16">
      {/* Section Header with Cobalt typography feel */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MODULAR & INTUITIF</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Semua yang Kamu Butuhkan. Tanpa Fitur Basa-Basi.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Dirancang untuk kecepatan operasional mahasiswa dan anak kost. Bebas friksi pencatatan manual, dengan kontrol keuangan yang bekerja di latar belakang.
        </p>
      </div>

      {/* Grid Bento: Row 1 (3 Cards) & Row 2 (2 Wide Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
        
        {/* Card 1: Input Suara & Scan Struk */}
        <div className="relative rounded-2xl p-6 sm:p-7 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-blue-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Catat Secepat Bicara
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ucapkan belanjaanmu secara santai. AI lokal mengekstrak nama item, nominal rupiah, dan kategori secara presisi.
              </p>
            </div>
          </div>

          {/* Mini Interactive Preview */}
          <div className="relative z-10 rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Audio Aktif
              </span>
              <span>Web Speech Native</span>
            </div>
            <p className="font-semibold text-white text-xs leading-snug">
              &ldquo;Makan siang ayam geprek 18 ribu sama es teh 4 ribu&rdquo;
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px]">
                Ayam Geprek Rp18.000
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold text-[10px]">
                Es Teh Rp4.000
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 pt-2 border-t border-slate-800/80 text-xs font-semibold">
            <button
              type="button"
              onClick={onOpenVoice}
              className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Tes Bicara</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={onOpenScan}
              className="text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Tes Scan Struk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Jatah Harian Dinamis */}
        <div className="relative rounded-2xl p-6 sm:p-7 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-emerald-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Disiplin Jatah Harian
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tetapkan plafon belanja harian anti-boncos. Pantau secara instan apakah sisa uang saku hari ini aman atau kritis.
              </p>
            </div>
          </div>

          {/* Mini Ring Meter Preview */}
          <div className="relative z-10 rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Harian:</span>
              <span className="font-bold text-white money">Rp150.000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: "30%" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sisa Rp105.000 (Aman)
              </span>
              <span className="text-slate-400">Terpakai Rp45.000</span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Dihitung otomatis dari sisa hari & anggaran bulanan.
          </p>
        </div>

        {/* Card 3: Wishlist Planner */}
        <div className="relative rounded-2xl p-6 sm:p-7 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-purple-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Wishlist & Target Nyata
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Redam belanja impulsif dengan masa tunggu evaluasi. Finoch menghitung estimasi tanggal ketercapaian secara realistis.
              </p>
            </div>
          </div>

          {/* Mini Wishlist Preview */}
          <div className="relative z-10 rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Mechanical Keyboard</span>
              <span className="font-extrabold text-purple-400 money">Rp450.000</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out" style={{ width: "70%" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Terkumpul Rp315.000</span>
              <span className="font-bold text-slate-300">~9 hari lagi</span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Alokasi otomatis dari sisa jatah harian yang dihemat.
          </p>
        </div>
      </div>

      {/* Row 2: 2 Wider Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-7">
        
        {/* Card 4: PWA Offline-First (7 cols) */}
        <div className="md:col-span-7 relative rounded-2xl p-6 sm:p-8 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-blue-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                PWA Offline-First & Sinkronisasi Cerdas
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Bisa dipasang langsung di Android, iOS, maupun Desktop seperti aplikasi native. Tetap berfungsi tanpa koneksi internet; transaksi disimpan lokal di IndexedDB dan disinkronkan otomatis begitu online.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Lokal IndexedDB</p>
                <p className="text-[11px] text-slate-400">Pencatatan instan & tanpa jeda</p>
              </div>
            </div>

            <div className="rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 flex items-center gap-3">
              <Cloud className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Cloud PostgreSQL</p>
                <p className="text-[11px] text-slate-400">Auto-sync di latar belakang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Pintasan Cepat & Privasi Penuh (5 cols) */}
        <div className="md:col-span-5 relative rounded-2xl p-6 sm:p-8 bg-[#080D1A] border border-slate-800/90 shadow-xl overflow-hidden group hover:border-slate-500/50 hover:shadow-2xl transition-card hover-card-lift flex flex-col justify-between space-y-6">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center justify-center shadow-xs">
              <Command className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Pencarian Cepat & Privasi Penuh
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Akses semua histori dengan pintasan keyboard. Tanpa pelacak iklan pihak ketiga, data finansialmu terjaga aman.
              </p>
            </div>
          </div>

          <div className="relative z-10 rounded-xl p-3.5 bg-[#0C1427] border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                Global Search
              </span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/70 font-mono text-[10px] text-slate-300">
                Ctrl + K
              </kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Enkripsi JWT Cookie
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
