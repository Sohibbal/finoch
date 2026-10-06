"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRightLeft, AlertCircle } from "lucide-react";
import { BudgetEnvelope } from "@/types/budget-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BudgetTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: BudgetEnvelope[];
  initialFromEnvelope?: BudgetEnvelope | null;
  onConfirmTransfer: (
    fromId: string,
    toId: string,
    amount: number,
    reason: string
  ) => void;
}

export function BudgetTransferModal({
  isOpen,
  onClose,
  envelopes,
  initialFromEnvelope,
  onConfirmTransfer,
}: BudgetTransferModalProps) {
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState<number>(50000);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (initialFromEnvelope) {
        setFromId(initialFromEnvelope.id);
        const other = envelopes.find((e) => e.id !== initialFromEnvelope.id);
        if (other) setToId(other.id);
      } else if (envelopes.length >= 2) {
        setFromId(envelopes[0].id);
        setToId(envelopes[1].id);
      }
      setAmount(50000);
      setReason("");
      setError("");
    }
  }, [isOpen, initialFromEnvelope, envelopes]);

  if (!isOpen) return null;

  const fromEnvelope = envelopes.find((e) => e.id === fromId);
  const toEnvelope = envelopes.find((e) => e.id === toId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) {
      setError("Pilih pos asal dan pos tujuan");
      return;
    }
    if (fromId === toId) {
      setError("Pos asal dan pos tujuan tidak boleh sama");
      return;
    }
    if (amount <= 0) {
      setError("Nominal transfer harus lebih besar dari Rp 0");
      return;
    }

    onConfirmTransfer(fromId, toId, amount, reason);
    onClose();
  };

  const quickPills = [20000, 50000, 100000, 200000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
                Pindahkan Dana Antar Pos
              </h3>
              <p className="text-xs text-navy-500 dark:text-cream-400">
                Seimbangkan pos anggaran mahasiswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy-500 hover:bg-cream-100 dark:hover:bg-navy-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dari Pos */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Dari Pos Anggaran:
            </label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Alokasi: {formatRupiah(env.allocatedAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Ke Pos */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Ke Pos Anggaran:
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {envelopes.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Alokasi: {formatRupiah(env.allocatedAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Nominal Transfer */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Nominal Transfer:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-navy-400 dark:text-cream-400">
                Rp
              </span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="50000"
                required
              />
            </div>

            {/* Quick Pills */}
            <div className="flex gap-2 mt-2">
              {quickPills.map((pill) => (
                <button
                  type="button"
                  key={pill}
                  onClick={() => setAmount(pill)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    amount === pill
                      ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                      : "bg-cream-100 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 hover:bg-cream-200"
                  }`}
                >
                  +{pill / 1000}rb
                </button>
              ))}
            </div>
          </div>

          {/* Alasan / Catatan */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Alasan Transfer (Opsional):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Sisa jatah kopi dialihkan ke makan akhir bulan"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Summary Preview */}
          {fromEnvelope && toEnvelope && (
            <div className="p-3 rounded-xl bg-cream-100 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800 text-xs text-navy-700 dark:text-cream-300 space-y-1">
              <div className="flex justify-between">
                <span>{fromEnvelope.name}:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatRupiah(amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{toEnvelope.name}:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatRupiah(amount)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 font-bold text-xs hover:bg-cream-100 dark:hover:bg-navy-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
            >
              Konfirmasi Pindah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
