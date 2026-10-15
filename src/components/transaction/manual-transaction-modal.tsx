"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Plus, PenLine } from "lucide-react";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";

interface ManualTransactionModalProps {
  isOpen: boolean;
  type: "income" | "expense";
  onClose: () => void;
  onSave: (data: { itemName: string; amount: number; category: string; transactionDate: string }) => Promise<void> | void;
}

export const INCOME_CATEGORIES = [
  "Uang Saku",
  "Gaji",
  "Freelance",
  "Hadiah & Bonus",
  "Penjualan",
  "Lainnya",
];

export const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Kebutuhan Kost",
  "Hiburan & Jajan",
  "Belanja",
  "Pendidikan",
  "Kesehatan",
  "Lainnya",
];

export function ManualTransactionModal({
  isOpen,
  type,
  onClose,
  onSave,
}: ManualTransactionModalProps) {
  const isIncome = type === "income";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [itemName, setItemName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(localDateKey(new Date()));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDate(localDateKey(new Date()));
      if (!categories.includes(category)) {
        setCategory(categories[0]);
      }
      setError("");
    }
  }, [isOpen, categories, category]);

  if (!isOpen) return null;

  const rawAmount = Number(amountStr.replace(/\D/g, "")) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(amountStr.replace(/\D/g, ""));
    const cleanItem = itemName.trim();

    if (!cleanItem) {
      setError("Nama item tidak boleh kosong");
      return;
    }
    if (!cleanAmount || cleanAmount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSave({
        itemName: cleanItem,
        amount: cleanAmount,
        category,
        transactionDate: date,
      });
      setItemName("");
      setAmountStr("");
      onClose();
    } catch {
      setError("Gagal menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xl glass-sheen relative overflow-hidden group space-y-5">
        {/* Background Watermark Icon */}
        <Plus
          className="absolute -right-3 -bottom-3 w-32 h-32 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
          strokeWidth={1.5}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <PenLine className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Catat Manual {isIncome ? "Pemasukan" : "Pengeluaran"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ketik nama item, nominal & tentukan kategori
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Nama {isIncome ? "Pemasukan / Sumber" : "Pengeluaran / Keperluan"}
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={isIncome ? "Contoh: Uang Saku Ortu, Gaji Part Time" : "Contoh: Makan Siang, Bensin Pertalite"}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Nominal (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr ? Number(amountStr.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
                placeholder="25.000"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-extrabold money focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {rawAmount > 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold text-right pt-0.5">
              Nominal: {rupiah(rawAmount)}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !itemName.trim() || rawAmount <= 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
