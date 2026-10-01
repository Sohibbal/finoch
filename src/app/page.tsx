"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  LogIn,
  ArrowRight,
  Zap,
  Lock,
  Smartphone,
  ChevronRight,
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

export default function RootPage() {
  const [userId, setUserId] = useState("guest");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-16 transition-colors">
      {/* Top Header - Spanning Full Width with Top-Right Desktop Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Top-Left Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-black text-sm tracking-tighter transition">
              VC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  VoiCash
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                  Mahasiswa
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Catat pengeluaran cukup dengan bicara
              </p>
            </div>
          </Link>

          {/* Top-Right Desktop Navigation (visible on md+) */}
          <TopNav
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            userEmail={userEmail}
          />

          {/* Mobile Right Controls (visible on < md) */}
          <div className="md:hidden flex items-center gap-2">
            {!userEmail && (
              <Link
                href="/login"
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1 shadow-sm shadow-emerald-600/20"
              >
                <LogIn className="w-3 h-3" />
                <span>Masuk</span>
              </Link>
            )}
            <SyncIndicator />
          </div>
        </div>
      </header>

      {/* Main Content Area: Conditional Landing View for Guests or Personal Dashboard for Logged-In Users */}
      {userEmail ? (
        /* ================= AUTHENTICATED USER DASHBOARD ================= */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Financial Metrics & Transactions Feed (8 cols on lg, 7 on md) */}
            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Dashboard Mahasiswa
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Halo, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{userEmail}</span>. Pengeluaran Anda tersinkronisasi otomatis.
                  </p>
                </div>
              </div>

              {/* Metric Cards: 3 Cards across on desktop */}
              <MetricCards expenses={expenses} />

              {/* Category Breakdown Ratio Bar with Emerald Green accent */}
              <CategoryBreakdown metrics={metrics} />

              {/* Recent Transactions List */}
              <section className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      Riwayat Transaksi Terakhir
                    </h3>
                    <p className="text-xs text-slate-400">
                      {expenses.length} pengeluaran tersimpan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVoiceOpen(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Tambah Catatan
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Memuat data pengeluaran mahasiswa...
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Belum ada transaksi dicatat
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Mulai dengan menekan tombol mikrofon dan katakan misalnya: <em>&ldquo;beli ayam geprek lima belas ribu sama es teh lima ribu&rdquo;</em>.
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

            {/* Right Column: Dedicated Desktop Voice Studio & Student Budget Insights */}
            <div className="hidden md:block md:col-span-5 lg:col-span-4 space-y-5">
              {/* Desktop Voice Quick Recording Studio */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Studio Suara Cepat
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    Web Speech id-ID
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Bicara langsung di sini. Suara Anda diproses secara lokal tanpa pernah diunggah ke server.
                </p>

                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95 group"
                >
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Mulai Bicara Pengeluaran
                </button>
              </div>

              {/* Student Budget Tips & Highlights */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/60 to-slate-50 dark:from-slate-900 dark:to-slate-900/60 border border-emerald-100/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Tips Hemat Mahasiswa
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Primer</strong> adalah makan sehari-hari, bensin, kos, dan fotokopi kuliah.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bocor Halus</strong> adalah kopi kekinian, nongkrong, top up game, dan snack impulsif.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Pertahankan rasio Primer di atas <strong>65%</strong> agar uang saku bulanan aman.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Privasi 100% terjaga</span>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Pelajari selengkapnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* ================= UNAUTHENTICATED DESKTOP-FIRST LANDING PAGE ================= */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
          {/* HERO SECTION: Spacious 2-Column Responsive Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Suara Bahasa Indonesia • Tanpa API AI Berbayar</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
                Catat Pengeluaran Kuliah Cukup dengan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Bicara.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Cukup ucapkan pengeluaran harian seperti{" "}
                <em className="text-slate-800 dark:text-slate-200 font-medium">
                  &ldquo;makan ayam geprek 15 ribu sama es teh 5 ribu&rdquo;
                </em>
                . VoiCash otomatis memisahkan transaksi, mendeteksi angka gaul (ceban, gocap, 15rb), dan mengawasi kebocoran anggaran mahasiswa.
              </p>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition active:scale-95 group"
                >
                  <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Mulai Bicara Sekarang (Tamu)
                </button>

                <Link
                  href="/login"
                  className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Masuk / Buat Akun Cloud
                </Link>
              </div>

              {/* Trust Guarantees */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Web Speech Native</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Audio Tidak Diunggah</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Offline Local-First</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Voice Simulation & Live Visual Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Simulasi Pengenalan Suara
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Otomatis Pisah Item
                  </span>
                </div>

                {/* Spoken bubble illustration */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Anda Berbicara:</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                    &ldquo;tadi beli nasi padang rendang 25rb sama es teh manis 5rb&rdquo;
                  </p>
                </div>

                {/* Output Items Preview */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Hasil Penguraian Otomatis:
                  </div>

                  {/* Item 1 */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        Primer
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Nasi Padang Rendang
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Rp 25.000
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Bocor Halus
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Es Teh Manis
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Rp 5.000
                    </span>
                  </div>
                </div>

                {/* Quick Try Button inside Card */}
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Coba Suara Sendiri Sekarang
                </button>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION (3 Columns on Desktop) */}
          <section id="fitur" className="pt-6 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Kenapa Mahasiswa Memilih VoiCash?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Fitur pintar yang dibangun khusus untuk kebiasaan dan cara bicara mahasiswa Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Bahasa Gaul & Angka Slang
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Memahami kata sehari-hari seperti <em>ceban</em>, <em>gocap</em>, <em>15rb</em>, <em>setengah juta</em>, serta konjungsi majemuk seperti <em>&ldquo;dan&rdquo;</em>, <em>&ldquo;sama&rdquo;</em>, atau <em>&ldquo;lalu&rdquo;</em> secara cerdas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Primer vs Bocor Halus
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Otomatis memisahkan kebutuhan wajib (makan pokok, kos, fotokopi kuliah) dari pengeluaran impulsif (kopi kafe, jajanan nongkrong, top-up game) agar uang saku tidak jebol.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Privasi & Local-First
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Web Speech API berjalan di perangkat Anda tanpa mengirim audio ke OpenAI/Whisper. Data tersimpan di browser Anda dan langsung tersinkron aman saat login.
                </p>
              </div>
            </div>
          </section>

          {/* GUEST WORKSPACE & LOCAL FINANCIAL SNAPSHOT */}
          <section className="pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    Catatan Keuangan Sesi Tamu
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Lokal di Browser
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Semua transaksi yang Anda ucapkan disimpan secara instan di perangkat ini.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Tambah Transaksi Suara
                </button>
              </div>
            </div>

            {/* Metric Cards across 3 columns on desktop */}
            <MetricCards expenses={expenses} />

            {/* Category Breakdown Ratio Bar */}
            <CategoryBreakdown metrics={metrics} />

            {/* Guest Cloud Sync Prompt Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-indigo-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-emerald-200/80 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Ingin sinkronisasi otomatis antar HP dan Laptop?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buat akun mahasiswa gratis. Semua data tamu Anda akan otomatis dipindahkan tanpa hilang.
                  </p>
                </div>
              </div>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition"
              >
                <span>Daftar Akun Cloud</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recent Guest Expenses List */}
            <div className="bg-white dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Riwayat Transaksi Lokal ({expenses.length})
              </h3>

              {isLoading ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Memuat data transaksi lokal...
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Belum ada transaksi dicatat
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Coba tekan tombol mikrofon di atas dan sebutkan pengeluaran Anda hari ini!
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

          {/* FOOTER */}
          <footer className="pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                Kebijakan Privasi Suara
              </button>
              <span>•</span>
              <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Masuk Akun
              </Link>
              <span>•</span>
              <Link href="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                Daftar Baru
              </Link>
            </div>
            <p className="text-[11px] text-slate-400">
              VoiCash © 2026. Progressive Web App untuk Mahasiswa Indonesia. Zero-cost native voice architecture.
            </p>
          </footer>
        </main>
      )}

      {/* Floating Bottom Nav for Mobile Screens only (< 768px) */}
      <BottomNav
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        userEmail={userEmail}
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
