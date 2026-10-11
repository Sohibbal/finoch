"use client";

import React, { useState, useEffect } from "react";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { ReceiptLine } from "@/components/press/masuk-receipt-line";
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
    <PaperDialog isOpen={isOpen} onClose={onClose} title="Pindah isi amplop" subtitle="Geser jatah dari satu amplop ke amplop lain">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="p-3 border border-habis-ink/40 text-body font-semibold text-habis-ink">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="envelope-from" className={LABEL_CLASS}>
            Dari amplop
          </label>
          <select id="envelope-from" value={fromId} onChange={(e) => setFromId(e.target.value)} className={FIELD_CLASS}>
            {envelopes.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} (jatah {formatRupiah(env.allocatedAmount)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="envelope-to" className={LABEL_CLASS}>
            Ke amplop
          </label>
          <select id="envelope-to" value={toId} onChange={(e) => setToId(e.target.value)} className={FIELD_CLASS}>
            {envelopes.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} (jatah {formatRupiah(env.allocatedAmount)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="envelope-move-amount" className={LABEL_CLASS}>
            Nominal (Rp)
          </label>
          <input
            id="envelope-move-amount"
            type="number"
            inputMode="numeric"
            min="1000"
            step="5000"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={`${FIELD_CLASS} money`}
            placeholder="50000"
            required
          />
          <div role="group" aria-label="Nominal cepat" className="grid grid-cols-4 gap-2 mt-2">
            {quickPills.map((pill) => (
              <OptionButton key={pill} pressed={amount === pill} onClick={() => setAmount(pill)} className="money px-1">
                {pill / 1000}rb
              </OptionButton>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="envelope-move-reason" className={LABEL_CLASS}>
            Alasan (boleh kosong)
          </label>
          <input
            id="envelope-move-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sisa jatah kopi buat makan akhir bulan"
            className={FIELD_CLASS}
          />
        </div>

        {fromEnvelope && toEnvelope && (
          <dl className="border-t border-ink/15 pt-3 space-y-1">
            <ReceiptLine label={`Jatah ${fromEnvelope.name}`} amount={`−${formatRupiah(amount)}`} />
            <ReceiptLine label={`Jatah ${toEnvelope.name}`} amount={`+${formatRupiah(amount)}`} />
          </dl>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" className={PRIMARY_CLASS}>
            Pindahkan
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
