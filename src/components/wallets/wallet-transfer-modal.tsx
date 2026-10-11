"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRightLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { WalletWithBalance } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletWithBalance[];
  sourceWallet?: WalletWithBalance | null;
  onTransfer: (
    fromId: string,
    toId: string,
    amount: number,
    adminFee: number,
    reason: string
  ) => void;
}

const COMMON_ADMIN_FEES = [
  { label: "Rp 0 (Bebas Biaya)", value: 0 },
  { label: "Rp 1.000 (Top-up)", value: 1000 },
  { label: "Rp 2.500 (BI-FAST)", value: 2500 },
  { label: "Rp 6.500 (Realtime)", value: 6500 },
];

export function WalletTransferModal({
  isOpen,
  onClose,
  wallets,
  sourceWallet,
  onTransfer,
}: WalletTransferModalProps) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (sourceWallet) {
        setFromId(sourceWallet.id);
        const other = wallets.find((w) => w.id !== sourceWallet.id);
        setToId(other ? other.id : "");
      } else if (wallets.length >= 2) {
        setFromId(wallets[0].id);
        setToId(wallets[1].id);
      }
      setAmount("");
      setAdminFee(0);
      setReason("Pindah saldo / Tarik tunai / Top-up");
      setError(null);
    }
  }, [isOpen, sourceWallet, wallets]);

  if (!isOpen) return null;

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);
  const numericAmount = parseFloat(amount.replace(/[^0-9]/g, "")) || 0;
  const totalDeduction = numericAmount + adminFee;
  const isInsufficient = fromWallet ? fromWallet.balance < totalDeduction : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId) {
      setError("Pilih dompet asal dan dompet tujuan.");
      return;
    }
    if (fromId === toId) {
      setError("Dompet asal dan tujuan tidak boleh sama.");
      return;
    }
    if (numericAmount <= 0) {
      setError("Nominal transfer harus lebih besar dari Rp 0.");
      return;
    }
    if (isInsufficient) {
      setError(
        `Saldo ${fromWallet?.name} tidak mencukupi (tersedia ${formatRupiah(
          fromWallet?.balance || 0
        )}, dibutuhkan ${formatRupiah(totalDeduction)}).`
      );
      return;
    }

    try {
      onTransfer(fromId, toId, numericAmount, adminFee, reason.trim());
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memindahkan saldo.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="relative w-full max-w-lg bg-paper-sheet rounded-sm border border-ink/20 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-aman/10 text-aman-ink flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">
                Pindah Saldo Antar Dompet
              </h2>
              <p className="text-xs text-ink-soft">
                Tarik tunai ATM atau top-up e-wallet bebas ribet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-paper-deep text-ink-soft flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-sm bg-habis/10 text-habis-ink font-semibold border border-habis-ink/40 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Wallets Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* From Wallet */}
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Dari Dompet / Rekening
              </label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs font-medium focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* To Wallet */}
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Ke Dompet Tujuan
              </label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs font-medium focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === fromId}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-ink">
                Nominal Pindah (Rp) <span className="text-habis-ink">*</span>
              </label>
              {numericAmount > 0 && (
                <span className="text-xs font-bold text-aman-ink">
                  {formatRupiah(numericAmount)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 100000"
              className="w-full min-h-[48px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              required
            />
          </div>

          {/* Admin Fee Options */}
          <div>
            <label className="text-xs font-bold text-ink block mb-1.5">
              Biaya Admin / Transfer
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {COMMON_ADMIN_FEES.map((fee, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAdminFee(fee.value)}
                  className={`min-h-[44px] px-3 py-2 rounded-sm text-xs font-medium border text-left flex items-center justify-between transition-all ${
                    adminFee === fee.value
                      ? "border-ink bg-ink/5 text-ink font-bold"
                      : "border-ink/20 text-ink hover:bg-ink/5"
                  }`}
                >
                  <span>{fee.label}</span>
                  {adminFee === fee.value && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="text-xs font-bold text-ink block mb-1">
              Alasan / Keterangan Transaksi
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Tarik tunai ATM kampus untuk makan siang seminggu"
              className="w-full min-h-[44px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Breakdown / Cost Summary */}
          {numericAmount > 0 && fromWallet && (
            <div className="p-4 rounded-sm bg-paper-sheet border border-ink/20 space-y-2 text-xs">
              <div className="flex justify-between text-ink-soft">
                <span>Saldo {fromWallet.name} saat ini:</span>
                <span className="font-semibold">{formatRupiah(fromWallet.balance)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Nominal ditransfer:</span>
                <span className="font-semibold">{formatRupiah(numericAmount)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Biaya admin:</span>
                <span className="font-semibold">{formatRupiah(adminFee)}</span>
              </div>
              <div className="pt-2 border-t border-ink/20 flex justify-between font-bold text-ink">
                <span>Total dipotong dari dompet asal:</span>
                <span className={isInsufficient ? "text-habis-ink" : "text-aman-ink"}>
                  {formatRupiah(totalDeduction)}
                </span>
              </div>
              {isInsufficient && (
                <div className="text-meta font-bold text-habis-ink pt-1">
                  Saldo dompet asal tidak mencukupi untuk memproses transfer ini!
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/20">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-sm border border-ink/20 text-xs font-bold text-ink hover:bg-ink/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isInsufficient || numericAmount <= 0}
              className={`min-h-[48px] px-6 py-2.5 rounded-sm text-xs font-bold transition-all ${
                isInsufficient || numericAmount <= 0
                  ? "bg-ink/5 text-ink-soft cursor-not-allowed opacity-60"
                  : "bg-ink hover:bg-ink/90 text-paper-sheet active:scale-95"
              }`}
            >
              Eksekusi Pindah Saldo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
