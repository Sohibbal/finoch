"use client";

import React, { useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import type { ParsedVoiceItem } from "@/lib/types/expense";
import { INPUT_CLASS } from "./expense-editor";
import { LABEL_CLASS } from "@/components/press/kampus-press";

interface ManualExpenseInputProps {
  onParsed: (items: ParsedVoiceItem[]) => void;
  disabled?: boolean;
}

/** The typed way to catat: same parser as voice, one line at a time. */
export function ManualExpenseInput({ onParsed, disabled }: ManualExpenseInputProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    const parsed = parseIndonesianExpense(clean);
    if (parsed.length === 0) {
      setError("Belum kebaca nominalnya. Tulis seperti: ayam geprek 15rb");
      return;
    }

    setError(null);
    setText("");
    onParsed(parsed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="catat-ketik" className={LABEL_CLASS}>
        Atau ketik
      </label>
      <div className="flex gap-2">
        <input
          id="catat-ketik"
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          disabled={disabled}
          enterKeyHint="done"
          autoComplete="off"
          placeholder="es teh 5rb, bensin 20rb"
          aria-describedby={error ? "catat-ketik-error" : undefined}
          className={INPUT_CLASS}
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Tambah ke catatan"
          className="w-11 h-11 shrink-0 flex items-center justify-center bg-ink text-paper-sheet hover:bg-ink/90 disabled:opacity-40 transition-colors"
        >
          <CornerDownLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id="catat-ketik-error" role="alert" className="mt-1.5 text-body text-habis-ink">
          {error}
        </p>
      )}
    </form>
  );
}
