"use client";

import React from "react";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import { WalletType, WalletWithBalance } from "@/types/wallet-types";
import { rupiah } from "@/lib/format";
import { Cap, DenomSheet, denomOf, seedOf } from "@/components/press/uang-denom";
import { formatSerial } from "@/components/press/serial";
import { useRolledNumber } from "@/components/press/rolling-numeral";

export const WALLET_TYPE_LABEL: Record<WalletType, string> = {
  cash: "Uang tunai",
  bank: "Rekening bank",
  ewallet: "Dompet digital",
};

// One line of character per wallet, derived from its type and name.
export function walletPersonality(wallet: Pick<WalletWithBalance, "type" | "name">): string {
  const name = wallet.name.toLowerCase();
  if (/gopay|grab|ovo/.test(name)) return "Langganan ojol, rajin minta top-up pas hujan.";
  if (/shopee|dana/.test(name)) return "Gampang kepencet checkout tengah malam.";
  if (wallet.type === "cash") return "Paling cepat habis di warteg, paling susah dilacak.";
  if (wallet.type === "bank") return "Kalem, jarang disentuh, tempat kiriman mendarat.";
  return "Gampang kepencet checkout tengah malam.";
}

/** Below this a wallet is printed as Mepet; below zero it is Minus. */
export const LOW_BALANCE = 20000;

interface WalletNoteProps {
  wallet: WalletWithBalance;
  onTransfer: (wallet: WalletWithBalance) => void;
  onEdit: (wallet: WalletWithBalance) => void;
  onDelete: (id: string) => void;
}

const NOTE_ACTION =
  "inline-flex items-center justify-center gap-2 min-h-11 border border-current text-body font-semibold hover:bg-paper-sheet/15 transition-colors";

/** A wallet printed as a note in its own denomination color, balance as the big numeral. */
export function WalletNote({ wallet, onTransfer, onEdit, onDelete }: WalletNoteProps) {
  const shown = useRolledNumber(wallet.balance);
  const titleId = `wallet-${wallet.id}`;
  const marks = [wallet.isPrimary && "Utama", wallet.isDefault && "Dompet bawaan catat"].filter(Boolean).join(" · ");

  return (
    <DenomSheet as="li" denom={denomOf(wallet.color)} seed={seedOf(wallet.id)} aria-labelledby={titleId} className="list-none">
      <div className="p-5 pb-4 space-y-4">
        {/* Name plate: a cream panel so the name always reads in ink. */}
        <div className="flex items-start justify-between gap-3">
          <div className="bg-paper-sheet text-ink px-3 py-2 min-w-0 max-w-[85%]">
            <h3 id={titleId} className="font-display text-head font-bold break-words">
              {wallet.name}
            </h3>
            <p className="text-meta text-ink-soft">
              {WALLET_TYPE_LABEL[wallet.type] ?? "Dompet"}
              {marks && ` · ${marks}`}
            </p>
          </div>
          {wallet.balance < 0 ? (
            <Cap tone="paper" tilt={8}>Minus</Cap>
          ) : wallet.balance < LOW_BALANCE ? (
            <Cap tone="paper" tilt={8}>Mepet</Cap>
          ) : null}
        </div>

        <p className="text-body">{walletPersonality(wallet)}</p>

        <p className="font-display font-bold money flex items-baseline gap-1.5 flex-wrap">
          <span className="text-head">{wallet.balance < 0 ? "−Rp" : "Rp"}</span>
          <span className="text-[2.75rem] leading-none tracking-[-0.02em]" aria-hidden="true">
            {Math.abs(shown).toLocaleString("id-ID")}
          </span>
          <span className="sr-only">{Math.abs(wallet.balance).toLocaleString("id-ID")}</span>
        </p>

        {wallet.notes && <p className="text-meta break-words">{wallet.notes}</p>}

        <p className="text-meta money tracking-[0.1em] break-all">
          {wallet.accountNumber ? `${wallet.accountNumber} · ` : ""}
          {formatSerial(wallet.id, wallet.updatedAt)}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button type="button" onClick={() => onTransfer(wallet)} className={`${NOTE_ACTION} flex-1 px-4`}>
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            Pindah saldo
          </button>
          <button
            type="button"
            onClick={() => onEdit(wallet)}
            className={`${NOTE_ACTION} w-11`}
            aria-label={`Ubah ${wallet.name}`}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Hapus dompet "${wallet.name}"?`)) onDelete(wallet.id);
            }}
            className={`${NOTE_ACTION} w-11`}
            aria-label={`Hapus ${wallet.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </DenomSheet>
  );
}

/** Totals per type from the real balances: a wallet in minus lowers the total instead of counting as zero. */
export function walletTotals(wallets: Pick<WalletWithBalance, "type" | "balance">[]) {
  const byType: Record<WalletType, number> = { cash: 0, bank: 0, ewallet: 0 };
  for (const w of wallets) byType[w.type] = (byType[w.type] ?? 0) + (w.balance || 0);
  return { total: byType.cash + byType.bank + byType.ewallet, byType };
}
