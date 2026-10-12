"use client";

import React from "react";
import { Mic, ScanLine, PenLine, ArrowUpRight } from "lucide-react";

interface TransactionActionCardsProps {
  onOpenVoice: () => void;
  onOpenScan: () => void;
  onOpenManual: () => void;
  layout?: "vertical" | "grid";
  type?: "income" | "expense" | "general";
  className?: string;
}

export function TransactionActionCards({
  onOpenVoice,
  onOpenScan,
  onOpenManual,
  layout = "vertical",
  type = "general",
  className = "",
}: TransactionActionCardsProps) {
  const isIncome = type === "income";

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
      : "flex flex-col gap-3 w-full";

  return (
    <div className={`${containerClass} ${className}`}>
      {/* 1. CARD: BICARA */}
      <button
        type="button"
        onClick={onOpenVoice}
        className="w-full text-left rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs glass-sheen relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500/70 hover:shadow-md transition-all flex flex-col justify-between min-h-[142px] cursor-pointer"
      >
        {/* Transparent Watermark Icon */}
        <Mic
          className="absolute -right-3 -bottom-3 w-24 h-24 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:rotate-6"
          strokeWidth={1.5}
        />

        <div className="relative z-10 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Bicara
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {isIncome
                ? "Sebut sumber uang masuk & nominal"
                : "Sebut belanjaanmu, AI ekstrak otomatis"}
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
          <span>Mulai Bicara</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 2. CARD: SCAN STRUK */}
      <button
        type="button"
        onClick={onOpenScan}
        className="w-full text-left rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs glass-sheen relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-500/70 hover:shadow-md transition-all flex flex-col justify-between min-h-[142px] cursor-pointer"
      >
        {/* Transparent Watermark Icon */}
        <ScanLine
          className="absolute -right-3 -bottom-3 w-24 h-24 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:rotate-6"
          strokeWidth={1.5}
        />

        <div className="relative z-10 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ScanLine className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Scan Struk
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {isIncome
                ? "Scan bukti transfer atau mutasi"
                : "Foto nota/struk kasir minimarket atau warung"}
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span>Pindai Struk</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 3. CARD: CATAT MANUAL */}
      <button
        type="button"
        onClick={onOpenManual}
        className="w-full text-left rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs glass-sheen relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-500/70 hover:shadow-md transition-all flex flex-col justify-between min-h-[142px] cursor-pointer"
      >
        {/* Transparent Watermark Icon */}
        <PenLine
          className="absolute -right-3 -bottom-3 w-24 h-24 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:rotate-6"
          strokeWidth={1.5}
        />

        <div className="relative z-10 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <PenLine className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Catat Manual
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {isIncome
                ? "Ketik nominal & sumber pemasukan"
                : "Ketik nominal & rincian pengeluaran"}
            </p>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
          <span>Input Manual</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
}
