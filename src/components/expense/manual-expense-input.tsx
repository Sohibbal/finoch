"use client";

import React, { useState } from "react";
import { Send, CornerDownLeft } from "lucide-react";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import type { ParsedVoiceItem } from "@/lib/types/expense";

interface ManualExpenseInputProps {
  onParsed: (items: ParsedVoiceItem[]) => void;
  disabled?: boolean;
}

export function ManualExpenseInput({ onParsed, disabled }: ManualExpenseInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    const parsed = parseIndonesianExpense(clean);
    if (parsed.length === 0) {
      setError("Tidak dapat mendeteksi pengeluaran. Contoh: 'ayam geprek 15rb'");
      return;
    }

    setError(null);
    setText("");
    onParsed(parsed);
  };

  return (
    <div className="w-full max-w-md mx-auto my-3">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          disabled={disabled}
          placeholder="Atau ketik di sini: beli bensin 20rb..."
          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-xs sm:text-sm placeholder:text-navy-400 dark:placeholder:text-cream-400/50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Kirim teks pengeluaran"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 disabled:opacity-40 text-cream-50 dark:text-navy-950 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 px-1">
          {error}
        </p>
      )}
    </div>
  );
}
