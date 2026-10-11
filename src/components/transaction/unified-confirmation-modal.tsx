"use client";

import React, { useState, useEffect, useRef } from "react";
import { TransactionCandidate, validateTransactionCandidate } from "@/types/financial-types";
import type { Expense } from "@/lib/types/expense";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import { localDateKey } from "@/lib/date";
import { categoryLabel, rupiah } from "@/lib/format";
import { LABEL_CLASS, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { SaveReceipt } from "@/components/press/receipt-stub";
import { CATEGORIES, INPUT_CLASS } from "@/components/expense/expense-editor";

interface UnifiedConfirmationModalProps {
  isOpen: boolean;
  candidate: TransactionCandidate | null;
  /** Keep it stable (useCallback): the dialog re-focuses itself when it changes. */
  onClose: () => void;
  /**
   * walletId undefined = the default wallet. Return the saved expenses to get the save receipt
   * with Batalkan; return nothing and the caller closes the modal itself.
   */
  onConfirm: (candidate: TransactionCandidate, walletId?: string) => Promise<Expense[] | void> | Expense[] | void;
  isSubmitting?: boolean;
  /** Today's jatah left, printed on the save receipt. */
  sisaHariIni?: number;
  /** After Batalkan deleted the saved expenses: reload. */
  onUndone?: () => void | Promise<void>;
}

/** Check a scanned or typed purchase, save it, and get the same receipt + Batalkan as Catat. */
export function UnifiedConfirmationModal({
  isOpen,
  candidate,
  onClose,
  onConfirm,
  isSubmitting = false,
  sisaHariIni,
  onUndone,
}: UnifiedConfirmationModalProps) {
  const [formData, setFormData] = useState<TransactionCandidate | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Expense[] | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  // Bumped on every opening so a late save never prints into the next one.
  const openingRef = useRef(0);

  useEffect(() => {
    if (isOpen && candidate) {
      openingRef.current += 1;
      setFormData({
        ...candidate,
        merchant: candidate.merchant || "",
        amount: candidate.amount || 0,
        spendingType: candidate.spendingType || "needs",
        category: candidate.category || "Food & Drinks",
        date: candidate.date || localDateKey(new Date()),
      });
      setValidationError("");
      setSaved(null);
      setSaving(false);
      setUndoError(null);
    }
    if (!isOpen) setSaved(null);
  }, [isOpen, candidate]);

  if (!formData) return null;

  const busy = isSubmitting || saving;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTransactionCandidate(formData);
    if (!validation.isValid) {
      setValidationError(validation.errors[0] || "Lengkapi dulu nominal, kategori dan tanggalnya.");
      return;
    }
    setValidationError("");
    const opening = openingRef.current;
    setSaving(true);
    try {
      const result = await onConfirm(formData, undefined);
      if (opening === openingRef.current && Array.isArray(result) && result.length > 0) setSaved(result);
    } catch {
      setValidationError("Belum tersimpan: penyimpanan HP-mu menolak. Coba Simpan lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = async () => {
    if (!saved) return;
    setUndoing(true);
    setUndoError(null);
    try {
      await expenseStorage.deleteExpenses(saved.map((e) => e.id));
    } catch {
      setUndoError("Gagal membatalkan. Coba ketuk Batalkan lagi.");
      setUndoing(false);
      return;
    }
    syncManager.triggerSync();
    try {
      await onUndone?.();
    } catch {
      // The delete stands; the next sync refreshes the page.
    }
    setUndoing(false);
    // Back to the form with everything still filled in.
    setSaved(null);
  };

  const categories = CATEGORIES.includes(formData.category) ? CATEGORIES : [...CATEGORIES, formData.category];

  return (
    <PaperDialog isOpen={isOpen} onClose={onClose} title={formData.source === "ocr" ? "Hasil scan struk" : "Catat manual"}>
      {saved ? (
        <SaveReceipt
          items={saved.map((e) => ({ name: e.itemName, amount: e.amount }))}
          serialId={saved[0].id}
          date={localDateKey(new Date(saved[0].createdAt))}
          sisaHariIni={sisaHariIni}
          onUndo={handleUndo}
          onDone={onClose}
          undoing={undoing}
          error={undoError}
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {formData.source === "ocr" && (
            <p className="text-body text-ink-soft">Cek angkanya dulu: hasil scan bisa salah baca.</p>
          )}

          <div>
            <label htmlFor="confirm-amount" className={LABEL_CLASS}>Nominal (Rp)</label>
            <input
              id="confirm-amount"
              type="text"
              inputMode="numeric"
              value={formData.amount ? String(formData.amount) : ""}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value.replace(/\D/g, "")) })}
              placeholder="15000"
              className={`${INPUT_CLASS} money font-semibold`}
            />
          </div>

          <div>
            <label htmlFor="confirm-merchant" className={LABEL_CLASS}>Buat apa / di mana</label>
            <input
              id="confirm-merchant"
              type="text"
              value={formData.merchant || ""}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              placeholder="Warteg Bu Sri"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="confirm-category" className={LABEL_CLASS}>Kategori</label>
              <select
                id="confirm-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={INPUT_CLASS}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="confirm-date" className={LABEL_CLASS}>Tanggal</label>
              <input
                id="confirm-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {formData.items && formData.items.length > 0 && (
            <details className="border-t border-dotted border-ink/40 pt-2">
              <summary className="min-h-11 flex items-center text-body font-semibold text-ink cursor-pointer">
                Rincian di struk ({formData.items.length} item)
              </summary>
              <ul className="space-y-1 pb-2">
                {formData.items.map((it, idx) => (
                  <li key={idx} className="flex items-baseline gap-2 text-body text-ink">
                    <span className="min-w-0 break-words">{it.name}</span>
                    <span aria-hidden="true" className="flex-1 border-b border-dotted border-ink/30" />
                    <span className="money whitespace-nowrap">{rupiah(it.amount)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {validationError && (
            <p role="alert" className="text-body text-habis-ink">
              {validationError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={busy} className={SECONDARY_CLASS}>
              Batal
            </button>
            <button type="submit" disabled={busy} className={`${PRIMARY_CLASS} flex-1`}>
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      )}
    </PaperDialog>
  );
}
