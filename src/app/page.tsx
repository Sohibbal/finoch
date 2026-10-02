"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Camera,
  ArrowRight,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { WaveBackground } from "@/components/ui/wave-background";
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

  // Interactive Live Twin Preview in Hero
  const [previewIncome, setPreviewIncome] = useState(4500000);
  const previewNeeds = Math.round(previewIncome * 0.5);
  const previewWants = Math.round(previewIncome * 0.3);
  const previewSavings = Math.round(previewIncome * 0.2);

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
    <div className="min-h-screen bg-white dark:bg-[#091124] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#091124]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-[#0f274a] dark:text-blue-400">
              FINRA
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-300 dark:border-slate-700">
              AI Financial Twin
            </span>
          </Link>

          <TopNav
            userEmail={userEmail}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />

          {/* Mobile Right Quick Action */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/onboarding"
              className="px-3.5 py-1.5 rounded-xl bg-[#0f274a] dark:bg-blue-600 text-white text-xs font-semibold"
            >
              Mulai
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH ANIMATED WAVE BACKGROUND */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <WaveBackground />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              See Your Financial Future{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
                Before You Live It.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              FINRA memodelkan arus kas harian Anda ke dalam Digital Twin 50/30/20 secara deterministik. Catat instan dengan suara offline atau foto struk belanja, lalu simulasikan keputusan finansial sebelum menjalaninya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              Bangun Digital Twin Saya
            </Link>

            <Link
              href="/simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-[#101c38] hover:bg-slate-50 dark:hover:bg-[#15254b] border border-slate-300 dark:border-[#1e335f] text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all active:scale-95"
            >
              Coba Simulator What-If
            </Link>
          </div>

          {/* Interactive Live Twin Calculator Preview */}
          <div className="mt-12 text-left max-w-2xl mx-auto bg-white dark:bg-[#101c38] rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-none border border-slate-200 dark:border-[#1e335f] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Preview Digital Twin Finansial (Model 50/30/20)
                </h3>
                <p className="text-xs text-slate-500">
                  Geser estimasi pemasukan untuk melihat alokasi ideal Anda
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
                  Kebutuhan (Needs 50%)
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Rp {previewNeeds.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Makan pokok, sewa, tagihan
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Keinginan (Wants 30%)
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Rp {previewWants.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Nongkrong, hobi, hiburan
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  Tabungan (Savings 20%)
                </div>
                <div className="text-base font-black text-blue-700 dark:text-blue-400 mt-1">
                  Rp {previewSavings.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Dana darurat, investasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL CAPTURE SHOWCASE (VOICE & RECEIPT OCR) */}
      <section id="fitur-capture" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c1630]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Pencatatan Tanpa Friksi: Suara & Scan Struk
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ucapkan apa yang Anda beli atau foto struk belanja. FINRA secara cerdas mengenali nominal dan mengklasifikasikan ke Needs vs Wants.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Offline Voice Capabilities */}
            <div className="bg-white dark:bg-[#101c38] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e335f] space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Hybrid Voice Speech-to-Text
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Didukung Web Speech API saat online dan model Whisper lokal saat offline. Suara Anda diproses langsung di peramban tanpa biaya token API cloud dan tanpa risiko privasi.
                </p>
              </div>

              {/* Interactive Voice Tester */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-500">
                  Uji Coba Kalimat Transaksi:
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
                    Hasil Pengenalan Otomatis:
                  </div>
                  <div className="space-y-1.5">
                    {parsedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.itemName} ({item.category === "primer" ? "Needs" : "Wants"})
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                >
                  Buka Perekam Suara Langsung
                </button>
              </div>
            </div>

            {/* Right: Hybrid Receipt OCR */}
            <div className="bg-white dark:bg-[#101c38] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e335f] space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Hybrid Receipt OCR Scanner
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Unggah atau foto struk belanja supermarket, kafe, atau apotek. FINRA mengekstrak nama merchant, tanggal transaksi, total belanja, serta daftar item belanja secara terstruktur.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800 space-y-4 text-center">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mendukung Struk Belanja Indonesia
                </div>
                <div className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Algoritma regex lokal dan jembatan PaddleOCR mengenali format nota kasir Indomaret, Alfamart, restoran, kafe, dan SPBU.
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101c38] hover:bg-slate-50 dark:hover:bg-[#15254b] text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                  >
                    Uji Scan Struk Sekarang
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Gerbang Konfirmasi: Seluruh data hasil scan wajib diverifikasi sebelum disimpan.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Fallback Offline: Tetap membaca struk di browser melalui Tesseract Web Worker.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT-IF SIMULATOR VALUE PROPOSITION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Simulator What-If: Uji Keputusan Sebelum Menyesal
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ingin tahu dampaknya jika Anda memangkas pengeluaran kafe Rp 300.000 per bulan? Atau bagaimana jika biaya sewa kos naik mendadak?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              What-If Simulator menghitung secara deterministik pergeseran tanggal tercapainya target finansial Anda, memperlihatkan peluang surplus atau risiko defisit secara instan.
            </p>
            <div className="pt-2">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <span>Buka Simulator What-If</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 dark:bg-[#101c38] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e335f] space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contoh Skenario Finansial
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Skenario: Pangkas Jajan Kopi Rp 200.000 / Bulan
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-1">
                  Dampak: Target Dana Darurat tercapai 3 bulan lebih cepat.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Skenario: Kenaikan Biaya Tempat Tinggal Rp 500.000
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                  Dampak: Porsi Needs melampaui 55%, rasio tabungan menyusut menjadi 8%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c1630]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs text-slate-500">
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
                q: "Mengapa FINRA menggunakan model 50/30/20?",
                a: "Model 50/30/20 adalah kerangka keuangan universal yang membagi anggaran ke Kebutuhan (50%), Keinginan (30%), dan Tabungan (20%). Ini menjaga disiplin tanpa membuat hidup terasa terlalu kaku.",
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
                  className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLEAN NAVY FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#091124] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">FINRA</span>
            <span> &copy; {new Date().getFullYear()}. See Your Financial Future Before You Live It.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/simulator" className="hover:text-blue-600 transition-colors">
              Simulator
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

      {/* Interactive Modals */}
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
