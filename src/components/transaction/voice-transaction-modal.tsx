"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Check } from "lucide-react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { rupiah } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "./manual-transaction-modal";

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

  // Auto-detect fields from transcript
  useEffect(() => {
    const fullText = (transcript + " " + interimTranscript).trim();
    if (!fullText) return;

    const parsed = parseIndonesianExpense(fullText);
    if (parsed.length > 0) {
      const top = parsed[0];
      setItemName(top.itemName);
      setAmount(top.amount);

      // Category matching
      const lower = fullText.toLowerCase();
      if (isIncome) {
        if (lower.includes("gaji") || lower.includes("salary")) setCategory("Gaji");
        else if (lower.includes("freelance") || lower.includes("proyek") || lower.includes("jasa")) setCategory("Freelance");
        else if (lower.includes("saku") || lower.includes("ortu") || lower.includes("kiriman") || lower.includes("transfer")) setCategory("Uang Saku");
        else if (lower.includes("bonus") || lower.includes("hadiah") || lower.includes("thr")) setCategory("Hadiah & Bonus");
        else if (lower.includes("jual") || lower.includes("laku")) setCategory("Penjualan");
        else setCategory("Lainnya");
      } else {
        if (lower.includes("makan") || lower.includes("kopi") || lower.includes("gacoan") || lower.includes("warteg") || lower.includes("minum")) setCategory("Makanan & Minuman");
        else if (lower.includes("bensin") || lower.includes("gojek") || lower.includes("grab") || lower.includes("angkot") || lower.includes("parkir")) setCategory("Transportasi");
        else if (lower.includes("kost") || lower.includes("listrik") || lower.includes("wifi") || lower.includes("laundry") || lower.includes("sabun")) setCategory("Kebutuhan Kost");
        else if (lower.includes("nongkrong") || lower.includes("nonton") || lower.includes("game") || lower.includes("jajan")) setCategory("Hiburan & Jajan");
        else if (lower.includes("baju") || lower.includes("sepatu") || lower.includes("belanja") || lower.includes("shopee")) setCategory("Belanja");
        else setCategory("Lainnya");
      }
    } else {
      setItemName(fullText);
    }
  }, [transcript, interimTranscript, isIncome]);

  useEffect(() => {
    if (!isOpen) {
      if (isListening) stopListening();
      resetTranscript();
      setItemName("");
      setAmount(null);
      setCategory(categories[0]);
      setDate(localDateKey(new Date()));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setItemName("");
      setAmount(null);
      startListening();
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#111C2E] rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bicara {isIncome ? "Pemasukan" : "Pengeluaran"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isIncome
                ? "Sebutkan sumber dan jumlah uang masuk"
                : "Sebutkan belanja atau pengeluaranmu"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microphone action area */}
        <div className="flex flex-col items-center justify-center py-3 space-y-3">
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/25 ring-8 ring-rose-500/15"
                : isIncome
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:scale-105"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:scale-105"
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {isListening ? "Mendengarkan ucapanmu... Ketuk untuk stop" : "Ketuk mikrofon untuk mulai bicara"}
          </p>

          {!itemName && !isListening && (
            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 italic max-w-xs">
              {isIncome
                ? 'Contoh: "Uang saku dari mama satu juta lima ratus ribu"'
                : 'Contoh: "Makan siang ayam geprek dua puluh lima ribu"'}
            </p>
          )}
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Nama {isIncome ? "Pemasukan" : "Pengeluaran"}
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={isIncome ? "Contoh: Uang Saku Bulanan" : "Contoh: Nasi Padang"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount ?? ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Contoh: 50000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {amount && amount > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-right">
              Terbaca: {rupiah(amount)}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!itemName.trim() || !amount || amount <= 0 || isSaving}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition-all disabled:opacity-50 ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Transaksi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
