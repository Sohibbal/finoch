"use client";

import React, { useState, useEffect } from "react";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { ReceiptLine } from "@/components/press/masuk-receipt-line";
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
  { label: "Rp 0 (gratis)", value: 0 },
  { label: "Rp 1.000 (top-up)", value: 1000 },
  { label: "Rp 2.500 (BI-FAST)", value: 2500 },
  { label: "Rp 6.500 (realtime)", value: 6500 },
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
    <PaperDialog isOpen={isOpen} onClose={onClose} title="Pindah saldo" subtitle="Tarik tunai di ATM atau isi saldo e-wallet">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="p-3 border border-habis-ink/40 text-body font-semibold text-habis-ink">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="transfer-from" className={LABEL_CLASS}>
              Dari dompet
            </label>
            <select id="transfer-from" value={fromId} onChange={(e) => setFromId(e.target.value)} className={FIELD_CLASS}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="transfer-to" className={LABEL_CLASS}>
              Ke dompet
            </label>
            <select id="transfer-to" value={toId} onChange={(e) => setToId(e.target.value)} className={FIELD_CLASS}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === fromId}>
                  {w.name} ({formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="transfer-amount" className={LABEL_CLASS}>
            Nominal (Rp)
          </label>
          <input
            id="transfer-amount"
            type="number"
            inputMode="numeric"
            min="1000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100000"
            className={`${FIELD_CLASS} money`}
            required
          />
        </div>

        <fieldset>
          <legend className={LABEL_CLASS}>Biaya admin</legend>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_ADMIN_FEES.map((fee) => (
              <OptionButton key={fee.value} pressed={adminFee === fee.value} onClick={() => setAdminFee(fee.value)} className="text-left">
                {fee.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="transfer-reason" className={LABEL_CLASS}>
            Keterangan
          </label>
          <input
            id="transfer-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tarik tunai ATM kampus buat makan seminggu"
            className={FIELD_CLASS}
          />
        </div>

        {numericAmount > 0 && fromWallet && (
          <div className="border-t border-ink/15 pt-3 space-y-1.5">
            <dl className="space-y-1">
              <ReceiptLine label={`Saldo ${fromWallet.name} sekarang`} amount={formatRupiah(fromWallet.balance)} />
              <ReceiptLine label="Dipindah" amount={formatRupiah(numericAmount)} />
              <ReceiptLine label="Biaya admin" amount={formatRupiah(adminFee)} />
              <ReceiptLine label="Total dipotong dari dompet asal" amount={formatRupiah(totalDeduction)} strong />
            </dl>
            {isInsufficient && (
              <p className="text-body font-semibold text-habis-ink">Saldo dompet asal tidak cukup buat pindahan ini.</p>
            )}
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" disabled={isInsufficient || numericAmount <= 0} className={PRIMARY_CLASS}>
            Pindahkan
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
