"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Mic,
  ScanLine,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroDashboardMockup } from "@/components/landing/hero-dashboard-mockup";
import { BentoGrid } from "@/components/landing/bento-grid";
import { FinbotShowcase } from "@/components/landing/finbot-showcase";
import { SentencePress } from "@/components/landing/sentence-press";
import { VoiceTransactionModal } from "@/components/transaction/voice-transaction-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { TransactionCandidate } from "@/types/financial-types";

const FAQ = [
  {
    q: "Beneran gratis?",
    a: "Finoch gratis digunakan. Tidak ada paket berlangganan tersembunyi dan tidak ada iklan yang mengganggu fokusmu.",
  },
  {
    q: "Bagaimana kalau sedang offline tanpa sinyal?",
    a: "Catatan transaksi tetap tersimpan secara instan di browser/perangkat melalui IndexedDB lokal. Begitu perangkatmu kembali terhubung ke internet, data otomatis disinkronkan ke server.",
  },
  {
    q: "Ke mana data suara saya diproses?",
    a: "Suara diproses menggunakan Speech Recognition browser secara aman. Finoch tidak menyimpan rekaman audio mentah, melainkan hanya teks transaksi yang diekstrak, dan kamu selalu dapat meninjau hasilnya sebelum disimpan.",
  },
  {
    q: "Bisa dipasang di layar utama HP seperti aplikasi native?",
    a: "Bisa. Finoch mendukung standar Progressive Web App (PWA). Cukup buka di browser ponselmu dan pilih opsi Pasang Aplikasi untuk pengalaman layar penuh yang cepat dan hemat memori.",
  },
];

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  const handleVoiceSave = async (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => {
    try {
      const { saveTransaction } = await import("@/lib/storage/transaction-storage");
      await saveTransaction({
        itemName: data.itemName,
        amount: data.amount,
        category: data.category,
        type: "expense",
        source: "voice",
        transactionDate: data.transactionDate,
      });
    } catch (err) {
      console.error(err);
    }
    setIsVoiceOpen(false);
  };

  const handleOcrSuccess = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#eaf0fd] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* 1. Floating Navigation Bar */}
      <LandingNavbar userEmail={userEmail} />

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-20 sm:space-y-28">
        {/* 2. Hero Section */}
        <section className="relative pt-4 sm:pt-8 text-center space-y-6">
          {/* Subtle Top Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Clean Top Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Finansial Intuitif Generasi Baru</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] text-numeral max-w-4xl mx-auto">
            Pegang Kendali Finansial Tanpa Ribet.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan spreadsheet kaku dan kalkulator manual yang bikin stres. Finoch mencatat transaksi secepat bicara, memantau jatah harian anti-boncos, serta didampingi AI Copilot pribadi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {userEmail ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md"
              >
                <span>Buka Dashboard Finoch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md"
                >
                  <span>Mulai Gratis Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-white dark:hover:bg-slate-800 transition-all shadow-2xs"
                >
                  <span>Coba Demo Cepat</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>

          {/* Hero Dashboard Showcase (Like Cobalt Mockup) */}
          <HeroDashboardMockup />
        </section>

        {/* 3. Statement / Contrast Section */}
        <section className="rounded-2xl p-6 sm:p-10 bg-white/80 dark:bg-[#111726]/80 backdrop-blur-xl border border-blue-200/70 dark:border-slate-800/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          <div className="lg:col-span-6">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Siapa bilang atur keuangan pribadi harus membosankan?
            </h2>
          </div>
          <div className="lg:col-span-6 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Mengelola uang saku, gaji, dan biaya hidup sehari-hari tidak seharusnya memerlukan rumus spreadsheet yang rumit atau aplikasi kaku yang membebani pikiran.
            </p>
            <p>
              Finoch dirancang agar proses pencatatan terasa instan, jelas, dan memberikan ketenangan pikiran. Cukup sebutkan belanjaanmu atau scan struk kasir, biarkan sistem yang memproses kategorinya secara otomatis.
            </p>
          </div>
        </section>

        {/* 4. Bento Grid Fitur */}
        <BentoGrid
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenScan={() => setIsScannerOpen(true)}
        />

        {/* 5. Spotlight: Meet FinBot */}
        <FinbotShowcase />

        {/* 6. Interactive Playground (Demo Langsung) */}
        <section id="demo" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Uji Coba Langsung di Browser
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Ketik contoh pengeluaranmu di bawah untuk melihat bagaimana kalimat natural langsung dipilah menjadi catatan rapi dengan jatah harian yang dihitung ulang.
            </p>
          </div>

          <div className="rounded-2xl p-5 sm:p-8 bg-white dark:bg-[#111726] border border-blue-200/70 dark:border-slate-800/80 shadow-xs space-y-6">
            <SentencePress onTryMic={() => setIsVoiceOpen(true)} />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Ingin mencoba input langsung via mikrofon atau kamera?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Coba Bicara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Coba Scan Struk</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ Accordion */}
        <section id="faq" className="scroll-mt-20 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Yang Sering Ditanyakan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Jawaban cepat seputar cara kerja, privasi, dan fitur Finoch.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 group-open:rotate-45 transition-transform text-sm font-semibold">
                    +
                  </span>
                </summary>
                <p className="pt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 mt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 8. Bottom CTA Banner (Like Cobalt Bottom Horizon) */}
        <section className="relative rounded-2xl p-8 sm:p-14 bg-gradient-to-b from-[#111726] to-[#070A11] text-white border border-slate-800/80 shadow-2xl overflow-hidden text-center space-y-6">
          {/* Top horizon blue line (like Cobalt reference) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Mulai Hari Ini. Uang Saku Awet & Impian Terwujud.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Aplikasi keuangan pertama yang kamu sukai, dan yang terakhir yang kamu butuhkan. Akses langsung di browser atau pasang aplikasi PWA sekarang.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={userEmail ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md"
            >
              <span>{userEmail ? "Buka Dashboard" : "Daftar Gratis Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!userEmail && (
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 font-semibold text-xs sm:text-sm hover:text-white hover:bg-slate-800 transition-all"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </section>

        {/* 9. Clean Footer */}
        <footer className="pt-6 pb-12 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo variant="full" className="h-6 w-auto" />
              <span>&copy; {new Date().getFullYear()} Finoch. Hak cipta dilindungi.</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Kebijakan Privasi
              </button>
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/copilot" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                FinBot
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </footer>
      </main>

      {/* Interactive Modals */}
      <VoiceTransactionModal
        isOpen={isVoiceOpen}
        type="expense"
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
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
      <PrivacyDialog isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
