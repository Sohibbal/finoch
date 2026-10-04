"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import type { ParsedVoiceItem, ExpenseCategory } from "@/lib/types/expense";

interface ExpenseEditorProps {
  item: ParsedVoiceItem;
  isOpen: boolean;
  onSave: (updatedItem: ParsedVoiceItem) => void;
  onClose: () => void;
}

export function ExpenseEditor({ item, isOpen, onSave, onClose }: ExpenseEditorProps) {
  const [itemName, setItemName] = useState(item.itemName);
  const [amount, setAmount] = useState(item.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(item.category);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = itemName.trim();
    const cleanAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!cleanName) {
      setError("Nama transaksi tidak boleh kosong.");
      return;
    }

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError("Jumlah uang harus lebih besar dari Rp0.");
      return;
    }

    onSave({
      ...item,
      itemName: cleanName,
      amount: cleanAmount,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-cream-50 dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 sm:p-6 shadow-2xl text-navy-950 dark:text-cream-50 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
            Edit Transaksi
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-navy-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1">
              Nama Pengeluaran
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setError(null);
              }}
              placeholder="Contoh: Nasi Padang"
              className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1">
              Jumlah (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="15000"
              className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
            >
              {[
                "Food & Drinks",
                "Transportation",
                "Bills & Utilities",
                "Shopping & Lifestyle",
                "Other",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-navy-800 dark:text-cream-300 bg-cream-200/70 hover:bg-cream-200 dark:bg-navy-900 dark:hover:bg-navy-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-cream-50 dark:text-navy-950 bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
