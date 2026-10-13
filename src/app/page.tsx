"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ArrowDown,
  Mic,
  ScanLine,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroDashboardMockup } from "@/components/landing/hero-dashboard-mockup";
import { BentoGrid } from "@/components/landing/bento-grid";
import { FinbotShowcase } from "@/components/landing/finbot-showcase";
import { SentencePress } from "@/components/landing/sentence-press";
import { HeroParticles } from "@/components/landing/hero-particles";
import { VoiceTransactionModal } from "@/components/transaction/voice-transaction-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { TransactionCandidate } from "@/types/financial-types";

const FAQ = [
  {
    q: "Beneran gratis tanpa biaya tersembunyi?",
    a: "Finoch gratis digunakan. Tidak ada paket berlangganan tersembunyi, tidak ada sistem koin, dan bebas dari iklan yang mengganggu fokus keuanganmu.",
  },
  {
    q: "Bagaimana jika sedang offline atau di tempat tanpa sinyal?",
    a: "Catatan transaksi tetap tersimpan seketika di perangkatmu melalui IndexedDB lokal. Begitu perangkat kembali terhubung ke jaringan internet, data otomatis disinkronkan ke server secara aman di latar belakang.",
  },
  {
    q: "Ke mana data rekaman suara saya diproses?",
    a: "Suara diproses menggunakan Web Speech API browser atau model Whisper on-device. Finoch tidak pernah menyimpan rekaman audio mentah di server pihak ketiga, melainkan hanya mengekstrak teks transaksi yang dapat kamu konfirmasi sebelum disimpan.",
  },
  {
    q: "Bisa dipasang di layar utama HP seperti aplikasi native?",
    a: "Bisa. Finoch sepenuhnya mendukung Progressive Web App (PWA). Cukup buka di peramban ponselmu dan pilih opsi 'Pasang Aplikasi' untuk pengalaman layar penuh yang instan, ringan, dan hemat memori.",
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
    <div className="min-h-screen bg-[#eaf0fd] dark:bg-[#050813] text-slate-900 dark:text-slate-100 relative selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Background Decor System (z-0 in front of page bg, behind z-10 content) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* 1. Hero Atmospheric Lighting (Cahaya Biru dari Atas - Cobalt Signature Dome) */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[750px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(37,99,235,0.45)_0%,rgba(30,58,138,0.22)_40%,transparent_75%)] dark:bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(59,130,246,0.45)_0%,rgba(30,58,138,0.22)_40%,transparent_75%)] pointer-events-none" 
        />
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(56,189,248,0.28)_0%,rgba(37,99,235,0.12)_45%,transparent_70%)] pointer-events-none" 
        />

        {/* 2. Hero Large 2D Square Grid (80px x 80px - memudar mulus ke arah tengah) */}
        <div 
          className="absolute top-0 inset-x-0 h-[1100px] cobalt-grid-hero pointer-events-none" 
        />

        {/* 3. Floating Subtle Animated White Particles (Titik putih animasi bergerak random tipis) */}
        <div className="absolute top-0 inset-x-0 h-[950px] pointer-events-none overflow-hidden">
          <HeroParticles />
        </div>

        {/* 4. Footer Large 2D Square Grid (balik muncul menjelang footer) */}
        <div 
          className="absolute bottom-0 inset-x-0 h-[900px] cobalt-grid-footer pointer-events-none" 
        />

        {/* 5. Bottom Ambient Glow approaching footer */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" 
        />
      </div>

      {/* Foreground Content Container (relative z-10) */}
      <div className="relative z-10">
        {/* 1. Floating Navigation Bar */}
        <LandingNavbar userEmail={userEmail} />

      {/* 2. Hero Section: 100% Viewport Height minus Navbar */}
      <section className="h-[calc(100vh-4.75rem)] h-[calc(100dvh-4.75rem)] min-h-[500px] flex flex-col justify-between items-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-4 sm:pt-6 pb-4 sm:pb-6 relative animate-fade-in">
        
        {/* Spacer top for balanced centering */}
        <div className="h-0" />

        {/* Hero Main Content */}
        <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto my-auto">
          {/* Tag Pill with Ease-Out Hover */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide shadow-xs hover:border-blue-500/40 transition-colors">
            <Zap className="w-3.5 h-3.5" />
            <span>FINANSIAL INTUITIF GENERASI BARU</span>
          </div>

          {/* Headline (Cobalt Scale) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] text-numeral max-w-3xl mx-auto">
            Pegang Kendali Finansial Tanpa Ribet.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan spreadsheet kaku dan kalkulator manual yang bikin stres. Finoch mencatat transaksi secepat bicara, memantau jatah harian anti-boncos, serta didampingi FinBot Copilot pribadi.
          </p>

          {/* CTA Buttons with Smooth Ease-Out Elevation */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/20 active:scale-98 transition-all duration-300 ease-out shadow-md"
            >
              <span>Buka Dashboard Finoch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#dashboard-preview"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 ease-out shadow-xs"
            >
              <span>Jelajahi Fitur</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Scroll Indicator Arrow to Dashboard Mockup below */}
        <div className="pb-2 pt-1 shrink-0">
          <a
            href="#dashboard-preview"
            className="inline-flex flex-col items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors animate-bounce cursor-pointer"
            aria-label="Scroll ke pratinjau dashboard"
          >
            <span className="text-[10px] font-semibold tracking-wider uppercase">Jelajahi Dashboard</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Main Content Sections (Starting with Hero Dashboard Mockup) */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-28 sm:space-y-40 lg:space-y-48">
        
        {/* 3. Hero Dashboard Showcase (Identik dengan Dashboard Sebenarnya) */}
        <section id="dashboard-preview" className="scroll-mt-24 pt-4">
          <HeroDashboardMockup />
        </section>

        {/* 4. Statement / Contrast Section (Spacious 2-Column Typography like Cobalt) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-6 sm:py-12 border-t border-b border-blue-200/50 dark:border-slate-800/80">
          <div className="lg:col-span-6">
            <h2 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Siapa bilang atur keuangan pribadi harus membosankan?
            </h2>
          </div>
          <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Mengelola uang saku, gaji, dan biaya hidup sehari-hari tidak seharusnya memerlukan rumus spreadsheet yang membingungkan atau aplikasi kaku yang membebani pikiran.
            </p>
            <p>
              Finoch dirancang agar proses pencatatan terasa instan, jelas, dan memberikan ketenangan pikiran. Cukup sebutkan belanjaanmu atau scan struk kasir, biarkan sistem yang memproses kategorinya secara otomatis di latar belakang.
            </p>
          </div>
        </section>

        {/* 5. Bento Grid Fitur */}
        <BentoGrid
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenScan={() => setIsScannerOpen(true)}
        />

        {/* 6. Spotlight: Meet FinBot */}
        <FinbotShowcase />

        {/* 7. Interactive Playground (Demo Langsung di Browser) */}
        <section id="demo" className="scroll-mt-28 space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
              <span>INTERAKTIF</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Uji Coba Langsung di Browser
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Ketik contoh pengeluaranmu di bawah untuk melihat bagaimana kalimat natural langsung dipilah menjadi catatan rapi dengan simulasi jatah harian yang dihitung ulang.
            </p>
          </div>

          <SentencePress
            onTryMic={() => setIsVoiceOpen(true)}
            onTryScan={() => setIsScannerOpen(true)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Ingin mencoba input langsung via mikrofon atau kamera ponsel?
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Buka Mic Suara</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Buka Scanner Struk</span>
              </button>
            </div>
          </div>
        </section>

        {/* 8. FAQ Accordion */}
        <section id="faq" className="scroll-mt-28 space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Jawaban cepat seputar cara kerja, privasi data, dan fungsionalitas Finoch.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group relative rounded-2xl bg-[#080D1A] border border-slate-800/90 p-5 sm:p-6 shadow-md transition-card hover-card-lift overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />
                <summary className="relative z-10 flex items-center justify-between gap-4 cursor-pointer list-none text-sm sm:text-base font-bold text-white [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="w-7 h-7 rounded-xl bg-[#0C1427] border border-slate-800 text-slate-400 flex items-center justify-center shrink-0 group-open:rotate-45 transition-transform duration-300 ease-out text-sm font-semibold">
                    +
                  </span>
                </summary>
                <p className="relative z-10 pt-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 mt-4">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 9. Bottom Horizon Glow Banner (Cobalt Reference Bottom Horizon) */}
        <section className="relative rounded-2xl p-8 sm:p-16 lg:p-20 bg-gradient-to-b from-[#111726] to-[#060A14] text-white border border-slate-800/80 shadow-2xl overflow-hidden text-center space-y-8">
          {/* Top Horizon Blue Line (Cobalt Accent) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
              Mulai Hari Ini. Uang Saku Awet & Impian Terwujud.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              Aplikasi keuangan pertama yang kamu sukai, dan yang terakhir yang kamu butuhkan. Akses langsung di browser atau pasang aplikasi PWA sekarang.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={userEmail ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:-translate-y-0.5 hover:shadow-xl active:scale-98 transition-all duration-300 ease-out shadow-md"
            >
              <span>{userEmail ? "Buka Dashboard Finoch" : "Daftar Gratis Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!userEmail && (
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/60 text-slate-300 font-semibold text-sm hover:text-white hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 ease-out"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </section>

        {/* 10. Clean Footer */}
        <footer className="pt-8 pb-16 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <BrandLogo variant="full" className="h-6 w-auto" />
              <span>&copy; {new Date().getFullYear()} Finoch. Hak cipta dilindungi.</span>
            </div>

            <div className="flex items-center gap-5">
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
                FinBot Copilot
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </footer>
      </main>
      </div>

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
