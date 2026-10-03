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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Edit Transaksi
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                "Food & Drinks",
                "Transportation",
                "Housing & Bills",
                "Shopping & Clothing",
                "Entertainment & Leisure",
                "Education & Career",
                "Health & Personal Care",
                "Social & Family",
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
