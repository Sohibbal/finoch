"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Camera,
  ArrowRight,
  Plus,
  Minus,
  Check,
  X,
  Sparkles,
  Shield,
  Smartphone,
  Layers,
  Database,
  Lock,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { TransactionCandidate } from "@/types/financial-types";

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    // Check logged in user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});

    // Check theme
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("voicash_theme", "dark");
      localStorage.setItem("finra_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("voicash_theme", "light");
      localStorage.setItem("finra_theme", "light");
    }
  };

  const handleOcrSuccess = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 transition-colors duration-300 font-sans selection:bg-navy-900 selection:text-cream-100 dark:selection:bg-cream-100 dark:selection:text-navy-950">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300/80 dark:border-navy-800/80 px-4 sm:px-8 py-4 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-xl font-black tracking-tight text-navy-900 dark:text-cream-50">
              voicash<span className="text-navy-600 dark:text-cream-300">.id</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-navy-800/80 dark:text-cream-200/80">
            <a href="#fitur" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Cara kerja
            </a>
            <a href="#paket" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              className="p-1.5 rounded-full text-navy-700 hover:text-navy-950 dark:text-cream-300 dark:hover:text-cream-50 hover:bg-cream-200/60 dark:hover:bg-navy-800/80 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-cream-200" />
              ) : (
                <Moon className="w-4 h-4 text-navy-900" />
              )}
            </button>

            {userEmail ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-navy-900 dark:text-cream-200 hover:text-navy-950 dark:hover:text-white transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                >
                  Mulai gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 space-y-24 sm:space-y-32 pt-12 sm:pt-20 pb-20">
        {/* 2. HERO SECTION (Split 50/50 Layout like botku.id) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Subtext */}
          <div className="lg:col-span-7 space-y-6">
            {/* Minimal Status Dot Indicator */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-navy-700/80 dark:text-cream-300/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pencatat pengeluaran suara lokal & cerdas</span>
            </div>

            {/* Main Headline (Tight leading, confident, display font) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-navy-950 dark:text-cream-50">
              Keuangan Anda rapi dalam satu kali bicara.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-navy-700/80 dark:text-cream-300/80 leading-relaxed max-w-xl">
              Tidak perlu mencatat nominal satu per satu di kasir. Cukup ucapkan belanjaan Anda atau foto struk nota, lalu VoiCash mengelompokkannya secara otomatis.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                Mulai gratis
              </Link>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-navy-900 dark:text-cream-200 hover:underline transition-all"
              >
                <span>Coba suara langsung</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Layered Mockup Graphic (matching botku.id style) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[390px]">
              {/* Offset Backdrop Shape */}
              <div className="absolute -inset-2 sm:-inset-3 bg-cream-200/90 dark:bg-navy-900 rounded-3xl transform rotate-2 pointer-events-none transition-transform duration-500 group-hover:rotate-0" />

              {/* Main Floating Voice & Transaction Card */}
              <div className="relative rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800/90 p-5 sm:p-6 shadow-xl space-y-4">
                {/* Mock Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800/80 text-[11px] font-medium text-navy-600 dark:text-cream-300/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-navy-900 dark:text-cream-100">VoiCash Audio Engine</span>
                  </div>
                  <span>0.3s • On-device</span>
                </div>

                {/* Simulated Voice Transcript Bubble */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-navy-500 dark:text-cream-400">
                    Input Suara Kasual:
                  </div>
                  <div className="p-3 rounded-xl bg-cream-100 dark:bg-navy-900/80 border border-cream-200 dark:border-navy-800 text-xs font-medium text-navy-900 dark:text-cream-100 italic">
                    &ldquo;makan siang warteg delapan belas ribu sama es teh manis lima ribu&rdquo;
                  </div>
                </div>

                {/* Simulated Extraction Result Bubble */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-navy-500 dark:text-cream-400">
                    Hasil Pemilahan Otomatis:
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-cream-50 dark:bg-navy-950/70 border border-cream-200/70 dark:border-navy-800/60 text-xs">
                      <div>
                        <span className="font-bold text-navy-950 dark:text-cream-100">Makan siang warteg</span>
                        <span className="ml-2 text-[10px] text-navy-500 dark:text-cream-400">(Makanan)</span>
                      </div>
                      <span className="font-extrabold text-navy-900 dark:text-cream-100">Rp 18.000</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-cream-50 dark:bg-navy-950/70 border border-cream-200/70 dark:border-navy-800/60 text-xs">
                      <div>
                        <span className="font-bold text-navy-950 dark:text-cream-100">Es teh manis</span>
                        <span className="ml-2 text-[10px] text-navy-500 dark:text-cream-400">(Minuman)</span>
                      </div>
                      <span className="font-extrabold text-navy-900 dark:text-cream-100">Rp 5.000</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Micro-Interactions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsVoiceOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 hover:bg-cream-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-cream-100 text-[11px] font-bold transition-colors"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Tes Suara</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 hover:bg-cream-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-cream-100 text-[11px] font-bold transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Scan Struk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. METRIC / STAT STRIP (3 Columns with Dividers) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-cream-300 dark:border-navy-800/80">
          <div className="space-y-1 md:pr-6 md:border-r border-cream-300 dark:border-navy-800/80">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              Rp 0
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-300/70">
              gratis selamanya untuk penggunaan personal & mahasiswa
            </div>
          </div>

          <div className="space-y-1 md:px-6 md:border-r border-cream-300 dark:border-navy-800/80">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              3 dtk
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-300/70">
              rata-rata waktu pencatatan transaksi tanpa ketik manual
            </div>
          </div>

          <div className="space-y-1 md:pl-6">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              0
            </div>
            <div className="text-xs text-navy-600 dark:text-cream-300/70">
              rekaman suara yang dikirim ke cloud (100% diproses lokal)
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION (Left Title, Right 6 Stacked List Rows) */}
        <section id="fitur" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start scroll-mt-24">
          {/* Left Title Column */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              Fitur yang terpakai setiap hari
            </h2>
            <p className="text-xs sm:text-sm text-navy-700/80 dark:text-cream-300/80 leading-relaxed">
              Semua ini langsung aktif begitu Anda membuka aplikasi. Tidak ada konfigurasi berbelit atau formulir panjang yang membingungkan.
            </p>
          </div>

          {/* Right Stacked Rows Column */}
          <div className="lg:col-span-7 divide-y divide-cream-200 dark:divide-navy-800/80 border-y border-cream-200 dark:border-navy-800/80">
            {/* Feature 1 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Perekam suara instan
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  Pahami ucapan kasual bahasa Indonesia, singkatan, dan beberapa item belanja sekaligus dalam satu kalimat santai.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Pindai struk & nota
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  Ambil foto struk kasir; engine OCR lokal mengekstrak nama toko dan total pengeluaran tanpa perlu sambungan internet.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  9 Kategori pengeluaran otomatis
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  AI mengelompokkan pos pengeluaran secara cerdas ke Makanan, Transportasi, Kos, Belanja, dan lainnya secara presisi.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Digital twin finansial
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  Simulasikan arus kas bulanan, deteksi potensi kebocoran anggaran kecil, dan amankan tanggal target tabungan Anda.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Berjalan di ponsel (PWA) & offline
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  Pasang langsung ke layar utama ponsel. Catat lancar walau kuota internet habis; data tersinkron saat tersambung kembali.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="py-4 sm:py-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cream-200/80 dark:bg-navy-900 text-navy-900 dark:text-cream-200 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Privasi tanpa kompromi
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                  Tidak ada data suara yang diunggah ke pihak ketiga. Privasi Anda terlindungi penuh dengan pemrosesan on-device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS (3 Step Columns with Numbers) */}
        <section id="cara-kerja" className="space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              Dari daftar sampai kas terkendali
            </h2>
            <p className="text-xs sm:text-sm text-navy-700/80 dark:text-cream-300/80">
              Tiga langkah berurutan. Yang paling lama hanya menunggu pesanan makanan Anda disajikan di meja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {/* Step 1 */}
            <div className="border-t border-cream-300 dark:border-navy-800 pt-6 space-y-3">
              <div className="text-3xl font-black text-navy-950 dark:text-cream-50">
                1
              </div>
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Ucapkan atau foto
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                Buka VoiCash di ponsel atau laptop, tekan ikon mikrofon saat membayar, atau jepret foto nota kasir Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-t border-cream-300 dark:border-navy-800 pt-6 space-y-3">
              <div className="text-3xl font-black text-navy-950 dark:text-cream-50">
                2
              </div>
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                AI klasifikasi instan
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                Sistem deterministik menguraikan nominal rupiah, nama item belanja, serta mengelompokkan ke pos anggaran yang tepat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-t border-cream-300 dark:border-navy-800 pt-6 space-y-3">
              <div className="text-3xl font-black text-navy-950 dark:text-cream-50">
                3
              </div>
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Kas terpantau nyata
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-300/70 leading-relaxed">
                Saldo dompet dan status batas pengeluaran bulanan Anda langsung terbarui tanpa ada uang yang raib tanpa jejak.
              </p>
            </div>
          </div>
        </section>

        {/* 6. PRICING / PLANS (3 Cards with Max/Lifetime Highlight like botku.id) */}
        <section id="paket" className="space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              Satu plan untuk kendali penuh
            </h2>
            <p className="text-xs sm:text-sm text-navy-700/80 dark:text-cream-300/80">
              Gunakan gratis selamanya di perangkat Anda, atau pilih plan pro jika membutuhkan sinkronisasi cloud lintas perangkat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan 1: Free */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-600 dark:text-cream-300/70">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Free</span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-cream-50">
                    Rp 0
                  </div>
                  <div className="text-[11px] text-navy-500 dark:text-cream-400 mt-0.5">
                    selamanya, untuk 1 pengguna
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-navy-700 dark:text-cream-200/90 pt-2 border-t border-cream-200 dark:border-navy-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Catat suara offline tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Pindai struk belanja harian</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>9 Kategori pengeluaran otomatis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Penyimpanan lokal di browser</span>
                  </li>
                  <li className="flex items-center gap-2 text-navy-400 dark:text-cream-400/50">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>Sinkronisasi cloud multi-perangkat</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-900 dark:text-cream-100 text-xs font-bold text-center transition-colors block"
              >
                Pilih Free
              </Link>
            </div>

            {/* Plan 2: Pro */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-600 dark:text-cream-300/70">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pro</span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-cream-50">
                    Rp 15.000
                  </div>
                  <div className="text-[11px] text-navy-500 dark:text-cream-400 mt-0.5">
                    per 30 hari untuk 1 akun
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-navy-700 dark:text-cream-200/90 pt-2 border-t border-cream-200 dark:border-navy-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Semua fitur Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Cloud backup & sinkronisasi multi-device</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Scan struk tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Digital Twin & analisis bocor kas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Perpanjang atau berhenti kapan saja</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-900 dark:text-cream-100 text-xs font-bold text-center transition-colors block"
              >
                Pilih Pro
              </Link>
            </div>

            {/* Plan 3: Lifetime (Highlighted High-Contrast Card like Max in botku.id) */}
            <div className="p-6 rounded-2xl bg-navy-900 dark:bg-cream-100 text-cream-100 dark:text-navy-950 border border-navy-950 dark:border-cream-200 flex flex-col justify-between space-y-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cream-300 dark:text-navy-700">
                    <Database className="w-3.5 h-3.5" />
                    <span>Lifetime</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-200 text-navy-950 dark:bg-navy-900 dark:text-cream-100">
                    Paling hemat
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-cream-50 dark:text-navy-950">
                    Rp 49.000
                  </div>
                  <div className="text-[11px] text-cream-300 dark:text-navy-700 mt-0.5">
                    sekali bayar seumur hidup
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-cream-200 dark:text-navy-900 pt-2 border-t border-navy-800 dark:border-cream-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>Semua fitur Pro selamanya</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>Ekspor data lengkap ke CSV / Excel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>Simulator skenario finansial tak terbatas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>Prioritas pembaruan fitur baru</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>Bebas biaya langganan berulang</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-cream-100 hover:bg-white text-navy-950 dark:bg-navy-950 dark:hover:bg-navy-900 dark:text-cream-50 text-xs font-bold text-center transition-colors shadow-sm block"
              >
                Pilih Lifetime
              </Link>
            </div>
          </div>
        </section>

        {/* 7. FAQ SECTION (Accordion with +/- Dividers) */}
        <section id="faq" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start scroll-mt-24">
          {/* Left Title Column */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950 dark:text-cream-50">
              Pertanyaan yang sering diajukan
            </h2>
            <p className="text-xs sm:text-sm text-navy-700/80 dark:text-cream-300/80 leading-relaxed">
              Yang paling sering ditanyakan seputar akurasi suara, privasi data, dan cara kerja VoiCash.
            </p>
          </div>

          {/* Right Accordion Column */}
          <div className="lg:col-span-7 divide-y divide-cream-200 dark:divide-navy-800/80 border-y border-cream-200 dark:border-navy-800/80">
            {[
              {
                q: "Apakah rekaman suara saya disimpan atau diunggah ke server?",
                a: "Sama sekali tidak. Pengenalan ucapan dijalankan secara lokal di peramban Anda menggunakan Web Speech API dan model Whisper WebAssembly offline. File audio tidak pernah diunggah atau disimpan di cloud.",
              },
              {
                q: "Apakah nomor ponsel atau WhatsApp saya dibutuhkan?",
                a: "Tidak. VoiCash adalah web app mandiri (PWA). Anda tidak perlu menautkan WhatsApp atau membagikan nomor pribadi ke server mana pun.",
              },
              {
                q: "Apakah aplikasi tetap bisa dipakai ketika tidak ada sinyal internet?",
                a: "Ya. VoiCash dirancang dengan prinsip local-first. Anda dapat membuka aplikasi di kasir basement, merekam pengeluaran atau foto struk, dan data tersimpan aman di penyimpanan lokal peramban (IndexedDB).",
              },
              {
                q: "Bagaimana cara kerja scan struk nota kasir?",
                a: "Cukup jepret nota kasir menggunakan kamera peramban. Engine OCR Tesseract.js di background worker langsung mengekstrak nama merchant dan total nominal belanja secara otomatis.",
              },
              {
                q: "Apakah pengelompokan 9 kategori pengeluaran bisa disesuaikan?",
                a: "Tentu. Setiap kali transaksi dipilah, Anda dapat memeriksa dan mengoreksi kategori (misal dari Makanan ke Hiburan) sebelum mengonfirmasi penyimpanan.",
              },
              {
                q: "Apakah VoiCash benar-benar gratis untuk mahasiswa?",
                a: "Ya, paket dasar Free gratis selamanya tanpa batasan waktu untuk pencatatan harian Anda di satu perangkat.",
              },
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-navy-950 dark:text-cream-100 hover:text-navy-700 dark:hover:text-cream-200 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 text-navy-500 dark:text-cream-400">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pt-3 pr-6 text-xs text-navy-600 dark:text-cream-300/80 leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. HIGH-CONTRAST BOTTOM CTA BANNER (Mirroring botku.id bottom banner) */}
        <section className="rounded-3xl p-8 sm:p-12 bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors shadow-lg">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Mulai rapikan keuangan Anda hari ini.
            </h2>
            <p className="text-xs sm:text-sm text-cream-200/80 dark:text-navy-800/80 leading-relaxed">
              Daftar akun gratis dalam 30 detik. Tidak perlu kartu kredit, langsung coba catat pengeluaran pertama Anda.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/register"
              className="inline-block px-7 py-3.5 rounded-full bg-cream-100 hover:bg-white text-navy-950 dark:bg-navy-950 dark:hover:bg-navy-900 dark:text-cream-50 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Mulai gratis
            </Link>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="border-t border-cream-300/80 dark:border-navy-800/80 py-8 px-4 sm:px-8 text-xs text-navy-600 dark:text-cream-300/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-navy-950 dark:text-cream-100">voicash.id</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#fitur" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Fitur
            </a>
            <a href="#cara-kerja" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Cara kerja
            </a>
            <a href="#paket" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Harga
            </a>
            <a href="#faq" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors"
            >
              Privasi
            </button>
            <Link href="/login" className="hover:text-navy-950 dark:hover:text-cream-50 transition-colors">
              Masuk
            </Link>
          </div>
        </div>
      </footer>

      {/* Interactive Voice Sheet & Modals */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExpenseSaved={() => setIsVoiceOpen(false)}
      />

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleOcrSuccess}
      />

      <UnifiedConfirmationModal
        isOpen={isConfirmModalOpen}
        candidate={currentCandidate}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => setIsConfirmModalOpen(false)}
      />

      <PrivacyDialog
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
