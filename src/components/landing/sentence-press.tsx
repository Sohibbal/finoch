"use client";

import React, { useEffect, useState } from "react";
import { Mic, CornerDownLeft } from "lucide-react";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";

export const EXAMPLE = { uangSaku: 1_500_000, tetap: 650_000, hariLagi: 20 };
export const EXAMPLE_JATAH = (EXAMPLE.uangSaku - EXAMPLE.tetap) / EXAMPLE.hariLagi;

export const SAMPLE_SENTENCES = [
  "makan warteg delapan belas ribu sama es teh lima ribu",
  "bensin dua puluh ribu terus parkir dua ribu",
  "nasi padang ceban, kopi susu 15rb, fotokopi 3 ribu",
];

export type MoneyStatus = "aman" | "mepet" | "habis";

export function demoStatus(spent: number, jatah = EXAMPLE_JATAH): MoneyStatus {
  const left = jatah - spent;
  return left <= 0 ? "habis" : spent >= jatah * 0.8 ? "mepet" : "aman";
}

export interface StubData {
  id: string;
  item: string;
  amount: number;
  date: string;
  category: string;
  time: string;
}

export function pressSentence(sentence: string, today: string, run: number): StubData[] {
  return parseIndonesianExpense(sentence).map((item, i) => ({
    id: `contoh-${run}-${i}-${item.itemName}`,
    item: item.itemName,
    amount: item.amount,
    date: today,
    category: item.category,
    time: "barusan",
  }));
}

export function SentencePress({
  onTryMic,
  onTryScan,
}: {
  onTryMic: () => void;
  onTryScan?: () => void;
}) {
  const [sentence, setSentence] = useState(SAMPLE_SENTENCES[0]);
  const [stubs, setStubs] = useState<StubData[]>([]);
  const [run, setRun] = useState(1);
  const [today, setToday] = useState("2026-10-13");

  useEffect(() => {
    const day = localDateKey(new Date());
    setToday(day);
    setStubs(pressSentence(SAMPLE_SENTENCES[0], day, 1));
  }, []);

  const handleUpdate = (text: string) => {
    setSentence(text);
    if (text.trim()) {
      setStubs(pressSentence(text, today, run + 1));
      setRun((r) => r + 1);
    } else {
      setStubs([]);
    }
  };

  const spent = stubs.reduce((s, x) => s + x.amount, 0);
  const left = EXAMPLE_JATAH - spent;
  const status = demoStatus(spent);

  return (
    <div className="relative w-full rounded-2xl bg-[#080D1A] border border-slate-800/90 shadow-xl p-4 sm:p-7 lg:p-9 space-y-5 sm:space-y-7 overflow-hidden transition-card hover-card-lift">
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Header Form & Sample Pills */}
      <div className="relative z-10 space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Coba Sendiri: Ketik atau Sebutkan Belanjaanmu
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Mendukung kata, slang ("goceng", "ceban"), dan singkatan ("15rb")
          </span>
        </div>

        {/* Input box */}
        <div className="relative">
          <textarea
            rows={2}
            value={sentence}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder="Ketik kalimat belanja santai, misal: beli nasi goreng 18rb es teh ceban..."
            className="w-full min-h-[96px] sm:min-h-[80px] rounded-2xl border border-slate-800/80 bg-[#0C1427] px-3.5 sm:px-4 py-3 sm:py-3.5 pb-12 sm:pb-3.5 sm:pr-28 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-inner"
          />

          <div className="absolute right-2.5 bottom-2.5 sm:right-3 sm:bottom-3 flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onTryMic}
              className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 transition-colors"
              title="Bicara via Mikrofon"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleUpdate(sentence)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Proses</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Contoh cepat:</span>
          {SAMPLE_SENTENCES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => handleUpdate(sample)}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                sentence === sample
                  ? "border-blue-500 bg-blue-500/15 text-blue-400 font-bold"
                  : "border-slate-800/80 bg-[#0C1427] text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Parsed Results */}
      <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Parsed Items Breakdown */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Hasil Ekstraksi AI ({stubs.length} Item Terdeteksi)
            </span>
            <span>Total: {rupiah(spent)}</span>
          </div>

          <div className="space-y-2">
            {stubs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Belum ada pengeluaran terdeteksi dari kalimat di atas.
              </p>
            ) : (
              stubs.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl p-3 bg-[#0C1427] border border-slate-800/80 flex items-center justify-between gap-3 text-xs animate-content-in"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-bold text-white capitalize">
                        {s.item}
                      </p>
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-rose-400 money text-sm">
                    {rupiah(s.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Sisa Jatah Harian Impact */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-[#0C1427] border border-slate-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Simulasi Jatah Hari Ini
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                status === "habis"
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                  : status === "aman"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
              }`}
            >
              {status === "habis" ? "Over Budget" : status === "aman" ? "Aman" : "Mepet"}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-extrabold text-white money">
              {rupiah(Math.max(0, left))}
            </p>
            <p className="text-[11px] text-slate-400">
              Sisa dari plafon {rupiah(EXAMPLE_JATAH)} setelah belanja di atas
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                status === "habis" ? "bg-rose-500" : status === "aman" ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(100, (spent / EXAMPLE_JATAH) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
