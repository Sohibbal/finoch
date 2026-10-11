"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ParsedVoiceItem } from "@/lib/types/expense";
import { categoryLabel, rupiah } from "@/lib/format";

interface ParsedExpenseListProps {
  items: ParsedVoiceItem[];
  onToggleCategory: (id: string) => void;
  onEdit: (item: ParsedVoiceItem) => void;
  onDelete: (id: string) => void;
}

export function formatRupiah(amount: number): string {
  return rupiah(amount);
}

const ICON_BUTTON = "w-11 h-11 shrink-0 flex items-center justify-center text-ink hover:bg-ink/5 transition-colors";

/** What was heard or typed, printed as stubs to check before saving. */
export function ParsedExpenseList({ items, onToggleCategory, onEdit, onDelete }: ParsedExpenseListProps) {
  if (items.length === 0) return null;

  return (
    <ol aria-label="Cek dulu sebelum disimpan" className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="relative flex items-center gap-1 pl-4 bg-paper-sheet border border-dashed border-ink/50 animate-stub-in">
          <span aria-hidden="true" className="absolute left-1.5 top-2 bottom-2 border-l border-dotted border-ink/40" />
          <div className="min-w-0 flex-1 py-2">
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-body font-semibold text-ink break-words min-w-0">{item.itemName}</span>
              <span className="money text-body font-bold text-ink whitespace-nowrap">{rupiah(item.amount)}</span>
            </p>
            {/* Tapping cycles the five categories; the full list is in Ubah. */}
            <button
              type="button"
              onClick={() => onToggleCategory(item.id)}
              aria-label={`Kategori ${categoryLabel(item.category)}, ketuk untuk ganti`}
              className="-ml-1 px-1 min-h-11 text-meta font-semibold text-ink-soft underline underline-offset-4 decoration-dotted decoration-ink/40 hover:text-ink"
            >
              {categoryLabel(item.category)}
            </button>
          </div>
          <button type="button" onClick={() => onEdit(item)} aria-label={`Ubah ${item.itemName}`} className={ICON_BUTTON}>
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onDelete(item.id)} aria-label={`Buang ${item.itemName}`} className={ICON_BUTTON}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ol>
  );
}
