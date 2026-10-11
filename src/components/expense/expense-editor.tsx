"use client";

import React, { useState } from "react";
import type { ExpenseCategory } from "@/lib/types/expense";
import { categoryLabel } from "@/lib/format";
import { FIELD_CLASS, LABEL_CLASS, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";

/** FIELD_CLASS at 16px: anything smaller makes iOS zoom into the field. */
export const INPUT_CLASS = FIELD_CLASS.replace("text-body", "text-base");

export const CATEGORIES: ExpenseCategory[] = [
  "Food & Drinks",
  "Transportation",
  "Bills & Utilities",
  "Shopping & Lifestyle",
  "Other",
];

export interface EditableExpense {
  itemName: string;
  amount: number;
  category: ExpenseCategory;
}

interface ExpenseEditorProps {
  item: EditableExpense;
  onSave: (updated: EditableExpense) => void;
  onCancel: () => void;
  submitLabel?: string;
  /** Extra fields (wallet, date) printed between the category and the buttons. */
  children?: React.ReactNode;
  busy?: boolean;
}

/** Name, amount and category of one expense, edited in place. */
export function ExpenseEditor({ item, onSave, onCancel, submitLabel = "Simpan", children, busy = false }: ExpenseEditorProps) {
  const [itemName, setItemName] = useState(item.itemName);
  const [amount, setAmount] = useState(item.amount ? String(item.amount) : "");
  const [category, setCategory] = useState<ExpenseCategory>(item.category);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = itemName.trim();
    const cleanAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!cleanName) {
      setError("Tulis dulu buat apa uangnya.");
      return;
    }
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError("Isi jumlahnya, lebih dari Rp 0.");
      return;
    }
    onSave({ itemName: cleanName, amount: cleanAmount, category });
  };

  // Unknown legacy categories stay selectable so saving never silently changes them.
  const options = CATEGORIES.includes(item.category) ? CATEGORIES : [...CATEGORIES, item.category];

  return (
    <form onSubmit={handleSave} className="space-y-3" noValidate>
      <div>
        <label htmlFor="expense-name" className={LABEL_CLASS}>Buat apa</label>
        <input
          id="expense-name"
          type="text"
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value);
            setError(null);
          }}
          placeholder="Nasi padang"
          className={INPUT_CLASS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="expense-amount" className={LABEL_CLASS}>Jumlah (Rp)</label>
          <input
            id="expense-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder="15000"
            className={`${INPUT_CLASS} money`}
          />
        </div>
        <div>
          <label htmlFor="expense-category" className={LABEL_CLASS}>Kategori</label>
          <select
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className={INPUT_CLASS}
          >
            {options.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {children}
      {error && (
        <p role="alert" className="text-body text-habis-ink">
          {error}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} disabled={busy} className={SECONDARY_CLASS}>
          Batal
        </button>
        <button type="submit" disabled={busy} className={`${PRIMARY_CLASS} flex-1`}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
