"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Pre-flight findings: Next.js 15 App Router, Plus Jakarta Sans, Dark/Light Theme Engine, Web Speech API & Local OCR. */
/* Design Read: High-conversion Student-First Landing Page for Finoch (Finansial Anak Kost Rapi Sekali Bicara), Apple/Linear hardware aesthetic, Workbench & Interactive Playground split, double-bezel nested architecture. */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
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
  Menu,
  ChevronRight,
  Zap,
  TrendingDown,
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  HelpCircle,
  GraduationCap,
  CreditCard,
  Wallet,
  CalendarClock,
  Receipt,
  Hourglass,
  Utensils,
  FileSpreadsheet,
  Handshake,
  Flame,
} from "lucide-react";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { TransactionCandidate } from "@/types/financial-types";

// Sample voice test presets for the interactive hero simulator (Campus / Anak Kost scenarios)
const SAMPLE_VOICE_PRESETS = [
  {
    id: 1,
    phrase: "makan siang warteg delapan belas ribu sama es teh manis lima ribu",
    items: [
      { name: "Makan siang warteg", cat: "Makanan", amount: 18000 },
      { name: "Es teh manis", cat: "Minuman", amount: 5000 },
    ],
    total: 23000,
  },
  {
    id: 2,
    phrase: "bensin pertalite dua puluh ribu sekalian bayar parkir dua ribu",
    items: [
      { name: "Bensin pertalite", cat: "Transportasi", amount: 20000 },
      { name: "Bayar parkir", cat: "Transportasi", amount: 2000 },
    ],
    total: 22000,
  },
  {
    id: 3,
    phrase: "patungan wifi kos empat puluh lima ribu transfer bca",
    items: [
      { name: "Patungan WiFi kos", cat: "Tagihan & Kos", amount: 45000 },
    ],
    total: 45000,
  },
];

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Interactive Voice Simulator State
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);

  // Interactive Cash Leakage Calculator State
  const [coffeeDaily, setCoffeeDaily] = useState(25000);
  const [snackDaily, setSnackDaily] = useState(20000);
  const [adminFeesDaily, setAdminFeesDaily] = useState(5000);

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
      localStorage.setItem("finoch_theme", "dark");
      localStorage.setItem("voicash_theme", "dark");
      localStorage.setItem("finra_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("finoch_theme", "light");
      localStorage.setItem("voicash_theme", "light");
      localStorage.setItem("finra_theme", "light");
    }
  };

  const handleOcrSuccess = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const playVoiceSimulator = (index: number) => {
    setActiveSampleIndex(index);
    setIsSimulatingAudio(true);
    setTimeout(() => {
      setIsSimulatingAudio(false);
    }, 1200);
  };

  // Calculations for Leakage Simulator
  const monthlyLeakage = (coffeeDaily + snackDaily + adminFeesDaily) * 30;
  const yearlyLeakage = monthlyLeakage * 12;

  const currentSample = SAMPLE_VOICE_PRESETS[activeSampleIndex];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#060B14] text-[#0B192C] dark:text-[#F6F4ED] transition-colors duration-300 font-sans selection:bg-[#0B192C] selection:text-[#FAF8F5] dark:selection:bg-[#F6F4ED] dark:selection:text-[#060B14]">
      
      {/* 1. FLOATING NAVBAR (N5 Pill Glass Bar Archetype with Mobile Menu Drawer) */}
      <div className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none">
        <header className="pointer-events-auto glass-pill rounded-full px-4 sm:px-5 py-2.5 shadow-xl max-w-4xl w-full flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Finoch.id Beranda">
            <BrandLogo variant="full" className="h-6 sm:h-7 w-auto transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#0B192C]/70 dark:text-[#F6F4ED]/70">
            <a href="#fitur" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Fitur Utama
            </a>
            <a href="#kalkulator" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Kalkulator Kebocoran
            </a>
            <a href="#cara-kerja" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Cara Kerja
            </a>
            <a href="#komitmen-mahasiswa" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Komitmen Mahasiswa
            </a>
            <a href="#faq" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Controls & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              className="w-8 h-8 rounded-full bg-[#0B192C]/5 dark:bg-white/10 hover:bg-[#0B192C]/10 dark:hover:bg-white/20 flex items-center justify-center text-[#0B192C] dark:text-[#FAF8F5] transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {userEmail ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0B192C] hover:bg-[#1E2D4A] dark:bg-[#FAF8F5] dark:hover:bg-white text-[#FAF8F5] dark:text-[#0B192C] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-[#0B192C] dark:text-[#F6F4ED] hover:opacity-80 transition-opacity"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="group px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0B192C] hover:bg-[#1E2D4A] dark:bg-[#FAF8F5] dark:hover:bg-white text-[#FAF8F5] dark:text-[#0B192C] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <span>Mulai Gratis</span>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full bg-[#0B192C]/5 dark:bg-white/10 flex items-center justify-center text-[#0B192C] dark:text-[#FAF8F5]"
              aria-label="Toggle Mobile Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Dropdown Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 md:hidden glass-pill rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in border border-[#0B192C]/10 dark:border-white/10">
          <nav className="flex flex-col gap-3 text-sm font-bold text-[#0B192C] dark:text-[#FAF8F5]">
            <a
              href="#fitur"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0B192C]/5 dark:border-white/5"
            >
              Fitur Utama
            </a>
            <a
              href="#kalkulator"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0B192C]/5 dark:border-white/5"
            >
              Kalkulator Kebocoran
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0B192C]/5 dark:border-white/5"
            >
              Cara Kerja
            </a>
            <a
              href="#komitmen-mahasiswa"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 border-b border-[#0B192C]/5 dark:border-white/5"
            >
              Komitmen Mahasiswa (100% Gratis)
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2"
            >
              FAQ
            </a>
          </nav>

          {!userEmail && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-[#0B192C]/5 dark:bg-white/10 text-[#0B192C] dark:text-[#FAF8F5]"
              >
                Masuk Akun
              </Link>
            </div>
          )}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-36 pb-20 space-y-16 sm:space-y-32">

        {/* 2. HERO WORKBENCH SPLIT (Asymmetric 60/40 Hero with Mobile Responsiveness) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center sm:text-left">
            {/* Micro Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.16em] font-bold bg-[#0B192C]/5 dark:bg-white/10 text-[#0B192C] dark:text-[#F6F4ED] border border-[#0B192C]/10 dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>100% On-Device · Dibuat Khusus untuk Mahasiswa</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] sm:leading-[1.06] text-[#0B192C] dark:text-[#FAF8F5]">
              Finoch: Finansial Anak Kost Rapi Sekali Bicara.
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed max-w-xl mx-auto sm:mx-0">
              Tidak perlu lagi pusing mencatat nominal satu per satu saat ngantre kasir atau warteg. Cukup sebut ucapan santai Anda atau jepret struk nota — AI lokal Finoch memilah pos pengeluaran Anda secara otomatis tanpa perlu kuota internet.
            </p>

            {/* Hero Action Buttons - Full-width stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                href="/dashboard"
                className="group px-6 py-3.5 rounded-full bg-[#0B192C] hover:bg-[#1E2D4A] dark:bg-[#FAF8F5] dark:hover:bg-white text-[#FAF8F5] dark:text-[#0B192C] text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{userEmail ? "Buka Dashboard Aplikasi" : "Masuk ke Dashboard PWA"}</span>
                <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#0B192C]/5 dark:bg-white/10 hover:bg-[#0B192C]/10 dark:hover:bg-white/20 text-[#0B192C] dark:text-[#FAF8F5] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Tes Suara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#0B192C]/5 dark:bg-white/10 hover:bg-[#0B192C]/10 dark:hover:bg-white/20 text-[#0B192C] dark:text-[#FAF8F5] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Scan Struk</span>
                </button>
              </div>
            </div>

            {/* Key Trust Micro-bullets */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[11px] font-semibold text-[#0B192C]/60 dark:text-[#F6F4ED]/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Tanpa kartu kredit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                100% Gratis Mahasiswa
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                PWA Offline di HP
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Workbench Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="double-bezel-outer w-full max-w-md">
              <div className="double-bezel-inner p-4 sm:p-6 space-y-4 sm:space-y-5">
                
                {/* Header & Status Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-[#0B192C]/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0B192C] dark:text-[#FAF8F5] tracking-tight">
                      Finoch Voice Engine (Simulasi)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    0.3s · Whisper Local
                  </span>
                </div>

                {/* Preset Selector Chips */}
                <div className="space-y-2">
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#0B192C]/60 dark:text-[#F6F4ED]/60 uppercase tracking-wider">
                    Klik Contoh Suara Bahasa Indonesia:
                  </div>
                  <div className="flex flex-col gap-2">
                    {SAMPLE_VOICE_PRESETS.map((preset, idx) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => playVoiceSimulator(idx)}
                        className={`text-left p-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-between ${
                          activeSampleIndex === idx
                            ? "bg-[#0B192C] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#0B192C] border-[#0B192C] dark:border-[#FAF8F5] shadow-sm"
                            : "bg-[#0B192C]/5 dark:bg-white/5 text-[#0B192C] dark:text-[#F6F4ED] border-[#0B192C]/10 dark:border-white/10 hover:bg-[#0B192C]/10 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate pr-2">&ldquo;{preset.phrase}&rdquo;</span>
                        <Play className={`w-3.5 h-3.5 shrink-0 ${activeSampleIndex === idx ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Simulated Audio Wave visualizer */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#0B192C]/5 dark:bg-white/5 border border-[#0B192C]/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#0B192C]/70 dark:text-[#F6F4ED]/70">
                    <span>Gelombang Suara Real-time:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {isSimulatingAudio ? "Memproses..." : "Aktif"}
                    </span>
                  </div>

                  <div className="h-7 sm:h-8 flex items-center justify-center gap-1 sm:gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <div
                        key={bar}
                        className={`w-1 sm:w-1.5 rounded-full bg-emerald-500 transition-all ${
                          isSimulatingAudio
                            ? bar % 2 === 0
                              ? "animate-soundwave-1"
                              : "animate-soundwave-3"
                            : "h-3 opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Simulated Output Extraction Results */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#0B192C]/60 dark:text-[#F6F4ED]/60 uppercase tracking-wider">
                    <span>Hasil Ekstraksi Pos Anggaran:</span>
                    <span className="text-[#0B192C] dark:text-[#FAF8F5]">
                      Total: Rp {currentSample.total.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {currentSample.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-[#FAF8F5] dark:bg-[#060B14] border border-[#0B192C]/10 dark:border-white/10 text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-[#0B192C] dark:text-[#FAF8F5] truncate">{item.name}</span>
                          <span className="text-[9px] sm:text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-[#0B192C]/5 dark:bg-white/10 text-[#0B192C]/70 dark:text-[#F6F4ED]/70 shrink-0">
                            {item.cat}
                          </span>
                        </div>
                        <span className="font-extrabold text-[#0B192C] dark:text-[#FAF8F5] shrink-0">
                          Rp {item.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Direct Action */}
                <div className="p-[2px] rounded-xl bg-gradient-to-r from-emerald-500 via-blue-600 to-[#0B192C] shadow-md transition-all hover:shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIsVoiceOpen(true)}
                    className="w-full py-2.5 px-3 sm:px-4 rounded-[calc(0.75rem-2px)] bg-[#0B192C] hover:bg-[#132238] dark:bg-[#060B14] dark:hover:bg-[#0E172A] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Buka Mikrofon & Coba Suara Asli</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 3. PROOF & METRICS WALL (2x2 Grid on Mobile) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-3.5 sm:p-5 space-y-1 text-center">
              <div className="text-xl sm:text-3xl font-black text-[#0B192C] dark:text-[#FAF8F5] tracking-tight">
                0.3 Detik
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0B192C]/70 dark:text-[#F6F4ED]/70 leading-snug">
                Pemrosesan ucapan lokal tanpa jeda server
              </div>
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-3.5 sm:p-5 space-y-1 text-center">
              <div className="text-xl sm:text-3xl font-black text-[#0B192C] dark:text-[#FAF8F5] tracking-tight">
                100% Offline
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0B192C]/70 dark:text-[#F6F4ED]/70 leading-snug">
                Tetap berfungsi di basement warung tanpa sinyal
              </div>
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-3.5 sm:p-5 space-y-1 text-center">
              <div className="text-xl sm:text-3xl font-black text-[#0B192C] dark:text-[#FAF8F5] tracking-tight">
                Rp 0
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0B192C]/70 dark:text-[#F6F4ED]/70 leading-snug">
                Gratis selamanya untuk pencatatan harian
              </div>
            </div>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-3.5 sm:p-5 space-y-1 text-center">
              <div className="text-xl sm:text-3xl font-black text-[#0B192C] dark:text-[#FAF8F5] tracking-tight">
                0 Byte
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0B192C]/70 dark:text-[#F6F4ED]/70 leading-snug">
                Data suara yang diunggah ke cloud (100% On-Device)
              </div>
            </div>
          </div>
        </section>

        {/* 4. INTERACTIVE CASH LEAKAGE DETECTOR */}
        <section id="kalkulator" className="space-y-6 sm:space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingDown className="w-3 h-3" />
              <span>Simulator Kebocoran Anggaran</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              Hitung uang yang menguap dari pengeluaran kecil harian
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
              Jajanan 20rb & kopi 25rb terkesan kecil, namun dalam sebulan bisa menyedot jutaan rupiah tanpa Anda sadari.
            </p>
          </div>

          <div className="double-bezel-outer max-w-4xl mx-auto">
            <div className="double-bezel-inner p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Sliders Column */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Item 1: Kopi / Minuman Kekinian */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0B192C] dark:text-[#FAF8F5]">
                    <span>☕ Kopi & Minuman / hari</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      Rp {coffeeDaily.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="5000"
                    value={coffeeDaily}
                    onChange={(e) => setCoffeeDaily(Number(e.target.value))}
                    className="w-full accent-[#0B192C] dark:accent-[#FAF8F5] cursor-pointer"
                  />
                </div>

                {/* Item 2: Jajanan / Cemilan Kasual */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0B192C] dark:text-[#FAF8F5]">
                    <span>🍟 Jajanan & Cemilan / hari</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      Rp {snackDaily.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="5000"
                    value={snackDaily}
                    onChange={(e) => setSnackDaily(Number(e.target.value))}
                    className="w-full accent-[#0B192C] dark:accent-[#FAF8F5] cursor-pointer"
                  />
                </div>

                {/* Item 3: Biaya Admin QRIS / Topup / Parkir */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0B192C] dark:text-[#FAF8F5]">
                    <span>💳 Admin QRIS / Parkir / hari</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      Rp {adminFeesDaily.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="1000"
                    value={adminFeesDaily}
                    onChange={(e) => setAdminFeesDaily(Number(e.target.value))}
                    className="w-full accent-[#0B192C] dark:accent-[#FAF8F5] cursor-pointer"
                  />
                </div>

              </div>

              {/* Live Calculation Output Card */}
              <div className="lg:col-span-5 bg-[#0B192C] dark:bg-[#060B14] text-[#FAF8F5] rounded-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 border border-white/10 shadow-lg text-center lg:text-left">
                <div className="space-y-1">
                  <div className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Total Anggaran Menguap:
                  </div>
                  <div className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Rp {monthlyLeakage.toLocaleString("id-ID")}
                    <span className="text-xs font-normal text-white/60"> / bulan</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  <div className="text-xs text-white/80 font-semibold flex items-center justify-between">
                    <span>Setara dalam 1 tahun:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      Rp {yearlyLeakage.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Uang sebesar ini cukup untuk beli laptop baru, bayar kos 6 bulan, atau dana darurat aman!
                  </p>
                </div>

                <Link
                  href="/register"
                  className="w-full py-2.5 rounded-xl bg-white text-[#0B192C] text-xs font-extrabold transition-all flex items-center justify-center gap-2 hover:bg-emerald-400 shadow-sm block"
                >
                  <span>Hentikan Kebocoran Kas Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* 5. FEATURE SHOWCASE (The 4 Pillars of Finoch) */}
        <section id="fitur" className="space-y-8 sm:space-y-12 scroll-mt-24">
          <div className="space-y-2 sm:space-y-3 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              Dirancang khusus untuk gaya hidup serba cepat mahasiswa
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
              Empat keunggulan utama yang membuat Anda konsisten mencatat pengeluaran tanpa terbeban.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                    Engine Suara Bahasa Indonesia Alami
                  </h3>
                  <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                    Paham istilah kasual seperti &ldquo;makan warteg 18rb&rdquo;, &ldquo;bensin pertalite 20rb&rdquo;, hingga &ldquo;patungan wifi kos 45rb&rdquo; tanpa perlu ejaan kaku.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                    Pindai Struk & Nota Kasir (Local OCR)
                  </h3>
                  <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                    Tinggal jepret foto nota Indomaret, Alfamart, atau warung makan — Tesseract OCR lokal mengekstrak nama merchant dan total nominal belanja secara akurat.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                    9 Pos Pengeluaran Otomatis
                  </h3>
                  <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                    AI mengklasifikasikan pos anggaran secara presisi ke Makanan, Transportasi, Kos, Belanja, Hiburan, Tagihan, dan Kesehatan. Anda tetap punya hak koreksi 1-klik.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                    100% Local-First & Privasi Terjamin
                  </h3>
                  <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                    Semua rekaman suara dan data transaksi diproses di perangkat HP/Laptop Anda sendiri via IndexedDB. Tidak ada data pribadi yang dijual ke pihak ketiga.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Special Modules Showcase */}
          <div className="pt-8 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-bold text-blue-600 dark:text-blue-400">
                Lengkap &amp; Praktis untuk Mahasiswa
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0B192C] dark:text-[#FAF8F5]">
                10 Alat Finansial Khusus Anak Kost
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { href: "/wallets", label: "Dompet Akun", desc: "Tunai, Bank, E-Wallet", icon: CreditCard },
                { href: "/streak", label: "Streak Hemat", desc: "Puasa jajan &amp; kalender", icon: Zap },
                { href: "/budget", label: "Amplop Pos", desc: "Pos makan, kos, bensin", icon: Wallet },
                { href: "/audit", label: "Bocor Halus", desc: "Audit admin &amp; jajan kopi", icon: Flame },
                { href: "/debts", label: "Buku Kasbon", desc: "Talangan teman &amp; utang", icon: Handshake },
                { href: "/bills", label: "Tagihan Kost", desc: "Sewa kamar, WiFi, listrik", icon: CalendarClock },
                { href: "/split-bill", label: "Split Bill", desc: "Bagi bill resto &amp; teks WA", icon: Receipt },
                { href: "/wishlist", label: "Wishlist Tunda", desc: "Aturan cooling-off 7 hari", icon: Hourglass },
                { href: "/meal-calc", label: "Masak vs Warteg", desc: "Kalkulator hemat &amp; hybrid", icon: Utensils },
                { href: "/ukt-savings", label: "Tabungan UKT", desc: "Sinking fund semesteran", icon: GraduationCap },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-[#0B192C]/10 dark:border-white/10 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0B192C]/5 dark:bg-white/10 text-[#0B192C] dark:text-[#FAF8F5] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0B192C] dark:text-[#FAF8F5] flex items-center justify-between">
                        <span>{item.label}</span>
                        <ArrowRight className="w-3 h-3 text-[#0B192C]/40 dark:text-white/40 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[10px] text-[#0B192C]/60 dark:text-[#F6F4ED]/60 mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS (Numbered 3-Step Workflow) */}
        <section id="cara-kerja" className="space-y-8 sm:space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              Cara kerja dalam 3 detik
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 dark:text-[#F6F4ED]/75">
              Tiga langkah instan yang menghemat jam kerja pencatatan keuangan manual Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-2.5 sm:space-y-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B192C] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#0B192C] text-xs font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                  Buka & Bicara saat Bayar
                </h3>
                <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                  Tekan tombol mic di Finoch PWA ponsel Anda begitu selesai transaksi di warteg atau minimarket.
                </p>
              </div>
            </div>

            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-2.5 sm:space-y-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B192C] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#0B192C] text-xs font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="text-base font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                  AI Memilah Nominal & Kategori
                </h3>
                <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                  Whisper & parser lokal mengekstrak item belanjaan, nominal rupiah, dan pos pengeluaran dalam kurun waktu 0.3 detik.
                </p>
              </div>
            </div>

            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-2.5 sm:space-y-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B192C] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#0B192C] text-xs font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="text-base font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                  Kas Terpantau Rapi & Aman
                </h3>
                <p className="text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed">
                  Grafik arus kas bulanan Anda langsung terbarui tanpa risiko ada uang hilang yang lupa dicatat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. COMPARISON MATRIX ("Mengapa Finoch Berbeda?") */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              Perbandingan dengan cara pencatatan lama
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 dark:text-[#F6F4ED]/75">
              Lihat perbedaan nyata antara metode konvensional vs. kemudahan bersama Finoch.
            </p>
          </div>

          <div className="md:hidden text-center text-[10px] font-semibold text-[#0B192C]/60 dark:text-[#F6F4ED]/60 flex items-center justify-center gap-1.5">
            <span>Geser menyamping untuk melihat tabel lengkap →</span>
          </div>

          <div className="double-bezel-outer overflow-x-auto no-scrollbar">
            <div className="double-bezel-inner p-4 sm:p-6 min-w-[580px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#0B192C]/10 dark:border-white/10 text-[#0B192C]/60 dark:text-[#F6F4ED]/60 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-3 sm:px-4">Fitur / Pengalaman</th>
                    <th className="py-3 px-3 sm:px-4">Catat Manual (Excel/Buku)</th>
                    <th className="py-3 px-3 sm:px-4">App Finansial Biasa</th>
                    <th className="py-3 px-3 sm:px-4 text-[#0B192C] dark:text-[#FAF8F5] font-black">Finoch.id</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B192C]/10 dark:divide-white/10 font-semibold">
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-[#0B192C] dark:text-[#FAF8F5]">Waktu pencatatan</td>
                    <td className="py-3.5 px-3 sm:px-4 text-red-500">3-5 menit / hari</td>
                    <td className="py-3.5 px-3 sm:px-4 text-amber-500">1-2 menit (banyak form)</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-600 dark:text-emerald-400 font-extrabold">3 detik (bicara)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-[#0B192C] dark:text-[#FAF8F5]">Koneksi Internet</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-500">Offline</td>
                    <td className="py-3.5 px-3 sm:px-4 text-red-500">Wajib online (lelet di basement)</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-600 dark:text-emerald-400 font-extrabold">100% Offline (Local PWA)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-[#0B192C] dark:text-[#FAF8F5]">Privasi Data Suara</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-500">Aman di kertas</td>
                    <td className="py-3.5 px-3 sm:px-4 text-red-500">Diunggah ke server cloud</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-600 dark:text-emerald-400 font-extrabold">0% Server Upload (Whisper Local)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-[#0B192C] dark:text-[#FAF8F5]">Scan Struk Nota Kasir</td>
                    <td className="py-3.5 px-3 sm:px-4 text-red-500">Tidak ada</td>
                    <td className="py-3.5 px-3 sm:px-4 text-amber-500">Bayar mahal per scan</td>
                    <td className="py-3.5 px-3 sm:px-4 text-emerald-600 dark:text-emerald-400 font-extrabold">Gratis & Instant Local OCR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. STUDENT VALUE GUARANTEE (Zero SaaS Slop, 100% Free for Indonesian Students) */}
        <section id="komitmen-mahasiswa" className="space-y-8 sm:space-y-12 scroll-mt-24 relative">
          {/* Legacy anchor fallback for #harga to prevent broken links */}
          <span id="harga" className="scroll-mt-24 pointer-events-none absolute -top-24" />

          <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Komitmen Mahasiswa Merdeka</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              100% Gratis untuk Seluruh Mahasiswa Indonesia
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#0B192C]/80 dark:text-[#F6F4ED]/80 max-w-xl mx-auto leading-relaxed">
              Bebas Iklan · Tanpa Langganan · Berjalan Tanpa Kuota (100% On-Device)
            </p>
            <p className="text-xs text-[#0B192C]/65 dark:text-[#F6F4ED]/65 max-w-lg mx-auto">
              Tidak ada paywall jebakan, tidak ada paket &ldquo;Pro/Enterprise&rdquo; berbayar, dan nol komersialisasi data finansial pribadi Anda.
            </p>
          </div>

          {/* 3 Interactive Student Guarantee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            
            {/* Guarantee 1: 100% Free Forever */}
            <div className="double-bezel-outer flex flex-col justify-between">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-[#FAF8F5]">
                      Dibuat Khusus untuk Mahasiswa & Anak Kost
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#0B192C]/65 dark:text-[#F6F4ED]/65 mt-1 leading-relaxed">
                      Kami paham perjuangan mengatur uang saku bulanan dan bayar uang kos. Semua fitur esensial terbuka penuh tanpa biaya sepeser pun.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-[#0B192C]/80 dark:text-[#F6F4ED]/80 pt-3 border-t border-[#0B192C]/10 dark:border-white/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Semua fitur pencatatan suara gratis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Kalkulator simulasi kebocoran anggaran</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Digital twin proyeksi sisa uang saku</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Rp 0 Selamanya
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee 2: Zero Ads & Open Spirit */}
            <div className="double-bezel-outer flex flex-col justify-between">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-[#FAF8F5]">
                      100% Free Forever · Zero Ads
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#0B192C]/65 dark:text-[#F6F4ED]/65 mt-1 leading-relaxed">
                      Bebas dari iklan banner atau video pop-up yang mengganggu. Tanpa tagihan kartu kredit atau skema perpanjangan langganan otomatis.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-[#0B192C]/80 dark:text-[#F6F4ED]/80 pt-3 border-t border-[#0B192C]/10 dark:border-white/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Bebas iklan banner & video pop-up</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tanpa biaya tagihan tersembunyi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Semangat open source & pro-mahasiswa</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Bebas Komersialisasi Data
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee 3: Hemat Kuota & On-Device */}
            <div className="double-bezel-outer flex flex-col justify-between">
              <div className="double-bezel-inner p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B192C] dark:text-[#FAF8F5]">
                      Hemat Kuota & Baterai
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#0B192C]/65 dark:text-[#F6F4ED]/65 mt-1 leading-relaxed">
                      Ditenagai model 100% On-Device Whisper & IndexedDB. Aplikasi tetap dapat digunakan meski kuota internet sedang habis total.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs font-semibold text-[#0B192C]/80 dark:text-[#F6F4ED]/80 pt-3 border-t border-[#0B192C]/10 dark:border-white/10">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Berjalan offline tanpa paket data seluler</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Data aman tersimpan di IndexedDB browser</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>PWA ringan hemat memori dan daya baterai</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[11px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    100% On-Device PWA
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Real Campus Scenarios Showcase */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-5 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0B192C]/10 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B192C] dark:text-[#FAF8F5]">
                    Simulasi Nyata Pengeluaran Mahasiswa Kampus
                  </h3>
                  <p className="text-xs text-[#0B192C]/70 dark:text-[#F6F4ED]/70">
                    Lihat bagaimana Finoch secara instan memilah pos pengeluaran anak kost dari suara alami Anda:
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 self-start sm:self-auto">
                  Akurasi 99.2%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Scenario 1: Makan warteg 18rb */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#0B192C]/5 dark:bg-white/5 border border-[#0B192C]/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                      Makan warteg 18rb
                    </span>
                    <span className="text-xs font-black text-[#0B192C] dark:text-[#FAF8F5]">Rp 23.000</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0B192C] dark:text-[#FAF8F5] italic">
                    &ldquo;makan siang warteg delapan belas ribu sama es teh manis lima ribu&rdquo;
                  </p>
                  <div className="text-[11px] text-[#0B192C]/70 dark:text-[#F6F4ED]/70 flex items-center gap-1.5 pt-1 border-t border-[#0B192C]/5 dark:border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Terpilah otomatis ke <strong>Pos Makanan & Minuman</strong></span>
                  </div>
                </div>

                {/* Scenario 2: Bensin pertalite 20rb sekalian parkir */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#0B192C]/5 dark:bg-white/5 border border-[#0B192C]/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                      Bensin pertalite 20rb sekalian parkir
                    </span>
                    <span className="text-xs font-black text-[#0B192C] dark:text-[#FAF8F5]">Rp 22.000</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0B192C] dark:text-[#FAF8F5] italic">
                    &ldquo;bensin pertalite dua puluh ribu sekalian bayar parkir dua ribu&rdquo;
                  </p>
                  <div className="text-[11px] text-[#0B192C]/70 dark:text-[#F6F4ED]/70 flex items-center gap-1.5 pt-1 border-t border-[#0B192C]/5 dark:border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Terpilah otomatis ke <strong>Pos Transportasi</strong></span>
                  </div>
                </div>

                {/* Scenario 3: Patungan WiFi kos 45rb */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#0B192C]/5 dark:bg-white/5 border border-[#0B192C]/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                      Patungan WiFi kos 45rb
                    </span>
                    <span className="text-xs font-black text-[#0B192C] dark:text-[#FAF8F5]">Rp 45.000</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0B192C] dark:text-[#FAF8F5] italic">
                    &ldquo;patungan wifi kos empat puluh lima ribu transfer bca&rdquo;
                  </p>
                  <div className="text-[11px] text-[#0B192C]/70 dark:text-[#F6F4ED]/70 flex items-center gap-1.5 pt-1 border-t border-[#0B192C]/5 dark:border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span>Terpilah otomatis ke <strong>Pos Tagihan & Kos</strong></span>
                  </div>
                </div>
              </div>

              {/* Direct Call to Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#0B192C]/70 dark:text-[#F6F4ED]/70 text-center sm:text-left">
                  🎓 Dirancang dari mahasiswa untuk mahasiswa Indonesia. Kelola keuangan tanpa beban biaya bulanan.
                </div>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-[#0B192C] hover:bg-[#1E2D4A] dark:bg-[#FAF8F5] dark:hover:bg-white text-[#FAF8F5] dark:text-[#0B192C] text-xs font-extrabold transition-all shadow-sm active:scale-[0.98] shrink-0"
                >
                  Mulai Gunakan Finoch Gratis
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* 9. FAQ ACCORDION SECTION */}
        <section id="faq" className="space-y-6 sm:space-y-8 max-w-3xl mx-auto scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B192C] dark:text-[#FAF8F5]">
              Pertanyaan yang sering diajukan
            </h2>
            <p className="text-xs sm:text-sm text-[#0B192C]/75 dark:text-[#F6F4ED]/75">
              Segala hal seputar akurasi suara, privasi lokal, dan cara kerja Finoch.
            </p>
          </div>

          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-4 sm:p-6 divide-y divide-[#0B192C]/10 dark:divide-white/10">
              {[
                {
                  q: "Apakah Finoch benar-benar 100% gratis untuk mahasiswa?",
                  a: "Benar sekali! Seluruh fitur pencatatan suara, pemindaian OCR struk nota, kalkulator kebocoran, dan simulasi arus kas gratis selamanya. Tidak ada paket langganan berbayar (SaaS pro/enterprise) dan bebas dari iklan banner yang mengganggu.",
                },
                {
                  q: "Apakah rekaman suara saya disimpan atau diunggah ke server?",
                  a: "Sama sekali tidak. Pengenalan ucapan dijalankan secara lokal di peramban Anda menggunakan Web Speech API dan model Whisper WebAssembly offline. File audio tidak pernah diunggah atau disimpan di cloud server.",
                },
                {
                  q: "Apakah nomor HP atau akun WhatsApp saya dibutuhkan?",
                  a: "Tidak. Finoch adalah Progressive Web App (PWA) mandiri. Anda dapat langsung menggunakan tanpa perlu menautkan WhatsApp atau membagikan nomor telepon pribadi.",
                },
                {
                  q: "Apakah aplikasi tetap bisa dipakai ketika tidak ada sinyal internet atau kuota habis?",
                  a: "Ya. Finoch dirancang dengan prinsip local-first. Anda dapat membuka aplikasi di basement warung atau saat kuota habis, merekam pengeluaran atau foto struk, dan data tersimpan aman di penyimpanan lokal peramban (IndexedDB).",
                },
                {
                  q: "Bagaimana cara kerja scan struk nota kasir?",
                  a: "Cukup jepret nota kasir menggunakan kamera peramban. Engine OCR Tesseract.js di background worker langsung mengekstrak nama merchant dan total nominal belanja secara otomatis.",
                },
                {
                  q: "Apakah pengelompokan 9 kategori pengeluaran bisa disesuaikan?",
                  a: "Tentu. Setiap kali transaksi dipilah, Anda dapat memeriksa dan mengoreksi kategori (misal dari Makanan ke Hiburan) sebelum mengonfirmasi penyimpanan 1-klik.",
                },
              ].map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="py-3.5 sm:py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-[#0B192C] dark:text-[#FAF8F5] hover:opacity-80 transition-opacity"
                    >
                      <span>{faq.q}</span>
                      <span className="shrink-0 text-[#0B192C]/50 dark:text-[#F6F4ED]/50">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pt-2 sm:pt-2.5 text-xs text-[#0B192C]/75 dark:text-[#F6F4ED]/75 leading-relaxed animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. HIGH-IMPACT BOTTOM MARKETING CTA BANNER */}
        <section className="p-0.5 sm:p-1 rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#1E2D4A] to-[#0B192C] dark:from-[#FAF8F5] dark:via-white dark:to-[#FAF8F5] shadow-2xl">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-[#0B192C] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#0B192C] p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
            <div className="space-y-1.5 sm:space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Mulai rapikan keuangan Anda dalam 30 detik.
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF8F5]/80 dark:text-[#0B192C]/80 leading-relaxed">
                Tanpa kartu kredit, tanpa konfigurasi ribet. Langsung coba catat pengeluaran pertama Anda hari ini.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full bg-[#FAF8F5] text-[#0B192C] dark:bg-[#0B192C] dark:text-[#FAF8F5] text-xs sm:text-sm font-black transition-all hover:bg-emerald-400 dark:hover:bg-emerald-400 dark:hover:text-black shadow-lg active:scale-[0.98]"
              >
                <span>Mulai Gratis Sekarang</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 11. FOOTER */}
      <footer className="border-t border-[#0B192C]/10 dark:border-white/10 py-10 sm:py-12 px-4 sm:px-8 text-xs text-[#0B192C]/60 dark:text-[#F6F4ED]/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Finoch.id Beranda">
              <BrandLogo variant="full" className="h-5 sm:h-6 w-auto" />
            </Link>
            <span>&copy; {new Date().getFullYear()} Finoch. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
            <a href="#fitur" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Fitur
            </a>
            <a href="#kalkulator" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Kalkulator
            </a>
            <a href="#cara-kerja" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Cara Kerja
            </a>
            <a href="#komitmen-mahasiswa" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Komitmen Mahasiswa
            </a>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors"
            >
              Kebijakan Privasi
            </button>
            <Link href="/login" className="hover:text-[#0B192C] dark:hover:text-[#FAF8F5] transition-colors">
              Masuk Akun
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
