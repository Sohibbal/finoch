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
    if (candidate) {
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
  }, [candidate]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              {formData.source === "ocr" ? (
                <Receipt className="w-5 h-5" />
              ) : formData.source === "voice" ? (
                <Mic className="w-5 h-5" />
              ) : (
                <Edit2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Konfirmasi Transaksi
              </h3>
              <p className="text-xs text-slate-500">
                Sumber: {formData.source.toUpperCase()}
                {formData.confidence !== undefined &&
                  ` (Keyakinan: ${Math.round(formData.confidence * 100)}%)`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {validationError}
            </div>
          )}

          {/* Nominal Input Display */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Nominal Transaksi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                Rp
              </span>
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Merchant / Nama Item */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Merchant / Keterangan
            </label>
            <input
              type="text"
              value={formData.merchant || ""}
              onChange={(e) =>
                setFormData({ ...formData, merchant: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Mie Gacoan, Indomaret"
            />
          </div>

          {/* Digital Twin Spending Type Selector (Needs vs Wants vs Savings) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Alokasi Digital Twin (50/30/20)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSpendingTypeToggle("needs")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  formData.spendingType === "needs"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="text-xs font-bold">Kebutuhan (50%)</div>
                <div className="text-[10px] text-slate-500">Primer & Esensial</div>
              </button>
              <button
                type="button"
                onClick={() => handleSpendingTypeToggle("wants")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  formData.spendingType === "wants"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="text-xs font-bold">Keinginan (30%)</div>
                <div className="text-[10px] text-slate-500">Gaya Hidup & Kafe</div>
              </button>
              <button
                type="button"
                onClick={() => handleSpendingTypeToggle("savings")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  formData.spendingType === "savings"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="text-xs font-bold">Tabungan (20%)</div>
                <div className="text-[10px] text-slate-500">Dana Masa Depan</div>
              </button>
            </div>
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  {SPENDING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Item Breakdown (if extracted from OCR) */}
          {formData.items && formData.items.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowItemDetails(!showItemDetails)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1"
              >
                <span>Daftar Rincian Item ({formData.items.length} item)</span>
                {showItemDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showItemDetails && (
                <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-800">
                  {formData.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {it.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
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
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? "Menyimpan..." : "Konfirmasi & Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
