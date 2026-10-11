"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { localDateKey } from "@/lib/date";

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
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [itemName, setItemName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(localDateKey(new Date()));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(amountStr.replace(/\D/g, ""));
    const cleanItem = itemName.trim();

    if (!cleanItem) {
      setError("Deskripsi / nama item tidak boleh kosong");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-paper-sheet dark:bg-navy-900 border border-ink/20 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ink/10 dark:border-navy-800">
          <h2 className="text-head font-bold text-ink dark:text-white">
            Catat {type === "income" ? "Pemasukan" : "Pengeluaran"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-ink-soft hover:text-ink hover:bg-ink/5 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-meta font-medium text-rose-500">{error}</p>}

          <div>
            <label className="block text-meta font-semibold text-ink-soft dark:text-navy-300 mb-1">
              Nominal (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr ? Number(amountStr.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
              onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-ink/20 dark:border-navy-700 bg-paper-sheet dark:bg-navy-800 text-ink dark:text-white text-head font-bold money focus:outline-none focus:ring-2 focus:ring-ink/20"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-meta font-semibold text-ink-soft dark:text-navy-300 mb-1">
              {type === "income" ? "Sumber / Keterangan" : "Untuk Apa / Di Mana"}
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={type === "income" ? "Transfer Ortu, Gaji Freelance..." : "Makan Siang, Bensin..."}
              className="w-full px-4 py-2.5 rounded-xl border border-ink/20 dark:border-navy-700 bg-paper-sheet dark:bg-navy-800 text-ink dark:text-white text-body focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-meta font-semibold text-ink-soft dark:text-navy-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-ink/20 dark:border-navy-700 bg-paper-sheet dark:bg-navy-800 text-ink dark:text-white text-body focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-meta font-semibold text-ink-soft dark:text-navy-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-ink/20 dark:border-navy-700 bg-paper-sheet dark:bg-navy-800 text-ink dark:text-white text-body focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ink dark:bg-white text-paper-sheet dark:text-navy-950 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
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
