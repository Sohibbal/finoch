"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  TrendingUp,
  LogIn,
  Lock,
  Smartphone,
  ChevronRight,
  Share2,
  Settings,
  HelpCircle,
  CheckCircle2,
  Zap,
  Volume2,
  RefreshCw,
  Wallet,
  Play,
  Compass,
  Camera,
  Bot,
} from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { MetricCards, calculateMetrics } from "@/components/dashboard/metric-cards";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { SyncIndicator } from "@/components/dashboard/sync-indicator";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/layout/top-nav";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { DesktopFloatingActions } from "@/components/layout/desktop-floating-actions";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { formatRupiah } from "@/components/expense/parsed-expense-list";
import type { ParsedVoiceItem } from "@/lib/types/expense";

export default function RootPage() {
  const [userId, setUserId] = useState("guest");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Testing rekam suara di landing page
  const sampleVoicePhrases = [
    "makan ayam geprek lima belas ribu sama es teh lima ribu",
    "kopi susu ceban",
    "bensin gocap",
    "fotokopi materi kuliah tujuh ribu",
  ];
  const [testInput, setTestInput] = useState(sampleVoicePhrases[0]);
  const [testParsedItems, setTestParsedItems] = useState<ParsedVoiceItem[]>(() =>
    parseIndonesianExpense(sampleVoicePhrases[0])
  );

  const { expenses, isLoading, refreshExpenses, deleteExpense } = useExpenses(userId);
  const metrics = calculateMetrics(expenses);

  // Check auth session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleTestParse = (phrase: string) => {
    setTestInput(phrase);
    const parsed = parseIndonesianExpense(phrase);
    setTestParsedItems(parsed);
  };

  const userName = userEmail ? userEmail.split("@")[0] : "Mahasiswa";

  return (
    <div className="min-h-[100dvh] ambient-glow-bg text-slate-900 dark:text-slate-100 pb-28 md:pb-16 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#080c16]/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-blue-500/15 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 font-black text-sm tracking-tighter transition group-hover:scale-105">
              FINRA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  FINRA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/40">
                  Digital Twin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                See Your Financial Future Before You Live It
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <TopNav
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            userEmail={userEmail}
          />

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            {!userEmail && (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-md shadow-blue-600/25"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )}
            <SyncIndicator />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {userEmail ? (
        /* ================= AUTHENTICATED USER DASHBOARD ================= */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              {/* User Profile Bar */}
              <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-[#0e1526]/60 border border-slate-200/90 dark:border-white/[0.06] backdrop-blur-md shadow-sm transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-800 dark:text-blue-300 font-black text-sm shadow-md">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      <span>Halo, {userName}</span>
                      <span>👋</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pengeluaran Anda tersinkronisasi otomatis
                    </p>
                  </div>
                </div>

                {/* Circular Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    aria-label="Pengaturan Privasi"
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center transition active:scale-95"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "VoiCash",
                          text: "Catat pengeluaran mahasiswa cukup dengan bicara",
                          url: window.location.href,
                        }).catch(() => {});
                      }
                    }}
                    aria-label="Bagikan aplikasi"
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center transition active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <MetricCards
                expenses={expenses}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onOpenManual={() => setIsVoiceOpen(true)}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
              />

              {/* Category Breakdown Ratio Bar */}
              <CategoryBreakdown metrics={metrics} />

              {/* Recent Transactions List */}
              <section className="bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/30 space-y-4 transition-colors">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                      Riwayat Transaksi Terakhir
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {expenses.length} pengeluaran tersimpan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVoiceOpen(true)}
                    className="text-xs font-bold px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                    <span>Tambah Catatan</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Memuat data pengeluaran mahasiswa...
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#0b1120]/60 border border-dashed border-slate-300 dark:border-blue-500/20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Belum ada transaksi dicatat
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Mulai dengan menekan tombol mikrofon dan katakan misalnya: <em className="text-blue-700 dark:text-blue-300">&ldquo;beli ayam geprek lima belas ribu sama es teh lima ribu&rdquo;</em>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {expenses.map((expense) => (
                      <ExpenseListItem
                        key={expense.id}
                        expense={expense}
                        onDelete={deleteExpense}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Desktop Quick Studio & Student Budget Insights */}
            <div className="hidden md:block md:col-span-5 lg:col-span-4 space-y-5">
              {/* Desktop Voice Quick Recording Studio */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/80 border border-slate-200/90 dark:border-blue-500/20 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/40 relative overflow-hidden space-y-4 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Studio Suara Cepat
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 font-medium">
                    Web Speech id-ID
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bicara langsung di sini. Suara Anda diproses secara lokal di peramban tanpa pernah diunggah ke server cloud pihak ketiga.
                </p>

                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-95 group"
                >
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.2]" />
                  <span>Mulai Bicara Pengeluaran</span>
                </button>
              </div>

              {/* Student Budget Tips */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/60 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Tips Anggaran Mahasiswa
                  </h4>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">Primer:</strong> Makan sehari-hari, bensin, biaya kos, dan fotokopi kuliah.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">Bocor Halus:</strong> Kopi kekinian, nongkrong kafe, top up game, dan snack impulsif.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>
                      Pertahankan rasio Primer di atas <strong className="text-blue-700 dark:text-blue-300 font-bold">65%</strong> agar uang saku bulanan aman.
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Privasi 100% terjaga</span>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Pelajari selengkapnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* ================= UNAUTHENTICATED LANDING PAGE (ADOPTING MONEYTRACKER.ID STRUCTURE) ================= */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
          {/* 1. HERO SECTION: Value Proposition & CTAs */}
          <section className="text-center max-w-4xl mx-auto space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AI Financial Digital Twin • Model 50/30/20 • Hybrid Voice & OCR • Zero Voice Cost</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              See Your Financial Future Before You{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300">
                Live It.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Ubah transaksi harian dari suara dan foto struk menjadi Digital Twin 50/30/20. Simulasikan keputusan anggaran di What-If Simulator dan capai target keuangan Anda bersama AI Copilot.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 transition active:scale-95 group"
              >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span>Bangun Digital Twin Saya</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <span>Buka Dashboard</span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </Link>

              <Link
                href="/simulator"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Coba Simulator</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Offline Whisper & Web Speech</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Suara Tidak Diunggah ke Cloud</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Offline Local-First PWA</span>
              </div>
            </div>
          </section>

          {/* 2. DEDICATED TESTING REKAM SUARA DI LANDING PAGE */}
          <section
            id="testing-suara"
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e1526]/85 border border-slate-200/90 dark:border-blue-500/25 shadow-xl shadow-slate-200/50 dark:shadow-blue-950/40 relative overflow-hidden space-y-6 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    <Volume2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Testing Rekam Suara Langsung
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Uji coba kecerdasan pengenalan kalimat pengeluaran mahasiswa Indonesia secara real-time.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="self-start md:self-auto px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Buka Perekam Suara Langsung</span>
              </button>
            </div>

            {/* Quick Presets to Click */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Contoh Kalimat Mahasiswa:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleVoicePhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTestParse(phrase)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 ${
                      testInput === phrase
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>&ldquo;{phrase}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Parsing Result Display */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Spoken input box */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Kalimat yang Diucapkan:
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  &ldquo;{testInput}&rdquo;
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-md">
                    Engine NLP: Indonesian Rule-Based Normalizer
                  </span>
                </div>
              </div>

              {/* Parsed items */}
              <div className="md:col-span-7 p-4 rounded-2xl bg-blue-50/50 dark:bg-[#0b1120]/60 border border-blue-200/80 dark:border-blue-500/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                    Hasil Ekstraksi Transaksi Otomatis ({testParsedItems.length} Item):
                  </span>
                </div>

                <div className="space-y-2">
                  {testParsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.category === "primer"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          }`}
                        >
                          {item.category === "primer" ? "Primer (Wajib)" : "Bocor Halus"}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.itemName}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. GRID FITUR UNGGULAN (ADOPTING 6 BENTO CARDS FROM MONEYTRACKER.ID) */}
          <section id="fitur" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Fitur Cerdas untuk Mahasiswa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Dirancang khusus untuk kebiasaan belanja, bahasa percakapan, dan pengawasan uang saku kuliah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: Smart Voice NLP */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Mic className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Smart Voice NLP id-ID
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Paham bahasa gaul dan angka sehari-hari seperti <em>ceban</em>, <em>gocap</em>, <em>15rb</em>, <em>setengah juta</em>, serta konjungsi majemuk seperti <em>&ldquo;dan&rdquo;</em> atau <em>&ldquo;sama&rdquo;</em>.
                </p>
              </div>

              {/* Feature 2: Primer vs Bocor Halus */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-purple-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Primer vs Bocor Halus
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Secara cerdas memisahkan pengeluaran wajib (makan pokok, kos, fotokopi kuliah) dari pengeluaran impulsif (kopi kafe, jajanan nongkrong, top up game).
                </p>
              </div>

              {/* Feature 3: Offline PWA Ready */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-cyan-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  100% Offline PWA Ready
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Aplikasi dapat dipasang di layar utama dan tetap bisa dipakai mencatat transaksi meskipun kuota internet habis atau berada di ruang kuliah bawah tanah.
                </p>
              </div>

              {/* Feature 4: Tanpa Biaya API AI */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-amber-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tanpa Biaya API AI
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Memanfaatkan Web Speech API bawaan perangkat dan algoritma NLP deterministik lokal. Tanpa biaya token bulanan OpenAI atau langganan mahal.
                </p>
              </div>

              {/* Feature 5: Privasi Total */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Privasi Tanpa Rekaman Server
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Berkas suara Anda tidak pernah dikirim atau direkam di server kami. Privasi data finansial Anda sepenuhnya aman dan berada dalam kendali Anda.
                </p>
              </div>

              {/* Feature 6: Cloud Sync Fleksibel */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-indigo-500/15 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-blue-950/30 space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <RefreshCw className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Sinkronisasi Cloud Fleksibel
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Mulai catat secara instan sebagai tamu lokal. Kapan saja Anda ingin sinkron antar laptop dan HP, cukup login dan data otomatis termigrasi.
                </p>
              </div>
            </div>
          </section>

          {/* 4. GUEST LOCAL WORKSPACE SNAPSHOT */}
          <section className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Catatan Sesi Tamu Anda
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                    Lokal di Browser
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data pengeluaran tersimpan instan di perangkat ini tanpa perlu akun.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Tambah Catatan Suara</span>
              </button>
            </div>

            {/* Metric Cards */}
            <MetricCards
              expenses={expenses}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onOpenManual={() => setIsVoiceOpen(true)}
              onOpenPrivacy={() => setIsPrivacyOpen(true)}
            />

            {/* Category Breakdown */}
            <CategoryBreakdown metrics={metrics} />

            {/* Recent Guest Expenses */}
            <div className="bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-blue-950/30 space-y-4 transition-colors">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Daftar Transaksi Sesi Tamu ({expenses.length})
              </h3>

              {isLoading ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Memuat data transaksi lokal...
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#0b1120]/60 border border-dashed border-slate-300 dark:border-blue-500/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Belum ada transaksi dicatat
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Coba tekan tombol mikrofon di atas atau di pojok kanan bawah dan sebutkan pengeluaran Anda hari ini!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {expenses.map((expense) => (
                    <ExpenseListItem
                      key={expense.id}
                      expense={expense}
                      onDelete={deleteExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 5. KATA MEREKA (TESTIMONIALS FROM STUDENTS) */}
          <section className="space-y-8 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Kata Mahasiswa yang Menggunakan VoiCash
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Membantu mahasiswa mengontrol uang saku bulanan tanpa repot mengetik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-lg space-y-4 transition-colors">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;Biasanya malas catat pengeluaran kalau harus ketik satu-satu di kasir. Pakai VoiCash tinggal bisik sambil jalan ke kos: warteg 15rb es teh 5rb langsung tercatat rapi.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rian Maulana</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Teknik Informatika, Semester 5</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-lg space-y-4 transition-colors">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;Fitur Bocor Halus-nya membuka mata banget. Ternyata uang saku cepat habis bukan karena makan sehari-hari, tapi jajan kopi kekinian sama top-up receh yang menumpuk.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                  <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                    N
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Nadia Safira</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Kedokteran Gigi, Anak Kos</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 backdrop-blur-xl shadow-lg space-y-4 transition-colors">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;Bisa diinstall jadi PWA di HP dan tetap jalan waktu kuota internet sekarat. Tampilan dark modenya juga keren banget mirip aplikasi fintech premium.&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold flex items-center justify-center text-xs">
                    F
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fajar Hidayat</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Ekonomi Bisnis, Semester 3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. PERTANYAAN SEPUTAR VOICASH (FAQ) */}
          <section className="space-y-8 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Pertanyaan Seputar VoiCash
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Punya pertanyaan? Temukan penjelasan lengkap di bawah ini.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 shadow-sm space-y-2 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Apakah rekaman suara saya disimpan di server?</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  Tidak. VoiCash memanfaatkan Web Speech API bawaan peramban Anda. Tidak ada berkas audio (.mp3/.wav) yang pernah diunggah atau disimpan di server kami. Hanya teks transaksi yang telah Anda konfirmasi yang disimpan.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 shadow-sm space-y-2 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Bagaimana VoiCash mendeteksi angka seperti ceban atau gocap?</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  VoiCash dilengkapi mesin NLP khusus bahasa gaul Indonesia. Kata seperti ceban (10.000), goceng (5.000), gocap (50.000), 15rb, dan setengah juta otomatis dinormalisasi menjadi nilai angka rupiah yang akurat.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 shadow-sm space-y-2 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Apakah aplikasi ini bisa digunakan saat offline?</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  Ya. VoiCash adalah Progressive Web App (PWA) dengan arsitektur Local-First. Semua data dan analisis NLP tersimpan secara lokal di IndexedDB perangkat Anda sehingga pencatatan manual dan riwayat tetap bekerja tanpa koneksi internet. Khusus fitur perekaman suara (Web Speech API di Chrome/Edge), peramban memerlukan koneksi internet untuk mengonversi ucapan suara menjadi teks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1526]/70 border border-slate-200/90 dark:border-blue-500/15 shadow-sm space-y-2 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Apakah VoiCash gratis untuk mahasiswa?</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                  Ya, 100% gratis. Karena VoiCash menggunakan teknologi pengenalan suara native di perangkat tanpa bergantung pada API AI cloud berbayar, kami dapat menyediakannya tanpa memungut biaya langganan kepada mahasiswa.
                </p>
              </div>
            </div>
          </section>

          {/* 7. FOOTER */}
          <footer className="pt-10 pb-4 border-t border-slate-200 dark:border-white/[0.08] text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Kebijakan Privasi Suara
              </button>
              <span>•</span>
              <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Masuk Akun
              </Link>
              <span>•</span>
              <Link href="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Daftar Baru
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              VoiCash © 2026. Progressive Web App untuk Mahasiswa Indonesia. Arsitektur suara lokal bebas biaya.
            </p>
          </footer>
        </main>
      )}

      {/* Floating Bottom Nav for Mobile Screens only (< md): Exactly 3 items (Beranda, Microphone, Akun) */}
      <BottomNav
        onOpenVoice={() => setIsVoiceOpen(true)}
        userEmail={userEmail}
      />

      {/* Floating Action Buttons for Desktop & Tablet (>= md): Exactly 2 buttons in bottom-right corner */}
      <DesktopFloatingActions
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenManual={() => setIsVoiceOpen(true)}
      />

      {/* Voice Expense Recording Sheet / Modal */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        userId={userId}
        onExpenseSaved={refreshExpenses}
      />

      {/* Privacy Explanation Dialog */}
      <PrivacyDialog
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
