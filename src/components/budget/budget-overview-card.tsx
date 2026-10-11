"use client";

import React from "react";
import { BudgetSummary, ReallocationSuggestion } from "@/types/budget-types";
import { rupiah } from "@/lib/format";
import { StatusStamp } from "@/components/press/status-stamp";
import { fixedCostScope, type MonthFigures } from "@/lib/financial/month-ledger";

interface BudgetOverviewCardProps {
  summary: BudgetSummary;
  /** The month ledger: its remaining is the same "sisa bulan ini" the dashboard prints. */
  month: MonthFigures;
  suggestions?: ReallocationSuggestion[];
  onApplySuggestion?: (sug: ReallocationSuggestion) => void;
}

const STAMP = { safe: "aman", warning: "mepet", exceeded: "habis" } as const;

/** This month's ledger line above the envelopes, plus the top rebalancing tip. */
export function BudgetOverviewCard({ summary, month, suggestions = [], onApplySuggestion }: BudgetOverviewCardProps) {
  const topSuggestion = suggestions[0] ?? null;
  const spendable = Math.max(0, month.spendable);
  const unsplit = spendable - summary.totalAllocated;

  return (
    <div className="space-y-4">
      <section aria-labelledby="amplop-total-title" className="border-y border-ink/20 py-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id="amplop-total-title" className="text-body text-ink-soft">
            Sisa bulan ini
          </h2>
          <StatusStamp status={STAMP[summary.status]} />
        </div>
        <p className="font-display text-head font-bold text-ink money">{rupiah(month.remaining)}</p>
        <dl className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-3">
          <div className="min-w-0">
            <dt className="text-meta text-ink-soft">Bisa dibelanjakan bulan ini</dt>
            <dd className="money text-body font-semibold text-ink break-words">{rupiah(month.spendable)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-meta text-ink-soft">Dibagi ke {summary.envelopeCount} amplop</dt>
            <dd className="money text-body font-semibold text-ink break-words">{rupiah(summary.totalAllocated)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-meta text-ink-soft">Terpakai bulan ini</dt>
            <dd className="money text-body font-semibold text-ink break-words">{rupiah(month.spent)}</dd>
          </div>
        </dl>
        <p className="text-meta text-ink-soft max-w-prose">
          Uang saku <span className="money">{rupiah(month.income)}</span> (dari profil) − pengeluaran tetap{" "}
          <span className="money">{rupiah(month.fixedCosts)}</span> ({fixedCostScope(month.fixedCostSource)}).
          {unsplit > 0 && <> Masih <span className="money">{rupiah(unsplit)}</span> yang belum masuk amplop.</>}
          {unsplit < 0 && <> Isi amplop lebih besar <span className="money">{rupiah(-unsplit)}</span> dari yang bisa dibelanjakan.</>}
        </p>
        {summary.overbudgetCount > 0 && (
          <p className="text-body text-habis-ink font-semibold">
            {summary.overbudgetCount} amplop sudah jebol. Pindahkan isi dari amplop yang masih longgar.
          </p>
        )}
      </section>

      {topSuggestion && (
        <section
          aria-label="Saran pindah isi amplop"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-ink/20 bg-paper-sheet p-4"
        >
          <p className="text-body text-ink min-w-0">{topSuggestion.message}</p>
          {onApplySuggestion && (
            <button
              type="button"
              onClick={() => onApplySuggestion(topSuggestion)}
              className="shrink-0 inline-flex items-center justify-center min-h-11 px-4 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 transition-colors"
            >
              Pindahkan {rupiah(topSuggestion.recommendedAmount)}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
