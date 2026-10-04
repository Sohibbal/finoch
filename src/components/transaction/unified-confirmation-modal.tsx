"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Receipt,
  Mic,
  Edit2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  TransactionCandidate,
  SpendingType,
  SPENDING_CATEGORIES,
  SpendingCategory,
  validateTransactionCandidate,
} from "@/types/financial-types";

interface UnifiedConfirmationModalProps {
  isOpen: boolean;
  candidate: TransactionCandidate | null;
  onClose: () => void;
  onConfirm: (candidate: TransactionCandidate) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function UnifiedConfirmationModal({
  isOpen,
  candidate,
  onClose,
  onConfirm,
  isSubmitting = false,
}: UnifiedConfirmationModalProps) {
  const [formData, setFormData] = useState<TransactionCandidate | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (isOpen && candidate) {
      setFormData({
        ...candidate,
        merchant: candidate.merchant || "Transaksi Baru",
        amount: candidate.amount || 0,
        spendingType: candidate.spendingType || "needs",
        category: candidate.category || "Food",
        date: candidate.date || new Date().toISOString().split("T")[0],
      });
      setShowItemDetails(Boolean(candidate.items && candidate.items.length > 0));
      setValidationError("");
    }
  }, [isOpen, candidate]);

  if (!isOpen || !formData) return null;

  const handleSpendingTypeToggle = (type: SpendingType) => {
    setFormData((prev) => (prev ? { ...prev, spendingType: type } : null));
  };

  const handleSave = async () => {
    if (!formData) return;
    const validation = validateTransactionCandidate(formData);
    if (!validation.isValid) {
      setValidationError(validation.errors[0] || "Mohon lengkapi data transaksi");
      return;
    }
    setValidationError("");
    await onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 dark:bg-[#070E1A] rounded-3xl shadow-2xl border border-cream-300 dark:border-navy-800 max-w-lg w-full overflow-hidden transition-all text-navy-950 dark:text-cream-50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cream-200/80 dark:bg-navy-900 text-navy-950 dark:text-cream-50 border border-cream-300 dark:border-navy-800">
              {formData.source === "ocr" ? (
                <Receipt className="w-5 h-5" />
              ) : formData.source === "voice" ? (
                <Mic className="w-5 h-5" />
              ) : (
                <Edit2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Konfirmasi Transaksi
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-400">
                Sumber: {formData.source === "ocr" ? "Scan Struk" : formData.source === "voice" ? "Input Suara" : "Catat Manual"}
                {formData.confidence !== undefined &&
                  ` • Akurasi ${Math.round(formData.confidence * 100)}%`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {validationError}
            </div>
          )}

          {/* Nominal Input Display */}
          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
              Nominal Transaksi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-500 dark:text-cream-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-xl font-black text-navy-950 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
                placeholder="0"
              />
            </div>
          </div>

          {/* Merchant / Nama Item */}
          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
              Merchant / Keterangan
            </label>
            <input
              type="text"
              value={formData.merchant || ""}
              onChange={(e) =>
                setFormData({ ...formData, merchant: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-sm font-medium text-navy-950 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
              placeholder="Contoh: Mie Gacoan, Indomaret"
            />
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                Kategori
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SpendingCategory,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-sm font-medium text-navy-950 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 appearance-none shadow-sm transition"
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
                <Layers className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-white dark:bg-navy-900/60 text-sm font-medium text-navy-950 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-navy-900 dark:focus:ring-cream-200 shadow-sm transition"
                />
                <Calendar className="w-4 h-4 text-navy-400 dark:text-cream-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Item Breakdown (if extracted from OCR) */}
          {formData.items && formData.items.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowItemDetails(!showItemDetails)}
                className="w-full flex items-center justify-between text-xs font-semibold text-navy-600 dark:text-cream-300 hover:text-navy-950 dark:hover:text-cream-50 py-1"
              >
                <span>Daftar Rincian Item ({formData.items.length} item)</span>
                {showItemDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showItemDetails && (
                <div className="mt-2 divide-y divide-cream-200 dark:divide-navy-800 rounded-2xl bg-white/80 dark:bg-navy-900/50 p-3 border border-cream-300 dark:border-navy-800 shadow-sm">
                  {formData.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-navy-800 dark:text-cream-200">
                        {it.name}
                      </span>
                      <span className="font-bold text-navy-950 dark:text-cream-50">
                        Rp {it.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-cream-100/60 dark:bg-navy-950/80 border-t border-cream-200 dark:border-navy-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-xs font-semibold text-navy-800 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-navy-900 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-xs font-bold text-cream-50 dark:text-navy-950 shadow-sm disabled:opacity-50 transition active:scale-95"
          >
            <CheckCircle className="w-4 h-4 stroke-[2.2]" />
            {isSubmitting ? "Menyimpan..." : "Konfirmasi & Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
