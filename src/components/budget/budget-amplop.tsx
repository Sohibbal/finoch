"use client";

import React from "react";
import {
  ArrowRightLeft,
  BookOpen,
  Car,
  Coffee,
  Home,
  Pencil,
  Shield,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { BudgetEnvelope } from "@/types/budget-types";
import { calculateEnvelopeProgress } from "@/lib/financial/budget-engine";
import { categoryLabel, rupiah } from "@/lib/format";
import { Cap, DenomSheet, denomOf, seedOf } from "@/components/press/denom";

const ICON_MAP: Record<string, React.ElementType> = {
  utensils: Utensils,
  home: Home,
  car: Car,
  coffee: Coffee,
  shield: Shield,
  book: BookOpen,
  shopping: ShoppingBag,
  sparkles: Sparkles,
};

// One line of character per envelope, from what it is for (its icon).
const PERSONALITY: Record<string, string> = {
  utensils: "Paling rakus di tanggal muda.",
  home: "Kecil-kecil tapi rutin: laundry, galon, pulsa.",
  car: "Diam-diam boros kalau hujan dan ojol jadi pilihan.",
  coffee: "Paling gampang dirayu “ngopi bentar yuk”.",
  shield: "Jangan disentuh kecuali beneran darurat.",
  book: "Muncul pas fotokopi dan print tugas mendadak.",
  shopping: "Suka lapar mata pas tanggal kembar.",
  sparkles: "Buat senang-senang, asal tahu batas.",
};

export function envelopePersonality(icon: string): string {
  return PERSONALITY[icon] ?? PERSONALITY.sparkles;
}

// The five categories an expense can carry, by their Indonesian names.
const KNOWN = new Set(["Food & Drinks", "Transportation", "Bills & Utilities", "Shopping & Lifestyle", "Other"].map(categoryLabel));

/** The categories this envelope pulls from, in Indonesian, once each; free-text aliases stay out. */
export function envelopeSources(aliases: string[]): string[] {
  return [...new Set(aliases.map((a) => categoryLabel(a)))].filter((label) => KNOWN.has(label));
}

interface BudgetAmplopProps {
  envelope: BudgetEnvelope;
  onTransfer: (envelope: BudgetEnvelope) => void;
  onEdit: (envelope: BudgetEnvelope) => void;
  onDelete: (id: string) => void;
}

const AMPLOP_ACTION =
  "inline-flex items-center justify-center gap-2 min-h-11 border border-current text-body font-semibold hover:bg-paper-sheet/15 transition-colors";

/** An envelope printed as an amplop: a flap fold, a name plate, and its month as a small ledger. */
export function BudgetAmplop({ envelope, onTransfer, onEdit, onDelete }: BudgetAmplopProps) {
  const { percentage, remaining, overspent, status } = calculateEnvelopeProgress(
    envelope.allocatedAmount,
    envelope.spentAmount
  );
  const Icon = ICON_MAP[envelope.icon] || Sparkles;
  const titleId = `amplop-${envelope.id}`;
  const sources = envelopeSources(envelope.categoryAliases);

  return (
    <DenomSheet as="li" denom={denomOf(envelope.color)} seed={seedOf(envelope.id)} aria-labelledby={titleId} className="list-none">
      {/* The flap: two fold lines meeting under the top edge. */}
      <svg aria-hidden="true" viewBox="0 0 100 20" preserveAspectRatio="none" className="block w-full h-12">
        <polyline points="0,0 50,19 100,0" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="px-5 pb-5 -mt-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="bg-paper-sheet text-ink px-3 py-2 min-w-0">
            <h3 id={titleId} className="font-display text-head font-bold break-words flex items-center gap-2">
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{envelope.name}</span>
            </h3>
            <p className="text-meta text-ink-soft">{envelopePersonality(envelope.icon)}</p>
          </div>
          {status === "exceeded" ? (
            <Cap tone="paper" tilt={7}>Habis</Cap>
          ) : status === "warning" ? (
            <Cap tone="paper" tilt={7}>Mepet</Cap>
          ) : null}
        </div>

        {/* Spent against allocation, printed like a ledger. */}
        <dl className="text-body money">
          <div className="flex justify-between gap-3 py-1">
            <dt>Isi amplop</dt>
            <dd className="font-semibold">{rupiah(envelope.allocatedAmount)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-1 border-b border-current">
            <dt>Terpakai</dt>
            <dd className="font-semibold">{rupiah(-envelope.spentAmount)}</dd>
          </div>
          <div className="flex justify-between items-baseline gap-3 pt-2">
            <dt className="font-semibold">{overspent > 0 ? "Jebol" : "Sisa"}</dt>
            <dd className="font-display text-head font-bold">{rupiah(overspent > 0 ? -overspent : remaining)}</dd>
          </div>
        </dl>

        <div className="space-y-1">
          <div
            role="meter"
            aria-label={`Terpakai ${envelope.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(100, percentage)}
            className="h-2 border border-current"
          >
            <div className="h-full bg-current" style={{ width: `${Math.min(100, percentage)}%` }} />
          </div>
          <p className="text-meta">
            {percentage}% terpakai{envelope.rollover ? " · sisa dibawa ke bulan depan" : ""}
          </p>
        </div>

        {(envelope.notes || sources.length > 0) && (
          <p className="text-meta break-words">
            {[envelope.notes, sources.length > 0 && `Dari: ${sources.join(", ")}`].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onTransfer(envelope)} className={`${AMPLOP_ACTION} flex-1 px-4`}>
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            Pindah isi
          </button>
          <button type="button" onClick={() => onEdit(envelope)} className={`${AMPLOP_ACTION} w-11`} aria-label={`Ubah ${envelope.name}`}>
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Hapus amplop "${envelope.name}"?`)) onDelete(envelope.id);
            }}
            className={`${AMPLOP_ACTION} w-11`}
            aria-label={`Hapus ${envelope.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </DenomSheet>
  );
}
