"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Camera,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Smartphone,
  Layers,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { WaveBackground } from "@/components/ui/wave-background";
import { FeatureFlipCards } from "@/components/landing/feature-flip-cards";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { TransactionCandidate } from "@/types/financial-types";
import { formatRupiah } from "@/components/expense/parsed-expense-list";
import type { ParsedVoiceItem } from "@/lib/types/expense";

export default function RootPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Interactive Live Cashflow Preview Calculator
  const [previewIncome, setPreviewIncome] = useState(4500000);
  const previewFixed = Math.round(previewIncome * 0.45);
  const previewFlexible = Math.round(previewIncome * 0.35);
  const previewSavings = Math.round(previewIncome * 0.20);

  // Interactive Voice Phrase Tester
  const sampleVoicePhrases = [
    "makan ayam geprek lima belas ribu sama es teh lima ribu",
    "kopi susu kekinian dua puluh dua ribu",
    "isi bensin lima puluh ribu",
    "sewa kos sembilan ratus ribu",
  ];
  const [testPhrase, setTestPhrase] = useState(sampleVoicePhrases[0]);
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>(() =>
    parseIndonesianExpense(sampleVoicePhrases[0])
  );

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleTestPhraseSelect = (phrase: string) => {
    setTestPhrase(phrase);
    setParsedItems(parseIndonesianExpense(phrase));
  };

  const handleOcrSuccess = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#091124] text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#091124]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-xl font-black tracking-tight text-[#0f274a] dark:text-blue-400 group-hover:opacity-90 transition-opacity">
              FINRA
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2.5 border-l border-slate-300 dark:border-slate-700">
              by VoiCash
            </span>
          </Link>

          <TopNav
            userEmail={userEmail}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />

          {/* Mobile Quick Actions */}
          <div className="md:hidden flex items-center gap-2">
            {userEmail ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-[#0f274a] dark:bg-blue-600 text-white text-xs font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0f274a] dark:bg-blue-600 text-white text-xs font-semibold"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. FULL 100VH HERO SECTION WITH DICODING-STYLE ANIMATED WAVE BACKGROUND */}
      <section className="relative min-h-[calc(100dvh-65px)] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
        <WaveBackground />

        {/* Top Spacer to keep center balance */}
        <div className="hidden sm:block h-2" />

        {/* Hero Central Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-7 sm:space-y-8 my-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Platform Finansial Local-First dengan AI Suara Hibrida</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            See Your Financial Future{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
              Before You Live It.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            FINRA memodelkan arus kas harian Anda ke dalam Digital Twin Finansial cerdas berbasis kategori nyata. Catat instan dengan suara offline atau foto struk belanja, lalu simulasikan keputusan finansial sebelum menjalaninya.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-950/10 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Mulai Sekarang Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#101c38] hover:bg-slate-50 dark:hover:bg-[#15254b] border border-slate-300 dark:border-[#1e335f] text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all active:scale-95"
            >
              Masuk ke Akun
            </Link>
          </div>

          {/* Interactive Live Demo Trigger Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 font-medium">
              Coba Langsung Tanpa Login:
            </span>

            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Coba Demo Suara</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Pindai Struk</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Bar with Trust Points and Scroll Indicator */}
        <div className="relative z-10 w-full max-w-4xl mx-auto pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              100% On-Device Voice (Whisper Local)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Kategori Pengeluaran Nyata & Terarah
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              PWA Siap Mode Offline
            </span>
          </div>

          <a
            href="#fitur-unggulan"
            className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400 hover:underline"
          >
            <span>Jelajahi Fitur</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* 3. FITUR UNGGULAN: 3 INTERACTIVE 3D FLIP CARDS */}
      <section
        id="fitur-unggulan"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c1630]"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Arsitektur & Keunggulan
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Tiga Pilar Utama FINRA
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ketuk atau klik kartu mana saja di bawah untuk membalik dan membaca arsitektur teknis serta mekanisme kerjanya secara mendalam.
            </p>
          </div>

          {/* 3 Flip Cards Component */}
          <FeatureFlipCards
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        </div>
      </section>

      {/* 4. ALUR KERJA: 3 LANGKAH MUDAH */}
      <section
        id="alur-kerja"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80"
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Proses Kerja
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Tiga Langkah Mengendalikan Finansial
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Dari pengeluaran harian hingga simulasi masa depan tanpa friksi pencatatan manual yang melelahkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101c38] border border-slate-200 dark:border-[#1e335f] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-black text-base flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Input Instan (Suara / Struk)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ucapkan transaksi dalam 3 detik setelah membayar di kasir atau foto struk nota belanja. Pemrosesan berjalan cepat di perangkat Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101c38] border border-slate-200 dark:border-[#1e335f] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-black text-base flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Klasifikasi Deterministik
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Algoritma AI cerdas memisahkan item dan nominal rupiah serta mengelompokkan pengeluaran ke kategori nyata seperti Makanan, Transportasi, dan Tagihan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#101c38] border border-slate-200 dark:border-[#1e335f] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 font-black text-base flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Simulasi & Proteksi Kas
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kembaran finansial Anda mengevaluasi saldo, memantau pengeluaran berlebih, dan memproyeksikan tanggal target tabungan tercapai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE CASHFLOW & SAVINGS SIMULATION PREVIEW */}
      <section
        id="simulasi-finansial"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c1630]"
      >
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Kalkulator Interaktif
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Simulasi Proyeksi Arus Kas & Tabungan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Geser estimasi pemasukan bulanan Anda untuk melihat pembagian alokasi sehat dan simulasi potensi tabungan sebelum membuat akun.
            </p>
          </div>

          <div className="bg-white dark:bg-[#101c38] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e335f] shadow-xl shadow-slate-900/5 dark:shadow-none space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Simulasi Anggaran Bulanan
                </h3>
                <p className="text-xs text-slate-500">
                  Model proporsional kebutuhan pokok, gaya hidup, dan tabungan
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Pemasukan: </span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400">
                  Rp {previewIncome.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Income Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={2000000}
                max={20000000}
                step={500000}
                value={previewIncome}
                onChange={(e) => setPreviewIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rp 2.000.000</span>
                <span>Rp 20.000.000</span>
              </div>
            </div>

            {/* 3 Split Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Kebutuhan Pokok (Estimasi 45%)
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Rp {previewFixed.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Makan pokok, kos, tagihan wajib
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pengeluaran Fleksibel (Estimasi 35%)
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Rp {previewFlexible.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Nongkrong, hiburan, belanja harian
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  Potensi Tabungan (Estimasi 20%)
                </div>
                <div className="text-base font-black text-blue-700 dark:text-blue-400 mt-1">
                  Rp {previewSavings.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Dana darurat, target impian
                </div>
              </div>
            </div>

            {/* Interactive Voice Sample Tester */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Uji Coba Pengenalan Kalimat Bahasa Indonesia:
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleVoicePhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTestPhraseSelect(phrase)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      testPhrase === phrase
                        ? "bg-[#0f274a] text-white dark:bg-blue-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    &ldquo;{phrase}&rdquo;
                  </button>
                ))}
              </div>

              {/* Parsed Output Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Hasil Pemisahan Transaksi:
                </div>
                <div className="space-y-1.5">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.itemName} ({item.category || "Umum"})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA inside calculator */}
            <div className="pt-2 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                <span>Terapkan Alokasi Ini di Akun Anda</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section
        id="faq"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Informasi seputar privasi, kerja offline, dan model kalkulasi FINRA.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Apakah rekaman suara saya diunggah ke server pihak ketiga?",
                a: "Tidak. Suara Anda diproses langsung di peramban menggunakan Web Speech API dan model Whisper WebAssembly offline di Web Worker. Tidak ada file audio yang disimpan atau diunggah ke cloud.",
              },
              {
                q: "Bagaimana cara kerja scan struk ketika internet mati?",
                a: "FINRA menggunakan pendekatan hybrid. Saat offline, browser menjalankan Web Worker Tesseract.js dan parser regex lokal Indonesia untuk mendeteksi merchant dan nominal total.",
              },
              {
                q: "Bagaimana FINRA mengelompokkan pengeluaran saya?",
                a: "FINRA menggunakan 9 kategori pengeluaran alami (seperti Food & Drinks, Transportation, Housing & Bills, Shopping, dll.). AI secara otomatis memilah transaksi dari suara atau foto struk Anda ke kategori yang relevan.",
              },
              {
                q: "Apakah FINRA bisa dipasang di ponsel seperti aplikasi native?",
                a: "Ya. FINRA adalah Progressive Web App (PWA). Anda dapat menambahkannya ke layar utama (Add to Home Screen) di Android, iOS, maupun desktop dengan dukungan penuh offline.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#101c38] rounded-xl border border-slate-200 dark:border-[#1e335f] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 to-white dark:from-[#0b162f] dark:to-[#091124]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Kendalikan Finansial Anda Tanpa Kebocoran Kas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Mulai membangun Digital Twin finansial Anda hari ini. Gratis, tanpa biaya langganan, dan siap digunakan langsung di browser.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-950/20 dark:shadow-none transition-all active:scale-95"
            >
              <span>Buat Akun Gratis Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#091124] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 FINRA by VoiCash. Solusi Finansial Local-First Mahasiswa & Profesional Muda.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-blue-600 transition-colors">
              Daftar
            </Link>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-blue-600 transition-colors"
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Live Modals */}
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
        onConfirm={() => {
          setIsConfirmModalOpen(false);
        }}
      />

      <PrivacyDialog
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
