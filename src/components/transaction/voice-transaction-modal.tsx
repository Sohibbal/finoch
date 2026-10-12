"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Check, RotateCcw, Sparkles } from "lucide-react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { rupiah } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "./manual-transaction-modal";
import { AudioFrequencyVisualizer } from "./audio-frequency-visualizer";

interface VoiceTransactionModalProps {
  isOpen: boolean;
  type: "income" | "expense";
  onClose: () => void;
  onSave: (data: {
    itemName: string;
    amount: number;
    category: string;
    transactionDate: string;
  }) => Promise<void> | void;
}

export function VoiceTransactionModal({
  isOpen,
  type,
  onClose,
  onSave,
}: VoiceTransactionModalProps) {
  const isIncome = type === "income";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useHybridSpeech();

  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(localDateKey(new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingLlm, setIsParsingLlm] = useState(false);

  // Flow step: "recording" (auto-listen + frequency wave) -> "confirm" (human-in-the-loop review)
  const [step, setStep] = useState<"recording" | "confirm">("recording");

  // Keep track of the full transcript spoken
  const spokenText = (transcript + " " + interimTranscript).trim();

  // Helper to map category from NLP to UI category list
  const mapToUiCategory = useCallback((detectedCategory: string, text: string): string => {
    const lower = text.toLowerCase();
    if (isIncome) {
      if (lower.includes("gaji") || lower.includes("salary")) return "Gaji";
      if (lower.includes("freelance") || lower.includes("proyek") || lower.includes("jasa")) return "Freelance";
      if (lower.includes("saku") || lower.includes("ortu") || lower.includes("kiriman") || lower.includes("transfer")) return "Uang Saku";
      if (lower.includes("bonus") || lower.includes("hadiah") || lower.includes("thr")) return "Hadiah & Bonus";
      if (lower.includes("jual") || lower.includes("laku")) return "Penjualan";
      return "Lainnya";
    }

    if (detectedCategory === "Food & Drinks" || lower.includes("makan") || lower.includes("kopi") || lower.includes("warteg") || lower.includes("minum") || lower.includes("ayam")) {
      return "Makanan & Minuman";
    }
    if (detectedCategory === "Transportation" || lower.includes("bensin") || lower.includes("gojek") || lower.includes("grab") || lower.includes("angkot") || lower.includes("parkir")) {
      return "Transportasi";
    }
    if (detectedCategory === "Bills & Utilities" || lower.includes("kost") || lower.includes("kosan") || lower.includes("listrik") || lower.includes("wifi") || lower.includes("pulsa")) {
      return "Kebutuhan Kost";
    }
    if (detectedCategory === "Shopping & Lifestyle" || lower.includes("nongkrong") || lower.includes("game") || lower.includes("bioskop") || lower.includes("shopee")) {
      return "Belanja";
    }
    return "Lainnya";
  }, [isIncome]);

  // Refine item extraction using LLM API if available
  const refineWithLlm = useCallback(async (fullText: string) => {
    if (!fullText || fullText.length < 3) return;
    setIsParsingLlm(true);
    try {
      const res = await fetch("/api/transactions/parse-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const top = data.items[0];
          if (top.itemName && typeof top.itemName === "string") {
            setItemName(top.itemName);
          }
          if (typeof top.amount === "number" && top.amount > 0) {
            setAmount(top.amount);
          }
          if (top.category) {
            setCategory(mapToUiCategory(top.category, fullText));
          }
        }
      }
    } catch {
      // Fallback already populated by local NLP
    } finally {
      setIsParsingLlm(false);
    }
  }, [mapToUiCategory]);

  // Parse speech transcript locally immediately as user speaks
  useEffect(() => {
    if (!spokenText) return;

    const parsed = parseIndonesianExpense(spokenText);
    if (parsed.length > 0) {
      const top = parsed[0];
      setItemName(top.itemName);
      setAmount(top.amount);
      setCategory(mapToUiCategory(top.category, spokenText));
    } else {
      setItemName(spokenText);
    }
  }, [spokenText, mapToUiCategory]);

  // Auto-start listening immediately upon opening modal without requiring user to press mic
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setStep("recording");
      resetTranscript();
      setItemName("");
      setAmount(null);
      setCategory(categories[0]);
      setDate(localDateKey(new Date()));
      setIsParsingLlm(false);

      // Trigger microphone automatically
      const timer = setTimeout(() => {
        startListening();
      }, 150);
      return () => clearTimeout(timer);
    }

    if (!isOpen && prevOpenRef.current) {
      if (isListening) stopListening();
      resetTranscript();
      setStep("recording");
    }

    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Automatically transition to confirm review when speech ends and we have detected an amount
  const lastSpokenRef = useRef(spokenText);
  useEffect(() => {
    lastSpokenRef.current = spokenText;
  }, [spokenText]);

  useEffect(() => {
    // If listening just stopped and we have a valid parsed item, move to confirmation step
    if (!isListening && step === "recording" && spokenText && amount && amount > 0) {
      refineWithLlm(spokenText);
      setStep("confirm");
    }
  }, [isListening, step, spokenText, amount, refineWithLlm]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      if (spokenText && amount && amount > 0) {
        refineWithLlm(spokenText);
        setStep("confirm");
      }
    } else {
      resetTranscript();
      setItemName("");
      setAmount(null);
      startListening();
    }
  };

  const handleFinishRecording = () => {
    stopListening();
    if (spokenText) {
      refineWithLlm(spokenText);
    }
    setStep("confirm");
  };

  const handleRestartRecording = () => {
    resetTranscript();
    setItemName("");
    setAmount(null);
    setStep("recording");
    setTimeout(() => {
      startListening();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !amount || amount <= 0) return;

    setIsSaving(true);
    try {
      await onSave({
        itemName: itemName.trim(),
        amount,
        category,
        transactionDate: date,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xl glass-sheen relative overflow-hidden group space-y-6">
        {/* Background Watermark Icon */}
        <Mic
          className="absolute -right-3 -bottom-3 w-32 h-32 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
          strokeWidth={1.5}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Bicara {isIncome ? "Pemasukan" : "Pengeluaran"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {step === "recording"
                  ? "Langsung bicara, sistem mendengarkan otomatis"
                  : "Konfirmasi & sesuaikan data sebelum disimpan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Live Voice Recording & Sound Frequency Visualizer */}
        {step === "recording" && (
          <div className="relative z-10 space-y-5 animate-fade-in">
            {/* Audio Waveform Equalizer */}
            <div className="rounded-2xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200/70 dark:border-slate-800/80 p-4 flex flex-col items-center justify-center space-y-2">
              <AudioFrequencyVisualizer isListening={isListening} />
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isListening
                      ? "bg-rose-500 animate-ping"
                      : "bg-slate-400"
                  }`}
                />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isListening
                    ? "Mendengarkan ucapanmu... Silakan langsung bicara"
                    : "Mikrofon jeda. Ketuk tombol mic untuk melanjutkan"}
                </p>
              </div>
            </div>

            {/* Live Transcript Bubble */}
            <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 p-4 space-y-1.5 min-h-[78px] flex flex-col justify-center">
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Ucapan Terdeteksi
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                {spokenText || (
                  <span className="text-slate-400 dark:text-slate-500 not-italic">
                    Contoh: &quot;Hari ini saya makan ayam bg kumis 25 ribu&quot;
                  </span>
                )}
              </p>
            </div>

            {/* Quick Parsing Live Preview */}
            {amount && amount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Item: &quot;{itemName}&quot;</span>
                </div>
                <span className="money text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {rupiah(amount)}
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`p-3 rounded-2xl border font-semibold text-xs flex items-center gap-2 transition-all ${
                  isListening
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Lanjut Bicara</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFinishRecording}
                disabled={!spokenText}
                className="flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Selesai Bicara & Periksa</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Human-in-the-Loop Confirmation Review Form */}
        {step === "confirm" && (
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4 animate-fade-in">
            {/* Informational notice */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Hasil ekstraksi AI bersih dari kata awalan</span>
              </div>
              {isParsingLlm && (
                <span className="text-[11px] text-blue-500 animate-pulse">
                  Menyempurnakan dengan LLM...
                </span>
              )}
            </div>

            {/* Field: Nama Item / Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Nama {isIncome ? "Pemasukan" : "Pengeluaran"}
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={isIncome ? "Contoh: Uang Saku Mama" : "Contoh: Ayam Bg Kumis"}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Field: Nominal & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount ?? ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-extrabold money focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field: Tanggal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Nominal preview badge */}
            {amount && amount > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-right pt-1">
                Terbaca: {rupiah(amount)}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleRestartRecording}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bicara Ulang</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={!itemName.trim() || !amount || amount <= 0 || isSaving}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white shadow-md transition-all disabled:opacity-50 ${
                    isIncome
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Transaksi"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
