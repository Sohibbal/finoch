"use client";

import React, { useState } from "react";
import {
  Mic,
  Receipt,
  Scale,
  RotateCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FeatureFlipCardsProps {
  onOpenVoice: () => void;
  onOpenScanner: () => void;
}

export function FeatureFlipCards({
  onOpenVoice,
  onOpenScanner,
}: FeatureFlipCardsProps) {
  // Support click/tap toggle for mobile and keyboard accessibility
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const toggleFlip = (index: number) => {
    setFlippedIndex((prev) => (prev === index ? null : index));
  };

  const cards = [
    {
      id: "voice-ai",
      badge: "Hybrid Speech AI",
      badgeColor: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
      icon: Mic,
      frontTitle: "Catat Cepat Cukup Berbicara",
      frontDesc:
        "Bicara senatural mungkin: 'Makan ayam geprek 15 ribu sama es teh 5 ribu'. Sistem memecah item belanja dan mendeteksi rupiah secara instan.",
      metrics: [
        { label: "Latensi Pengenalan", value: "< 50ms" },
        { label: "Dukungan Offline", value: "Whisper On-Device" },
      ],
      backTitle: "Arsitektur Audio & NLP Lokal",
      backPoints: [
        {
          title: "Dual Engine Orchestration",
          desc: "Beralih otomatis antara Web Speech API saat online dan model Whisper WebAssembly lokal saat offline tanpa kendala koneksi.",
        },
        {
          title: "Privasi Total (Zero Cloud Audio)",
          desc: "Audio diproses langsung ke Float32Array 16kHz mono di peramban. Tidak ada file rekaman suara yang dikirim atau disimpan di server.",
        },
        {
          title: "Deterministic Token Splitting",
          desc: "Mengenali slang nominal rupiah (seperti goceng, ceban, setengah juta) dan memilah kategori belanja ke pos Kebutuhan vs Keinginan.",
        },
      ],
      actionLabel: "Coba Demo Suara",
      onAction: onOpenVoice,
    },
    {
      id: "ocr-scanner",
      badge: "Computer Vision & OCR",
      badgeColor: "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
      icon: Receipt,
      frontTitle: "Pindai Struk Sekali Jepret",
      frontDesc:
        "Foto atau unggah struk belanja supermarket, kafe, atau SPBU. FINRA mengekstrak merchant, tanggal, total, dan rincian item belanja otomatis.",
      metrics: [
        { label: "Format Struk", value: "Indomaret, SPBU, Kafe" },
        { label: "Gerbang Validasi", value: "100% Konfirmasi Manual" },
      ],
      backTitle: "Mekanisme Ekstraksi Struk Digital",
      backPoints: [
        {
          title: "Hybrid Cloud & Edge Pipeline",
          desc: "Ekstraksi terstruktur saat online dengan dukungan LLM, serta fallback instan menggunakan Tesseract.js Web Worker di peramban saat offline.",
        },
        {
          title: "Klasifikasi Otomatis 50/30/20",
          desc: "Setiap baris barang belanjaan dipilah otomatis ke pos Kebutuhan (Needs) atau Keinginan (Wants) untuk transparansi arus kas.",
        },
        {
          title: "Gerbang Konfirmasi Terbuka",
          desc: "Data struk tidak pernah langsung masuk ke buku besar tanpa konfirmasi. Anda dapat meninjau dan merevisi nominal sebelum disimpan.",
        },
      ],
      actionLabel: "Uji Pindai Struk",
      onAction: onOpenScanner,
    },
    {
      id: "twin-simulator",
      badge: "Financial Twin Sandbox",
      badgeColor: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
      icon: Scale,
      frontTitle: "Kembaran Finansial 50/30/20",
      frontDesc:
        "Simulasikan keputusan keuangan sebelum Anda menjalaninya. Uji dampak nyata jika memangkas jajan kopi atau jika biaya sewa kos naik mendadak.",
      metrics: [
        { label: "Model Anggaran", value: "50% Needs / 30% Wants / 20% Save" },
        { label: "Proteksi Kas", value: "Peringatan Bocor Halus" },
      ],
      backTitle: "Model Simulasi Prospektif",
      backPoints: [
        {
          title: "Sandbox Keputusan Finansial",
          desc: "Menghitung secara matematis pergeseran tanggal tercapainya target tabungan saat terjadi perubahan pola belanja harian.",
        },
        {
          title: "Algoritma Deteksi Bocor Halus",
          desc: "Menandai pengeluaran berulang bernominal kecil yang jika diakumulasikan berpotensi menggerus alokasi tabungan bulanan.",
        },
        {
          title: "Local-First & Offline Sync",
          desc: "Seluruh data Anda tersimpan di IndexedDB browser secara offline, dan disinkronkan ke server secara terenkripsi saat Anda login.",
        },
      ],
      actionLabel: "Eksplorasi Simulasi",
      onAction: () => {
        const el = document.getElementById("simulasi-503020");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {cards.map((card, idx) => {
        const isFlipped = flippedIndex === idx;
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className="perspective-1000 min-h-[490px] sm:min-h-[510px] w-full"
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={() => toggleFlip(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFlip(idx);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Kartu fitur: ${card.frontTitle}. Tekan untuk membalik dan melihat detail teknis.`}
            >
              {/* FRONT OF CARD */}
              <div className="backface-hidden absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#101c38] border border-slate-200 dark:border-[#1e335f] shadow-lg shadow-slate-900/5 dark:shadow-none flex flex-col justify-between transition-colors hover:border-blue-400 dark:hover:border-blue-500/50">
                <div className="space-y-4">
                  {/* Badge & Flip Indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${card.badgeColor}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {card.badge}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Balik Kartu</span>
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="pt-2 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#0b1428] border border-blue-100 dark:border-blue-900/60 text-[#0f274a] dark:text-blue-400 flex items-center justify-center shadow-sm">
                      <IconComponent className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                      {card.frontTitle}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.frontDesc}
                    </p>
                  </div>
                </div>

                {/* Key Metrics & Bottom Bar */}
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2">
                    {card.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b1428] border border-slate-100 dark:border-slate-800"
                      >
                        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          {m.label}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                    <span>Ketuk untuk membaca arsitektur detail</span>
                    <RotateCw className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 bg-[#0b162f] dark:bg-[#0d1730] border border-blue-500/30 text-white shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      {card.backTitle}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Tutup</span>
                    </span>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-3.5 text-left">
                    {card.backPoints.map((point, pIdx) => (
                      <div key={pIdx} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{point.title}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-300 pl-5.5 leading-relaxed">
                          {point.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back Actions */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      card.onAction();
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{card.actionLabel}</span>
                  </button>

                  <div className="text-center text-[10px] text-slate-400">
                    Klik kartu untuk membalik kembali
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
