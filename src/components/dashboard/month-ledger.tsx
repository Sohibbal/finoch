import React from "react";
import { categoryLabel, rupiah } from "@/lib/format";
import { BUCKET_CATEGORY, sumByBucket, type Bucket } from "./dashboard-data";
import type { TransactionCandidate } from "@/types/financial-types";

/**
 * This month's spending per category as a printed ledger: a label, an ink rule
 * scaled to the biggest category, and the amount. The total is the sum of the rows.
 */
export function MonthLedger({ monthTransactions }: { monthTransactions: TransactionCandidate[] }) {
  const sums = sumByBucket(monthTransactions);
  const rows = (Object.keys(sums) as Bucket[]).filter((b) => sums[b] > 0).sort((a, b) => sums[b] - sums[a]);
  if (rows.length === 0) return null;
  const total = rows.reduce((s, b) => s + sums[b], 0);
  const max = sums[rows[0]];

  return (
    <section aria-labelledby="ledger-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
        <h2 id="ledger-title" className="font-display text-head font-bold text-ink">
          Rincian bulan ini
        </h2>
        <p className="text-meta text-ink-soft">
          Total bulan ini <span className="money text-body font-bold text-ink">{rupiah(total)}</span>
        </p>
      </div>
      <ul className="space-y-3">
        {rows.map((b) => (
          <li key={b} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1">
            <span className="text-body text-ink">{categoryLabel(BUCKET_CATEGORY[b])}</span>
            <span className="money text-body font-semibold text-ink">{rupiah(sums[b])}</span>
            <span aria-hidden="true" className="col-span-2 h-1.5 bg-ink/80" style={{ width: `${Math.max(2, (sums[b] / max) * 100)}%` }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
